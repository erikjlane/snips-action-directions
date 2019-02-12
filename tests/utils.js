module.exports = {
    createLocationFromSlot(address) {
        return {
            slotName: 'location_from',
            entity: 'address',
            confidence: 1,
            rawValue: address,
            value: {
                kind: 'Custom',
                value: address
            }
        }
    },

    createLocationToSlot (address) {
        return {
            slotName: 'location_to',
            entity: 'address',
            confidence: 1,
            rawValue: address,
            value: {
                kind: 'Custom',
                value: address
            }
        }
    },

    createTravelModeSlot (travelMode) {
        return {
            slotName: 'travel_mode',
            entity: 'travel_mode',
            confidence: 1,
            rawValue: travelMode,
            value: {
                kind: 'Custom',
                value: travelMode
            }
        }
    },

    createDepartureTimeSlot (departureTime) {
        return {
            slotName: 'departure_time',
            entity: 'snips/datetime',
            confidence: 1,
            rawValue: departureTime,
            value: {
                kind: 'InstantTime',
                value: departureTime,
                grain: 'Hour',
                precision: 'Exact'
            }
        }
    },

    createArrivalTimeSlot (arrivalTime) {
        return {
            slotName: 'arrival_time',
            entity: 'snips/datetime',
            confidence: 1,
            rawValue: arrivalTime,
            value: {
                kind: 'InstantTime',
                value: arrivalTime,
                grain: 'Hour',
                precision: 'Exact'
            }
        }
    }
}
