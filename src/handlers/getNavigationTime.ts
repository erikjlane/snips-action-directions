import { translation, slot, tts, aggregate, helpers } from '../utils'
import commonHandler, { KnownSlots } from './common'
import { INTENT_FILTER_PROBABILITY_THRESHOLD } from '../constants'
import { i18n, Handler, logger } from 'snips-toolkit'
import { calculateRoute } from '../api'
import handlers from './index'

export const getNavigationTimeHandler: Handler = async function (msg, flow, hermes, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('GetNavigationTime')
    
    // Extracting slots
    const {
        locationFrom,
        locationTo,
        travelMode
    } = await commonHandler(msg, knownSlots)

    // One required slot is missing
    if (slot.missing(locationTo)) {
        throw new Error('intentNotRecognized')
    }

    // origin was provided but not understood
    if (slot.providedButNotUnderstood(msg, 'location_from')) {
        if (knownSlots.depth === 0) {
            throw new Error('slotsNotRecognized')
        }

        // elicitation intent
        flow.continue('snips-assistant:ElicitOrigin', (msg, flow) => {
            if (msg.intent.confidenceScore < INTENT_FILTER_PROBABILITY_THRESHOLD) {
                throw new Error('intentNotRecognized')
            }

            return handlers.getNavigationTime(msg, flow, hermes, {
                travel_mode: travelMode,
                location_to: locationTo,
                depth: knownSlots.depth - 1
            })
        })

        // intent not recognized
        /*
        flow.notRecognized((msg, flow) => {
            knownSlots.depth -= 1
            return handlers.getNavigationTime(msg, flow, hermes, knownSlots)
        })
        */

        flow.continue('snips-assistant:Cancel', (_, flow) => {
            flow.end()
        })
        flow.continue('snips-assistant:StopSilence', (_, flow) => {
            flow.end()
        })

        return i18n.translate('directions.dialog.noOriginAddress')
    }

    // Are the origin and destination addresses the same?
    if (locationFrom.includes(locationTo) || locationTo.includes(locationFrom)) {
        const speech = i18n.translate('directions.dialog.sameLocations')
        flow.end()
        logger.info(speech)
        return speech
    }

    const now = Date.now()

    // Get the data from Directions API
    const directionsData = await calculateRoute(locationFrom, locationTo, travelMode)
    //logger.debug(directionsData)

    try {
        const aggregatedDirectionsData = aggregate.aggregateDirections(directionsData)
        //logger.debug(aggregatedDirectionsData)

        const { origin, destination } = helpers.getFullAddress(locationFrom, locationTo, directionsData)
        const duration = directionsData.routes[0].legs[0].duration.value

        let durationInTraffic
        if (travelMode === 'driving') {
            durationInTraffic = directionsData.routes[0].legs[0].duration_in_traffic.value
        }
        
        const speech = translation.navigationTimeToSpeech(origin, destination, travelMode, duration, aggregatedDirectionsData, durationInTraffic)
        logger.info(speech)

        flow.end()
        if (Date.now() - now < 4000) {
            return speech
        } else {
            tts.say(hermes, speech)
        }
    } catch (error) {
        logger.error(error)
        throw new Error('APIResponse')
    }
}
