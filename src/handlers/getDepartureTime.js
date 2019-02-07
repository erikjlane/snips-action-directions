const { i18nFactory, httpFactory } = require('../factories')
const { message, logger, translation } = require('../utils')
const commonHandler = require('./common')

module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    if (knownSlots.depth === 0) {
        throw new Error('slotsNotRecognized')
    }

    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // Get arrival_time specific slot
    const arrivalTimeSlot = message.getSlotsByName(msg, 'arrival_time', { onlyMostConfident: true })

    if (!arrivalTimeSlot) {
        throw new Error('noArrivalTime')
    }

    const arrivalTimeDate = new Date(arrivalTimeSlot.value.value.value)
    const arrivalTime = arrivalTimeDate.getTime() / 1000

    logger.info("arrival_time: ", arrivalTime)

    // One required slot is missing
    if (!locationTo || locationTo.includes('unknownword')) {
        flow.continue('snips-assistant:GetDepartureTime', (msg, flow) => (
            require('./index').getDepartureTime(msg, flow, {
                location_to: locationTo,
                location_from: locationFrom,
                travel_mode: travelMode,
                depth: knownSlots.depth - 1
            })
        ))

        return i18n('directions.dialog.noDestinationAddress')
    } else {
        // Get the data from Directions API
        const directionsData = await httpFactory.calculateRoute({
            origin: locationFrom,
            destination: locationTo,
            travelMode: travelMode,
            arrivalTime: arrivalTime
        })
        //logger.debug(directionsData)

        let speech = ''
        try {
            const destination = directionsData.routes[0].legs[0].end_address
            const departureTime = directionsData.routes[0].legs[0].departure_time.value
            const arrivalTime = directionsData.routes[0].legs[0].arrival_time.value

            speech = translation.departureTimeToSpeech(locationFrom, destination, travelMode, departureTime, arrivalTime)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }
    
        flow.end()
        logger.info(speech)
        return speech
    }
}
