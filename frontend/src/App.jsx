import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TournamentDetail from './pages/TournamentDetail';
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';

function App() {
    return (
        <Router>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tournament/:id" element={<TournamentDetail />} />
                    <Route path="/tournament/:id/fixtures" element={<Fixtures />} />
                    <Route path="/tournament/:id/standings" element={<Standings />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
