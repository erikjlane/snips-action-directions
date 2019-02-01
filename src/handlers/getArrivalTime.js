const api = require('../api')
const { i18nFactory, configFactory } = require('../factories')
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
    const directions = await api.calculateRoute({
        origin: locationFrom,
        destination: locationTo,
        travel_mode: travelMode,
        departure_time: departureTime
    })

    let speech = ''

    try {
        const departureTime = directions.routes[0].legs[0].departure_time.value
        const arrivalTime = directions.routes[0].legs[0].arrival_time.value

        speech = translation.departureTimeToSpeech(locationFrom, locationTo, travelMode, departureTime, arrivalTime)
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }

    flow.end()

    logger.info(speech)
    return speech
}
