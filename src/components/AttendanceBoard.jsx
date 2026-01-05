import React, { useState } from 'react';
import { useCampStore } from '../store/CampContext';
import clsx from 'clsx';
import { ClipboardCheck, PlusCircle, Lock, Unlock, Search } from 'lucide-react';
import NoteModal from './NoteModal';
import ConfirmModal from './ConfirmModal';
import { GroupIcon } from './GroupManager';

import { useNavigate } from 'react-router-dom';

const AttendanceBoard = ({ viewDate, setViewDate, filteredAthletes, onToggleAttendance, currentCamp, isLocked, onToggleLock, campId }) => {
    const { getAthleteGroup, attendance, addNote, assignGroupToAthlete, groups } = useCampStore();
    const navigate = useNavigate();
    const campGroups = groups.filter(g => g.campId === campId);

    // Modal State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Lock Logic
    const executeWithProtection = (callback) => {
        if (isLocked) {
            setConfirmState({
                isOpen: true,
                title: 'Date is Saved',
                message: `This date (${viewDate}) has been saved. Changing group assignments requires confirmation. Are you sure?`,
                onConfirm: callback,
                isDestructive: true,
                confirmText: 'Change Group'
            });
        } else {
            callback();
        }
    };

    const handleAddNoteClick = (e, athlete) => {
        e.stopPropagation(); // Prevent navigation
        setSelectedAthlete(athlete);
        setIsNoteModalOpen(true);
    };

    const handleProfileClick = (athleteId) => {
        navigate(`/athlete/${athleteId}`, { state: { previousTab: 'attendance' } });
    };

    const handleSaveNote = (type, content) => {
        if (selectedAthlete) {
            addNote(viewDate, selectedAthlete.id, type, content);
        }
    };

    // Sort alphabetically
    const sortedAthletes = [...filteredAthletes].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header / Controls */}
            <div className="glass-panel p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700 flex items-center gap-2 flex-grow md:flex-grow-0">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider hidden sm:inline">Date:</span>
                        <input
                            type="date"
                            className="bg-transparent text-white border-none outline-none text-sm w-full md:w-auto"
                            value={viewDate}
                            onChange={(e) => setViewDate(e.target.value)}
                            min={currentCamp?.startDate}
                            max={currentCamp?.endDate}
                        />
                    </div>

                    <button
                        onClick={onToggleLock}
                        className={clsx(
                            "px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-sm uppercase tracking-wider flex-shrink-0",
                            isLocked
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                        )}
                    >
                        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                        {isLocked ? "Saved" : "Save"}
                    </button>

                    <div className="text-slate-500 text-sm ml-auto md:ml-0">
                        {filteredAthletes.length} Athletes
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 glass-panel overflow-hidden flex flex-col">
                <div className="overflow-y-auto p-2 space-y-2">
                    {sortedAthletes.map(athlete => {
                        const isAbsent = attendance[`${viewDate}_${athlete.id}`] === 'absent';
                        const isPresent = !isAbsent;
                        const groupId = getAthleteGroup(athlete.id, viewDate);
                        const group = campGroups.find(g => g.id === groupId);

                        return (
                            <div
                                key={athlete.id}
                                onClick={() => handleProfileClick(athlete.id)}
                                className="flex items-center justify-between p-3 rounded bg-slate-800/30 hover:bg-slate-800/50 transition-all border border-slate-700/30 group cursor-pointer hover:border-blue-400/30"
                            >
                                <div className="min-w-0 flex-1 flex items-center gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleAttendance(athlete.id); }}
                                        className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all border flex-shrink-0",
                                            isPresent
                                                ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                : "bg-transparent text-slate-600 border-slate-700 hover:border-slate-500"
                                        )}
                                    >
                                        <ClipboardCheck size={20} />
                                    </button>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx("font-bold text-lg group-hover:text-blue-200 transition-colors", isAbsent ? "text-slate-500 line-through" : "text-white")}>
                                                {athlete.name}
                                            </span>
                                            <button
                                                onClick={(e) => handleAddNoteClick(e, athlete)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-400 transition-opacity"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span>{athlete.nickname}</span>
                                            {/* Quick Group Select */}
                                            <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800" onClick={(e) => e.stopPropagation()}>
                                                <div className={`w-4 h-4 rounded-full ${group ? group.color : 'bg-slate-600'} flex items-center justify-center`}>
                                                    <GroupIcon iconName={group?.icon} size={10} className="text-white/90" />
                                                </div>
                                                <select
                                                    value={groupId || 'unassigned'}
                                                    onChange={(e) => executeWithProtection(() => assignGroupToAthlete(viewDate, athlete.id, e.target.value))}
                                                    className="bg-transparent text-slate-400 focus:outline-none text-xs appearance-none pr-1 cursor-pointer hover:text-white"
                                                >
                                                    <option value="unassigned" className="bg-slate-900">Unassigned</option>
                                                    {campGroups.map(g => (
                                                        <option key={g.id} value={g.id} className="bg-slate-900">{g.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                isDestructive={confirmState.isDestructive}
                confirmText={confirmState.confirmText}
            />

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                athleteName={selectedAthlete?.name}
                defaultType="performance"
            />
        </div>
    );
};

export default AttendanceBoard;
