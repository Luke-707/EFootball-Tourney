/**
 * Generates round-robin fixtures for a list of teams
 */
function generateRoundRobinFixtures(teams, tournamentId) {
    let tempTeams = [...teams];
    if (tempTeams.length % 2 !== 0) {
        tempTeams.push(null); // Bye
    }

    const numTeams = tempTeams.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;
    const fixtures = [];

    for (let round = 0; round < numRounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
            const home = tempTeams[match];
            const away = tempTeams[numTeams - 1 - match];

            if (home !== null && away !== null) {
                fixtures.push({
                    homeTeam: home,
                    awayTeam: away,
                    tournamentId: tournamentId,
                    round: round + 1,
                    played: false
                });
            }
        }
        tempTeams.splice(1, 0, tempTeams.pop());
    }

    return fixtures;
}

/**
 * Finds the next power of 2 >= N
 */
function nextPowerOf2(n) {
    let p = 1;
    while (p < n) p *= 2;
    return p;
}

/**
 * Generates a seeded bracket for N teams.
 *
 * Standard seeding: seeds 1..N are placed so that:
 *   - #1 and #2 can only meet in the final
 *   - #1 and #3/#4 can only meet in the semis
 *   etc.
 *
 * Teams that receive byes are seeded from the top (best seeds advance automatically).
 *
 * Bracket size = next power of 2 >= N.
 * numByes = bracketSize - N
 *
 * Returns { fixtures, bracketSize, numByes }
 */
function generateInitialKnockoutFixtures(teams, tournamentId, shouldShuffle = true) {
    let orderedTeams = [...teams];

    // Shuffle if it's the very first round draw
    if (shouldShuffle) {
        for (let i = orderedTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [orderedTeams[i], orderedTeams[j]] = [orderedTeams[j], orderedTeams[i]];
        }
    }

    const N = orderedTeams.length;
    if (N < 2) return { fixtures: [], bracketSize: 0, numByes: 0 };

    const bracketSize = nextPowerOf2(N);
    const numByes = bracketSize - N;

    // Build a standard seeded bracket slot array of length bracketSize.
    // Slot positions follow the classic seeding pattern:
    //   Seed 1 @ slot 0, Seed 2 @ slot (bracketSize-1), etc.
    // We'll use the standard method: recursively split the bracket.
    const slots = buildSeededSlots(bracketSize);

    // Fill slots with teams (by seed order = shuffled order).
    // The first `numByes` seeds get byes (best seeds).
    // A slot value > N means it's a bye slot (no real team mapped there yet — we treat it as TBD).
    const slotTeams = slots.map(seed => {
        if (seed <= N) return orderedTeams[seed - 1];
        return null; // bye placeholder
    });

    // Generate round 1 matches by pairing consecutive slots: [0,1], [2,3], ...
    const fixtures = [];

    for (let i = 0; i < bracketSize; i += 2) {
        const home = slotTeams[i];
        const away = slotTeams[i + 1];

        if (home === null && away === null) {
            // Shouldn't happen with proper power-of-2 sizing
            continue;
        }

        if (home === null || away === null) {
            // One side is a bye — the real team auto-advances
            const realTeam = home || away;
            fixtures.push({
                homeTeam: realTeam,
                awayTeam: realTeam,
                homeScore: 1,
                awayScore: 0,
                tournamentId: tournamentId,
                round: 1,
                played: true,
                isBye: true
            });
        } else {
            // Normal match
            fixtures.push({
                homeTeam: home,
                awayTeam: away,
                tournamentId: tournamentId,
                round: 1,
                played: false,
                isBye: false
            });
        }
    }

    return { fixtures, bracketSize, numByes };
}

/**
 * Builds the standard seeded bracket slot order for a bracket of given size.
 * Returns an array of seed numbers in slot order (index = slot position).
 *
 * Convention: Seed 1 is at top, Seed 2 is at bottom of bracket.
 * They can only meet in the final.
 */
function buildSeededSlots(size) {
    let slots = [1, 2];
    while (slots.length < size) {
        const next = [];
        const n = slots.length;
        for (let i = 0; i < n; i++) {
            // Each existing seed gets a "mirror" partner = (n*2 + 1 - seed)
            next.push(slots[i]);
            next.push(n * 2 + 1 - slots[i]);
        }
        slots = next;
    }
    return slots;
}

/**
 * Generate next round fixtures from an array of winner team IDs.
 * Winners are kept in their bracket order (no shuffling).
 */
function generateNextRoundFixtures(winners, tournamentId, nextRound) {
    const fixtures = [];
    // Winners are in bracket order — just pair them sequentially
    for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
            fixtures.push({
                homeTeam: winners[i],
                awayTeam: winners[i + 1],
                tournamentId: tournamentId,
                round: nextRound,
                played: false,
                isBye: false
            });
        } else {
            // Odd winner — shouldn't happen if seeding is correct, but safety net
            fixtures.push({
                homeTeam: winners[i],
                awayTeam: winners[i],
                homeScore: 1,
                awayScore: 0,
                tournamentId: tournamentId,
                round: nextRound,
                played: true,
                isBye: true
            });
        }
    }
    return fixtures;
}

module.exports = {
    generateRoundRobinFixtures,
    generateInitialKnockoutFixtures,
    generateNextRoundFixtures
};
