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

    return (
        <div>
            <Navbar tournamentId={id} />
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
                <div className="card" style={{ overflowX: 'auto' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Knockout Brackets</h2>
                    <div className="bracket-container">
                        {Object.keys(rounds).map(roundNum => (
                            <div key={roundNum} className="bracket-round">
                                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--gray)' }}>
                                    Round {roundNum === '1' ? '1 (Initial)' : roundNum}
                                </h3>
                                {rounds[roundNum].map(match => (
                                    <div key={match._id} className="bracket-match-wrapper">
                                        <div className="bracket-match">
                                            {match.homeTeam._id === match.awayTeam._id ? (
                                                <div className="bracket-team winner">
                                                    <span className="bracket-team-name">{match.homeTeam.name}</span>
                                                    <span className="bracket-team-score" style={{ fontSize: '0.7rem', opacity: 0.8 }}>BYE</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`bracket-team ${match.played && match.homeScore > match.awayScore ? 'winner' : ''}`}>
                                                        <span className="bracket-team-name">{match.homeTeam.name}</span>
                                                        {match.played && <span className="bracket-team-score">{match.homeScore}</span>}
                                                    </div>
                                                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }}></div>
                                                    <div className={`bracket-team ${match.played && match.awayScore > match.homeScore ? 'winner' : ''}`}>
                                                        <span className="bracket-team-name">{match.awayTeam.name}</span>
                                                        {match.played && <span className="bracket-team-score">{match.awayScore}</span>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
