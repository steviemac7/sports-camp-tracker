import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCampStore } from './store/CampContext';
import Layout from './components/Layout';
import CampSelector from './components/CampSelector';
import CampDashboard from './pages/CampDashboard';
import AthleteDetail from './pages/AthleteDetail';

const AppContent = () => {
    const { currentCampId } = useCampStore();

    return (
        <Layout>
            <Routes>
                <Route
                    path="/"
                    element={currentCampId ? <Navigate to="/dashboard" replace /> : <CampSelector />}
                />
                <Route
                    path="/dashboard"
                    element={currentCampId ? <CampDashboard /> : <Navigate to="/" replace />}
                />
                <Route
                    path="/athlete/:id"
                    element={currentCampId ? <AthleteDetail /> : <Navigate to="/" replace />}
                />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
