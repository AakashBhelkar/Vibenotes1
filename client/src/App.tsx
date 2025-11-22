import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotesPage from './pages/NotesPage';
import LandingPage from './pages/LandingPage';
import { authService } from './services/authService';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return authService.isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/notes"
                    element={
                        <ProtectedRoute>
                            <NotesPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
