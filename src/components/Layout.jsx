import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Home, Users, LogOut, Settings, ArrowRightLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CampSettingsModal from './CampSettingsModal';
import { useAuth } from '../store/AuthContext';

const Layout = ({ children }) => {
    const { currentCampId, camps, selectCamp } = useCampStore();
    const { currentUser, isAdmin, logout } = useAuth();
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
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">
                                {currentUser ? `Signed in as: ${currentUser.email}` : (currentCamp ? 'Camp Manager' : 'Select a Camp')}
                            </span>
                            {isAdmin && <span className="text-red-500 font-bold uppercase tracking-wider text-[10px] border border-red-500/30 px-1 rounded bg-red-500/10">Admin</span>}
                        </div>
                    </div>
                </div>

                {currentCampId && (
                    <div className="flex items-center gap-2">
                        {currentCamp && (
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                title="Camp Settings"
                            >
                                <Settings size={18} />
                                <span className="hidden sm:inline text-sm font-medium">Camp Settings</span>
                            </button>
                        )}
                        <button
                            onClick={handleSwitchCamp}
                            className="px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                            title="Switch Camp"
                        >
                            <ArrowRightLeft size={18} />
                            <span className="hidden sm:inline text-sm font-medium">Switch Camp</span>
                        </button>
                    </div>
                )}
                {currentUser && (
                    <button
                        onClick={async () => {
                            await logout();
                            navigate('/login');
                        }}
                        className="ml-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
                        title="Log Out"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline text-sm font-medium">Log Out</span>
                    </button>
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
