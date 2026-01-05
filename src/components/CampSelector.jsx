import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Plus, Tent } from 'lucide-react';

const CampSelector = () => {
    const { camps, addCamp, selectCamp } = useCampStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newCampName, setNewCampName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (newCampName.trim()) {
            const id = addCamp(newCampName);
            selectCamp(id);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold heading-gradient mb-2">My Camps</h2>
                <p className="text-slate-400">Select a camp to manage or create a new one.</p>
            </div>

            <div className="grid gap-4">
                {camps.map(camp => (
                    <button
                        key={camp.id}
                        onClick={() => selectCamp(camp.id)}
                        className="glass-panel p-6 flex items-center gap-4 hover:border-blue-400 transition-all group text-left w-full"
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
                    </button>
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
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter camp name (e.g. Summer 2024)"
                            className="input-field mb-4"
                            value={newCampName}
                            onChange={(e) => setNewCampName(e.target.value)}
                        />
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
                                disabled={!newCampName.trim()}
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
