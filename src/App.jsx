import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCampStore, CampProvider } from './store/CampContext';
import { AuthProvider } from './store/AuthContext';
import Layout from './components/Layout';
import CampSelector from './components/CampSelector';
import CampDashboard from './pages/CampDashboard';
import AthleteDetail from './pages/AthleteDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
    const { currentCampId } = useCampStore();

    return (
        <Layout>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            {currentCampId ? <Navigate to={`/camp/${currentCampId}`} replace /> : <CampSelector />}
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            {currentCampId ? <Navigate to={`/camp/${currentCampId}`} replace /> : <Navigate to="/" replace />}
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/camp/:campId"
                    element={
                        <PrivateRoute>
                            <CampDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/athlete/:id"
                    element={
                        <PrivateRoute>
                            <AthleteDetail />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <CampProvider>
                    <AppContent />
                </CampProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
