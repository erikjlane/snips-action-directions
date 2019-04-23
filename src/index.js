const { withHermes } = require('hermes-javascript')
const bootstrap = require('./bootstrap')
const handlers = require('./handlers')
const { translation, logger } = require('./utils')

// Initialize hermes
module.exports = function ({
    // address: '192.168.171.167:1883'
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) {
    withHermes(async (hermes, done) => {
        try {
            // Bootstrap config, locale, i18n…
            await bootstrap(bootstrapOptions)

            const dialog = hermes.dialog()
            dialog.flows([
                {
                    intent: 'snips-assistant:GetNavigationTime',
                    action: (msg, flow) => handlers.getNavigationTime(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:GetDepartureTime',
                    action: (msg, flow) => handlers.getDepartureTime(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:GetArrivalTime',
                    action: (msg, flow) => handlers.getArrivalTime(msg, flow, hermes)
                },
                {
                    intent: 'snips-assistant:GetDirections',
                    action: (msg, flow) => handlers.getDirections(msg, flow, hermes)
                }
            ])
        } catch (error) {
            // Output initialization errors to stderr and exit
            const message = await translation.errorMessage(error)
            logger.error(message)
            logger.error(error)
            // Exit
            done()
        }
    }, hermesOptions)
}
