import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const Navbar = ({ tournamentId }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    return (
        <nav className="nav">
            <div className="nav-group">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', borderRadius: '50%' }}
                    title="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <Link
                    to="/"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', borderRadius: '50%' }}
                    title="Home"
                >
                    <Home size={18} />
                </Link>
            </div>

            <div className="nav-group">
                {tournamentId && (
                    <>
                        <Link
                            to={`/tournament/${tournamentId}`}
                            className={`nav-link ${path === `/tournament/${tournamentId}` ? 'active' : ''}`}
                        >
                            Teams
                        </Link>
                        <Link
                            to={`/tournament/${tournamentId}/fixtures`}
                            className={`nav-link ${path.includes('fixtures') ? 'active' : ''}`}
                        >
                            Fixtures
                        </Link>
                        <Link
                            to={`/tournament/${tournamentId}/standings`}
                            className={`nav-link ${path.includes('standings') ? 'active' : ''}`}
                        >
                            Standings
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
