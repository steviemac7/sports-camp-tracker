import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Plus, X, Check, Edit2, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const COLORS = [
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Teal', class: 'bg-teal-500' },
    { name: 'Cyan', class: 'bg-cyan-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Violet', class: 'bg-violet-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Fuchsia', class: 'bg-fuchsia-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Rose', class: 'bg-rose-500' },
];

const GroupManager = ({ onClose }) => {
    const { currentCampId, groups, addGroup, updateGroup, deleteGroup } = useCampStore();
    const campGroups = groups.filter(g => g.campId === currentCampId);

    const [isAdding, setIsAdding] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState(COLORS[0].class);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            addGroup(currentCampId, newGroupName, newGroupColor);
            setNewGroupName('');
            setIsAdding(false);
        }
    };

    const startEdit = (group) => {
        setEditingId(group.id);
        setEditName(group.name);
        setEditColor(group.color);
    };

    const saveEdit = () => {
        if (editName.trim()) {
            updateGroup(editingId, { name: editName, color: editColor });
            setEditingId(null);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure? Athletes in this group will be unassigned.')) {
            deleteGroup(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-6 text-white">Manage Groups</h2>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6 pr-2">
                    {campGroups.map(group => (
                        <div key={group.id} className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-700">
                            {editingId === group.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                    <div className="relative group/color">
                                        <div className={`w-8 h-8 rounded-full ${editColor} cursor-pointer border-2 border-white/20`} />
                                        <div className="absolute top-10 left-0 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-1 shadow-xl z-10 hidden group-hover/color:grid w-40">
                                            {COLORS.map(c => (
                                                <button key={c.name} type="button" className={`w-6 h-6 rounded-full ${c.class}`} onClick={() => setEditColor(c.class)} />
                                            ))}
                                        </div>
                                    </div>
                                    <input
                                        autoFocus
                                        className="bg-transparent border-b border-blue-500 text-white outline-none flex-1 pb-1"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                    <button onClick={saveEdit} className="text-green-400 p-1"><Check size={18} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400 p-1"><X size={18} /></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${group.color}`} />
                                        <span className="font-medium text-slate-200">{group.name}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => startEdit(group)} className="p-2 text-slate-500 hover:text-blue-400"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(group.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {isAdding ? (
                    <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                    className={`w-8 h-8 rounded-full ${newGroupColor} cursor-pointer border-2 border-white/20 transition-transform active:scale-95`}
                                />
                                {isColorPickerOpen && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setIsColorPickerOpen(false)} />
                                        <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-2 shadow-xl z-10 w-48 animate-in fade-in zoom-in-95 duration-200">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    className={`w-6 h-6 rounded-full ${c.class} hover:scale-110 transition-transform ${newGroupColor === c.class ? 'ring-2 ring-white' : ''}`}
                                                    onClick={() => {
                                                        setNewGroupColor(c.class);
                                                        setIsColorPickerOpen(false);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <input
                                placeholder="Group Name (e.g. Red Team)"
                                className="bg-transparent border-b border-slate-600 focus:border-blue-500 text-white outline-none flex-1 pb-1 transition-colors"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary py-1 px-3 text-sm">Cancel</button>
                            <button type="submit" className="btn-primary py-1 px-3 text-sm">Create</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2 font-semibold">
                        <Plus size={20} />
                        Add New Group
                    </button>
                )}
            </div>
        </div>
    );
};

export default GroupManager;
