module.exports = {
    DEFAULT_LOCALE: 'english',
    SUPPORTED_LOCALES: [
        'english',
        'french'
    ],
    DEFAULT_LANGUAGE: 'en',
    LANGUAGE_MAPPINGS: {
        english: 'en',
        french: 'fr'
    },
    HOME_SYNONYMS: [
        'home'
    ],
    WORK_SYNONYMS: [
        'workplace',
        'work',
        'work place',
        'office'
    ],
    INTENT_PROBABILITY_THRESHOLD: 0.5,
    INTENT_FILTER_PROBABILITY_THRESHOLD: 0,
    SLOT_CONFIDENCE_THRESHOLD: 0.9,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD: 0.5
}
