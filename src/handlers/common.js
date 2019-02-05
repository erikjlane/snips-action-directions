const { message, logger } = require('../utils')
const { configFactory } = require('../factories')
const { INTENT_PROBABILITY_THRESHOLD, HOME_SYNONYMS, WORK_SYNONYMS } = require('../constants')

function getCurrentLocation() {
    const config = configFactory.get()

    if (config.currentAddress) {
        switch (config.currentAddress) {
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
    if (!config.workAddress) {
        throw new Error('noWorkAddress')
    }
    return config.workAddress
}

function getHomeLocation() {
    const config = configFactory.get()
    if (!config.homeAddress) {
        throw new Error('noHomeAddress')
    }
    return config.homeAddress
}

function getRealAddress(location) {
    if (WORK_SYNONYMS.includes(location)) {
        return getWorkLocation()
    }
    if (HOME_SYNONYMS.includes(location)) {
        return getHomeLocation()
    }
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
        locationFrom = getRealAddress(locationFromSlot.value.value)
    } else {
        locationFrom = getCurrentLocation()
    }

    // location_to

    let locationTo = ''
    if (locationToSlot) {
        locationTo = getRealAddress(locationToSlot.value.value)
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
