import { message } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'

export const slot = {
    missing: (slot: string | string[]) => {
        if (slot instanceof Array) {
            return slot.length === 0
        }
        return !slot || slot.includes('unknownword')
    },

    providedButNotUnderstood: (msg, slotName) => {
        const slot = message.getSlotsByName(msg, slotName, {
            onlyMostConfident: true
        })
    
        if (slot) {
            return slot.confidenceScore < SLOT_CONFIDENCE_THRESHOLD
        }

        return false
    }
}
