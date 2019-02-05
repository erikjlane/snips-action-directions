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

    // Get the data from Directions API
    const directionsData = await httpFactory.calculateRoute({
        origin: locationFrom,
        destination: locationTo,
        travelMode: travelMode
    })
    logger.debug(directionsData)

    let speech = ''

    try {
        const navigationTime = directionsData.routes[0].legs[0].duration.value
        speech = translation.navigationTimeToSpeech(locationFrom, locationTo, travelMode, navigationTime)
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }

    flow.end()

    logger.info(speech)
    return speech
}
