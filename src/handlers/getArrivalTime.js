const { i18nFactory, configFactory, httpFactory } = require('../factories')
const { message, logger, translation } = require('../utils')
const commonHandler = require('./common')

module.exports = async function (msg, flow) {
    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg)

    logger.info("location_from: ", locationFrom)
    logger.info("location_to: ", locationTo)
    logger.info("travel_mode: ", travelMode)

    // Get departure_time specific slot
    const departureTimeSlot = message.getSlotsByName(msg, 'departure_time', { onlyMostConfident: true })

    if (!departureTimeSlot) {
        throw new Error('noDepartureTime')
    }

    const departureTimeDate = new Date(departureTimeSlot.value.value.value)
    const departureTime = departureTimeDate.getTime() / 1000

    logger.info("arrival_time: ", departureTime)

    // Get the data from Directions API
    const directionsData = await httpFactory.calculateRoute({
        origin: locationFrom,
        destination: locationTo,
        travelMode: travelMode,
        departureTime: departureTime
    })
    logger.debug(directionsData)

    let speech = ''

    try {
        const departureTime = directionsData.routes[0].legs[0].departure_time.value
        const arrivalTime = directionsData.routes[0].legs[0].arrival_time.value

        speech = translation.departureTimeToSpeech(locationFrom, locationTo, travelMode, departureTime, arrivalTime)
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }

    flow.end()

    logger.info(speech)
    return speech
}
