const { message, logger } = require('../utils')
const { configFactory } = require('../factories')
const { INTENT_PROBABILITY_THRESHOLD } = require('../constants')

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

    // If no location_from was specified, fallback to the default location
    let locationFromDefault = ''
    if (!locationFromSlot) {
        const config = configFactory.get()
        if (!config.currentAddress) {
            throw new Error('noCurrentAddress')
        } else {
            if (config.currentAddress === 'work') {
                if (!config.workAddress) {
                    throw new Error('noWorkAddress')
                }
                locationFromDefault = config.workAddress
            } else if (config.currentAddress === 'home') {
                if (!config.homeAddress) {
                    throw new Error('noHomeAddress')
                }
                locationFromDefault = config.homeAddress
            } else {
                throw new Error('badCurrentAddress')
            }
        }
    }

    if (!locationToSlot) {
        return new Error('noDestinationAddress')
    }

    return {
        locationFrom: locationFromSlot ? locationFromSlot.value.value : locationFromDefault,
        locationTo: locationToSlot.value.value,
        travelMode: travelModeSlot ? travelModeSlot : 'transit'
    }
}
