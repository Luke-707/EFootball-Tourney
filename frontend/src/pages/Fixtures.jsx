import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentApi, matchApi } from '../api';
import Navbar from '../components/Navbar';
import { Check, RefreshCw, Edit2, Play } from 'lucide-react';

const Fixtures = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);
    const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });

    useEffect(() => {
        fetchTournament();
    }, [id]);

    const fetchTournament = async () => {
        try {
            const res = await tournamentApi.getById(id);
            setTournament(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRecord = async (matchId) => {
        try {
            await matchApi.recordResult(matchId, scores);
            setEditingMatch(null);
            fetchTournament();
        } catch (err) {
            alert(err.response?.data?.error || 'Error recording result');
        }
    };

    const handleClearFixtures = async () => {
        if (!window.confirm('This will delete ALL fixtures and reset the leaderboard. Continue?')) return;
        try {
            await tournamentApi.clearFixtures(id);
            fetchTournament();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateNextRound = async () => {
        try {
            await tournamentApi.generateFixtures(id);
            fetchTournament();
        } catch (err) {
            alert(err.response?.data?.error || 'Error advancing round');
        }
    };

    if (!tournament) return <div>Loading...</div>;

    // Group matches by round
    const rounds = {};
    tournament.matches.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
    });

    return (
        <div>
            <Navbar tournamentId={id} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: 0 }}>{tournament.name}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {tournament.type === 'knockout' && tournament.matches.length > 0 && (
                        <button className="btn btn-primary" onClick={handleGenerateNextRound}>
                            <Play size={18} /> Next Round
                        </button>
                    )}
                    {tournament.matches.length > 0 && (
                        <button className="btn btn-secondary" onClick={handleClearFixtures} style={{ color: 'var(--text)' }}>
                            <RefreshCw size={18} /> Reset
                        </button>
                    )}
                </div>
            </div>

            {tournament.type === 'knockout' && (
                <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    * Knockout Phase: In case of a draw, please record the score after extra time/penalties to ensure a winner is determined.
                </p>
            )}

            {tournament.type === 'knockout' ? (
                <div className="bracket-container">
                    {Object.keys(rounds).sort((a, b) => a - b).map(round => (
                        <div key={round} className="bracket-round">
                            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)', fontSize: '1.2rem' }}>
                                {parseInt(round) === Object.keys(rounds).length ? 'Final' : `Round ${round}`}
                            </h2>
                            {rounds[round].map(match => (
                                <div key={match._id} className="bracket-match-wrapper">
                                    <div className={`bracket-match ${match.played ? 'played' : ''} ${match.isBye ? 'is-bye' : ''}`}>
                                        {match.isBye ? (
                                            <div className="bracket-team winner bye-team">
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="bracket-team-name">{match.homeTeam.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Bye Round 1</span>
                                                </div>
                                                <span className="bracket-team-score" style={{ background: 'var(--glass)', color: 'var(--primary)', fontSize: '0.7rem' }}>ADV</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`bracket-team ${match.played && match.homeScore > match.awayScore ? 'winner' : ''}`}>
                                                    <span className="bracket-team-name">{match.homeTeam.name}</span>
                                                    {match.played ? (
                                                        <span className="bracket-team-score">{match.homeScore}</span>
                                                    ) : (
                                                        editingMatch === match._id && (
                                                            <input
                                                                type="number"
                                                                className="form-input"
                                                                style={{ width: '40px', padding: '2px', textAlign: 'center', fontSize: '0.8rem' }}
                                                                value={scores.homeScore}
                                                                onChange={(e) => setScores({ ...scores, homeScore: parseInt(e.target.value) || 0 })}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                                                <div className={`bracket-team ${match.played && match.awayScore > match.homeScore ? 'winner' : ''}`}>
                                                    <span className="bracket-team-name">{match.awayTeam.name}</span>
                                                    {match.played ? (
                                                        <span className="bracket-team-score">{match.awayScore}</span>
                                                    ) : (
                                                        editingMatch === match._id && (
                                                            <input
                                                                type="number"
                                                                className="form-input"
                                                                style={{ width: '40px', padding: '2px', textAlign: 'center', fontSize: '0.8rem' }}
                                                                value={scores.awayScore}
                                                                onChange={(e) => setScores({ ...scores, awayScore: parseInt(e.target.value) || 0 })}
                                                            />
                                                        )
                                                    )}
                                                </div>

                                                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                                                    {!match.played && !match.isBye && editingMatch !== match._id && (
                                                        <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setEditingMatch(match._id)}>
                                                            Set Score
                                                        </button>
                                                    )}
                                                    {editingMatch === match._id && !match.isBye && (
                                                        <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => handleRecord(match._id)}>
                                                            Save
                                                        </button>
                                                    )}
                                                    {match.played && !match.isBye && (
                                                        <button
                                                            className="btn"
                                                            style={{ padding: '2px', background: 'transparent', color: 'var(--gray)' }}
                                                            onClick={() => {
                                                                setEditingMatch(match._id);
                                                                setScores({ homeScore: match.homeScore, awayScore: match.awayScore });
                                                            }}
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {Object.keys(rounds).map(round => (
                        <div key={round} style={{ marginBottom: '3rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Round {round}</h2>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {rounds[round].map(match => (
                                    <div key={match._id} className="card" style={{ marginBottom: 0 }}>
                                        <div className="fixture-card" style={{ background: 'transparent', padding: 0 }}>
                                            <div className="fixture-team" style={{ textAlign: 'right' }}>{match.homeTeam.name}</div>

                                            {match.played && editingMatch !== match._id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="fixture-score">
                                                        {match.homeScore} - {match.awayScore}
                                                    </div>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.3rem', borderRadius: '50%' }}
                                                        onClick={() => {
                                                            setEditingMatch(match._id);
                                                            setScores({ homeScore: match.homeScore, awayScore: match.awayScore });
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            ) : editingMatch === match._id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: '60px', textAlign: 'center' }}
                                                        value={scores.homeScore}
                                                        onChange={(e) => setScores({ ...scores, homeScore: parseInt(e.target.value) || 0 })}
                                                    />
                                                    <span>-</span>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: '60px', textAlign: 'center' }}
                                                        value={scores.awayScore}
                                                        onChange={(e) => setScores({ ...scores, awayScore: parseInt(e.target.value) || 0 })}
                                                    />
                                                    <button className="btn btn-primary" onClick={() => handleRecord(match._id)}>
                                                        <Check size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem 1rem' }}
                                                    onClick={() => {
                                                        setEditingMatch(match._id);
                                                        setScores({ homeScore: 0, awayScore: 0 });
                                                    }}
                                                >
                                                    Record Result
                                                </button>
                                            )}

                                            <div className="fixture-team" style={{ textAlign: 'left' }}>{match.awayTeam.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Fixtures;
