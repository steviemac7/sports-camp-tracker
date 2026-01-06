import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Plus, Tent, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

import { useNavigate } from 'react-router-dom';

const CampSelector = () => {
    const { camps, addCamp, selectCamp, deleteCamp } = useCampStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newCampName, setNewCampName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [confirmState, setConfirmState] = useState({ isOpen: false, step: 0, camp: null });
    const navigate = useNavigate();

    const handleSelect = (id) => {
        selectCamp(id);
        navigate(`/camp/${id}`);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newCampName.trim() && startDate && endDate) {
            const id = await addCamp(newCampName, startDate, endDate);
            selectCamp(id);
            navigate(`/camp/${id}`);
        }
    };

    const startDeleteData = (camp) => {
        setConfirmState({
            isOpen: true,
            step: 1,
            camp: camp,
            title: 'Delete Camp?',
            message: `Are you sure you want to delete "${camp.name}"?`,
            confirmText: 'Yes, Delete'
        });
    };

    const handleConfirm = () => {
        const { step, camp } = confirmState;

        if (step === 1) {
            // Proceed to Step 2
            setConfirmState({
                ...confirmState,
                step: 2,
                title: 'Data Loss Warning',
                message: `This will permanently delete all athletes, attendance records, and groups associated with "${camp.name}". This cannot be undone.`,
                confirmText: 'I Understand, Continue'
            });
        } else if (step === 2) {
            // Proceed to Step 3
            setConfirmState({
                ...confirmState,
                step: 3,
                title: 'FINAL CONFIRMATION',
                message: `Please confirm one last time. Delete "${camp.name}" forever?`,
                confirmText: 'DELETE FOREVER'
            });
        } else if (step === 3) {
            // Execute Delete
            deleteCamp(camp.id);
            setConfirmState({ isOpen: false, step: 0, camp: null });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={handleConfirm}
                title={confirmState.title}
                message={confirmState.message}
                isDestructive={true}
                confirmText={confirmState.confirmText}
                autoClose={false}
            />

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold heading-gradient mb-2">My Camps</h2>
                <p className="text-slate-400">Select a camp to manage or create a new one.</p>
            </div>

            <div className="grid gap-4">
                {camps.map(camp => (
                    <div
                        key={camp.id}
                        onClick={() => handleSelect(camp.id)}
                        className="glass-panel p-6 flex items-center gap-4 hover:border-blue-400 transition-all group text-left w-full cursor-pointer relative pr-12"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Tent size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-100">{camp.name}</h3>
                            <p className="text-sm text-slate-500">
                                Created {new Date(camp.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                startDeleteData(camp);
                            }}
                            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Camp"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="glass-panel p-6 flex items-center gap-4 border-dashed border-slate-600 hover:border-slate-400 transition-all text-slate-400 hover:text-slate-200 w-full"
                    >
                        <div className="w-12 h-12 rounded-xl bg-slate-700/30 flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold">Create New Camp</span>
                    </button>
                ) : (
                    <form onSubmit={handleCreate} className="glass-panel p-6 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-lg mb-4 text-slate-100">New Camp Details</h3>
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Camp Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter camp name (e.g. Summer 2024)"
                                    className="input-field w-full"
                                    value={newCampName}
                                    onChange={(e) => setNewCampName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        className="input-field w-full"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        className="input-field w-full"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={!newCampName.trim() || !startDate || !endDate}
                            >
                                Create Camp
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CampSelector;
