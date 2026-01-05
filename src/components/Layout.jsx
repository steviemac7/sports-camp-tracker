import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Home, Users, LogOut, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CampSettingsModal from './CampSettingsModal';

const Layout = ({ children }) => {
    const { currentCampId, camps, selectCamp } = useCampStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const currentCamp = camps.find(c => c.id === currentCampId);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSwitchCamp = () => {
        selectCamp(null);
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <CampSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                camp={currentCamp}
            />

            {/* Navigation */}
            <nav className="glass-panel m-4 mb-0 p-4 flex items-center justify-between z-50 sticky top-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                        {currentCamp ? currentCamp.name.substring(0, 2).toUpperCase() : 'SC'}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">
                            {currentCamp ? currentCamp.name : 'Sports Camp Tracker'}
                        </h1>
                        <p className="text-xs text-slate-400">
                            {currentCamp ? 'Camp Manager' : 'Select a Camp'}
                        </p>
                    </div>
                </div>

                {currentCampId && (
                    <div className="flex items-center gap-2">
                        {currentCamp && (
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                                title="Camp Settings"
                            >
                                <Settings size={20} />
                            </button>
                        )}
                        <button
                            onClick={handleSwitchCamp}
                            className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                            title="Switch Camp"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

export default Layout;
