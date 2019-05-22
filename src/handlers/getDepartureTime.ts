import { message, logger, Handler, i18n } from 'snips-toolkit'
import { translation, slot, tts, aggregate, helpers } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { SLOT_CONFIDENCE_THRESHOLD, INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'
import { calculateRoute } from '../api'

export const getDepartureTimeHandler: Handler = async function (msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('GetDepartureTime')

    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // Get arrival_time specific slot
    let arrivalTime

    if (!('arrival_time' in knownSlots)) {
        const arrivalTimeSlot = message.getSlotsByName(msg, 'arrival_time', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (arrivalTimeSlot) {
            // Is it an InstantTime object?
            if (arrivalTimeSlot.value.kind === 'InstantTime') {
                arrivalTime = new Date(arrivalTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            if (arrivalTimeSlot.value.kind === 'TimeInterval') {
                const from = arrivalTimeSlot.value.from
                if (from) {
                    arrivalTime = new Date(from)
                } else {
                    const to = arrivalTimeSlot.value.to
                    if (to) {
                        arrivalTime = new Date(to)
                    }
                }
            }
        }
    } else {
        arrivalTime = knownSlots.arrival_time
    }

    logger.info('\tarrival_time: ', arrivalTime)

    // One required slot is missing
    if (slot.missing(locationTo)) {
        throw new Error('intentNotRecognized')
    }
    
    if (slot.providedButNotUnderstood(msg, 'location_from')) {
        if (slot.missing(arrivalTime)) {
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

            return getDepartureTimeHandler(msg, flow, hermes, {
                travel_mode: travelMode,
                location_to: locationTo,
                arrival_time: arrivalTime,
                depth: knownSlots.depth - 1
            })
        })

        // intent not recognized
        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return getDepartureTimeHandler(msg, flow, hermes, knownSlots)
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

    // missing arrival_time
    if (slot.missing(arrivalTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // intent not recognized
        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return getDepartureTimeHandler(msg, flow, hermes, knownSlots)
        })
        */

        // elicitation intent
        flow.continue('snips-assistant:ElicitArrivalTime', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return getDepartureTimeHandler(msg, flow, hermes, {
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
        
        return i18n.translate('directions.dialog.noArrivalTime')
    }

    // Are the origin and destination addresses the same?
    if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
        const speech = i18n.translate('directions.dialog.sameLocations')
        flow.end()
        logger.info(speech)
        return speech
    }

    const now = Date.now()

    // Get the data from Directions API
    const directionsData = await calculateRoute(locationFrom, locationTo, travelMode, undefined, arrivalTime.getTime() / 1000)
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
            arrivalTimeEpoch = arrivalTime.getTime() / 1000
            departureTimeEpoch = arrivalTimeEpoch - leg.duration.value
        }

        const speech = translation.departureTimeToSpeech(origin, destination, travelMode, departureTimeEpoch, arrivalTimeEpoch, aggregatedDirectionsData)
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
