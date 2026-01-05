import React, { useState } from 'react';
import { X, Save, ShieldAlert, Award, Heart } from 'lucide-react';
import clsx from 'clsx';

const NoteModal = ({ isOpen, onClose, onSave, athleteName, defaultType = 'performance' }) => {
    const [type, setType] = useState(defaultType);
    const [content, setContent] = useState('');

    // Reset type when modal opens or defaultType changes
    React.useEffect(() => {
        if (isOpen) {
            setType(defaultType);
            setContent('');
        }
    }, [isOpen, defaultType]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSave(type, content);
        setContent('');
        onClose();
    };

    const types = [
        { id: 'admin', label: 'Admin', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/20' },
        { id: 'performance', label: 'Performance', icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { id: 'interests', label: 'Interests', icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                    <h3 className="font-bold text-white text-lg">Add Note for {athleteName}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        {types.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setType(t.id)}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all",
                                    type === t.id
                                        ? `${t.bg} ${t.color} border-${t.color.split('-')[1]}-500/50`
                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                                )}
                            >
                                <t.icon size={20} />
                                <span className="text-xs font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Note Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none placeholder-slate-600"
                            placeholder="Type your note here..."
                            autoFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            Save Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteModal;
