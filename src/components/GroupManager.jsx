import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { Plus, X, Check, Edit2, Trash2, Circle, Trophy, Star, Flame, Zap, Heart, Smile, Users, Target, Flag, Shield, Anchor, Mountain, Trees, Hexagon, Component, Crown, Gem, Sword, Skull } from 'lucide-react';
import clsx from 'clsx';

// Extended Color Palette
const COLORS = [
    { name: 'Slate', class: 'bg-slate-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Yellow', class: 'bg-yellow-400' },
    { name: 'Lime', class: 'bg-lime-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Teal', class: 'bg-teal-500' },
    { name: 'Cyan', class: 'bg-cyan-500' },
    { name: 'Sky', class: 'bg-sky-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Violet', class: 'bg-violet-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Fuchsia', class: 'bg-fuchsia-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Rose', class: 'bg-rose-500' },
    { name: 'Stone', class: 'bg-stone-500' },
    { name: 'Neutral', class: 'bg-neutral-600' }
];

// Available Icons
const ICONS = [
    { name: 'Circle', component: Circle },
    { name: 'Star', component: Star },
    { name: 'Heart', component: Heart },
    { name: 'Flag', component: Flag },
    { name: 'Shield', component: Shield },
    { name: 'Trophy', component: Trophy },
    { name: 'Crown', component: Crown },
    { name: 'Flame', component: Flame },
    { name: 'Zap', component: Zap },
    { name: 'Target', component: Target },
    { name: 'Sword', component: Sword },
    { name: 'Gem', component: Gem },
    { name: 'Skull', component: Skull },
    { name: 'Anchor', component: Anchor },
    { name: 'Mountain', component: Mountain },
    { name: 'Trees', component: Trees },
    { name: 'Smile', component: Smile },
    { name: 'Users', component: Users },
    { name: 'Hexagon', component: Hexagon },
    { name: 'Component', component: Component },
    // Numbers
    { name: '1', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>1</span> },
    { name: '2', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>2</span> },
    { name: '3', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>3</span> },
    { name: '4', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>4</span> },
    { name: '5', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>5</span> },
    { name: '6', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>6</span> },
    { name: '7', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>7</span> },
    { name: '8', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>8</span> },
    { name: '9', component: ({ size, className }) => <span className={clsx("font-bold font-mono flex items-center justify-center leading-none", className)} style={{ fontSize: size }}>9</span> },
];

export const GroupIcon = ({ iconName, className, size = 16 }) => {
    const iconDef = ICONS.find(i => i.name === iconName) || ICONS[0];
    const IconComponent = iconDef.component;
    return <IconComponent className={className} size={size} />;
};

