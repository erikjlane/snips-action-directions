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

    // At least one required slot is missing
    if (slot.missing(locationFrom) || slot.missing(locationTo) || slot.missing(departureTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // intent not recognized

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').getArrivalTime(msg, flow, knownSlots)
        })

        // multiple slots missing

        // missing itinerary
        if (slot.missing(locationFrom) && slot.missing(locationTo) && !slot.missing(departureTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitItinerary', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getArrivalTime(msg, flow, {
                    travel_mode: travelMode,
                    departure_time: departureTime,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noOriginAndDestinationAddresses')
        }
        
        // missing origin and departure time
        if (slot.missing(locationFrom) && slot.missing(departureTime) && !slot.missing(locationTo)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitOriginDepartureTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getArrivalTime(msg, flow, {
                    travel_mode: travelMode,
                    location_to: locationTo,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noOriginAddressAndDepartureTime')
        }

        // missing destination and departure time
        if (slot.missing(locationTo) && slot.missing(departureTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitDestinationDepartureTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                const slots = {
                    travel_mode: travelMode,
                    depth: knownSlots.depth - 1
                }

                if (!slot.missing(locationFrom)) {
                    slots.location_from = locationFrom
                }

                return require('./index').getArrivalTime(msg, flow, slots)
            })

            return i18n('directions.dialog.noDestinationAddressAndDepartureTime')
        }

        // single slot missing

        // missing origin
        if (slot.missing(locationFrom) && !slot.missing(locationTo) && !slot.missing(departureTime)) {
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

            // slot filling
            /*
            flow.continue('snips-assistant:GetArrivalTime', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getArrivalTime(msg, flow, {
                    travel_mode: travelMode,
                    location_to: locationTo,
                    departure_time: departureTime,
                    depth: knownSlots.depth - 1
                })
            }, { slotFiller: 'location_from' })
            */

            return i18n('directions.dialog.noOriginAddress')
        }

        // missing destination
        if (slot.missing(locationTo) && !slot.missing(locationFrom) && !slot.missing(departureTime)) {
            // elicitation intent
            flow.continue('snips-assistant:ElicitDestination', (msg, flow) => {
                if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                    throw new Error('intentNotRecognized')
                }

                return require('./index').getArrivalTime(msg, flow, {
                    travel_mode: travelMode,
                    location_from: locationFrom,
                    departure_time: departureTime,
                    depth: knownSlots.depth - 1
                })
            })

            return i18n('directions.dialog.noDestinationAddress')
        }

        // missing departure_time
        if (slot.missing(departureTime) && !slot.missing(locationTo) && !slot.missing(locationFrom)) {
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

            return i18n('directions.dialog.noDepartureTime')
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
            departureTime: departureTime.getTime() / 1000
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
}
