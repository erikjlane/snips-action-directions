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
    HOME_SYNONYMS: {
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
    },
    WORK_SYNONYMS: {
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
    },
    INTENT_PROBABILITY_THRESHOLD: 0.45,
    INTENT_FILTER_PROBABILITY_THRESHOLD: 0.5,
    SLOT_CONFIDENCE_THRESHOLD: 0.5,
    ASR_UTTERANCE_CONFIDENCE_THRESHOLD: 0.5
}
