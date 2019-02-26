const { message, logger } = require('../utils')
const { configFactory } = require('../factories')
const {
    HOME_SYNONYMS,
    WORK_SYNONYMS,
    INTENT_PROBABILITY_THRESHOLD,
    SLOT_CONFIDENCE_THRESHOLD,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD
} = require('../constants')

function getCurrentLocation() {
    const config = configFactory.get()

    if (config.currentLocation) {
        switch (config.currentLocation) {
            case 'work':
                return getWorkLocation()
            case 'home':
                return getHomeLocation()
            default:
                throw new Error('badCurrentAddress')
        }
    } else {
        throw new Error('noCurrentAddress')
    }
}

function getWorkLocation() {
    const config = configFactory.get()

    if (!config.workAddress || !config.workCity) {
        throw new Error('noWorkAddress')
    }

    return config.workAddress + ' ' + config.workCity
}

function getHomeLocation() {
    const config = configFactory.get()

    if (!config.homeAddress || !config.homeCity) {
        throw new Error('noHomeAddress')
    }

    return config.homeAddress + ' ' + config.homeCity
}

function getCompleteAddress(location) {
    if (WORK_SYNONYMS.includes(location)) {
        return getWorkLocation()
    }
    if (HOME_SYNONYMS.includes(location)) {
        return getHomeLocation()
    }

    // Increasing precision if current city in provided
    /*
    if (config.currentLocation) {
        switch (config.currentLocation) {
            case 'work':
                if (!location.includes(config.workCity)) {
                    location += ' ' + config.workCity
                }
                break
            case 'home':
                if (!location.includes(config.homeCity)) {
                    location += ' ' + config.homeCity
                }
                break
            default:
                break
        }
    }
    */

    return location
}

function checkCurrentCoordinates() {
    const config = configFactory.get()

    if (!config.currentCoordinates) {
        throw new Error('noCurrentCoordinates')
    }
}

module.exports = async function (msg, knownSlots = {}) {
    if (msg.intent) {
        if (msg.intent.probability < INTENT_PROBABILITY_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
        if (message.getAsrConfidence(msg) < ASR_UTTERANCE_CONFIDENCE_THRESHOLD) {
            throw new Error('intentNotRecognized')
        }
    }

    checkCurrentCoordinates()

    let locationFrom, locationTo, travelMode

    // Slot location_from
    if (!('location_from' in knownSlots)) {
        const locationFromSlot = message.getSlotsByName(msg, 'location_from', {
            onlyMostConfident: true
        })

        if (locationFromSlot) {
            if (locationFromSlot.confidence >= SLOT_CONFIDENCE_THRESHOLD) {
                locationFrom = getCompleteAddress(locationFromSlot.value.value)
            }
        } else {
            locationFrom = getCurrentLocation()
        }
    } else {
        locationFrom = knownSlots.location_from
    }

    // Here, the previous slot location_from can be missing if the attached confidence is too slow

    // Slot location_to
    if (!('location_to' in knownSlots)) {
        const locationToSlot = message.getSlotsByName(msg, 'location_to', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (locationToSlot) {
            locationTo = getCompleteAddress(locationToSlot.value.value)
        }
    } else {
        locationTo = knownSlots.location_to
    }

    // Slot travel_mode
    if (!('travel_mode' in knownSlots)) {
        const travelModeSlot = message.getSlotsByName(msg, 'travel_mode', { 
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (travelModeSlot) {
            const travelModeAvailable = {
                bike: 'bicycling',
                car: 'driving',
                walk: 'walking',
                subway: 'transit',
                train: 'train',
                bus: 'bus'
            }
            travelMode = travelModeAvailable[travelModeSlot.value.value] || 'transit'
        } else {
            travelMode = 'transit'
        }
    } else {
        travelMode = knownSlots.travel_mode
    }

    logger.info('\tlocation_from: ', locationFrom)
    logger.info('\tlocation_to: ', locationTo)
    logger.info('\ttravel_mode: ', travelMode)

    return { locationFrom, locationTo, travelMode }
}
