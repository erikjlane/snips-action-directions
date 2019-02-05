const { i18nFactory, configFactory } = require('../factories')
const { info } = require('./logger')

function getFormattedHoursAndMinutes (date) {
    return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
}

module.exports = {
    // Outputs an error message based on the error object, or a default message if not found.
    errorMessage: async error => {
        let i18n = i18nFactory.get()

        if (!i18n) {
            await i18nFactory.init()
            i18n = i18nFactory.get()
        }

        if (i18n) {
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
        info(i18nFactory)
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
    },
    directionsToSpeech (locationFrom, locationTo, travelMode, directionsData) {
        const i18n = i18nFactory.get()
        const config = configFactory.get()

        let tts = ''
        let i
        for (i = 0; i < directionsData.length; i++) {
            const currentStep = directionsData[i]
            const nextStep = directionsData[i + 1]

            if (currentStep.travel_mode === 'WALKING') {
                if (nextStep && nextStep.travel_mode === 'TRANSIT') {
                    if (currentStep.duration > 90) {
                        tts += i18n('directions.info.walkToMetro', {
                            arrival_stop: nextStep.departure_stop,
                            duration: currentStep.duration / 60
                        })
                    }
                } else {
                    tts += i18n('directions.info.walkToFinalLocation', {
                        distance: currentStep.distance,
                        location_to: locationTo
                    })
                }
            }
            else if (currentStep.travel_mode === 'TRANSIT') {
                tts += i18n('directions.info.metro', {
                    line_name: currentStep.line_name,
                    headsign: currentStep.headsign,
                    arrival_stop: currentStep.arrival_stop
                })
            }
            tts += ' '
        }

        return tts
    },
    trafficInfoToSpeech (locationFrom, locationTo, travelMode) {
        const i18n = i18nFactory.get()
        const config = configFactory.get()

        const tts = i18n('directions.info.trafficInfo', {
            location_from: locationFrom,
            location_to: locationTo,
            travel_mode: travelMode
        })

        return tts
    }
}
