import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ProfessorPage from './pages/ProfessorPage';
import AlunoPage from './pages/AlunoPage';
import UserPage from './pages/UserPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/professores" element={<ProfessorPage />} />
            <Route path="/alunos" element={<AlunoPage />} />
            <Route path="/usuarios" element={<UserPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
