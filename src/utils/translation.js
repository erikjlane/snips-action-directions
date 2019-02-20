const { i18nFactory } = require('../factories')
const { isConnection, noStepByTravelMode, chosenTravelMode } = require('./directions')
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

    navigationTimeToSpeech (locationFrom, locationTo, travelMode, duration, directionsData, durationInTraffic = '') {
        const i18n = i18nFactory.get()

        let tts = ''

        // If no route has been found by travelMode
        if (noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = chosenTravelMode(directionsData)
        }

        tts += i18n('directions.navigationTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            duration: beautify.duration(duration)
        })

        if (travelMode === 'driving') {
            let trafficQualifier = ''

            if (durationInTraffic > 1.05 * duration) {
                trafficQualifier = 'slower'
            } else if (durationInTraffic < 0.95 * duration) {
                trafficQualifier = 'faster'
            }

            if (trafficQualifier) {
                tts += ' '
                tts += i18n('directions.navigationTime.trafficInfo.' + trafficQualifier, {
                    duration_in_traffic: beautify.duration(durationInTraffic)
                })
            }
        }

        return tts
    },

    departureTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime, directionsData) {
        const i18n = i18nFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        let tts = ''

        // If no route has been found by travelMode
        if (noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = chosenTravelMode(directionsData)
        }

        tts += i18n('directions.departureTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.time(departureTimeDate),
            arrival_time: beautify.time(arrivalTimeDate)
        })

        return tts
    },

    arrivalTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime, directionsData) {
        const i18n = i18nFactory.get()

        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        let tts = ''

        // If no route has been found by travelMode
        if (noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = chosenTravelMode(directionsData)
        }

        tts += i18n('directions.arrivalTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.time(departureTimeDate),
            arrival_time: beautify.time(arrivalTimeDate)
        })

        return tts
    },

    directionsToSpeech (locationFrom, locationTo, travelMode, duration, distance, directionsData) {
        const i18n = i18nFactory.get()
        const { randomTranslation } = module.exports

        let tts = ''

        // If no route has been found by travelMode
        if (noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n('travel_modes.' + travelMode)
            })
            tts += ' '
            travelMode = chosenTravelMode(directionsData)
        }

        // Time to get there by travelMode
        tts += randomTranslation('directions.directions.' + travelMode + '.toDestination', {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            duration: beautify.duration(duration),
            distance: beautify.distance(distance)
        })

        // Directions explanation (which stations?)
        if (travelMode === 'transit' || travelMode === 'train' || travelMode === 'bus') {
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
                            arrival_stop: beautify.headsign(nextStep.departure_stop),
                            duration: beautify.duration(currentStep.duration)
                        })
                    }
                }
                else if (currentStep.travel_mode === 'TRANSIT') {
                    connection = false

                    tts += i18n('directions.directions.transit.' + (connection ? 'connectionMetro' : 'metro'), {
                        line_name: currentStep.line_name,
                        headsign: beautify.headsign(currentStep.headsign),
                        arrival_stop: beautify.headsign(currentStep.arrival_stop)
                    })
                }
                tts += ' '
            }
        }

        return tts
    }
}
