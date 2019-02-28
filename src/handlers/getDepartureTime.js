const { i18nFactory, directionsHttpFactory } = require('../factories')
const { message, logger, translation, directions, slot } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

function generateMissingSlotsTTS (locationFrom, locationTo, arrivalTime) {
    const i18n = i18nFactory.get()

    if (slot.missing(locationFrom) && slot.missing(locationTo) && slot.missing(arrivalTime)) {
        throw new Error('intentNotRecognized')
    }
    if (slot.missing(locationFrom) && slot.missing(locationTo)) {
        return i18n('directions.dialog.noOriginAndDestinationAddresses')
    }
    if (slot.missing(locationFrom) && slot.missing(arrivalTime)) {
        return i18n('directions.dialog.noOriginAddressAndArrivalTime')
    }
    if (slot.missing(locationTo) && slot.missing(arrivalTime)) {
        return i18n('directions.dialog.noDestinationAddressAndArrivalTime')
    }
    if (slot.missing(locationFrom)) {
        return i18n('directions.dialog.noOriginAddress')
    }
    if (slot.missing(locationTo)) {
        return i18n('directions.dialog.noDestinationAddress')
    }
    if (slot.missing(arrivalTime)) {
        return i18n('directions.dialog.noArrivalTime')
    }
}

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
            else if (arrivalTimeSlot.value.kind === 'TimeInterval') {
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

        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            msg.slots = []
            return require('./index').getDirections(msg, flow, knownSlots)
        })

        flow.continue('snips-assistant:GetDepartureTime', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            const slotsToBeSent = {
                travel_mode: travelMode,
                depth: knownSlots.depth - 1
            }

            // Adding the known slots, if more

            if (!slot.missing(locationFrom)) {
                slotsToBeSent.location_from = locationFrom
            }
            if (!slot.missing(locationTo)) {
                slotsToBeSent.location_to = locationTo
            }
            if (!slot.missing(arrivalTime)) {
                slotsToBeSent.arrival_time = arrivalTime
            }

            return require('./index').getDepartureTime(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return generateMissingSlotsTTS(locationFrom, locationTo, arrivalTime)
    } else {
        // Are the origin and destination addresses the same?
        if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
            const speech = i18n('directions.dialog.sameLocations')
            flow.end()
            logger.info(speech)
            return speech
        }

        // Get the data from Directions API
        const directionsData = await directionsHttpFactory.calculateRoute({
            origin: locationFrom,
            destination: locationTo,
            travelMode: travelMode,
            departureTime: '',
            arrivalTime: arrivalTime.getTime() / 1000
        })
        logger.debug(directionsData)

        const aggregatedDirectionsData = directions.aggregateDirections(directionsData)
        logger.debug(aggregatedDirectionsData)

        let speech = ''
        try {
            let origin = directionsData.routes[0].legs[0].start_address_name
            if (!origin) {
                origin = directionsData.routes[0].legs[0].start_address
            }
            let destination = directionsData.routes[0].legs[0].end_address_name
            if (!destination) {
                destination = directionsData.routes[0].legs[0].end_address
            }
    
            // With travel modes different from transit, the API doesn't return departure and arrival time
            let departureTimeEpoch, arrivalTimeEpoch
            if (travelMode === 'transit') {
                departureTimeEpoch = directionsData.routes[0].legs[0].departure_time.value
                arrivalTimeEpoch = directionsData.routes[0].legs[0].arrival_time.value
            } else {
                arrivalTimeEpoch = arrivalTime.getTime() / 1000
                departureTimeEpoch = arrivalTimeEpoch - directionsData.routes[0].legs[0].duration.value
            }

            speech = translation.departureTimeToSpeech(origin, destination, travelMode, departureTimeEpoch, arrivalTimeEpoch, aggregatedDirectionsData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    
        flow.end()
        logger.info(speech)
        return speech
    }
}
