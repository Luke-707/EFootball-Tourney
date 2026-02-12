import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentApi } from '../api';
import { Trophy, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
    const [tournaments, setTournaments] = useState([]);
    const [name, setName] = useState('');
    const [type, setType] = useState('league');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await tournamentApi.getAll();
            setTournaments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name) return;
        try {
            await tournamentApi.create({ name, type });
            setName('');
            fetchTournaments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this tournament and all its data?')) return;
        try {
            await tournamentApi.delete(id);
            fetchTournaments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartEdit = (e, t) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(t._id);
        setEditName(t.name);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await tournamentApi.update(editingId, { name: editName });
            setEditingId(null);
            fetchTournaments();
        } catch (err) {
            console.error(err);
        }
    };

    const cancelEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div>
            <Navbar />
            <h1 className="title">eFootball Tournament Manager</h1>

            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Create New Tournament</h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, minWidth: '200px' }}
                        placeholder="Tournament Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="league">League (Round-Robin)</option>
                        <option value="knockout">Knockout (Single Elimination)</option>
                    </select>
                    <button className="btn btn-primary" type="submit">
                        <Plus size={20} /> Create
                    </button>
                </form>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Active Tournaments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {tournaments.map(t => (
                    <div key={t._id} style={{ position: 'relative' }}>
                        <Link to={`/tournament/${t._id}`} className="card" style={{ display: 'block', marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', color: 'var(--bg)' }}>
                                    <Trophy size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    {editingId === t._id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                            <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleUpdate}>
                                                <Check size={16} />
                                            </button>
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={cancelEdit}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 style={{ color: 'var(--text-light)' }}>{t.name}</h3>
                                            <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                                                {t.type.toUpperCase()} • {t.teams.length} Teams • {new Date(t.createdAt).toLocaleDateString()}
                                            </p>
                                        </>
                                    )}
                                </div>
                                {editingId !== t._id && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem', borderRadius: '50%' }}
                                            onClick={(e) => handleStartEdit(e, t)}
                                            title="Rename"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--text)' }}
                                            onClick={(e) => handleDelete(e, t._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Home;
