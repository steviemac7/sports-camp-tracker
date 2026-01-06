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
    const [selectedGroupId, setSelectedGroupId] = useState('all');

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

    // Check if date is locked.
    const executeWithProtection = (actionName, callback) => {
        if (isDateLocked(viewDate)) {
            setConfirmState({
                isOpen: true,
                title: 'Date is Saved',
                message: `This date (${viewDate}) has been saved. Making changes to attendance or groups requires confirmation. Are you sure you want to proceed?`,
                onConfirm: callback,
                isDestructive: true,
                confirmText: 'Modify Anyway'
            });
        } else {
            callback();
        }
    };

    // Use campId from URL for initial lookup to avoid premature redirect
    const effectiveCampId = campId || currentCampId;
    const currentCamp = camps.find(c => c.id === effectiveCampId);

    if (!effectiveCampId || !currentCamp) {
        if (!effectiveCampId) return <Navigate to="/" replace />;
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Loading Camp...</div>;
    }

    // Filter athletes for this camp
    const campAthletes = athletes.filter(a => a.campId === effectiveCampId);

    // Search filter
    const filteredAthletes = campAthletes.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.nickname && a.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleImport = (importedAthletes) => {
        importedAthletes.forEach(athlete => addAthlete(athlete, effectiveCampId));
    };

    const handleToggleAttendance = (athleteId) => {
        const action = () => {
            const key = `${viewDate}_${athleteId}`;
            const currentStatus = attendance[key] || 'present'; // Default to present
            const newStatus = currentStatus === 'present' ? 'absent' : 'present';
            updateAttendance(viewDate, athleteId, newStatus);
        };
        executeWithProtection('Toggle Attendance', action);
    };

    const handleMarkAll = (status) => {
        const action = () => {
            const ids = filteredAthletes.map(a => a.id);
            bulkUpdateAttendance(viewDate, ids, status);
        };
        executeWithProtection('Bulk Update', action);
    };

    const handleDeleteAthlete = (athleteId, athleteName) => {
        // Step 1: Initial Warning
        setConfirmState({
            isOpen: true,
            title: 'Delete Athlete?',
            message: `Are you sure you want to delete ${athleteName}? This will remove them from all camp records.`,
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: () => {
                // Step 2: Final Warning (Chained)
                setTimeout(() => {
                    setConfirmState({
                        isOpen: true,
                        title: 'FINAL WARNING',
                        message: `This action is PERMANENT. ${athleteName} and all their attendance history will be lost forever. Are you absolutely sure?`,
                        confirmText: 'YES, DELETE PERMANENTLY',
                        isDestructive: true,
                        onConfirm: () => deleteAthlete(athleteId)
                    });
                }, 200);
            }
        });
    };

    const tabs = [
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'groups', label: 'Groups', icon: Users },
        { id: 'athletes', label: 'Athletes', icon: Contact },
    ];

    const isLocked = isDateLocked(viewDate);

    const handleToggleLock = () => {
        if (isLocked) {
            setConfirmState({
                isOpen: true,
                title: 'Unlock Date?',
                message: `Unlocking this date will revert it to an unsaved state. You will need to click 'Save' again to lock any subsequent changes. Are you sure?`,
                confirmText: 'Unlock',
                isDestructive: false,
                onConfirm: () => toggleDateLock(viewDate)
            });
        } else {
            toggleDateLock(viewDate);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-2 lg:px-8">
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                isDestructive={confirmState.isDestructive}
                confirmText={confirmState.confirmText}
            />

            <AddAthleteModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={(data) => addAthlete(data, currentCampId)}
            />

            {isGroupManagerOpen && <GroupManager onClose={() => setIsGroupManagerOpen(false)} />}

            {/* Header Controls - Static to prevent overlap */}
            <div className="space-y-4 pb-6 pt-2 mb-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 glass-panel p-1 flex items-center shadow-lg">
                        <Search className="text-slate-500 ml-3" size={20} />
                        <input
                            type="text"
                            placeholder="Search athletes..."
                            className="bg-transparent border-none text-white p-3 focus:outline-none w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-inner">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                isActive
                                    ? "bg-slate-700 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                            )}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

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
                    selectedGroupId={selectedGroupId}
                    setSelectedGroupId={setSelectedGroupId}
                    onManageGroups={() => setIsGroupManagerOpen(true)}
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
