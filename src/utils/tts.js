const { Dialog } = require('hermes-javascript')

module.exports = {
    say: (hermes, text, siteId='default') => {
        const dialog = hermes.dialog()
        
        dialog.publish('start_session', {
            init: {
                type: Dialog.enums.initType.notification,
                text
            },
            siteId
        })
    }
}
