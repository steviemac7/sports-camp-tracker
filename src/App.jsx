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
                    element={currentCampId ? <Navigate to={`/camp/${currentCampId}`} replace /> : <CampSelector />}
                />
                <Route
                    path="/dashboard"
                    element={currentCampId ? <Navigate to={`/camp/${currentCampId}`} replace /> : <Navigate to="/" replace />}
                />
                <Route
                    path="/camp/:campId"
                    element={<CampDashboard />}
                />
                <Route
                    path="/athlete/:id"
                    element={<AthleteDetail />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
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
