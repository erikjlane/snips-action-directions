const logger = require('./logger')

module.exports = {
    missing: slot => {
        const str = String(slot)
        return !slot || str.includes('unknownword')
    }
}