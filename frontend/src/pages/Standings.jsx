import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentApi } from '../api';
import Navbar from '../components/Navbar';

const Standings = () => {
    const { id } = useParams();
    const [standings, setStandings] = useState([]);
    const [tournament, setTournament] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [standingsRes, tournamentRes] = await Promise.all([
                tournamentApi.getStandings(id),
                tournamentApi.getById(id)
            ]);
            setStandings(standingsRes.data);
            setTournament(tournamentRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!tournament) return <div>Loading...</div>;

    // Group matches by round for bracket
    const rounds = {};
    tournament.matches?.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
    });

    const roundsArray = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));
    const totalRounds = roundsArray.length;

    const getRoundName = (roundNum) => {
        const matchCount = rounds[roundNum]?.length || 0;

        if (matchCount === 1) return 'Final';
        if (matchCount === 2) return 'Semi-Final';
        if (matchCount === 4) return 'Quarter Final';

        return `Round ${roundNum}`;
    };

    return (
        <div>
            <Navbar tournamentId={id} tournamentType={tournament?.type} />
            <h1 className="title">{tournament.name}</h1>

            {tournament.type === 'league' ? (
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>League Table</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pos</th>
                                    <th>Team</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>GF</th>
                                    <th>GA</th>
                                    <th>GD</th>
                                    <th style={{ color: 'var(--primary)' }}>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((team, index) => (
                                    <tr key={team._id}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{team.name}</td>
                                        <td>{team.played}</td>
                                        <td>{team.won}</td>
                                        <td>{team.drawn}</td>
                                        <td>{team.lost}</td>
                                        <td>{team.goalsFor}</td>
                                        <td>{team.goalsAgainst}</td>
                                        <td>{team.goalsFor - team.goalsAgainst}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                    <h2 style={{ padding: '1.5rem', marginBottom: '0' }}>Tournament Bracket</h2>
                    <div className="bracket-container">
                        {roundsArray.map(roundNum => (
                            <div key={roundNum} className="bracket-round">
                                <h3 className="bracket-round-title">
                                    {getRoundName(roundNum)}
                                </h3>
                                {rounds[roundNum].map((match, matchIndex) => {
                                    const isBye = match.isBye || match.homeTeam._id === match.awayTeam._id;
                                    const roundIndex = roundsArray.indexOf(roundNum);
                                    // Height doubles each round to maintain centering
                                    const wrapperHeight = Math.pow(2, roundIndex) * 120;

                                    return (
                                        <div
                                            key={match._id}
                                            className="bracket-match-wrapper"
                                            style={{ height: `${wrapperHeight}px` }}
                                        >
                                            <div className={`bracket-match ${isBye ? 'is-bye' : (match.played ? 'played' : '')}`}>
                                                {isBye ? (
                                                    <div className="bracket-team winner bye-layout">
                                                        <div className="bye-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="bracket-team-name" style={{ color: 'var(--primary)', fontWeight: 800 }}>{match.homeTeam.name}</span>
                                                            <div className="badge-bye">BYE</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className={`bracket-team ${match.played && match.homeScore > match.awayScore ? 'winner' : ''}`}>
                                                            <span className="bracket-team-name">{match.homeTeam.name}</span>
                                                            {match.played && <span className="bracket-team-score">{match.homeScore}</span>}
                                                        </div>
                                                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                                                        <div className={`bracket-team ${match.played && match.awayScore > match.homeScore ? 'winner' : ''}`}>
                                                            <span className="bracket-team-name">{match.awayTeam.name}</span>
                                                            {match.played && <span className="bracket-team-score">{match.awayScore}</span>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tournament.type === 'league' && standings.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray)' }}>
                    No standings available yet. Add teams and play matches.
                </p>
            )}
            {tournament.type === 'knockout' && Object.keys(rounds).length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray)' }}>
                    No fixtures generated yet.
                </p>
            )}
        </div>
    );
};

export default Standings;
