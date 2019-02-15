const { i18nFactory, directionsHttpFactory } = require('../factories')
const { logger, translation, directions, slot } = require('../utils')
const commonHandler = require('./common')
const {
    INTENT_FILTER_PROBABILITY_THRESHOLD
} = require('../constants')

module.exports = async function (msg, flow, knownSlots = { depth: 2 }) {
    const i18n = i18nFactory.get()

    logger.info('GetNavigationTime')
    
    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // One required slot is missing
    if (slot.missing(locationTo)) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        flow.continue('snips-assistant:GetNavigationTime', (msg, flow) => {
            if (msg.intent.probability < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return require('./index').getNavigationTime(msg, flow, {
                location_from: locationFrom,
                travel_mode: travelMode,
                depth: knownSlots.depth - 1
            })
        })

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:Stop', (_, flow) => {
            flow.end()
        })

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
        const directionsData = await directionsHttpFactory.calculateRoute({
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

            if (travelMode === 'driving') {
                const durationInTraffic = directionsData.routes[0].legs[0].duration_in_traffic.value

                speech = translation.navigationTimeToSpeech(locationFrom, destination, travelMode, duration, aggregatedDirectionsData, durationInTraffic)
            } else {
                speech = translation.navigationTimeToSpeech(locationFrom, destination, travelMode, duration, aggregatedDirectionsData)
            }
        } catch (error) {
            logger.error(error)
            throw new Error('APIResponse')
        }

        flow.end()
        logger.info(speech)
        return speech
    }
}
