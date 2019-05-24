import { CalculateRoutePayload, Step, AggregatedData } from '../../api'

export const aggregate = {
    aggregateDirections: (directionsData: CalculateRoutePayload): AggregatedData[] => {
        const steps: Step[] = directionsData.routes[0].legs[0].steps
        let data: AggregatedData[] = []

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            data.push({
                travel_mode: step.travel_mode,
                distance: step.distance.value,
                duration: step.duration.value,
                line_name: (step.transit_details) ? step.transit_details.line.short_name : undefined,
                vehicle_type: (step.transit_details) ? step.transit_details.line.vehicle.type : undefined,
                headsign: (step.transit_details) ? step.transit_details.headsign : undefined,
                departure_stop: (step.transit_details) ? step.transit_details.departure_stop.name : undefined,
                arrival_stop: (step.transit_details) ? step.transit_details.arrival_stop.name : undefined,
            })
        }

        return data
    }
}
