import { handler, ConfidenceThresholds } from 'snips-toolkit'
import { getNavigationTimeHandler } from './getNavigationTime'
import { getArrivalTimeHandler } from './getArrivalTime'
import { getDepartureTimeHandler } from './getDepartureTime'
import { getDirectionsHandler } from './getDirections'
import { INTENT_PROBABILITY_THRESHOLD, ASR_UTTERANCE_CONFIDENCE_THRESHOLD } from '../constants'

const thresholds: ConfidenceThresholds = {
    intent: INTENT_PROBABILITY_THRESHOLD,
    asr: ASR_UTTERANCE_CONFIDENCE_THRESHOLD
}

// Add handlers here, and wrap them.
export default {
    getNavigationTime: handler.wrap(getNavigationTimeHandler, thresholds),
    getArrivalTime: handler.wrap(getArrivalTimeHandler, thresholds),
    getDepartureTime: handler.wrap(getDepartureTimeHandler, thresholds),
    getDirections: handler.wrap(getDirectionsHandler, thresholds)
}
