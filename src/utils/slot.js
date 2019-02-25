module.exports = {
    missing: slot => {
        if (Array.isArray(slot)) {
            return slot.length === 0
        } else {
            const str = String(slot)
            return !slot || str.includes('unknownword')
        }
    }
}