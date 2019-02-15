const logger = require('./logger')

module.exports = {
    missing: slot => {
        const str = String(slot)
        logger.debug(str)
        return !slot || str.includes('unknownword')
    }
}