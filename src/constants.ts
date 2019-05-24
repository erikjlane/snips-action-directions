export const BASE_URL_DIRECTIONS = 'https://maps.googleapis.com/maps/api/directions/json'
export const BASE_URL_PLACES = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
export const INTENT_PROBABILITY_THRESHOLD = 0.40
export const INTENT_FILTER_PROBABILITY_THRESHOLD = 0.5
export const SLOT_CONFIDENCE_THRESHOLD = 0.5
export const ASR_UTTERANCE_CONFIDENCE_THRESHOLD = 0.5
export const TRAVEL_MODE_VARIABLES = {
    en: {
        bike: 'bike',
        car: 'car',
        walk: 'walk',
        subway: 'subway',
        train: 'train',
        bus: 'bus'
    },
    fr: {
        bike: 'vélo',
        car: 'voiture',
        walk: 'pied',
        subway: 'métro',
        train: 'train',
        bus: 'bus'
    }
}
export const HOME_SYNONYMS = {
    en: [
        'home'
    ],
    fr: [
        'chez moi',
        'maison',
        'appartement',
        'l\'appartement',
        'appart'
    ]
}
export const WORK_SYNONYMS = {
    en: [
        'workplace',
        'work',
        'work place',
        'office'
    ],
    fr: [
        'bureau',
        'travail',
        'lieu de travail'
    ]
}
