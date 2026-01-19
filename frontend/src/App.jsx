import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TechnicalAdminDashboard from './pages/TechnicalAdminDashboard';
import ProfessorPage from './pages/ProfessorPage';
import AlunoPage from './pages/AlunoPage';
import UserPage from './pages/UserPage';
import GradesPage from './pages/GradesPage';
import NotificationsPage from './pages/NotificationsPage';
import CursoTurmaPage from './pages/CursoTurmaPage';
import DisciplinaPage from './pages/DisciplinaPage';
import MatriculaPage from './pages/MatriculaPage';
import MinhasTurmasPage from './pages/MinhasTurmasPage';
import Login from './pages/Login';
import './App.css';

// Component to handle role-based dashboard routing
function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'TECHNICAL_ADMIN':
      return <TechnicalAdminDashboard />;
    default:
      return <AdminDashboard />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Header />
                  <Navigation />
                  <main className="app-main">
                    <Routes>
                      <Route path="/" element={<DashboardRouter />} />
                      <Route 
                        path="/professores" 
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <ProfessorPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/alunos" 
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <AlunoPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/usuarios" 
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <UserPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/cursos-turmas" 
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <CursoTurmaPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/disciplinas" 
                        element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <DisciplinaPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/notas" 
                        element={
                          <ProtectedRoute>
                            <GradesPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/notificacoes" 
                        element={
                          <ProtectedRoute>
                            <NotificationsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/matriculas" 
                        element={
                          <ProtectedRoute requiredRole="STUDENT">
                            <MatriculaPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/minhas-turmas" 
                        element={
                          <ProtectedRoute requiredRole="TEACHER">
                            <MinhasTurmasPage />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
