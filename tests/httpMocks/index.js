module.exports = {
    mock(fetchMock) {
        fetchMock.mock('glob:*api/place/nearbysearch*London+Eye*', {
            html_attributions: [],
            results: [
                {
                    geometry: {
                        location: {
                            lat: 51.503324,
                            lng: -0.119543
                        },
                        viewport: {
                            northeast: {
                                lat: 51.50464877989272,
                                lng: -0.11644895
                            },
                            southwest: {
                                lat: 51.50194912010727,
                                lng: -0.12057435
                            }
                        }
                    },
                    icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png',
                    id: '6d925b4f3e0d975eb6955a915a0689f8f4f0abd2',
                    name: 'Coca-Cola London Eye',
                    opening_hours: {
                        open_now: true
                    },
                    place_id: 'ChIJc2nSALkEdkgRkuoJJBfzkUI',
                    plus_code: {
                        compound_code: 'GV3J+85 Lambeth, London, UK',
                        global_code: '9C3XGV3J+85'
                    },
                    rating: 4.5,
                    reference: 'ChIJc2nSALkEdkgRkuoJJBfzkUI',
                    scope: 'GOOGLE',
                    types: [
                        'point_of_interest',
                        'establishment'
                    ],
                    user_ratings_total: 72944,
                    vicinity: 'London'
                }
            ],
            status: 'OK'
        })

        fetchMock.mock('glob:*api/place/nearbysearch*', {
            html_attributions: [],
            results: [
                {
                    geometry: {
                        location: {
                            lat: 51.501364,
                            lng: -0.14189
                        },
                        viewport: {
                            northeast: {
                                lat: 51.50302137989272,
                                lng: -0.13910645
                            },
                            southwest: {
                                lat: 51.50032172010728,
                                lng: -0.14281785
                            }
                        }
                    },
                    icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
                    id: '6a2997f5840e8cb6a28334f8e3bad9535e450e3c',
                    name: 'Buckingham Palace',
                    place_id: 'ChIJtV5bzSAFdkgRpwLZFPWrJgo',
                    plus_code: {
                        compound_code: 'GV25+G6 Westminster, London, UK',
                        global_code: '9C3XGV25+G6'
                    },
                    rating: 4.5,
                    reference: 'ChIJtV5bzSAFdkgRpwLZFPWrJgo',
                    scope: 'GOOGLE',
                    types: [
                        'premise',
                        'point_of_interest',
                        'establishment'
                    ],
                    user_ratings_total: 77143,
                    vicinity: 'London'
                }
            ],
            status: 'OK'
        })

        fetchMock.mock('glob:*api/directions*', {
            geocoded_waypoints: [
                {
                    geocoder_status: 'OK',
                    place_id: 'ChIJ6QSUFpQEdkgR12P1w2Dt_B0',
                    types: [
                        'premise'
                    ]
                },
                {
                    geocoder_status: 'OK',
                    place_id: 'ChIJtV5bzSAFdkgRpwLZFPWrJgo',
                    types: [
                        'establishment',
                        'point_of_interest',
                        'premise'
                    ]
                }
            ],
            routes: [
                {
                    legs: [
                        {
                            arrival_time: {
                                text: '9:53pm',
                                time_zone: 'Europe/London',
                                value: 1550008439
                            },
                            departure_time: {
                                text: '9:28pm',
                                time_zone: 'Europe/London',
                                value: 1550006892
                            },
                            distance: {
                                text: '5.4 km',
                                value: 5381
                            },
                            duration: {
                                text: '26 mins',
                                value: 1547
                            },
                            end_address: 'Westminster, London SW1A 1AA, UK',
                            end_location: {
                                lat: 51.5015395,
                                lng: -0.1412334
                            },
                            start_address: 'Hammond Court, 10 Hotspur St, Lambeth, London SE11 6BW, UK',
                            start_location: {
                                lat: 51.4897644,
                                lng: -0.1125028
                            },
                            steps: [
                                {
                                    distance: {
                                        text: '53 m',
                                        value: 53
                                    },
                                    duration: {
                                        text: '1 min',
                                        value: 48
                                    },
                                    end_location: {
                                        lat: 51.4894952,
                                        lng: -0.1120096
                                    },
                                    html_instructions: 'Walk to Hotspur Street (Stop KJ)',
                                    polyline: {
                                        points: '_rgyHb~THWBARCB?L??K?[?Q?I'
                                    },
                                    start_location: {
                                        lat: 51.4897644,
                                        lng: -0.1125028
                                    },
                                    steps: [
                                        {
                                            distance: {
                                                text: '33 m',
                                                value: 33
                                            },
                                            duration: {
                                                text: '1 min',
                                                value: 24
                                            },
                                            end_location: {
                                                lat: 51.4894986,
                                                lng: -0.112292
                                            },
                                            html_instructions: 'Head <b>southeast</b> on <b>Hotspur St</b> toward <b>Black Prince Rd</b><div style="font-size:0.9em">Restricted usage road</div>',
                                            polyline: {
                                                points: '_rgyHb~THWBARCB?L??K'
                                            },
                                            start_location: {
                                                lat: 51.4897644,
                                                lng: -0.1125028
                                            },
                                            travel_mode: 'WALKING'
                                        },
                                        {
                                            distance: {
                                                text: '20 m',
                                                value: 20
                                            },
                                            duration: {
                                                text: '1 min',
                                                value: 24
                                            },
                                            end_location: {
                                                lat: 51.4894952,
                                                lng: -0.1120096
                                            },
                                            html_instructions: 'Turn <b>left</b> onto <b>Black Prince Rd</b>',
                                            maneuver: 'turn-left',
                                            polyline: {
                                                points: 'kpgyHx|T?[?Q?I'
                                            },
                                            start_location: {
                                                lat: 51.4894986,
                                                lng: -0.112292
                                            },
                                            travel_mode: 'WALKING'
                                        }
                                    ],
                                    travel_mode: 'WALKING'
                                },
                                {
                                    distance: {
                                        text: '1.4 km',
                                        value: 1370
                                    },
                                    duration: {
                                        text: '7 mins',
                                        value: 420
                                    },
                                    end_location: {
                                        lat: 51.485748,
                                        lng: -0.124064
                                    },
                                    html_instructions: 'Bus towards Royal Albert Hall',
                                    polyline: {
                                        points: 'epgyHd{T}BdQmEbO]`[vVlExIjE'
                                    },
                                    start_location: {
                                        lat: 51.489468,
                                        lng: -0.112027
                                    },
                                    transit_details: {
                                        arrival_stop: {
                                            location: {
                                                lat: 51.485748,
                                                lng: -0.124064
                                            },
                                            name: 'Vauxhall Bus Station (Stop B)'
                                        },
                                        arrival_time: {
                                            text: '9:36pm',
                                            time_zone: 'Europe/London',
                                            value: 1550007360
                                        },
                                        departure_stop: {
                                            location: {
                                                lat: 51.489468,
                                                lng: -0.112027
                                            },
                                            name: 'Hotspur Street (Stop KJ)'
                                        },
                                        departure_time: {
                                            text: '9:29pm',
                                            time_zone: 'Europe/London',
                                            value: 1550006940
                                        },
                                        headsign: 'Royal Albert Hall',
                                        line: {
                                            agencies: [
                                                {
                                                    name: 'Transport for London',
                                                    url: 'https://tfl.gov.uk/'
                                                }
                                            ],
                                            color: '#ce312d',
                                            name: 'Elephant & Castle - Knightsbridge',
                                            short_name: '360',
                                            text_color: '#ffffff',
                                            vehicle: {
                                                icon: '//maps.gstatic.com/mapfiles/transit/iw2/6/bus2.png',
                                                local_icon: '//maps.gstatic.com/mapfiles/transit/iw2/6/uk-london-bus.png',
                                                name: 'Bus',
                                                type: 'BUS'
                                            }
                                        },
                                        num_stops: 5
                                    },
                                    travel_mode: 'TRANSIT'
                                },
                                {
                                    distance: {
                                        text: '46 m',
                                        value: 46
                                    },
                                    duration: {
                                        text: '1 min',
                                        value: 41
                                    },
                                    end_location: {
                                        lat: 51.4859851,
                                        lng: -0.123829
                                    },
                                    html_instructions: 'Walk to Vauxhall Station',
                                    polyline: {
                                        points: 'yxfyHleWCCAAACAGAMA]G@]j@'
                                    },
                                    start_location: {
                                        lat: 51.4857313,
                                        lng: -0.1239121
                                    },
                                    steps: [
                                        {
                                            distance: {
                                                text: '24 m',
                                                value: 24
                                            },
                                            duration: {
                                                text: '1 min',
                                                value: 18
                                            },
                                            end_location: {
                                                lat: 51.485805,
                                                lng: -0.1236027
                                            },
                                            html_instructions: 'Head <b>northeast</b> on <b>Bondway</b> toward <b>S Lambeth Pl</b>',
                                            polyline: {
                                                points: 'yxfyHleWCCAAACAGAMA]'
                                            },
                                            start_location: {
                                                lat: 51.4857313,
                                                lng: -0.1239121
                                            },
                                            travel_mode: 'WALKING'
                                        },
                                        {
                                            distance: {
                                                text: '22 m',
                                                value: 22
                                            },
                                            duration: {
                                                text: '1 min',
                                                value: 23
                                            },
                                            end_location: {
                                                lat: 51.4859851,
                                                lng: -0.123829
                                            },
                                            html_instructions: 'Take entrance <span class="location"></span>',
                                            polyline: {
                                                points: 'oyfyHpcW]j@'
                                            },
                                            start_location: {
                                                lat: 51.48584,
                                                lng: -0.123613
                                            },
                                            travel_mode: 'WALKING'
                                        }
                                    ],
                                    travel_mode: 'WALKING'
                                }
                            ],
                            traffic_speed_entry: [],
                            via_waypoint: []
                        }
                    ]
                }
            ],
            status: 'OK'
        })

        return fetchMock
    }
}