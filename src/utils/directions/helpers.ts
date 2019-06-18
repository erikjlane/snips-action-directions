import { config } from 'snips-toolkit'

const buses = [
    'BUS',
    'INTERCITY_BUS',
    'TROLLEYBUS'
]
const trains = [
    'HEAVY_RAIL',
    'COMMUTER_TRAIN',
    'HIGH_SPEED_TRAIN',
    'LONG_DISTANCE_TRAIN'
]

export const helpers = {
    isConnection: (aggregatedDirectionsData, currentIndex) => {
        const previousStep = aggregatedDirectionsData[currentIndex - 1]
        const currentStep = aggregatedDirectionsData[currentIndex]
        const nextStep = aggregatedDirectionsData[currentIndex + 1]

        return previousStep && currentStep && nextStep
            && currentStep.travel_mode === 'WALKING' &&
            previousStep.travel_mode == 'TRANSIT' &&
            nextStep.travel_mode === 'TRANSIT'
    },

    noStepByTravelMode: (travelMode, aggregatedDirectionsData) => {
        for (let element of Object.values(aggregatedDirectionsData)) {
            switch (travelMode) {
                case 'walking':
                    if (element.travel_mode === 'WALKING') return false
                    break
                case 'bicycling':
                    if (element.travel_mode === 'BICYCLING') return false
                    break
                case 'driving':
                    if (element.travel_mode === 'DRIVING') return false
                    break
                case 'transit':
                    if (element.travel_mode === 'TRANSIT') return false
                    break
                case 'bus':
                    if (element.travel_mode === 'TRANSIT' && buses.includes(element.vehicle_type)) return false
                    break
                case 'train':
                    if (element.travel_mode === 'TRANSIT' && trains.includes(element.vehicle_type)) return false
                    break
                default:
                    break
            }
        }
        return true
    },

    getFullAddress: (locationFrom, locationTo, directionsData) => {
        let origin = locationFrom
        if (!locationFrom.includes(config.get().homeAddress) && !locationFrom.includes(config.get().workAddress)) {
            origin = directionsData.routes[0].legs[0].start_address_name
            if (!origin) {
                origin = directionsData.routes[0].legs[0].start_address
            }
        }

        let destination = locationTo
        if (!locationTo.includes(config.get().homeAddress) && !locationTo.includes(config.get().workAddress)) {
            destination = directionsData.routes[0].legs[0].end_address_name
            if (!destination) {
                destination = directionsData.routes[0].legs[0].end_address
            }
        }

        return { origin, destination }
    },

    chosenTravelMode: aggregatedDirectionsData => {
        const defaultTravelMode = 'walking'
        let chosenTravelMode = defaultTravelMode

        for (let element of Object.values(aggregatedDirectionsData)) {
            if (buses.includes(element.vehicle_type)) {
                if (chosenTravelMode !== defaultTravelMode) {
                    return 'transit'
                }
                chosenTravelMode = 'bus'
            }
            if (trains.includes(element.vehicle_type)) {
                if (chosenTravelMode !== defaultTravelMode) {
                    return 'transit'
                }
                chosenTravelMode = 'train'
            }
        }

        return chosenTravelMode
    }
}
