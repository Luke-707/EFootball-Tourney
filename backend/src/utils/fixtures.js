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

function generateInitialKnockoutFixtures(teams, tournamentId) {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const fixtures = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
            fixtures.push({
                homeTeam: shuffled[i],
                awayTeam: shuffled[i + 1],
                tournamentId: tournamentId,
                round: 1,
                played: false
            });
        } else {
            // Bye: Automatically create a played match with the team winning against themselves? 
            // Or just advance them. For simplicity in the current UI, let's create a match 
            // where 1-0 result is already set. 
            fixtures.push({
                homeTeam: shuffled[i],
                awayTeam: shuffled[i], // Same team to indicate bye/advanced
                homeScore: 1,
                awayScore: 0,
                tournamentId: tournamentId,
                round: 1,
                played: true
            });
        }
    }
    return fixtures;
}

module.exports = { generateRoundRobinFixtures, generateInitialKnockoutFixtures };
