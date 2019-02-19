const { i18nFactory, directionsHttpFactory } = require('../factories')
const { message, logger, translation, directions, slot } = require('../utils')
const commonHandler = require('./common')
const {
    SLOT_CONFIDENCE_THRESHOLD,
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

function generateMissingSlotsTTS (locationFrom, locationTo, departureTime) {
    const i18n = i18nFactory.get()

    if (slot.missing(locationFrom) && slot.missing(locationTo) && slot.missing(departureTime)) {
        throw new Error('intentNotRecognized')
    }
    if (slot.missing(locationFrom) && slot.missing(locationTo)) {
        return i18n('directions.dialog.noOriginAndDestinationAddresses')
    }
    if (slot.missing(locationFrom) && slot.missing(departureTime)) {
        return i18n('directions.dialog.noOriginAddressAndDepartureTime')
    }
    if (slot.missing(locationTo) && slot.missing(departureTime)) {
        return i18n('directions.dialog.noDestinationAddressAndDepartureTime')
    }
    if (slot.missing(locationFrom)) {
        return i18n('directions.dialog.noOriginAddress')
    }
    if (slot.missing(locationTo)) {
        return i18n('directions.dialog.noDestinationAddress')
    }
    if (slot.missing(departureTime)) {
        return i18n('directions.dialog.noDepartureTime')
    }
}

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
            if (departureTimeSlot.value.value_type === 4) {
                departureTime = new Date(departureTimeSlot.value.value.value)
            }
            // Or is it a TimeInterval object?
            else if (departureTimeSlot.value.value_type === 5) {
                const to = departureTimeSlot.value.value.to
                if (to) {
                    departureTime = new Date(to)
                } else {
                    const from = departureTimeSlot.value.value.from
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

        flow.continue('IntentNotRecognized', (_, _) => {
            throw new Error('intentNotRecognized')
        })
        
        flow.continue('snips-assistant:GetArrivalTime', (msg, flow) => {
            if (msg.intent.probability < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }
            
            let slotsToBeSent = {
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
            if (!slot.missing(departureTime)) {
                slotsToBeSent.departure_time = departureTime
            }

            return require('./index').getArrivalTime(msg, flow, slotsToBeSent)
        }, { intent_not_recognized: true })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        return generateMissingSlotsTTS(locationFrom, locationTo, departureTime)
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
            departureTime: departureTime.getTime() / 1000
        })
        logger.debug(directionsData)

        const aggregatedDirectionsData = directions.aggregateDirections(directionsData)
        logger.debug(aggregatedDirectionsData)

        let speech = ''
        try {
            const destination = directionsData.routes[0].legs[0].end_address
            const departureTime = directionsData.routes[0].legs[0].departure_time.value
            const arrivalTime = directionsData.routes[0].legs[0].arrival_time.value

            speech = translation.arrivalTimeToSpeech(locationFrom, destination, travelMode, departureTime, arrivalTime, aggregatedDirectionsData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}
