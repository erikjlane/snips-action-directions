import { Enums } from 'hermes-javascript/types'

export const tts = {
    say: (hermes, text, siteId='default') => {
        const dialog = hermes.dialog()

        dialog.publish('start_session', {
            init: {
                type: Enums.initType.notification,
                text
            },
            siteId
        })
    }
}