const GroupManager = ({ onClose }) => {
    const { currentCampId, groups, addGroup, updateGroup, deleteGroup } = useCampStore();
    const campGroups = groups.filter(g => g.campId === currentCampId);

    const [isAdding, setIsAdding] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState(COLORS[7].class); // Default Emerald
    const [newGroupIcon, setNewGroupIcon] = useState('Circle');

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editIcon, setEditIcon] = useState('Circle');

    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    // Helpers to manage pickers for Edit mode vs Add mode is tricky with shared state.
    // Simplification: Pickers only active for ONE context at a time.
    // Let's use specific states or IDs.
    const [activePicker, setActivePicker] = useState({ type: null, id: null }); // type: 'color'|'icon', id: 'new'|groupId

    const handleAdd = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            addGroup(currentCampId, newGroupName, newGroupColor, newGroupIcon);
            setNewGroupName('');
            setIsAdding(false);
        }
    };

    const startEdit = (group) => {
        setEditingId(group.id);
        setEditName(group.name);
        setEditColor(group.color);
        setEditIcon(group.icon || 'Circle');
        setActivePicker({ type: null, id: null });
    };

    const saveEdit = () => {
        if (editName.trim()) {
            updateGroup(editingId, { name: editName, color: editColor, icon: editIcon });
            setEditingId(null);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure? Athletes in this group will be unassigned.')) {
            deleteGroup(id);
        }
    };

    const togglePicker = (type, id) => {
        if (activePicker.type === type && activePicker.id === id) {
            setActivePicker({ type: null, id: null });
        } else {
            setActivePicker({ type, id });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-6 text-white">Manage Groups</h2>

                <div className="space-y-3 overflow-y-auto mb-6 pr-2 flex-1 min-h-0">
                    {campGroups.map(group => (
                        <div key={group.id} className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-700 relative">
                            {editingId === group.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                    {/* Edit Color */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => togglePicker('color', group.id)}
                                            className={`w-8 h-8 rounded-full ${editColor} cursor-pointer border-2 border-white/20 flex items-center justify-center`}
                                        >
                                            {/* Edit Icon Preview */}
                                            <GroupIcon iconName={editIcon} size={14} className="text-white/80" />
                                        </button>

                                        {/* Edit Icon Trigger (Small overlay) */}
                                        <button
                                            onClick={() => togglePicker('icon', group.id)}
                                            className="absolute -bottom-1 -right-1 bg-slate-700 text-slate-200 rounded-full p-0.5 border border-slate-500"
                                        >
                                            <Edit2 size={10} />
                                        </button>

                                        {/* Color Picker Popover */}
                                        {activePicker.type === 'color' && activePicker.id === group.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActivePicker({ type: null, id: null })} />
                                                <div className="absolute top-10 left-0 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-2 shadow-xl z-20 w-48 animate-in fade-in zoom-in-95">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.name}
                                                            type="button"
                                                            className={`w-6 h-6 rounded-full ${c.class} hover:scale-110 transition-transform`}
                                                            onClick={() => { setEditColor(c.class); setActivePicker({ type: null, id: null }); }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Icon Picker Popover */}
                                        {activePicker.type === 'icon' && activePicker.id === group.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActivePicker({ type: null, id: null })} />
                                                <div className="absolute top-10 left-0 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-2 shadow-xl z-20 w-48 animate-in fade-in zoom-in-95 max-h-48 overflow-y-auto">
                                                    {ICONS.map(i => (
                                                        <button
                                                            key={i.name}
                                                            type="button"
                                                            className={`w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors`}
                                                            onClick={() => { setEditIcon(i.name); setActivePicker({ type: null, id: null }); }}
                                                        >
                                                            <i.component size={16} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
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
                                        <div className={`w-8 h-8 rounded-full ${group.color} flex items-center justify-center`}>
                                            <GroupIcon iconName={group.icon} className="text-white/80" />
                                        </div>
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
                            {/* New Group Color/Icon Picker */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => togglePicker('color', 'new')}
                                    className={`w-10 h-10 rounded-full ${newGroupColor} cursor-pointer border-2 border-white/20 flex items-center justify-center transition-transform active:scale-95`}
                                >
                                    <GroupIcon iconName={newGroupIcon} className="text-white/90" size={20} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => togglePicker('icon', 'new')}
                                    className="absolute -bottom-1 -right-1 bg-slate-700 text-slate-200 rounded-full p-1 border border-slate-500 shadow-sm z-10"
                                >
                                    <Edit2 size={10} />
                                </button>

                                {/* New Color Popover */}
                                {activePicker.type === 'color' && activePicker.id === 'new' && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setActivePicker({ type: null, id: null })} />
                                        <div className="absolute bottom-14 left-0 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-2 shadow-xl z-20 w-56 animate-in fade-in zoom-in-95">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    className={`w-8 h-8 rounded-full ${c.class} hover:scale-110 transition-transform ${newGroupColor === c.class ? 'ring-2 ring-white' : ''}`}
                                                    onClick={() => { setNewGroupColor(c.class); setActivePicker({ type: null, id: null }); }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* New Icon Popover */}
                                {activePicker.type === 'icon' && activePicker.id === 'new' && (
                                    <>
                                        <div className="fixed inset-0 z-0" onClick={() => setActivePicker({ type: null, id: null })} />
                                        <div className="absolute bottom-14 left-8 bg-slate-900 border border-slate-700 p-2 rounded-lg grid grid-cols-5 gap-2 shadow-xl z-20 w-56 animate-in fade-in zoom-in-95 max-h-56 overflow-y-auto">
                                            {ICONS.map(i => (
                                                <button
                                                    key={i.name}
                                                    type="button"
                                                    className={`w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors ${newGroupIcon === i.name ? 'bg-slate-700 text-white' : ''}`}
                                                    onClick={() => { setNewGroupIcon(i.name); setActivePicker({ type: null, id: null }); }}
                                                >
                                                    <i.component size={20} />
                                                </button>
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
