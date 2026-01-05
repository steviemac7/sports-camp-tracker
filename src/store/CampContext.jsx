import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CampContext = createContext();

export const useCampStore = () => {
  const context = useContext(CampContext);
  if (!context) {
    throw new Error('useCampStore must be used within a CampProvider');
  }
  return context;
};

export const CampProvider = ({ children }) => {
  // State
  const [camps, setCamps] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_camps');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sct_camps:', e);
      return [];
    }
  });

  const [currentCampId, setCurrentCampId] = useState(() => {
    return localStorage.getItem('sct_currentCampId') || null;
  });

  const [athletes, setAthletes] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_athletes');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sct_athletes:', e);
      return [];
    }
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_attendance');
      const parsed = saved ? JSON.parse(saved) : {};
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      console.error('Failed to parse sct_attendance:', e);
      return {};
    }
  });

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_notes');
      const parsed = saved ? JSON.parse(saved) : {};
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      console.error('Failed to parse sct_notes:', e);
      return {};
    }
  });

  const [groupAssignments, setGroupAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_group_assignments');
      const parsed = saved ? JSON.parse(saved) : {};
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) {
      console.error('Failed to parse sct_group_assignments:', e);
      return {};
    }
  });

  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_groups');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sct_groups:', e);
      return [];
    }
  });



  const [savedDates, setSavedDates] = useState(() => {
    try {
      const saved = localStorage.getItem('sct_saved_dates');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sct_saved_dates:', e);
      return [];
    }
  });

  // Persistence Effects
  // Persistence Effects
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    try {
      localStorage.setItem('sct_camps', JSON.stringify(camps));
      localStorage.setItem('sct_athletes', JSON.stringify(athletes));
      localStorage.setItem('sct_attendance', JSON.stringify(attendance));
      localStorage.setItem('sct_notes', JSON.stringify(notes));
      localStorage.setItem('sct_groups', JSON.stringify(groups));
      localStorage.setItem('sct_group_assignments', JSON.stringify(groupAssignments));
      localStorage.setItem('sct_saved_dates', JSON.stringify(savedDates));

      if (currentCampId) localStorage.setItem('sct_currentCampId', currentCampId);
      else localStorage.removeItem('sct_currentCampId');

    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [camps, athletes, attendance, notes, groups, groupAssignments, savedDates, currentCampId]);

  // Actions
  const toggleDateLock = (date) => {
    setSavedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const isDateLocked = (date) => savedDates.includes(date);

  const addCamp = (name) => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const newCamp = {
      id: uuidv4(),
      name,
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setCamps([...camps, newCamp]);
    // Add default groups for the new camp
    const defaultGroups = [
      { id: uuidv4(), campId: newCamp.id, name: 'Red Team', color: 'bg-red-500' },
      { id: uuidv4(), campId: newCamp.id, name: 'Blue Team', color: 'bg-blue-500' },
      { id: uuidv4(), campId: newCamp.id, name: 'Green Team', color: 'bg-green-500' }
    ];
    setGroups(prev => [...prev, ...defaultGroups]);
    return newCamp.id;
  };

  const updateCamp = (campId, updates) => {
    setCamps(prev => prev.map(c => c.id === campId ? { ...c, ...updates } : c));
  };

  const selectCamp = (campId) => {
    setCurrentCampId(campId);
  };

  const addAthlete = (athleteData, campId) => {
    const newAthlete = { ...athleteData, id: uuidv4(), campId, groupId: 'unassigned' };
    setAthletes(prev => [...prev, newAthlete]);
  };

  const updateAttendance = (date, athleteId, status) => {
    const key = `${date}_${athleteId}`;
    setAttendance(prev => ({ ...prev, [key]: status }));
  };

  const bulkUpdateAttendance = (date, athleteIds, status) => {
    setAttendance(prev => {
      const newAttendance = { ...prev };
      athleteIds.forEach(id => {
        newAttendance[`${date}_${id}`] = status;
      });
      return newAttendance;
    });
  };

  const addNote = (date, athleteId, type, content) => {
    // type: 'admin' | 'performance'
    const id = uuidv4();
    const newNote = { id, date, athleteId, type, content, timestamp: new Date().toISOString() };
    setNotes(prev => {
      const athleteNotes = prev[athleteId] || [];
      return { ...prev, [athleteId]: [...athleteNotes, newNote] };
    });
  };

  const updateAthleteGroup = (athleteId, groupId) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, groupId } : a));
  };

  // Date-Specific Group Assignment
  const assignGroupToAthlete = (date, athleteId, groupId) => {
    const key = `${date}_${athleteId}`;
    setGroupAssignments(prev => ({ ...prev, [key]: groupId }));
    // Also update the 'default' group for fallback consistency if this is the "latest" change? 
    // For now, let's keep the default update too so it feels persistent across days if you don't have overrides
    // Actually, the user wants "saved for each date". So if I change it on Jan 5, Jan 4 should remain.
    // We will NOT update the default athlete.groupId here to preserve history.
  };

  const getAthleteGroup = (athleteId, date) => {
    const key = `${date}_${athleteId}`;
    if (groupAssignments[key]) return groupAssignments[key];
    // Fallback to default group if no specific assignment for this date
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.groupId || 'unassigned';
  };

  const updateAthlete = (athleteId, updates) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, ...updates } : a));
  };

  // Group Actions
  const addGroup = (campId, name, color) => {
    const newGroup = { id: uuidv4(), campId, name, color };
    setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = (groupId, updates) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const deleteGroup = (groupId) => {
    // Move athletes in this group to unassigned (default)
    setAthletes(prev => prev.map(a => a.groupId === groupId ? { ...a, groupId: 'unassigned' } : a));
    // Also clear assignments? Or keep them as history records? 
    // Let's keep simpler clean up for now.
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const deleteAthlete = (athleteId) => {
    // Remove from athletes list
    setAthletes(prev => prev.filter(a => a.id !== athleteId));

    // Remove from attendance
    setAttendance(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.endsWith(`_${athleteId}`)) delete next[key];
      });
      return next;
    });

    // Remove from group assignments
    setGroupAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.endsWith(`_${athleteId}`)) delete next[key];
      });
      return next;
    });

    // Remove notes
    setNotes(prev => {
      const next = { ...prev };
      delete next[athleteId];
      return next;
    });
  };

  const value = {
    camps,
    currentCampId,
    athletes,
    attendance,
    notes,
    groups,
    groupAssignments,
    addCamp,
    selectCamp,
    addAthlete,
    updateAttendance,
    bulkUpdateAttendance,
    addNote,
    updateAthleteGroup,
    assignGroupToAthlete,
    getAthleteGroup,
    savedDates,
    toggleDateLock,
    isDateLocked,
    updateAthlete,
    addGroup,
    updateGroup,
    deleteGroup,
    deleteAthlete,
    updateCamp
  };

  return (
    <CampContext.Provider value={value}>
      {children}
    </CampContext.Provider>
  );
};
