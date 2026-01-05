import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Phone, StickyNote, Activity, User, Heart, ShieldAlert, Award, Grid, Pencil, Check, X, Clock, Plus, Mail, Calendar, Shirt } from 'lucide-react';
import { useCampStore } from '../store/CampContext';
import { get, set } from 'idb-keyval';
import clsx from 'clsx';
import NoteModal from '../components/NoteModal';

const AthleteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { athletes, groups, currentCampId, updateAthlete, notes, addNote, isDateLocked, camps, attendance: globalAttendance } = useCampStore();
    const [photoUrl, setPhotoUrl] = useState(null);

    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const athlete = athletes.find(a => a.id === id);

    // Local state for editable fields
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState({
        name: '',
        nickname: '',
        parentName: '',
        parentPhone: '',
        contactEmail: '',
        birthDate: '',
        shirtSize: '',
        medicalNotes: '',
        allergies: ''
    });

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    useEffect(() => {
        if (athlete) {
            setDetails({
                name: athlete.name || '',
                nickname: athlete.nickname || '',
                parentName: athlete.parentName || '',
                parentPhone: athlete.parentPhone || '',
                contactEmail: athlete.contactEmail || '',
                birthDate: athlete.birthDate || '',
                shirtSize: athlete.shirtSize || '',
                medicalNotes: athlete.medicalNotes || '',
                allergies: athlete.allergies || ''
            });
        }
    }, [athlete]);

    useEffect(() => {
        if (id) {
            get(`photo_${id}`)
                .then(url => {
                    if (url) setPhotoUrl(url);
                })
                .catch(err => console.error('Error loading photo:', err));
        }
    }, [id]);

    if (!athlete) {
        return <div className="p-8 text-center text-slate-400">Athlete not found</div>;
    }

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setPhotoUrl(base64);
                set(`photo_${id}`, base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDetailChange = (field, value) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const saveDetails = () => {
        updateAthlete(id, details);
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setDetails({
            name: athlete.name || '',
            nickname: athlete.nickname || '',
            parentName: athlete.parentName || '',
            parentPhone: athlete.parentPhone || '',
            contactEmail: athlete.contactEmail || '',
            birthDate: athlete.birthDate || '',
            shirtSize: athlete.shirtSize || '',
            medicalNotes: athlete.medicalNotes || '',
            allergies: athlete.allergies || ''
        });
        setIsEditing(false);
    };

    // Note Modal
    const handleSaveNote = (type, content) => {
        const today = new Date().toISOString().split('T')[0];
        addNote(today, id, type, content);
    };

    // Get Group Info for Read-Only Display
    const groupId = athlete.groupId || 'unassigned';
    const group = groups.find(g => g.id === groupId);

    const athleteNotes = notes[id] || [];

    // Generate dates for attendance history
    // Memoize this if performance becomes an issue, but for now it's fine
    const generateDates = () => {
        if (!currentCampId) return [];
        const currentCamp = camps.find(c => c.id === currentCampId);
        const today = new Date();
        const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const startDate = currentCamp?.startDate || defaultStart;
        const endDate = currentCamp?.endDate || defaultEnd;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateArray = [];
        let curr = new Date(start);

        // Safety limit
        let safety = 0;
        while (curr <= end && safety < 365) {
            dateArray.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
            safety++;
        }
        return dateArray;
    };

    const historyDates = generateDates();

    const handleBack = () => {
        const previousTab = location.state?.previousTab || 'attendance';
        navigate(`/camp/${currentCampId}?tab=${previousTab}`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-slate-100">
            {/* Header */}
            <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row items-center gap-6 relative">
                {/* Back Button */}
                <button onClick={handleBack} className="absolute top-4 left-4 p-2 bg-slate-700/50 text-slate-400 rounded-full hover:bg-slate-700 hover:text-blue-400 transition-colors" title="Back to Camp">
                    <ChevronLeft size={24} />
                </button>

                {/* Edit Actions - Top Right */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={saveDetails} className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors" title="Save Changes">
                                <Check size={20} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors" title="Cancel">
                                <X size={20} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="p-2 bg-slate-700/50 text-slate-400 rounded-full hover:bg-slate-700 hover:text-blue-400 transition-colors" title="Edit Profile">
                            <Pencil size={18} />
                        </button>
                    )}
                </div>

                <div className="relative group">
                    <div className={clsx("w-32 h-32 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border-4 border-slate-600", !photoUrl && "animate-pulse")}>
                        {photoUrl ? (
                            <img src={photoUrl} alt={athlete.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-slate-500" />
                        )}
                    </div>
                    <label className={clsx("absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-400 cursor-pointer shadow-lg transition-transform hover:scale-110", !isEditing && "hidden")}>
                        <Camera size={20} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                </div>

                <div className="text-center md:text-left flex-1 w-full space-y-3">

                    {/* Name & Nickname */}
                    <div>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={details.name}
                                    onChange={(e) => handleDetailChange('name', e.target.value)}
                                    className="bg-slate-800/50 border-b border-blue-500/50 text-3xl font-bold text-white text-center md:text-left w-full outline-none p-1 rounded-t"
                                    placeholder="Athlete Name"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    value={details.nickname}
                                    onChange={(e) => handleDetailChange('nickname', e.target.value)}
                                    className="bg-slate-800/50 border-b border-blue-500/50 text-xl text-blue-400 text-center md:text-left w-full outline-none p-1 mt-1 rounded-t placeholder-blue-900/50"
                                    placeholder="Nickname"
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-white mb-1">{athlete.name}</h2>
                                {athlete.nickname && <p className="text-xl text-blue-400 mb-2">"{athlete.nickname}"</p>}
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-2">
                        {/* Parent Name */}
                        <div className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                            <span className="font-semibold text-slate-300 w-16 text-right md:text-left">Parent:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={details.parentName}
                                    onChange={(e) => handleDetailChange('parentName', e.target.value)}
                                    className="bg-slate-800/50 border-b border-slate-500 text-slate-300 outline-none flex-1 min-w-[200px] px-2 py-0.5 rounded-t"
                                    placeholder="Parent Name"
                                />
                            ) : (
                                <span>{athlete.parentName || <span className="text-slate-600 italic">Not set</span>}</span>
                            )}
                        </div>

                        {/* Parent Phone */}
                        <div className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                            <span className="font-semibold text-slate-300 w-16 text-right md:text-left">Phone:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={details.parentPhone}
                                    onChange={(e) => handleDetailChange('parentPhone', e.target.value)}
                                    className="bg-slate-800/50 border-b border-slate-500 text-slate-300 outline-none flex-1 min-w-[200px] px-2 py-0.5 rounded-t"
                                    placeholder="Parent Phone"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    {athlete.parentPhone ? (
                                        <>
                                            <Phone size={16} className="text-slate-500" />
                                            <a href={`tel:${athlete.parentPhone}`} className="hover:text-blue-400 transition-colors">{athlete.parentPhone}</a>
                                        </>
                                    ) : (
                                        <span className="text-slate-600 italic">Not set</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Extended Info: Email, DOB, Shirt */}
                        <div className="grid grid-cols-1 gap-2 mt-2 pt-2 border-t border-slate-700/50">
                            {/* Email */}
                            <div className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                <span className="font-semibold text-slate-300 w-16 text-right md:text-left">Email:</span>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={details.contactEmail}
                                        onChange={(e) => handleDetailChange('contactEmail', e.target.value)}
                                        className="bg-slate-800/50 border-b border-slate-500 text-slate-300 outline-none flex-1 min-w-[200px] px-2 py-0.5 rounded-t"
                                        placeholder="Contact Email"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {athlete.contactEmail ? (
                                            <>
                                                <Mail size={16} className="text-slate-500" />
                                                <a href={`mailto:${athlete.contactEmail}`} className="hover:text-blue-400 transition-colors">{athlete.contactEmail}</a>
                                            </>
                                        ) : (
                                            <span className="text-slate-600 italic">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* DOB & Age */}
                            <div className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                <span className="font-semibold text-slate-300 w-16 text-right md:text-left">DOB:</span>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={details.birthDate}
                                        onChange={(e) => handleDetailChange('birthDate', e.target.value)}
                                        className="bg-slate-800/50 border-b border-slate-500 text-slate-300 outline-none flex-1 min-w-[200px] px-2 py-0.5 rounded-t"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {athlete.birthDate ? (
                                            <>
                                                <Calendar size={16} className="text-slate-500" />
                                                <span>{new Date(athlete.birthDate).toLocaleDateString()}</span>
                                                <span className="text-blue-400 font-bold ml-1">({calculateAge(athlete.birthDate)} yrs)</span>
                                            </>
                                        ) : (
                                            <span className="text-slate-600 italic">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Shirt Size */}
                            <div className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                <span className="font-semibold text-slate-300 w-16 text-right md:text-left">Shirt:</span>
                                {isEditing ? (
                                    <select
                                        value={details.shirtSize}
                                        onChange={(e) => handleDetailChange('shirtSize', e.target.value)}
                                        className="bg-slate-800/50 border-b border-slate-500 text-slate-300 outline-none flex-1 min-w-[200px] px-2 py-0.5 rounded-t"
                                    >
                                        <option value="">Select Size</option>
                                        <option value="YS">YS</option>
                                        <option value="YM">YM</option>
                                        <option value="YL">YL</option>
                                        <option value="YXL">YXL</option>
                                        <option value="AS">AS</option>
                                        <option value="AM">AM</option>
                                        <option value="AL">AL</option>
                                        <option value="AXL">AXL</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {athlete.shirtSize ? (
                                            <>
                                                <Shirt size={16} className="text-slate-500" />
                                                <span className="font-mono bg-slate-700 px-1.5 rounded text-xs text-slate-300 border border-slate-600">
                                                    {athlete.shirtSize}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-slate-600 italic">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Medical & Allergies Section */}
                        {(athlete.medicalNotes || athlete.allergies || isEditing) && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Medical Notes */}
                                <div className="text-slate-400">
                                    <span className="font-semibold text-amber-500/80 block text-xs uppercase tracking-wide mb-1">Medical Notes</span>
                                    {isEditing ? (
                                        <textarea
                                            value={details.medicalNotes}
                                            onChange={(e) => handleDetailChange('medicalNotes', e.target.value)}
                                            className="bg-slate-800/50 border border-slate-600/50 text-slate-300 outline-none w-full p-2 rounded text-sm min-h-[60px]"
                                            placeholder="Enter notes..."
                                        />
                                    ) : (
                                        <div className={clsx("text-sm", athlete.medicalNotes ? "text-amber-200" : "text-slate-600 italic")}>
                                            {athlete.medicalNotes || "None"}
                                        </div>
                                    )}
                                </div>

                                {/* Allergies */}
                                <div className="text-slate-400">
                                    <span className="font-semibold text-amber-500/80 block text-xs uppercase tracking-wide mb-1">Allergies</span>
                                    {isEditing ? (
                                        <textarea
                                            value={details.allergies}
                                            onChange={(e) => handleDetailChange('allergies', e.target.value)}
                                            className="bg-slate-800/50 border border-slate-600/50 text-slate-300 outline-none w-full p-2 rounded text-sm min-h-[60px]"
                                            placeholder="Enter allergies..."
                                        />
                                    ) : (
                                        <div className={clsx("text-sm", athlete.allergies ? "text-red-300 font-medium" : "text-slate-600 italic")}>
                                            {athlete.allergies || "None"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Read-Only Group Display */}
                        <div className="mt-2 flex items-center justify-center md:justify-start gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/50">
                                <Grid size={16} className="text-slate-400" />
                                <span className="text-slate-400 text-sm font-semibold">Group:</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${group ? group.color : 'bg-slate-500'}`} />
                                    <span className="text-white font-medium">{group ? group.name : 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Attendance History Section */}
            {
                currentCampId && (
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 px-1">Attendance Record</h3>
                        <div className="glass-panel p-4 overflow-x-auto">
                            {!athlete ? (
                                <div className="text-slate-500 italic">Athlete not found</div>
                            ) : (
                                <div className="flex gap-2 min-w-full pb-2">
                                    {historyDates.map(date => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const status = globalAttendance[`${dateStr}_${athlete.id}`];
                                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                                        let statusColor = 'bg-slate-800 border-slate-700 text-slate-600'; // Default/None
                                        let icon = <div className="w-2 h-2 rounded-full bg-slate-600" />;

                                        let isPresent = status === 'present';
                                        let isAbsent = status === 'absent';

                                        if (!status && isDateLocked(dateStr)) {
                                            isPresent = true;
                                        }

                                        if (isPresent) {
                                            statusColor = 'bg-green-500/10 border-green-500/50 text-green-400';
                                            icon = <Check size={12} />;
                                        } else if (isAbsent) {
                                            statusColor = 'bg-red-500/10 border-red-500/50 text-red-400';
                                            icon = <X size={12} />;
                                        }

                                        const displayDate = new Date(dateStr + 'T00:00:00Z');

                                        return (
                                            <div key={dateStr} className={clsx("flex flex-col items-center gap-1 p-2 rounded-lg border min-w-[70px]", statusColor, isToday && "ring-2 ring-blue-500")}>
                                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 leading-none">
                                                    {displayDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 leading-none">
                                                    {displayDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                                                </div>
                                                <div className="text-xl font-bold leading-tight">
                                                    {displayDate.getUTCDate()}
                                                </div>
                                                <div className="mt-1">
                                                    {icon}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Note History Section */}
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-bold text-white">Notes History</h3>
                <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add Note
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Admin Notes Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-400 font-bold border-b border-red-500/30 pb-2">
                        <ShieldAlert size={18} />
                        <h4>Admin Notes</h4>
                    </div>
                    <div className="space-y-3">
                        {athleteNotes.filter(n => n.type === 'admin').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(note => (
                            <div key={note.id} className="glass-panel p-3 border-l-2 border-red-500/50 bg-red-500/5">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mb-1">
                                    <Clock size={10} />
                                    {new Date(note.timestamp).toLocaleString(undefined, {
                                        month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit'
                                    })}
                                </div>
                                <p className="text-slate-300 text-sm leading-snug whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))}
                        {athleteNotes.filter(n => n.type === 'admin').length === 0 && (
                            <div className="text-slate-600 text-xs italic p-2">No admin notes</div>
                        )}
                    </div>
                </div>

                {/* Performance Notes Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-blue-500/30 pb-2">
                        <Award size={18} />
                        <h4>Performance Notes</h4>
                    </div>
                    <div className="space-y-3">
                        {athleteNotes.filter(n => n.type === 'performance').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(note => (
                            <div key={note.id} className="glass-panel p-3 border-l-2 border-blue-500/50 bg-blue-500/5">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mb-1">
                                    <Clock size={10} />
                                    {new Date(note.timestamp).toLocaleString(undefined, {
                                        month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit'
                                    })}
                                </div>
                                <p className="text-slate-300 text-sm leading-snug whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))}
                        {athleteNotes.filter(n => n.type === 'performance').length === 0 && (
                            <div className="text-slate-600 text-xs italic p-2">No performance notes</div>
                        )}
                    </div>
                </div>

                {/* Interests Notes Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/30 pb-2">
                        <Heart size={18} />
                        <h4>Interests Notes</h4>
                    </div>
                    <div className="space-y-3">
                        {athleteNotes.filter(n => n.type === 'interests').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(note => (
                            <div key={note.id} className="glass-panel p-3 border-l-2 border-emerald-500/50 bg-emerald-500/5">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mb-1">
                                    <Clock size={10} />
                                    {new Date(note.timestamp).toLocaleString(undefined, {
                                        month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit'
                                    })}
                                </div>
                                <p className="text-slate-300 text-sm leading-snug whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))}
                        {athleteNotes.filter(n => n.type === 'interests').length === 0 && (
                            <div className="text-slate-600 text-xs italic p-2">No interests notes</div>
                        )}
                    </div>
                </div>
            </div>

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                athleteName={athlete.name}
            />
        </div >
    );
};

export default AthleteDetail;
