const { i18nFactory, httpFactory } = require('../factories')
const { message, logger, translation, directions, slot } = require('../utils')
const commonHandler = require('./common')

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
        const departureTimeSlot = message.getSlotsByName(msg, 'departure_time', { onlyMostConfident: true })
        if (departureTimeSlot) {
            const departureTimeDate = new Date(departureTimeSlot.value.value.value)
            departureTime = departureTimeDate.getTime() / 1000
            logger.info('departure_time: ', departureTimeDate)
        }
    } else {
        departureTime = knownSlots.departure_time
    }

    // One or two required slots are missing
    if (slot.missing(locationTo) || slot.missing(departureTime)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }
        
        flow.continue('snips-assistant:GetArrivalTime', (msg, flow) => {
            let slotsToBeSent = {
                location_from: locationFrom,
                travel_mode: travelMode,
                depth: knownSlots.depth - 1
            }

            // Adding the known slots, if more
            if (!slot.missing(locationTo)) {
                slotsToBeSent.location_to = locationTo
            }
            if (!slot.missing(departureTime)) {
                slotsToBeSent.departure_time = departureTime
            }

            return require('./index').getArrivalTime(msg, flow, slotsToBeSent)
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })
        
        if (slot.missing(locationTo) && slot.missing(departureTime)) {
            return i18n('directions.dialog.noDestinationAddressAndDepartureTime')
        }
        if (slot.missing(locationTo)) {
            return i18n('directions.dialog.noDestinationAddress')
        }
        if (slot.missing(departureTime)) {
            return i18n('directions.dialog.noDepartureTime')
        }
    } else {
        // Are the origin and destination addresses the same?
        if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
            const speech = i18n('directions.dialog.sameLocations')
            flow.end()
            logger.info(speech)
            return speech
        }

        // Get the data from Directions API
        const directionsData = await httpFactory.calculateRoute({
            origin: locationFrom,
            destination: locationTo,
            travelMode: travelMode,
            departureTime: departureTime
        })
        //logger.debug(directionsData)

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
