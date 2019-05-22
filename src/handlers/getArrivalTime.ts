import { Handler, message, logger, i18n } from 'snips-toolkit'
import { translation, slot, tts, aggregate, helpers } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { SLOT_CONFIDENCE_THRESHOLD, INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'
import { Enums } from 'hermes-javascript/types'
import { calculateRoute } from '../api'

export const getArrivalTimeHandler: Handler = async function (msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('GetArrivalTime')

    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // Get departure_time specific slot
    let departureTime: Date | undefined

    if (!('departure_time' in knownSlots)) {
        const departureTimeSlot = message.getSlotsByName(msg, 'departure_time', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (departureTimeSlot) {
            // Is it an InstantTime object?
            if (departureTimeSlot.value.kind === Enums.slotType.instantTime) {
                departureTime = new Date(departureTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            else if (departureTimeSlot.value.kind === Enums.slotType.timeInterval) {
                const to = departureTimeSlot.value.to
                if (to) {
                    departureTime = new Date(to)
                } else {
                    const from = departureTimeSlot.value.from
                    if (from) {
                        departureTime = new Date(from)
                    }
                }
            }
        }
    } else {
        departureTime = knownSlots.departure_time
    }

    logger.info('\tdeparture_time: ', departureTime)

    // One required slot is missing
    if (slot.missing(locationTo)) {
        throw new Error('intentNotRecognized')
    }

    if (slot.providedButNotUnderstood(msg, 'location_from')) {
        if (slot.missing(departureTime)) {
            throw new Error('intentNotRecognized')
        }

        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // elicitation intent
        flow.continue('snips-assistant:ElicitOrigin', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return getArrivalTimeHandler(msg, flow, hermes, {
                travel_mode: travelMode,
                location_to: locationTo,
                departure_time: departureTime,
                depth: knownSlots.depth - 1
            })
        })

        // intent not recognized
        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return getArrivalTimeHandler(msg, flow, hermes, knownSlots)
        })
        */

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:StopSilence', (_, flow) => {
            flow.end()
        })

        return i18n.translate('directions.dialog.noOriginAddress')
    }

    // missing departure_time
    if (slot.missing(departureTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // intent not recognized
        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return getArrivalTimeHandler(msg, flow, hermes, knownSlots)
        })
        */

        // elicitation intent
        flow.continue('snips-assistant:ElicitDepartureTime', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return getArrivalTimeHandler(msg, flow, hermes, {
                travel_mode: travelMode,
                location_from: locationFrom,
                location_to: locationTo,
                depth: knownSlots.depth - 1
            })
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:StopSilence', (_, flow) => {
            flow.end()
        })

        return i18n.translate('directions.dialog.noDepartureTime')
    }

    // Are the origin and destination addresses the same?
    if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
        const speech = i18n.translate('directions.dialog.sameLocations')
        flow.end()
        logger.info(speech)
        return speech
    }

    if (departureTime) {
        const now = Date.now()

        // Get the data from Directions API
        const directionsData = await calculateRoute(locationFrom, locationTo, travelMode, departureTime.getTime() / 1000)
        //logger.debug(directionsData)

        try {
            const aggregatedDirectionsData = aggregate.aggregateDirections(directionsData)
            //logger.debug(aggregatedDirectionsData)

            const { origin, destination } = helpers.getFullAddress(locationFrom, locationTo, directionsData)

            // With travel modes different from transit, the API doesn't return departure and arrival time
            // Same if the transit trip is too short and contains no public transportation steps
            let departureTimeEpoch, arrivalTimeEpoch
            const leg = directionsData.routes[0].legs[0]
            if (travelMode === 'transit' && leg.departure_time && leg.arrival_time) {
                departureTimeEpoch = leg.departure_time.value
                arrivalTimeEpoch = leg.arrival_time.value
            } else {
                departureTimeEpoch = departureTime.getTime() / 1000
                arrivalTimeEpoch = departureTimeEpoch + leg.duration.value
            }

            const speech = translation.arrivalTimeToSpeech(origin, destination, travelMode, departureTimeEpoch, arrivalTimeEpoch, aggregatedDirectionsData)
            logger.info(speech)

            flow.end()
            if (Date.now() - now < 4000) {
                return speech
            } else {
                tts.say(hermes, speech)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    }
}
