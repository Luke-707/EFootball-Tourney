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

    return (
        <div>
            <Navbar tournamentId={id} />
            <h1 className="title">{tournament.name}</h1>

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
                {standings.length === 0 && (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray)' }}>
                        No standings available yet. Add teams and play matches.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Standings;
