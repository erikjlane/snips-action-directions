const { i18nFactory, configFactory } = require('../factories')
const { isToday } = require('./time')
const { info } = require('./logger')

function getFormattedHoursAndMinutes (date) {
    return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
}

module.exports = {
    // Outputs an error message based on the error object, or a default message if not found.
    errorMessage: async error => {
        let i18n = i18nFactory.get()

        if(!i18n) {
            await i18nFactory.init()
            i18n = i18nFactory.get()
        }

        if(i18n) {
            return i18n([`error.${error.message}`, 'error.unspecific'])
        } else {
            return 'Oops, something went wrong.'
        }
    },
    // Takes an array from the i18n and returns a random item.
    randomTranslation (key, opts) {
        const i18n = i18nFactory.get()
        const possibleValues = i18n(key, { returnObjects: true, ...opts })
        const randomIndex = Math.floor(Math.random() * possibleValues.length)
        return possibleValues[randomIndex]
    },
    navigationTimeToSpeech (locationFrom, locationTo, travelMode, navigationTime) {
        const i18n = i18nFactory.get()
        const config = configFactory.get()

        const tts =
            i18n('directions.info.navigationTime', {
                location_to: locationTo,
                navigation_time: Math.round(navigationTime / 60)
            }) +
            ' ' +
            i18n('directions.fromLocation.' + config.currentAddress) +
            '.'

        return tts
    },
    departureTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime) {
        const i18n = i18nFactory.get()
        const config = configFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        const tts =
            i18n('directions.info.departureTime', {
                location_to: locationTo,
                departure_time: getFormattedHoursAndMinutes(departureTimeDate),
                arrival_time: getFormattedHoursAndMinutes(arrivalTimeDate)
            }) +
            ' ' +
            i18n('directions.fromLocation.' + config.currentAddress) +
            '.'

        return tts
    },
    arrivalTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime) {
        const i18n = i18nFactory.get()

        const config = configFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        const tts =
            i18n('directions.info.departureTime', {
                location_to: locationTo,
                departure_time: getFormattedHoursAndMinutes(departureTimeDate),
                arrival_time: getFormattedHoursAndMinutes(arrivalTimeDate)
            }) +
            ' ' +
            i18n('directions.fromLocation.' + config.currentAddress) +
            '.'

        return tts
    }
}
