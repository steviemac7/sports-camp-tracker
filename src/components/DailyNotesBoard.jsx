import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import clsx from 'clsx';
import { StickyNote, Search, Calendar, ChevronRight, ChevronLeft, Award, Heart, ShieldAlert } from 'lucide-react';

const DailyNotesBoard = ({ viewDate, setViewDate, currentCamp, filteredAthletes }) => {
    const { notes, athletes } = useCampStore();


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

    // 2. Filter by Date and filteredAthletes (Camp + Search)
    const campNotes = allNotes.filter(note => {
        const noteDate = note.date; // "YYYY-MM-DD"
        // Ensure accurate date comparison
        if (noteDate !== viewDate) return false;

        // Verify athlete matches current filters (Search Query + Camp)
        // filteredAthletes is passed from parent and already filtered by search & camp
        if (filteredAthletes) {
            return filteredAthletes.some(a => a.id === note.athleteId);
        }

        // Fallback if no filter prop (shouldn't happen in current usage)
        const athlete = athletes.find(a => a.id === note.athleteId);
        return athlete && athlete.campId === currentCamp.id;
    });

    // 3. Group notes by athlete for Table View
    // Structure: { athleteId: { name: "Name", admin: [], performance: [], interests: [] } }
    const notesByAthlete = {};

    // Process ALL notes for this day
    campNotes.forEach(note => {
        if (!notesByAthlete[note.athleteId]) {
            notesByAthlete[note.athleteId] = {
                name: note.athleteName,
                admin: [],
                performance: [],
                interests: []
            };
        }
        if (notesByAthlete[note.athleteId][note.type]) {
            notesByAthlete[note.athleteId][note.type].push(note);
        }
    });

    const athleteIdsWithNotes = Object.keys(notesByAthlete).sort((a, b) =>
        notesByAthlete[a].name.localeCompare(notesByAthlete[b].name)
    );



    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header Controls */}
            <div className="glass-panel p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto pb-1 md:pb-0 overflow-visible">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const d = new Date(viewDate + 'T00:00:00');
                                d.setDate(d.getDate() - 1);
                                setViewDate(d.toLocaleDateString('en-CA'));
                            }}
                            disabled={currentCamp && viewDate <= currentCamp.startDate}
                            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className={clsx(
                            "relative p-2 rounded-lg border flex items-center gap-2 flex-grow md:flex-grow-0 transition-all min-w-[200px] justify-center overflow-visible",
                            viewDate === new Date().toLocaleDateString('en-CA')
                                ? "bg-slate-800 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                : "bg-slate-800/50 border-slate-700"
                        )}>
                            {/* Today Badge */}
                            {viewDate === new Date().toLocaleDateString('en-CA') && (
                                <div className="absolute -top-3 -right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-900 z-10 whitespace-nowrap">
                                    TODAY
                                </div>
                            )}

                            <span className={clsx("text-sm font-bold uppercase tracking-wider hidden sm:inline", viewDate === new Date().toLocaleDateString('en-CA') ? "text-blue-400" : "text-slate-400")}>Date:</span>
                            <input
                                type="date"
                                className="bg-transparent text-white border-none outline-none text-sm w-full md:w-auto z-0 cursor-pointer text-center"
                                value={viewDate}
                                onChange={(e) => setViewDate(e.target.value)}
                                min={currentCamp?.startDate}
                                max={currentCamp?.endDate}
                            />
                        </div>

                        <button
                            onClick={() => {
                                const d = new Date(viewDate + 'T00:00:00');
                                d.setDate(d.getDate() + 1);
                                setViewDate(d.toLocaleDateString('en-CA'));
                            }}
                            disabled={currentCamp && viewDate >= currentCamp.endDate}
                            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                </div>

                <div className="text-slate-500 text-sm font-medium">
                    {athleteIdsWithNotes.length} Athlete{athleteIdsWithNotes.length !== 1 && 's'} with Notes
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 glass-panel overflow-hidden flex flex-col">
                <div className="overflow-auto">
                    {athleteIdsWithNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500 opacity-50">
                            <StickyNote size={48} className="mb-4" />
                            <p className="text-lg font-semibold">No notes found for this day.</p>
                            <p className="text-sm">Select a different date.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400 font-bold">
                                    <th className="p-3 w-1/5 sticky top-0 bg-slate-900 z-10">Athlete</th>
                                    <th className="p-3 w-[26%] sticky top-0 bg-slate-900 z-10 text-red-400"><div className="flex items-center gap-2"><ShieldAlert size={14} /> Admin</div></th>
                                    <th className="p-3 w-[27%] sticky top-0 bg-slate-900 z-10 text-blue-400"><div className="flex items-center gap-2"><Award size={14} /> Performance</div></th>
                                    <th className="p-3 w-[27%] sticky top-0 bg-slate-900 z-10 text-emerald-400"><div className="flex items-center gap-2"><Heart size={14} /> Interests</div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {athleteIdsWithNotes.map(athleteId => {
                                    const data = notesByAthlete[athleteId];
                                    return (
                                        <tr key={athleteId} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-3 align-top border-r border-slate-800/50">
                                                <div className="font-bold text-slate-200 text-sm">{data.name}</div>
                                            </td>
                                            {/* Admin Notes Cell */}
                                            <td className="p-2 align-top bg-red-500/5 border-r border-slate-800/50">
                                                <div className="space-y-2">
                                                    {data.admin.map((note, idx) => (
                                                        <div key={idx} className="bg-slate-900/80 border border-red-500/20 rounded p-2 text-xs shadow-sm group">
                                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                                            <div className="mt-1 text-[10px] text-slate-500 font-mono text-right opacity-50 group-hover:opacity-100 transition-opacity">
                                                                {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            {/* Performance Notes Cell */}
                                            <td className="p-2 align-top bg-blue-500/5 border-r border-slate-800/50">
                                                <div className="space-y-2">
                                                    {data.performance.map((note, idx) => (
                                                        <div key={idx} className="bg-slate-900/80 border border-blue-500/20 rounded p-2 text-xs shadow-sm group">
                                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                                            <div className="mt-1 text-[10px] text-slate-500 font-mono text-right opacity-50 group-hover:opacity-100 transition-opacity">
                                                                {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            {/* Interests Notes Cell */}
                                            <td className="p-2 align-top bg-emerald-500/5">
                                                <div className="space-y-2">
                                                    {data.interests.map((note, idx) => (
                                                        <div key={idx} className="bg-slate-900/80 border border-emerald-500/20 rounded p-2 text-xs shadow-sm group">
                                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                                            <div className="mt-1 text-[10px] text-slate-500 font-mono text-right opacity-50 group-hover:opacity-100 transition-opacity">
                                                                {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyNotesBoard;
