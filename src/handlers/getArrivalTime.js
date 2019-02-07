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

    // Get departure_time specific slot
    const departureTimeSlot = message.getSlotsByName(msg, 'departure_time', { onlyMostConfident: true })

    if (!departureTimeSlot) {
        throw new Error('noDepartureTime')
    }

    const departureTimeDate = new Date(departureTimeSlot.value.value.value)
    const departureTime = departureTimeDate.getTime() / 1000

    logger.info("arrival_time: ", departureTime)

    // One required slot is missing
    if (!locationTo || locationTo.includes('unknownword')) {
        flow.continue('snips-assistant:GetArrivalTime', (msg, flow) => (
            require('./index').getArrivalTime(msg, flow, {
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
            departureTime: departureTime
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
