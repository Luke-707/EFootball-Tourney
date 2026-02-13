/**
 * Generates round-robin fixtures for a list of teams
 * @param {Array} teams Array of team IDs
 * @param {string} tournamentId
 * @returns {Array} Array of match objects
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
        // Rotate teams: keep first team, move others
        tempTeams.splice(1, 0, tempTeams.pop());
    }

    return fixtures;
}

function generateInitialKnockoutFixtures(teams, tournamentId, shouldShuffle = true) {
    let sortedTeams = [...teams];
    if (shouldShuffle) {
        sortedTeams = sortedTeams.sort(() => 0.5 - Math.random());
    }

    const N = sortedTeams.length;
    if (N < 2) return [];

    // Find the largest power of 2 less than or equal to N
    // This ensures that the NEXT round will have exactly targetPowerOf2 teams.
    let targetPowerOf2 = 1;
    while (targetPowerOf2 * 2 <= N) {
        targetPowerOf2 *= 2;
    }

    // If N is already a power of 2, everyone plays
    if (targetPowerOf2 === N) {
        const fixtures = [];
        for (let i = 0; i < N; i += 2) {
            fixtures.push({
                homeTeam: sortedTeams[i],
                awayTeam: sortedTeams[i + 1],
                tournamentId: tournamentId,
                round: 1,
                played: false
            });
        }
        return fixtures;
    }

    // If N is not a power of 2 (e.g., 6)
    // We want Round 2 to have targetPowerOf2 teams (e.g., 4)
    // M = numMatches in Round 1. B = numByes in Round 1.
    // M + B = targetPowerOf2
    // 2M + B = N
    // Subtracting: M = N - targetPowerOf2
    const numMatches = N - targetPowerOf2;
    const numByes = N - (2 * numMatches);

    const fixtures = [];
    let idx = 0;

    // 1. Create Play-in matches
    for (let i = 0; i < numMatches; i++) {
        fixtures.push({
            homeTeam: sortedTeams[idx++],
            awayTeam: sortedTeams[idx++],
            tournamentId: tournamentId,
            round: 1,
            played: false
        });
    }

    // 2. Assign Byes
    // A bye is represented by a match where homeTeam === awayTeam and it's already "played"
    // The frontend should handle this specifically.
    for (let i = 0; i < numByes; i++) {
        const team = sortedTeams[idx++];
        fixtures.push({
            homeTeam: team,
            awayTeam: team,
            homeScore: 1,
            awayScore: 0,
            tournamentId: tournamentId,
            round: 1,
            played: true,
            isBye: true // Explicit flag for easier frontend handling
        });
    }

    return fixtures;
}

module.exports = { generateRoundRobinFixtures, generateInitialKnockoutFixtures };
