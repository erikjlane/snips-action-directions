const { configFactory, i18nFactory, directionsHttpFactory, placesHttpFactory } = require('./factories')

const {
    LANGUAGE_MAPPINGS
} = require('./constants')

// Put anything that needs to be called on app. startup here.
module.exports = async (bootstrapOptions) => {
    configFactory.init()
    const config = configFactory.get()
    const language = LANGUAGE_MAPPINGS[config.locale]
    await i18nFactory.init(language, bootstrapOptions.i18n)
    directionsHttpFactory.init(bootstrapOptions.http)
    placesHttpFactory.init(bootstrapOptions.http)
}