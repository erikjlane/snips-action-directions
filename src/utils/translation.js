const { i18nFactory, configFactory } = require('../factories')
const { isConnection } = require('./directions')
const beautify = require('./beautify')

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

    navigationTimeToSpeech (locationFrom, locationTo, travelMode, duration) {
        const i18n = i18nFactory.get()

        return i18n('directions.navigationTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            duration: Math.round(duration / 60)
        })
    },

    departureTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime) {
        const i18n = i18nFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        return i18n('directions.departureTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.hoursAndMinutes(departureTimeDate),
            arrival_time: beautify.hoursAndMinutes(arrivalTimeDate)
        })
    },

    arrivalTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime) {
        const i18n = i18nFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        return i18n('directions.arrivalTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.hoursAndMinutes(departureTimeDate),
            arrival_time: beautify.hoursAndMinutes(arrivalTimeDate)
        })
    },

    directionsToSpeech (locationFrom, locationTo, travelMode, duration, distance, directionsData) {
        const i18n = i18nFactory.get()
        const { randomTranslation } = module.exports

        let tts = randomTranslation('directions.directions.' + travelMode + '.toDestination', {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            duration: Math.round(duration / 60),
            distance: beautify.distance(distance)
        })

        if (travelMode === 'transit') {
            tts += ' '

            let connection = false
            for (let i = 0; i < directionsData.length; i++) {
                const currentStep = directionsData[i]

                if (currentStep.travel_mode === 'WALKING') {
                    if (i === directionsData.length - 1) {
                        // If the distance of the final step is insignificant, skip it
                        if (currentStep.distance > 100) {
                            tts += i18n('directions.directions.transit.walkToFinalDestination', {
                                distance: beautify.distance(currentStep.distance),
                                location_to: beautify.address(locationTo)
                            })
                        }
                    } else if (isConnection(directionsData, i)) {
                        // If the current step is a connection step, set a flag to true to adapt the next sentence
                        connection = true
                    } else {
                        // If the next step is a metro step, adapt the sentence accordingly
                        const nextStep = directionsData[i + 1]
                        tts += i18n('directions.directions.transit.walkToMetro', {
                            arrival_stop: nextStep.departure_stop,
                            duration: Math.round(currentStep.duration / 60)
                        })
                    }
                }
                else if (currentStep.travel_mode === 'TRANSIT') {
                    if (!connection) {
                        tts += i18n('directions.directions.transit.metro', {
                            line_name: currentStep.line_name,
                            headsign: currentStep.headsign,
                            arrival_stop: currentStep.arrival_stop
                        })
                    } else {
                        tts += i18n('directions.directions.transit.connectionMetro', {
                            line_name: currentStep.line_name,
                            headsign: currentStep.headsign,
                            arrival_stop: currentStep.arrival_stop
                        })
                        connection = false
                    }
                }
                tts += ' '
            }
        }

        return tts
    },

    trafficInfoToSpeech (locationFrom, locationTo, travelMode, duration, durationInTraffic = '') {
        const i18n = i18nFactory.get()

        if (travelMode === 'driving') {
            return i18n('directions.trafficInfo.driving', {
                location_from: beautify.address(locationFrom),
                location_to: beautify.address(locationTo),
                duration: Math.round(duration / 60),
                duration_in_traffic: Math.round(durationInTraffic / 60)
            })
        } else {
            return i18n('directions.trafficInfo.' + travelMode, {
                location_from: beautify.address(locationFrom),
                location_to: beautify.address(locationTo),
                duration: Math.round(duration / 60)
            })
        }
    }
}
