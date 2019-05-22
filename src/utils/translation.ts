import { i18n } from 'snips-toolkit'
import { beautify, helpers } from '../utils'

export const translation = {
    navigationTimeToSpeech (locationFrom, locationTo, travelMode, duration, directionsData, durationInTraffic?: number) {
        let tts = ''

        // If no route has been found by travelMode
        if (helpers.noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n.translate('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n.translate('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = helpers.chosenTravelMode(directionsData)
        }

        tts += i18n.translate('directions.navigationTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            duration: beautify.duration(duration)
        })

        if (travelMode === 'driving') {
            if (durationInTraffic) {
                let trafficQualifier = ''

                if (durationInTraffic > 1.15 * duration) {
                    trafficQualifier = 'slower'
                } else if (durationInTraffic < 0.85 * duration) {
                    trafficQualifier = 'faster'
                }

                tts += ' '
                tts += i18n.translate('directions.navigationTime.trafficInfo.' + trafficQualifier, {
                    duration_in_traffic: beautify.duration(durationInTraffic)
                })
            }
        }

        return tts
    },

    departureTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime, directionsData) {
        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        let tts = ''

        // If no route has been found by travelMode
        if (helpers.noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n.translate('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n.translate('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = helpers.chosenTravelMode(directionsData)
        }

        tts += i18n.translate('directions.departureTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.time(departureTimeDate),
            arrival_time: beautify.time(arrivalTimeDate)
        })

        return tts
    },

    arrivalTimeToSpeech (locationFrom, locationTo, travelMode, departureTime, arrivalTime, directionsData) {
        // Date object handles the epoch in ms
        const departureTimeDate = new Date(departureTime * 1000)
        const arrivalTimeDate = new Date(arrivalTime * 1000)

        let tts = ''

        // If no route has been found by travelMode
        if (helpers.noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n.translate('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n.translate('directions.travel_modes.', travelMode)
            })
            tts += ' '
            travelMode = helpers.chosenTravelMode(directionsData)
        }

        tts += i18n.translate('directions.arrivalTime.' + travelMode, {
            location_from: beautify.address(locationFrom),
            location_to: beautify.address(locationTo),
            departure_time: beautify.time(departureTimeDate),
            arrival_time: beautify.time(arrivalTimeDate)
        })

        return tts
    },

    directionsToSpeech (locationFrom, locationTo, travelMode, duration, distance, directionsData) {
        let tts = ''

        // If no route has been found by travelMode
        if (helpers.noStepByTravelMode(travelMode, directionsData)) {
            tts += i18n.translate('directions.dialog.noTripWithTravelMode', {
                travel_mode: i18n.translate('travel_modes.' + travelMode)
            })
            tts += ' '
            travelMode = helpers.chosenTravelMode(directionsData)
        }

        if (travelMode !== 'transit' && travelMode !== 'train' && travelMode !== 'bus') {
            tts += i18n('directions.dialog.tooLongToExplain')
            tts += ' '
        }

        // Time to get there by travelMode
        tts += i18n.randomTranslation('directions.directions.' + travelMode + '.toDestination', {
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
                        // If the duration of the final step is insignificant, skip it
                        if (currentStep.duration > 60) {
                            tts += i18n.translate('directions.directions.transit.walkToFinalDestination', {
                                location_to: beautify.address(locationTo),
                                duration: beautify.duration(currentStep.duration)
                            })
                        } else {
                            tts += i18n.translate('directions.directions.transit.finalDestination', {
                                location_to: beautify.address(locationTo)
                            })
                        }
                    } else if (helpers.isConnection(directionsData, i)) {
                        // If the current step is a connection step, set a flag to true to adapt the next sentence
                        connection = true
                    } else {
                        // If the next step is a metro step, adapt the sentence accordingly
                        const nextStep = directionsData[i + 1]
                        tts += i18n.translate('directions.directions.transit.walkToMetro', {
                            arrival_stop: beautify.headsign(nextStep.departure_stop),
                            duration: beautify.duration(currentStep.duration)
                        })
                    }
                }
                else if (currentStep.travel_mode === 'TRANSIT') {
                    connection = false

                    tts += i18n.translate('directions.directions.transit.' + (connection ? 'connectionMetro' : 'metro'), {
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
