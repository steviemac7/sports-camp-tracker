import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useCampStore } from '../store/CampContext';
import { useParams, Navigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Users, Contact, Plus, Search, ChevronRight, Phone, LayoutGrid, CheckCircle2, XCircle, Lock, Unlock, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import AddAthleteModal from '../components/AddAthleteModal';
import GroupManager from '../components/GroupManager';
import GroupBoard from '../components/GroupBoard';
import AttendanceBoard from '../components/AttendanceBoard';
import CsvImporter from '../components/CsvImporter';

const CampDashboard = () => {
    const { currentCampId, camps, athletes, addAthlete, updateAttendance, bulkUpdateAttendance, attendance, groups, toggleDateLock, isDateLocked, deleteAthlete, setCurrentCampId } = useCampStore();

    // Router Hooks
    const { campId } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Priority: 1. Query Param (?tab=), 2. History State, 3. Default
    const validTabs = ['attendance', 'groups', 'athletes'];
    const rawTab = searchParams.get('tab') || location.state?.activeTab || 'attendance';
    const initialTab = validTabs.includes(rawTab) ? rawTab : 'attendance';

    // Local State
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewDate, setViewDate] = useState(new Date().toLocaleDateString('en-CA'));

    // Confirmation Logic
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Sync URL param to Store
    useEffect(() => {
        if (campId && campId !== currentCampId) {
            setCurrentCampId(campId);
        }
    }, [campId, currentCampId, setCurrentCampId]);

    // Update activeTab when URL param changes
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && validTabs.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // ... (keep middle code) ...

    {/* Tab Content */ }
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-[50vh]">

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
            <AttendanceBoard
                viewDate={viewDate}
                setViewDate={setViewDate}
                currentCamp={currentCamp}
                campId={effectiveCampId}
                isLocked={isLocked}
                onToggleLock={handleToggleLock}
                filteredAthletes={filteredAthletes}
                onToggleAttendance={handleToggleAttendance}
            />
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
            <GroupBoard
                viewDate={viewDate}
                setViewDate={setViewDate}
                currentCamp={currentCamp}
                campId={effectiveCampId}
                isLocked={isLocked}
                onToggleLock={handleToggleLock}
                filteredAthletes={filteredAthletes}
                onToggleAttendance={handleToggleAttendance}
            />
        )}


        {/* ATHLETES TAB (Manage) */}
        {activeTab === 'athletes' && (
            <div className="space-y-6">
                {/* Add/Import Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="glass-panel p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-800/50 border-2 border-dashed border-slate-600 hover:border-blue-400 transition-all cursor-pointer"
                    >
                        <Plus size={32} className="mb-2" />
                        <span className="font-bold">Add Manually</span>
                    </button>
                    <div className="glass-panel">
                        <CsvImporter onImport={handleImport} />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider text-sm px-2">Roster ({campAthletes.length})</h3>
                    {filteredAthletes.map(athlete => {
                        const group = groups.find(g => g.id === athlete.groupId);
                        return (
                            <Link
                                to={`/athlete/${athlete.id}`}
                                state={{ previousTab: 'athletes' }}
                                key={athlete.id}
                                className="glass-panel p-4 flex items-center justify-between group hover:border-blue-400/50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white", group ? group.color : "bg-slate-700")}>
                                        {athlete.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 group-hover:text-white">{athlete.name}</h4>
                                        <div className="flex gap-3 text-xs text-slate-500">
                                            <span>{athlete.nickname}</span>
                                            {athlete.parentPhone && <span className="flex items-center gap-1"><Phone size={10} /> {athlete.parentPhone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {athlete.quickNotes && (
                                        <div className="flex gap-1">
                                            {athlete.quickNotes.admin && <div className="w-2 h-2 rounded-full bg-red-500" title={`Admin: ${athlete.quickNotes.admin}`} />}
                                            {athlete.quickNotes.performance && <div className="w-2 h-2 rounded-full bg-blue-500" title={`Performance: ${athlete.quickNotes.performance}`} />}
                                            {athlete.quickNotes.interests && <div className="w-2 h-2 rounded-full bg-emerald-500" title={`Interests: ${athlete.quickNotes.interests}`} />}
                                        </div>
                                    )}
                                    {group && <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{group.name}</span>}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent navigation
                                            e.stopPropagation();
                                            handleDeleteAthlete(athlete.id, athlete.name);
                                        }}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                        title="Delete Athlete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-slate-600 group-hover:text-blue-400" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
        </div >
    );
};

export default CampDashboard;
