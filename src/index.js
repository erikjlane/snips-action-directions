const { withHermes } = require('hermes-javascript')
const bootstrap = require('./bootstrap')
const handlers = require('./handlers')
const { translation, logger } = require('./utils')
const { i18nFactory } = require('./factories')

// Initialize hermes
module.exports = function ({
    hermesOptions = {},
    bootstrapOptions = {}
} = {}) {
    withHermes(async (hermes, done) => {
        try {
            // Bootstrap config, locale, i18n…
            await bootstrap(bootstrapOptions)

            const dialog = hermes.dialog()

            // This is a placeholder! Replace that by something valid!
            dialog.flows([
                {
                    intent: 'snips-assistant:GetNavigationTime',
                    action: handlers.getNavigationTime
                },
                {
                    intent: 'snips-assistant:GetDepartureTime',
                    action: handlers.getDepartureTime
                },
                {
                    intent: 'snips-assistant:GetArrivalTime',
                    action: handlers.getArrivalTime
                },
                {
                    intent: 'snips-assistant:GetDirections',
                    action: handlers.getDirections
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
