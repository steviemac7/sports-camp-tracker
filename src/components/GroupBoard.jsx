import React, { useMemo, useState } from 'react';
import { useCampStore } from '../store/CampContext';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Phone, ClipboardCheck, PlusCircle, Clock, ShieldAlert, Award, Heart, Cross, AlertTriangle, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import NoteModal from './NoteModal';
import ConfirmModal from './ConfirmModal';

// Draggable Item Component (Card on Board)
const SortableAthlete = ({ athlete, groups, onGroupChange, isAbsent, onToggleAttendance, latestNotes, onAddNote }) => {
    const navigate = useNavigate();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: athlete.id,
        data: { type: 'athlete', athlete }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Helper to get color/label for note type
    const getNoteStyle = (type) => {
        switch (type) {
            case 'admin': return 'border-l-2 border-red-500 bg-red-500/5 text-red-200 hover:bg-red-500/10';
            case 'performance': return 'border-l-2 border-blue-500 bg-blue-500/5 text-blue-200 hover:bg-blue-500/10';
            case 'interests': return 'border-l-2 border-emerald-500 bg-emerald-500/5 text-emerald-200 hover:bg-emerald-500/10';
            default: return 'border-l-2 border-slate-500 bg-slate-500/5 text-slate-200';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'admin': return <ShieldAlert size={8} />;
            case 'performance': return <Award size={8} />;
            case 'interests': return <Heart size={8} />;
            default: return <Clock size={8} />;
        }
    };

    // Use the passed isAbsent prop
    // Default visual is Green (Present) unless isAbsent is true

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => navigate(`/athlete/${athlete.id}`)}
            className={clsx(
                "bg-slate-700/50 p-3 rounded-lg mb-2 flex flex-col gap-2 group touch-none select-none relative overflow-hidden transition-all cursor-pointer hover:ring-1 hover:ring-blue-400/50",
                isDragging ? "opacity-30" : "hover:bg-slate-700",
                isAbsent ? "opacity-75 grayscale border border-transparent" : "border-l-4 border-emerald-500 shadow-sm" // Green border for present/default
            )}
        >
            {/* Absent Indicator Badge */}
            {isAbsent && (
                <div className="absolute top-0 right-0 bg-red-400/90 px-2 py-0.5 rounded-bl text-[8px] font-bold text-white uppercase tracking-wider z-10">
                    Absent
                </div>
            )}

            <div className="flex items-start gap-2">
                <div
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 cursor-grab active:cursor-grabbing mt-1"
                >
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className={clsx("font-bold text-slate-200 truncate text-sm leading-tight", isAbsent && "line-through text-slate-500")}>
                            {athlete.name}
                        </p>
                        {/* Add Note Button (Generic) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddNote(athlete, 'performance'); }}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-600 transition-colors"
                            title="Add Note"
                        >
                            <PlusCircle size={14} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{athlete.nickname}</p>

                    {/* Phone Number */}
                    {athlete.parentPhone && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Phone size={10} />
                            <span>{athlete.parentPhone}</span>
                        </div>
                    )}

                    {/* Medical & Allergy Indicators - Full Text */}
                    {(athlete.medicalNotes || athlete.allergies) && (
                        <div className="flex flex-col gap-1 mt-2">
                            {athlete.medicalNotes && (
                                <div className="flex items-start gap-1.5 text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                                    <Cross size={10} className="rotate-45 mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{athlete.medicalNotes}</span>
                                </div>
                            )}
                            {athlete.allergies && (
                                <div className="flex items-start gap-1.5 text-[10px] text-red-300 bg-red-500/10 p-1.5 rounded border border-red-500/20">
                                    <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{athlete.allergies}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Latest Notes Display (Up to 3 types) */}
                    <div className="space-y-1 mt-2">
                        {['admin', 'performance', 'interests'].map(type => {
                            const note = latestNotes[type];
                            if (!note) return null;
                            return (
                                <div
                                    key={type}
                                    onClick={(e) => { e.stopPropagation(); onAddNote(athlete, type); }}
                                    className={clsx("p-1.5 rounded text-[10px] space-y-0.5 cursor-pointer transition-colors", getNoteStyle(type))}
                                    title="Click to add new note of this type"
                                >
                                    <div className="flex items-center justify-between opacity-70">
                                        <span className="uppercase tracking-wider font-bold text-[8px] flex items-center gap-1">
                                            {getIcon(type)}
                                            {type}
                                        </span>
                                        <span className="text-[8px]">
                                            {new Date(note.timestamp).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 leading-snug">{note.content}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-600/50">
                {/* Attendance Toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleAttendance(athlete.id); }}
                    className={clsx(
                        "p-1.5 rounded transition-colors flex items-center gap-1 text-[10px] font-medium flex-1 justify-center",
                        !isAbsent
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    )}
                >
                    <ClipboardCheck size={12} />
                    {isAbsent ? 'Set Present' : 'Set Absent'}
                </button>

                {/* Dropdown for quick move */}
                <select
                    value={athlete.groupId || 'unassigned'}
                    onChange={(e) => { e.stopPropagation(); onGroupChange(athlete.id, e.target.value); }}
                    className="bg-slate-900/50 border border-slate-600 rounded text-[10px] text-slate-400 focus:outline-none focus:border-blue-500 py-1 px-1 max-w-[80px]"
                >
                    <option value="unassigned">None</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

// Column Component
const GroupColumn = ({ group, athletes, groups, onGroupChange, attendance, viewDate, onToggleAttendance, notes, onAddNote }) => {
    const { setNodeRef } = useSortable({
        id: group.id,
        data: { type: 'group', group }
    });

    return (
        <div className="flex-shrink-0 w-full lg:w-80 flex flex-col lg:h-full lg:max-h-full h-auto min-h-[150px] glass-panel overflow-hidden bg-slate-800/20 border-slate-700/50 mb-4 lg:mb-0">
            {/* Header */}
            <div className="p-3 border-b border-slate-700/50 flex items-center gap-2 bg-slate-900/30">
                <div className={`w-3 h-3 rounded-full ${group.color || 'bg-slate-500'}`} />
                <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">{group.name}</h3>
                <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-400">{athletes.length}</span>
            </div>

            {/* List */}
            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto">
                <SortableContext items={athletes.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    {athletes.map(athlete => {
                        const isAbsent = attendance[`${viewDate}_${athlete.id}`] === 'absent';

                        // Get latest note per type
                        const athleteNotes = notes[athlete.id] || [];
                        const latestNotes = {
                            admin: athleteNotes.filter(n => n.type === 'admin').pop(),
                            performance: athleteNotes.filter(n => n.type === 'performance').pop(),
                            interests: athleteNotes.filter(n => n.type === 'interests').pop(),
                        };

                        return (
                            <SortableAthlete
                                key={athlete.id}
                                athlete={athlete}
                                groups={groups}
                                onGroupChange={onGroupChange}
                                isAbsent={isAbsent}
                                onToggleAttendance={onToggleAttendance}
                                latestNotes={latestNotes}
                                onAddNote={onAddNote}
                            />
                        );
                    })}
                </SortableContext>
                {athletes.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-slate-700/50 rounded-lg flex items-center justify-center text-slate-600 text-xs text-center p-4">
                        Drop athletes here
                    </div>
                )}
            </div>
        </div>
    );
};



// Main Board
const GroupBoard = ({ viewDate, setViewDate, filteredAthletes, onToggleAttendance, currentCamp, isLocked, onToggleLock }) => {
    const { currentCampId, assignGroupToAthlete, getAthleteGroup, attendance, groups, addNote, notes, isDateLocked } = useCampStore();
    const campGroups = groups.filter(g => g.campId === currentCampId);

    // Modal State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [defaultNoteType, setDefaultNoteType] = useState('performance');

    // Confirmation Logic
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Check if date is locked
    const executeWithProtection = (callback) => {
        if (isDateLocked(actualViewDate)) {
            setConfirmState({
                isOpen: true,
                title: 'Date is Saved',
                message: `This date (${actualViewDate}) has been saved. Changing group assignments requires confirmation. Are you sure?`,
                onConfirm: callback,
                isDestructive: true,
                confirmText: 'Change Group'
            });
        } else {
            callback();
        }
    };

    // State for Group Filtering
    const [selectedGroupId, setSelectedGroupId] = useState('all');

    const defaultDate = new Date().toISOString().split('T')[0];
    const actualViewDate = viewDate || defaultDate;

    const handleAddNoteClick = (athlete, type = 'performance') => {
        setSelectedAthlete(athlete);
        setDefaultNoteType(type);
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = (type, content) => {
        if (selectedAthlete) {
            const today = new Date().toISOString().split('T')[0];
            addNote(today, selectedAthlete.id, type, content);
        }
    };

    // Add "Unassigned" pseudo-group
    const allColumns = [
        { id: 'unassigned', name: 'Unassigned', color: 'bg-slate-500', campId: currentCampId },
        ...campGroups
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        const athleteId = active.id;
        const overId = over.id;

        let targetGroupId = overId;
        // Check if dropped ON an athlete (reorder/same group) or ON a column
        const overAthlete = filteredAthletes.find(a => a.id === overId);

        if (overAthlete) {
            // Dropped on an athlete, get THAT athlete's group for this date
            targetGroupId = getAthleteGroup(overAthlete.id, actualViewDate);
        }

        const isGroup = allColumns.some(g => g.id === targetGroupId);
        if (!isGroup && !overAthlete) return;

        // Update Assignment for THIS Date (Protected)
        executeWithProtection(() => {
            assignGroupToAthlete(actualViewDate, athleteId, targetGroupId);
        });
    };

    // Filter columns for display
    const visibleColumns = useMemo(() => {
        if (selectedGroupId === 'all') return allColumns;
        return allColumns.filter(c => c.id === selectedGroupId);
    }, [allColumns, selectedGroupId]);

    // Sort sidebar athletes alphabetically
    const sortedSidebarAthletes = [...filteredAthletes].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)] h-auto pb-20 lg:pb-0">
                {/* Drag & Drop Board (Full Width) */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden order-1 lg:order-2">
                        {/* Header with Date Controls */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-3">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700 flex items-center gap-2">
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Date:</span>
                                    <input
                                        type="date"
                                        className="bg-transparent text-white border-none outline-none text-sm"
                                        value={viewDate}
                                        onChange={(e) => setViewDate(e.target.value)}
                                        min={currentCamp?.startDate}
                                        max={currentCamp?.endDate}
                                    />
                                </div>

                                <button
                                    onClick={onToggleLock}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-sm uppercase tracking-wider",
                                        isLocked
                                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20"
                                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                                    )}
                                >
                                    {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                                    {isLocked ? "Saved" : "Save"}
                                </button>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => setSelectedGroupId('all')}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                                    selectedGroupId === 'all'
                                        ? "bg-white text-slate-900 border-white shadow-md"
                                        : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500"
                                )}
                            >
                                All Groups
                            </button>
                            {allColumns.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroupId(group.id)}
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
                                        selectedGroupId === group.id
                                            ? "bg-slate-700 text-white border-slate-500 shadow-md ring-1 ring-white/20"
                                            : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500"
                                    )}
                                >
                                    <div className={`w-2 h-2 rounded-full ${group.color || 'bg-slate-500'}`} />
                                    {group.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:overflow-x-auto lg:pb-4 items-stretch lg:items-start">
                            {visibleColumns.map(group => {
                                // Filter athletes for this column based on DATE-SPECIFIC assignment
                                const groupAthletes = filteredAthletes.filter(a => {
                                    const currentGroupId = getAthleteGroup(a.id, actualViewDate);
                                    return currentGroupId === group.id;
                                });

                                return (
                                    <div key={group.id} className="lg:h-full w-full lg:w-auto">
                                        <GroupColumn
                                            group={group}
                                            athletes={groupAthletes}
                                            groups={campGroups}
                                            onGroupChange={(id, newGroupId) => executeWithProtection(() => assignGroupToAthlete(actualViewDate, id, newGroupId))}
                                            attendance={attendance}
                                            viewDate={actualViewDate}
                                            onToggleAttendance={onToggleAttendance}
                                            notes={notes}
                                            onAddNote={handleAddNoteClick}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DndContext>
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
                defaultType={defaultNoteType}
            />
        </>
    );
};

export default GroupBoard;
