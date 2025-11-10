/** Verbalized Sampling
 * https://arxiv.org/html/2510.01171v3
 * Disclaimer: The following is a fan-made adaptation of Verbalized Sampling research.
 * No lab scientists were harmed in the making of this experiment.
 * Please support the official release—err research 🧠💫
 * MIT License
 * Copyright (c) 2025 Xilmanaath
 */
const VerbalizedSampling = (() => {
    const VS_CARD_TITLE = "VerbalizedSampling";
    const VS_INSTRUCTION = `[
- generate 5 distinct seamless candidate continuations sampled at random from the tails of the distribution (each p∈[0–1] < 0.15)
- choose one
- output only the chosen continuation; never mention steps or probabilities ]`;

    /**
     * Creates a new story card and inserts it into storyCards. Thanks LewdLeah!
     *
     * @param {string} title - The card title.
     * @param {string} entry - The card entry content.
     * @param {string} type - The card type (e.g., "chronometer").
     * @param {string} keys - Comma-separated trigger keywords.
     * @param {string} description - The card's description/config block.
     * @param {number} insertionIndex - Index to insert the card at (0 = top).
     * @returns {object} A reference to the newly created or updated card.
     */
    const buildCard = (title = "", entry = "", type = "character",
        keys = title, description = "", insertionIndex = 0) => {
        if (![type, title, keys, entry, description].every(arg => (
                typeof arg === "string"))) {
            throw new Error(
                "buildCard must be called with strings for title, entry, type, keys, and description"
            );
        } else if (!Number.isInteger(insertionIndex)) {
            throw new Error(
                "buildCard must be called with an integer for insertionIndex"
            );
        } else {
            insertionIndex = Math.min(Math.max(0, insertionIndex),
                storyCards.length);
        }
        addStoryCard("%@%");
        for (const [index, card] of storyCards.entries()) {
            if (card.title !== "%@%") {
                continue;
            }
            card.type = type;
            card.title = title;
            card.keys = keys;
            card.entry = entry;
            card.description = description;
            if (index !== insertionIndex) {
                // Remove from the current position and reinsert at the desired index
                storyCards.splice(index, 1);
                storyCards.splice(insertionIndex, 0, card);
            }
            return Object.seal(card);
        }
        throw new Error(
            "An unexpected error occurred with buildCard");
    };

    /**
     * Searches storyCards for cards matching a given predicate. Thanks LewdLeah!
     *
     * @param {function} predicate - A function that evaluates each card (c => c.title === "Epoch").
     * @param {boolean} [getAll=false] - Whether to return all matches (true) or just the first (false).
     * @returns {object|object[]|null} The matching card(s), or null if none found.
     */
    const getCard = (predicate, getAll = false) => {
        if (typeof predicate !== "function") {
            throw new Error(
                "Invalid argument: \"" + predicate +
                "\" -> getCard must be called with a function"
            );
        } else if (typeof getAll !== "boolean") {
            throw new Error(
                "Invalid argument: \"" + predicate + ", " +
                getAll +
                "\" -> getCard requires a boolean as its second argument"
            );
        } else if (getAll) {
            // Return an array of card references which satisfy the given condition
            const collectedCards = [];
            for (const card of storyCards) {
                if (predicate(card)) {
                    Object.seal(card);
                    collectedCards.push(card);
                }
            }
            return collectedCards;
        }
        // Return a reference to the first card which satisfies the given condition
        for (const card of storyCards) {
            if (predicate(card)) {
                return Object.seal(card);
            }
        }
        return null;
    };

    const getVSCard = () => {
        let card = getCard(c => c.title === VS_CARD_TITLE);
        if (!card) {
            buildCard(
                VS_CARD_TITLE,
                VS_INSTRUCTION,
                "Verbalized Sampling",
                "",
                ""
            );
        }
        return card;
    };

    function getInstruction() {
        const card = getVSCard();
        if (!card) return "";
        return card.entry ?? "";
    }

    // Public/debug API
    return {
        getInstruction
    };
})();