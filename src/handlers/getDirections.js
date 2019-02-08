const { httpFactory, i18nFactory } = require('../factories')
const { logger, translation, directions, slot } = require('../utils')
const commonHandler = require('./common')
 
module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info("GetDirections")

    if (knownSlots.depth === 0) {
        throw new Error('slotsNotRecognized')
    }
    
    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // One required slot is missing
    if (slot.missing(locationTo)) {
        flow.continue('snips-assistant:GetDirections', (msg, flow) => (
            require('./index').getDirections(msg, flow, {
                location_from: locationFrom,
                travel_mode: travelMode,
                depth: knownSlots.depth - 1
            })
        ))

        return i18n('directions.dialog.noDestinationAddress')
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
            travelMode: travelMode
        })
        //logger.debug(directionsData)

        const aggregatedDirectionsData = directions.aggregateDirections(directionsData)
        logger.debug(aggregatedDirectionsData)

        let speech = ''
        try {
            const destination = directionsData.routes[0].legs[0].end_address
            const duration = directionsData.routes[0].legs[0].duration.value
            const distance = directionsData.routes[0].legs[0].distance.value

            speech = translation.directionsToSpeech(locationFrom, destination, travelMode, duration, distance, aggregatedDirectionsData)
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}
