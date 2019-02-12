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
