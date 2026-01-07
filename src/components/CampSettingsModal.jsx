import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader, ShieldAlert, Crown } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useCampStore } from '../store/CampContext';

const CampSettingsModal = ({ isOpen, onClose, camp }) => {
    const { updateCamp, shareCamp, getCampCollaborators, removeCollaborator, getCampCreator } = useCampStore();
    const { currentUser, isAdmin } = useAuth();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Sharing State
    const [shareEmail, setShareEmail] = useState('');
    const [shareStatus, setShareStatus] = useState({ message: '', type: '' });
    const [isLoadingShare, setIsLoadingShare] = useState(false);

    // Collaborator Management
    const [collaborators, setCollaborators] = useState([]);
    const [loadingCollaborators, setLoadingCollaborators] = useState(false);
    const [creator, setCreator] = useState(null);

    // Fetch collaborators and creator
    useEffect(() => {
        setCreator(null); // Reset to avoid stale data
        const fetchData = async () => {
            if (camp) {
                if (camp.ownerId) {
                    const creatorData = await getCampCreator(camp.ownerId);
                    if (creatorData) {
                        setCreator(creatorData);
                    } else {
                        // Fallback purely for display if user profile is missing
                        setCreator({ email: 'Unknown Owner', uid: camp.ownerId });
                    }
                }

                // Fetch Collaborators
                if (camp.collaboratorIds && camp.collaboratorIds.length > 0) {
                    setLoadingCollaborators(true);
                    const collabs = await getCampCollaborators(camp.collaboratorIds);
                    setCollaborators(collabs);
                    setLoadingCollaborators(false);
                } else {
                    setCollaborators([]);
                }
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [camp, isOpen, getCampCollaborators, getCampCreator]);

    const handleRemove = async (uid) => {
        if (!window.confirm("Are you sure you want to remove this user's access?")) return;

        const result = await removeCollaborator(camp.id, uid);
        if (result.success) {
            // Optimistic update
            setCollaborators(prev => prev.filter(c => c.uid !== uid));
        } else {
            alert("Failed to remove: " + result.message);
        }
    };

    useEffect(() => {
        if (camp) {
            setName(camp.name || '');
            setStartDate(camp.startDate || '');
            setEndDate(camp.endDate || '');
        }
    }, [camp, isOpen]);

    if (!isOpen || !camp) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        updateCamp(camp.id, { name, startDate, endDate });
        onClose();
    };

    const handleShare = async (e) => {
        e.preventDefault();
        if (!shareEmail) return;

        setIsLoadingShare(true);
        setShareStatus({ message: '', type: '' });

        const result = await shareCamp(camp.id, shareEmail);

        setIsLoadingShare(false);
        setShareStatus({
            message: result.message,
            type: result.success ? 'success' : 'error'
        });

        if (result.success) setShareEmail('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">Camp Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Edit Camp Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Camp Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. Summer Elite 2025"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </form>

                    {/* Share Section */}
                    <div className="border-t border-slate-700/50 pt-6">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Share Access
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-normal normal-case">Collaborators can view & edit</span>
                        </h3>

                        {(isAdmin || currentUser?.uid === camp.ownerId) && (
                            <form onSubmit={handleShare} className="space-y-3 mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter collaborator's email"
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                        value={shareEmail}
                                        onChange={(e) => setShareEmail(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!shareEmail || isLoadingShare}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        {isLoadingShare ? 'Adding...' : 'Add User'}
                                    </button>
                                </div>
                                {shareStatus.message && (
                                    <p className={`text-xs ${shareStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'} animate-in fade-in slide-in-from-top-1`}>
                                        {shareStatus.message}
                                    </p>
                                )}
                            </form>
                        )}

                        {/* Collaborator List */}
                        <div className="space-y-4">
                            {/* Creator Badge */}
                            {/* Creator Badge */}
                            <div>
                                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Crown size={12} className="fill-amber-500" /> Camp Creator
                                </h4>
                                {creator ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center text-xs font-bold text-amber-500 border border-amber-500/30">
                                            {creator.email ? creator.email.substring(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <span className="text-sm text-slate-200">{creator.email || 'Unknown Email'}</span>
                                    </div>
                                ) : (
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-center gap-3 opacity-70">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                            ?
                                        </div>
                                        <span className="text-sm text-slate-500">
                                            {camp.ownerId ? 'Owner details unavailable' : 'No owner assigned'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Collaborators</h4>
                                {loadingCollaborators ? (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Loader className="animate-spin" size={14} /> Loading list...
                                    </div>
                                ) : collaborators.length > 0 ? (
                                    <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
                                        {collaborators.map(user => (
                                            <div key={user.uid} className="flex items-center justify-between p-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                        {user.email.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-slate-300">{user.email}</span>
                                                </div>
                                                {(isAdmin || currentUser?.uid === camp.ownerId) && (
                                                    <button
                                                        onClick={() => handleRemove(user.uid)}
                                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Remove Access"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-600 italic">No additional collaborators assigned.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampSettingsModal;
