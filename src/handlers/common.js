const { message, logger } = require('../utils')
const { configFactory } = require('../factories')
const { INTENT_PROBABILITY_THRESHOLD, HOME_SYNONYMS, WORK_SYNONYMS } = require('../constants')

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
    const config = configFactory.get()

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

module.exports = async function (msg) {
    const config = configFactory.get()

    if (msg.intent.probability < INTENT_PROBABILITY_THRESHOLD) {
        throw new Error('intentNotRecognized')
    }

    // If there are multiple, we take the only that is supposed to be the 'most valid'.
    // We discard slots with a confidence value too low.
    const locationFromSlot = message.getSlotsByName(msg, 'location_from', { onlyMostConfident: true })
    const locationToSlot = message.getSlotsByName(msg, 'location_to', { onlyMostConfident: true })
    const travelModeSlot = message.getSlotsByName(msg, 'travel_mode', { onlyMostConfident: true })

    // location_from

    let locationFrom = ''
    if (locationFromSlot) {
        locationFrom = getCompleteAddress(locationFromSlot.value.value)
    } else {
        locationFrom = getCurrentLocation()
    }

    // location_to

    let locationTo = ''
    if (locationToSlot) {
        locationTo = getCompleteAddress(locationToSlot.value.value)
    } else {
        return new Error('noDestinationAddress')
    }

    // travel_mode

    let travelMode = ''
    if (travelModeSlot) {
        const travelModeAvailable = {
            'bike': 'bicycling',
            'car': 'driving',
            'walk': 'walking',
            'train': 'transit',
            'bus': 'bus'
        }
        travelMode = travelModeAvailable[travelModeSlot.value.value] || 'transit'
    } else {
        travelMode = 'transit'
    }

    return {
        locationFrom,
        locationTo,
        travelMode
    }
}
