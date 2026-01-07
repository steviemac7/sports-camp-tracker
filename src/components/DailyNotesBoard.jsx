import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import clsx from 'clsx';
import { StickyNote, Search, Calendar, ChevronRight } from 'lucide-react';

const DailyNotesBoard = ({ viewDate, setViewDate, currentCamp }) => {
    const { notes, athletes } = useCampStore();
    const [filterType, setFilterType] = useState('all'); // all, admin, performance, etc.

    // 1. Flatten all notes into a single array
    // 'notes' is currently { athleteId: [note1, note2] }
    const allNotes = Object.entries(notes).flatMap(([athleteId, athleteNotes]) => {
        const athlete = athletes.find(a => a.id === athleteId);
        return athleteNotes.map(note => ({
            ...note,
            athleteName: athlete ? athlete.name : 'Unknown Athlete',
            athleteId
        }));
    });

    // 2. Filter by Date and Camp (implicitly by athlete being in camp)
    // We need to ensure we only show notes for athletes in THIS camp
    const campNotes = allNotes.filter(note => {
        const noteDate = note.date; // "YYYY-MM-DD"
        // Ensure accurate date comparison
        if (noteDate !== viewDate) return false;

        // Ensure athlete is in this camp (already handled by 'notes' context scope, but double check)
        const athlete = athletes.find(a => a.id === note.athleteId);
        return athlete && athlete.campId === currentCamp.id;
    });

    // 3. Filter by Type
    const filteredNotes = campNotes.filter(note => {
        if (filterType === 'all') return true;
        return note.type === filterType;
    });

    const noteTypes = [
        { id: 'all', label: 'All Notes', color: 'bg-slate-700 text-slate-300' },
        { id: 'admin', label: 'Admin', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
        { id: 'performance', label: 'Performance', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
        { id: 'general', label: 'General', color: 'bg-slate-600/20 text-slate-400 border border-slate-600/30' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header Controls */}
            <div className="glass-panel p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {/* Date Wrapper (Reused style from AttendanceBoard) */}
                    <div className={clsx(
                        "relative p-2 rounded-lg border flex items-center gap-2 flex-grow md:flex-grow-0 transition-all min-w-[160px] justify-center",
                        viewDate === new Date().toLocaleDateString('en-CA')
                            ? "bg-slate-800 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                            : "bg-slate-800/50 border-slate-700"
                    )}>
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Date:</span>
                        <input
                            type="date"
                            className="bg-transparent text-white border-none outline-none text-sm w-full md:w-auto z-0 cursor-pointer"
                            value={viewDate}
                            onChange={(e) => setViewDate(e.target.value)}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2">
                        {noteTypes.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                    filterType === type.id
                                        ? "ring-2 ring-white/20 " + type.color
                                        : "hover:bg-slate-700/50 opacity-50 hover:opacity-100 text-slate-400"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-slate-500 text-sm font-medium">
                    {filteredNotes.length} Note{filteredNotes.length !== 1 && 's'} Found
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 glass-panel overflow-hidden flex flex-col">
                <div className="overflow-y-auto p-4 space-y-4">
                    {filteredNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                            <StickyNote size={48} className="mb-4" />
                            <p className="text-lg font-semibold">No notes found for this day.</p>
                            <p className="text-sm">Select a different date or filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredNotes.map((note, idx) => (
                                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-200">{note.athleteName}</h3>
                                            <span className={clsx(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                note.type === 'admin' && "bg-red-500/20 text-red-400",
                                                note.type === 'performance' && "bg-blue-500/20 text-blue-400",
                                                note.type === 'general' && "bg-emerald-500/20 text-emerald-400"
                                            )}>
                                                {note.type}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 flex-1 whitespace-pre-wrap">{note.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyNotesBoard;
