const {
    SLOT_CONFIDENCE_THRESHOLD
} = require('../constants')
const { getSlotsByName } = require('../utils/message')

module.exports = {
    missing: slot => {
        if (Array.isArray(slot)) {
            return slot.length === 0
        } else {
            const str = String(slot)
            return !slot || str.includes('unknownword')
        }
    },

    providedButNotUnderstood: (msg, slotName) => {
        const slot = getSlotsByName(msg, slotName, {
            onlyMostConfident: true
        })
    
        if (slot) {
            return slot.confidenceScore < SLOT_CONFIDENCE_THRESHOLD
        }

        return false
    }
}