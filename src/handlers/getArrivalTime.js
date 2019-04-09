const { i18nFactory, directionsHttpFactory } = require('../factories')
const { message, logger, translation, directions, slot, tts } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')
const { Dialog } = require('hermes-javascript')

module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('GetArrivalTime')

    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // Get departure_time specific slot
    let departureTime

    if (!('departure_time' in knownSlots)) {
        const departureTimeSlot = message.getSlotsByName(msg, 'departure_time', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (departureTimeSlot) {
            // Is it an InstantTime object?
            if (departureTimeSlot.value.kind === Dialog.enums.slotType.instantTime) {
                departureTime = new Date(departureTimeSlot.value.value)
            }
            // Or is it a TimeInterval object?
            else if (departureTimeSlot.value.kind === Dialog.enums.slotType.timeInterval) {
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

            return require('./index').getArrivalTime(msg, flow, {
                travel_mode: travelMode,
                location_to: locationTo,
                departure_time: departureTime,
                depth: knownSlots.depth - 1
            })
        })

        // intent not recognized

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').getArrivalTime(msg, flow, knownSlots)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

        return i18n('directions.dialog.noOriginAddress')
    }

    // missing departure_time
    if (slot.missing(departureTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // intent not recognized

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').getArrivalTime(msg, flow, knownSlots)
        })

        // elicitation intent
        flow.continue('snips-assistant:ElicitDepartureTime', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return require('./index').getArrivalTime(msg, flow, {
                travel_mode: travelMode,
                location_from: locationFrom,
                location_to: locationTo,
                depth: knownSlots.depth - 1
            })
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

        return i18n('directions.dialog.noDepartureTime')
    }

    // Are the origin and destination addresses the same?
    if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
        const speech = i18n('directions.dialog.sameLocations')
        flow.end()
        logger.info(speech)
        return speech
    }

    const now = Date.now()

    // Get the data from Directions API
    const directionsData = await directionsHttpFactory.calculateRoute({
        origin: locationFrom,
        destination: locationTo,
        travelMode: travelMode,
        departureTime: departureTime.getTime() / 1000
    })
    //logger.debug(directionsData)

    try {
        const aggregatedDirectionsData = directions.aggregateDirections(directionsData)
        //logger.debug(aggregatedDirectionsData)

        const { origin, destination } = directions.getFullAddress(locationFrom, locationTo, directionsData)

        // With travel modes different from transit, the API doesn't return departure and arrival time
        let departureTimeEpoch, arrivalTimeEpoch
        if (travelMode === 'transit') {
            departureTimeEpoch = directionsData.routes[0].legs[0].departure_time.value
            arrivalTimeEpoch = directionsData.routes[0].legs[0].arrival_time.value
        } else {
            departureTimeEpoch = departureTime.getTime() / 1000
            arrivalTimeEpoch = departureTimeEpoch + directionsData.routes[0].legs[0].duration.value
        }

        const speech = translation.arrivalTimeToSpeech(origin, destination, travelMode, departureTimeEpoch, arrivalTimeEpoch, aggregatedDirectionsData)
        logger.info(speech)

        flow.end()
        if (Date.now() - now < 4000) {
            return speech
        } else {
            tts.say(speech)
        }
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }
}
