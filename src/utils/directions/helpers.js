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

module.exports = {
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
        for (let value of Object.entries(aggregatedDirectionsData)) {
            switch (travelMode) {
                case 'walking':
                    if (value.travel_mode === 'WALKING') return false
                    break
                case 'bicycling':
                    if (value.travel_mode === 'BICYCLING') return false
                    break
                case 'driving':
                    if (value.travel_mode === 'DRIVING') return false
                    break
                case 'transit':
                    if (value.travel_mode === 'TRANSIT') return false
                    break
                case 'bus':
                    if (value.travel_mode === 'TRANSIT' && buses.includes(value.vehicle_type)) return false
                    break
                case 'train':
                    if (value.travel_mode === 'TRANSIT' && trains.includes(value.vehicle_type)) return false
                    break
                default:
                    break
            }
        }
        return true
    },

    chosenTravelMode: aggregatedDirectionsData => {
        const defaultTravelMode = 'walking'
        let chosenTravelMode = defaultTravelMode

        for (let value of Object.entries(aggregatedDirectionsData)) {
            if (buses.includes(value.vehicle_type)) {
                if (chosenTravelMode !== defaultTravelMode) {
                    return 'transit'
                }
                chosenTravelMode = 'bus'
            }
            if (trains.includes(value.vehicle_type)) {
                if (chosenTravelMode !== defaultTravelMode) {
                    return 'transit'
                }
                chosenTravelMode = 'train'
            }
        }

        return chosenTravelMode
    }
}
