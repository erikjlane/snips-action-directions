export interface CalculateRoutePayload {
    geocoded_waypoints: GeocodedWaypoint[];
    routes:             Route[];
    status:             string;
}

export interface GeocodedWaypoint {
    geocoder_status: string;
    place_id:        string;
    types:           string[];
}

export interface Route {
    bounds:            Bounds;
    copyrights:        string;
    legs:              Leg[];
    overview_polyline: Polyline;
    summary:           string;
    warnings:          any[];
    waypoint_order:    any[];
}

export interface Bounds {
    northeast: Northeast;
    southwest: Northeast;
}

export interface Northeast {
    lat: number;
    lng: number;
}

export interface Leg {
    distance:            Distance;
    duration:            Distance;
    end_address:         string;
    end_location:        Northeast;
    start_address:       string;
    start_location:      Northeast;
    steps:               Step[];
    traffic_speed_entry: any[];
    via_waypoint:        any[];
    start_address_name?: string;
    end_address_name?:   string;
}

export interface Distance {
    text:  string;
    value: number;
}

export interface Step {
    distance:          Distance;
    duration:          Distance;
    end_location:      Northeast;
    html_instructions: string;
    polyline:          Polyline;
    start_location:    Northeast;
    travel_mode:       string;
    maneuver?:         string;
    transit_details?:  TransitDetails;
}

export interface Polyline {
    points: string;
}

export interface TransitDetails {
    arrival_stop:   Stop;
    arrival_time:   Time;
    departure_stop: Stop;
    departure_time: Time;
    headsign:       string;
    headway:        number;
    line:           Line;
    num_stops:      number;
}

export interface Stop {
    location: Location;
    name:     string;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Time {
    text:      string;
    time_zone: string;
    value:     number;
}

export interface Line {
    agencies:   Agency[];
    color:      string;
    name:       string;
    short_name: string;
    text_color: string;
    vehicle:    Vehicle;
}

export interface Agency {
    name: string;
    url:  string;
}

export interface Vehicle {
    icon:       string;
    local_icon: string;
    name:       string;
    type:       string;
}

export interface AggregatedData {
    travel_mode: string,
    distance: number,
    duration: number,
    line_name?: string,
    vehicle_type?: string,
    headsign?: string,
    departure_stop?: string,
    arrival_stop?: string
}