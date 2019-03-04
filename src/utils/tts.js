const { Hermes, Dialog } = require('hermes-javascript')
const logger = require('./logger')

module.exports = {
    say: (text, siteId='default') => {
        const hermes = new Hermes()
        const dialog = hermes.dialog()
        
        logger.info(text)

        dialog.publish('start_session', {
            init: {
                type: Dialog.enums.initType.notification,
                text
            },
            siteId
        })
    }
}