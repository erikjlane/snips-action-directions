export function createLocationFromSlot(address) {
    return {
        slotName: 'location_from',
        entity: 'address',
        confidenceScore: 1,
        rawValue: address,
        value: {
            kind: 'Custom',
            value: address
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createLocationToSlot(address) {
    return {
        slotName: 'location_to',
        entity: 'address',
        confidenceScore: 1,
        rawValue: address,
        value: {
            kind: 'Custom',
            value: address
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createTravelModeSlot(travelMode) {
    return {
        slotName: 'travel_mode',
        entity: 'travel_mode',
        confidenceScore: 1,
        rawValue: travelMode,
        value: {
            kind: 'Custom',
            value: travelMode
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createDepartureTimeSlot(departureTime) {
    return {
        slotName: 'departure_time',
        entity: 'snips/datetime',
        confidenceScore: 1,
        rawValue: departureTime,
        value: {
            kind: 'InstantTime',
            value: departureTime,
            grain: 'Hour',
            precision: 'Exact'
        },
        range: {
            start: 0,
            end: 1
        }
    }
}

export function createArrivalTimeSlot(arrivalTime) {
    return {
        slotName: 'arrival_time',
        entity: 'snips/datetime',
        confidenceScore: 1,
        rawValue: arrivalTime,
        value: {
            kind: 'InstantTime',
            value: arrivalTime,
            grain: 'Hour',
            precision: 'Exact'
        },
        range: {
            start: 0,
            end: 1
        }
    }
}
