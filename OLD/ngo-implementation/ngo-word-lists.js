/**
 * NGO Word Lists for Conflict/Calming Detection
 * These lists drive the heat accumulation system
 *
 * Add to sharedLibrary.js
 */

const NGO_WORD_LISTS = {
    // Words that INCREASE heat (conflict, tension, action)
    conflict: [
        // === VIOLENCE ===
        'attack', 'fight', 'battle', 'war', 'kill', 'murder', 'destroy',
        'strike', 'punch', 'kick', 'stab', 'slash', 'shoot', 'blast',
        'crush', 'smash', 'break', 'shatter', 'explode', 'detonate',
        'wound', 'injure', 'hurt', 'harm', 'damage', 'wreck', 'ruin',
        'slaughter', 'massacre', 'execute', 'assassinate', 'ambush',

        // === DANGER ===
        'danger', 'threat', 'enemy', 'foe', 'villain', 'monster',
        'demon', 'beast', 'creature', 'predator', 'hunter', 'assassin',
        'trap', 'ambush', 'poison', 'curse', 'plague', 'disease',
        'death', 'dying', 'dead', 'corpse', 'grave', 'tomb',

        // === URGENCY ===
        'run', 'flee', 'escape', 'chase', 'pursue', 'hurry', 'rush',
        'urgent', 'emergency', 'crisis', 'disaster', 'catastrophe',
        'collapse', 'crash', 'fall', 'fail', 'lose', 'lost',
        'now', 'quickly', 'immediately', 'hurry', 'fast',

        // === NEGATIVE EMOTION ===
        'rage', 'fury', 'anger', 'hate', 'fear', 'terror', 'panic',
        'scream', 'shout', 'yell', 'cry', 'sob', 'wail', 'shriek',
        'despair', 'agony', 'torment', 'suffer', 'pain', 'anguish',
        'dread', 'horror', 'nightmare', 'trauma', 'shock',

        // === CONFRONTATION ===
        'confront', 'challenge', 'oppose', 'resist', 'defy', 'betray',
        'deceive', 'lie', 'steal', 'rob', 'threaten', 'demand',
        'argue', 'fight', 'conflict', 'dispute', 'clash', 'battle',
        'accuse', 'blame', 'condemn', 'judge', 'punish',

        // === HIGH STAKES ===
        'blood', 'fire', 'explosion', 'destruction', 'chaos',
        'war', 'invasion', 'siege', 'conquest', 'revolution',
        'sacrifice', 'doom', 'fate', 'destiny', 'prophecy',
        'ultimate', 'final', 'last', 'end', 'apocalypse'
    ],

    // Words that DECREASE heat (calm, resolution, rest)
    calming: [
        // === PEACE ===
        'peace', 'calm', 'quiet', 'still', 'serene', 'tranquil',
        'gentle', 'soft', 'warm', 'safe', 'secure', 'protected',
        'harmony', 'balance', 'stable', 'steady', 'settled',

        // === REST ===
        'rest', 'sleep', 'relax', 'breathe', 'sigh', 'exhale',
        'settle', 'sit', 'lie', 'lean', 'recline', 'pause',
        'wait', 'linger', 'stay', 'remain', 'stop',
        'dream', 'slumber', 'doze', 'nap',

        // === POSITIVE EMOTION ===
        'happy', 'joy', 'love', 'care', 'comfort', 'soothe',
        'smile', 'laugh', 'giggle', 'chuckle', 'grin',
        'hug', 'embrace', 'hold', 'cuddle', 'caress',
        'content', 'satisfied', 'pleased', 'delighted',

        // === RESOLUTION ===
        'resolve', 'solve', 'fix', 'heal', 'recover', 'mend',
        'forgive', 'apologize', 'reconcile', 'understand', 'agree',
        'accept', 'approve', 'allow', 'permit', 'grant',
        'complete', 'finish', 'accomplish', 'achieve', 'succeed',

        // === CONNECTION ===
        'friend', 'ally', 'companion', 'partner', 'family', 'home',
        'trust', 'believe', 'hope', 'faith', 'together', 'united',
        'bond', 'connection', 'relationship', 'friendship', 'love',
        'support', 'help', 'aid', 'assist', 'guide',

        // === MUNDANE ===
        'eat', 'drink', 'cook', 'clean', 'walk', 'talk', 'think',
        'observe', 'notice', 'examine', 'study', 'learn', 'remember',
        'write', 'read', 'listen', 'watch', 'see', 'look',
        'ordinary', 'normal', 'usual', 'routine', 'daily'
    ]
};

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = NGO_WORD_LISTS;
}
