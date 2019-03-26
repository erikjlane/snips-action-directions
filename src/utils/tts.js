const { Hermes, Dialog } = require('hermes-javascript')

module.exports = {
    say: (text, siteId='default') => {
        const hermes = new Hermes()
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