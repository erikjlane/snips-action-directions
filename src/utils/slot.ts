import { message } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'

export const slot = {
    missing: (slot: string | string[] | any) => {
        if (slot instanceof Array) {
            return slot.length === 0
        } else if (slot instanceof String) {
            return !slot || slot.includes('unknownword')
        } else {
            return !slot
        }
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
