const { i18nFactory, directionsHttpFactory } = require('../factories')
const { message, logger, translation, directions, slot, tts } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

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

    // At least one required slot is missing
    if (slot.missing(locationFrom) || slot.missing(locationTo) || slot.missing(arrivalTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // intent not recognized

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').getDepartureTime(msg, flow, knownSlots)
        })

        // multiple slots missing

        // missing itinerary
        if (slot.missing(locationFrom) && slot.missing(locationTo) && !slot.missing(arrivalTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitItinerary', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    arrival_time: arrivalTime,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noOriginAndDestinationAddresses')
        }

        // missing destination and arrival time
        if (slot.missing(locationTo) && slot.missing(arrivalTime) && !slot.missing(locationFrom)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitDestinationArrivalTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    location_from: locationFrom,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noDestinationAddressAndArrivalTime')
        }

        // missing origin and arrival time
        // should not happen, origin has a default value
        if (slot.missing(locationFrom) && slot.missing(arrivalTime) && !slot.missing(locationTo)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitOriginArrivalTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    location_to: locationTo,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noOriginAddressAndArrivalTime')
        }

        // single slot missing

        // missing origin
        if (slot.missing(locationFrom) && !slot.missing(locationTo) && !slot.missing(arrivalTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitOrigin', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    location_to: locationTo,
                    arrival_time: arrivalTime,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noOriginAddress')
        }

        // missing destination
        if (slot.missing(locationTo) && !slot.missing(locationFrom) && !slot.missing(arrivalTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitDestination', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    location_from: locationFrom,
                    arrival_time: arrivalTime,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noDestinationAddress')
        }
        
        // missing arrival time
        if (slot.missing(arrivalTime) && !slot.missing(locationTo) && !slot.missing(locationFrom)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitArrivalTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getDepartureTime(msg, flow, {
                    travel_mode: travelMode,
                    location_from: locationFrom,
                    location_to: locationTo,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noArrivalTime')
        }

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        throw new Error('intentNotRecognized')
    } else {
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
            departureTime: '',
            arrivalTime: arrivalTime.getTime() / 1000
        })
        logger.debug(directionsData)

        try {
            const aggregatedDirectionsData = directions.aggregateDirections(directionsData)
            logger.debug(aggregatedDirectionsData)

            const { origin, destination } = directions.getFullAddress(locationFrom, locationTo, directionsData)
    
            // With travel modes different from transit, the API doesn't return departure and arrival time
            let departureTimeEpoch, arrivalTimeEpoch
            if (travelMode === 'transit') {
                departureTimeEpoch = directionsData.routes[0].legs[0].departure_time.value
                arrivalTimeEpoch = directionsData.routes[0].legs[0].arrival_time.value
            } else {
                arrivalTimeEpoch = arrivalTime.getTime() / 1000
                departureTimeEpoch = arrivalTimeEpoch - directionsData.routes[0].legs[0].duration.value
            }

            const speech = translation.departureTimeToSpeech(origin, destination, travelMode, departureTimeEpoch, arrivalTimeEpoch, aggregatedDirectionsData)
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
}
