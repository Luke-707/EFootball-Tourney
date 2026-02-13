import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentApi } from '../api';
import Navbar from '../components/Navbar';
import { Users, Play, Trash2 } from 'lucide-react';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [teamName, setTeamName] = useState('');

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

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!teamName) return;
        try {
            await tournamentApi.addTeam(id, { name: teamName });
            setTeamName('');
            fetchTournament();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        try {
            await tournamentApi.deleteTeam(id, teamId);
            fetchTournament();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateFixtures = async () => {
        try {
            await tournamentApi.generateFixtures(id);
            navigate(`/tournament/${id}/fixtures`);
        } catch (err) {
            console.error(err);
        }
    };

    if (!tournament) return <div>Loading...</div>;

    return (
        <div>
            <Navbar tournamentId={id} tournamentType={tournament?.type} />
            <h1 className="title">{tournament.name}</h1>

            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Add Teams</h2>
                <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                    />
                    <button className="btn btn-secondary" type="submit">
                        Add Team
                    </button>
                </form>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Teams ({tournament.teams.length})</h2>
                    {tournament.teams.length >= 2 && tournament.matches.length === 0 && (
                        <button className="btn btn-primary" onClick={handleGenerateFixtures}>
                            <Play size={20} /> Generate Fixtures
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {tournament.teams.map(team => (
                        <div key={team._id} className="fixture-card" style={{ marginBottom: 0, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} color="var(--primary)" />
                                <span style={{ fontWeight: 600 }}>{team.name}</span>
                            </div>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem', borderRadius: '50%', color: 'var(--text)' }}
                                onClick={() => handleDeleteTeam(team._id)}
                                title="Delete Team"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                {tournament.teams.length < 2 && (
                    <p style={{ color: 'var(--gray)', textAlign: 'center', marginTop: '1rem' }}>
                        Add at least 2 teams to generate fixtures.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TournamentDetail;
