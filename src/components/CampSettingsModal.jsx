import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useCampStore } from '../store/CampContext';

const CampSettingsModal = ({ isOpen, onClose, camp }) => {
    const { updateCamp, shareCamp } = useCampStore();
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [shareEmail, setShareEmail] = useState('');
    const [shareStatus, setShareStatus] = useState({ message: '', type: '' });
    const [isLoadingShare, setIsLoadingShare] = useState(false);

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

                        <form onSubmit={handleShare} className="space-y-3">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampSettingsModal;
