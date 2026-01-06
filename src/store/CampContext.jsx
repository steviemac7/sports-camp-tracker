import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

const CampContext = createContext();

export const useCampStore = () => {
  const context = useContext(CampContext);
  if (!context) {
    throw new Error('useCampStore must be used within a CampProvider');
  }
  return context;
};

export const CampProvider = ({ children }) => {
  // --- REAL-TIME STATE FROM FIRESTORE ---
  const [camps, setCamps] = useState([]);
  const [currentCampId, setCurrentCampId] = useState(() => {
    // Current camp ID "selection" is still local session state for now, 
    // unless we want to sync user preference. Let's keep it local.
    return localStorage.getItem('sct_currentCampId') || null;
  });
  const [athletes, setAthletes] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [notes, setNotes] = useState({});
  const [groups, setGroups] = useState([]);
  const [groupAssignments, setGroupAssignments] = useState({});
  const [savedDates, setSavedDates] = useState([]);

  // --- FIRESTORE LISTENERS ---
  useEffect(() => {
    // 1. Camps
    const unsubscribeCamps = onSnapshot(collection(db, 'camps'), (snapshot) => {
      const campData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCamps(campData);
    }, (error) => console.error("Error fetching camps:", error));

    // 2. Athletes
    const unsubscribeAthletes = onSnapshot(collection(db, 'athletes'), (snapshot) => {
      const athleteData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAthletes(athleteData);
    }, (error) => console.error("Error fetching athletes:", error));

    // 3. Groups
    const unsubscribeGroups = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groupData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupData);
    }, (error) => console.error("Error fetching groups:", error));

    // 4. Attendance (Key-Value)
    const unsubscribeAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const attData = {};
      snapshot.docs.forEach(doc => {
        attData[doc.id] = doc.data().status;
      });
      setAttendance(attData);
    }, (error) => console.error("Error fetching attendance:", error));

    // 5. Group Assignments (Key-Value)
    const unsubscribeAssignments = onSnapshot(collection(db, 'group_assignments'), (snapshot) => {
      const assignData = {};
      snapshot.docs.forEach(doc => {
        assignData[doc.id] = doc.data().groupId;
      });
      setGroupAssignments(assignData);
    }, (error) => console.error("Error fetching group assignments:", error));

    // 6. Saved Dates (Array stored as individual docs or a single metadata doc? 
    // Let's store individual date docs in a 'saved_dates' collection for easy real-time updates)
    const unsubscribeSavedDates = onSnapshot(collection(db, 'saved_dates'), (snapshot) => {
      const dates = snapshot.docs.map(doc => doc.id);
      setSavedDates(dates);
    }, (error) => console.error("Error fetching saved dates:", error));

    // 7. Notes - Need to restructure slightly. 
    // Local state structure: { athleteId: [note1, note2] }
    // Firestore structure: Collection 'notes'.
    // We will transform on receive.
    const unsubscribeNotes = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const notesMap = {};
      snapshot.docs.forEach(doc => {
        const noteData = { id: doc.id, ...doc.data() };
        if (!notesMap[noteData.athleteId]) {
          notesMap[noteData.athleteId] = [];
        }
        notesMap[noteData.athleteId].push(noteData);
      });
      setNotes(notesMap);
    }, (error) => console.error("Error fetching notes:", error));

    return () => {
      unsubscribeCamps();
      unsubscribeAthletes();
      unsubscribeGroups();
      unsubscribeAttendance();
      unsubscribeAssignments();
      unsubscribeSavedDates();
      unsubscribeNotes();
    };
  }, []);

  // --- LOCAL PERSISTENCE FOR SELECTION ---
  useEffect(() => {
    if (currentCampId) localStorage.setItem('sct_currentCampId', currentCampId);
    else localStorage.removeItem('sct_currentCampId');
  }, [currentCampId]);


  // --- FIRESTORE ACTIONS ---

  const selectCamp = (campId) => {
    setCurrentCampId(campId);
  };

  const addCamp = async (name) => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const newCampId = uuidv4();
    const newCamp = {
      name,
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'camps', newCampId), newCamp);

      // Add default groups
      const batch = writeBatch(db);
      const groupData = [
        { id: uuidv4(), campId: newCampId, name: 'Red Team', color: 'bg-red-500', icon: 'Shield' },
        { id: uuidv4(), campId: newCampId, name: 'Blue Team', color: 'bg-blue-500', icon: 'Flag' },
        { id: uuidv4(), campId: newCampId, name: 'Green Team', color: 'bg-green-500', icon: 'Trees' }
      ];
      groupData.forEach(g => {
        const { id, ...data } = g;
        batch.set(doc(db, 'groups', id), data);
      });
      await batch.commit();

      return newCampId;
    } catch (e) {
      console.error("Error adding camp:", e);
    }
  };

  const updateCamp = async (campId, updates) => {
    try {
      await updateDoc(doc(db, 'camps', campId), updates);
    } catch (e) {
      console.error("Error updating camp:", e);
    }
  };

  const deleteCamp = async (campId) => {
    try {
      const batch = writeBatch(db);

      // 1. Delete Camp Document
      batch.delete(doc(db, 'camps', campId));

      // 2. Delete Associated Groups
      // (We can assume the 'groups' state is up to date for this client)
      const campGroups = groups.filter(g => g.campId === campId);
      campGroups.forEach(g => {
        batch.delete(doc(db, 'groups', g.id));
      });

      // 3. Delete Associated Athletes
      const campAthletes = athletes.filter(a => a.campId === campId);
      campAthletes.forEach(a => {
        batch.delete(doc(db, 'athletes', a.id));

        // Try to clean up attendance/notes for these athletes if possible
        // This relies on the 'attendance' and 'notes' keys being predictable or loaded
        // Given the scale, we might just let them be orphaned or clean up what we can see locally
      });

      // Commit the batch
      await batch.commit();

      // If the deleted camp was selected, clear selection
      if (currentCampId === campId) {
        setCurrentCampId(null);
        localStorage.removeItem('sct_currentCampId');
      }

    } catch (e) {
      console.error("Error deleting camp:", e);
      throw e; // Propagate error to UI
    }
  };

  const addAthlete = async (athleteData, campId) => {
    const newAthleteId = uuidv4();
    const newAthlete = { ...athleteData, campId, groupId: 'unassigned' };
    try {
      await setDoc(doc(db, 'athletes', newAthleteId), newAthlete);
    } catch (e) {
      console.error("Error adding athlete:", e);
    }
  };

  const updateAthlete = async (athleteId, updates) => {
    try {
      await updateDoc(doc(db, 'athletes', athleteId), updates);
    } catch (e) {
      console.error("Error updating athlete:", e);
    }
  };

  const deleteAthlete = async (athleteId) => {
    try {
      // 1. Delete Athlete Profile
      await deleteDoc(doc(db, 'athletes', athleteId));

      // 2. Delete related data (This is harder in 'client-side' logic without Cloud Functions, 
      // but we can try to clean up known keys if we have them in memory, or leave them orphaned.)
      // For now, we unfortunately may leave orphans unless we query them. 
      // A proper implementation would use a Batch or Cloud Function.
      // Let's at least delete local Attendance references that we know of?
      // Actually, reading 'attendance' map locally allows us to find keys to delete.

      const batch = writeBatch(db);

      // Cleanup Attendance
      Object.keys(attendance).forEach(key => {
        if (key.endsWith(`_${athleteId}`)) {
          batch.delete(doc(db, 'attendance', key));
        }
      });

      // Cleanup Group Assignments
      Object.keys(groupAssignments).forEach(key => {
        if (key.endsWith(`_${athleteId}`)) {
          batch.delete(doc(db, 'group_assignments', key));
        }
      });

      // Cleanup Notes (Local state 'notes' is keyed by athleteId)
      const athleteNotes = notes[athleteId] || [];
      athleteNotes.forEach(note => {
        batch.delete(doc(db, 'notes', note.id));
      });

      await batch.commit();

    } catch (e) {
      console.error("Error deleting athlete:", e);
    }
  };

  const updateAttendance = async (date, athleteId, status) => {
    const key = `${date}_${athleteId}`;
    try {
      await setDoc(doc(db, 'attendance', key), { status });
    } catch (e) {
      console.error("Error updating attendance:", e);
    }
  };

  const bulkUpdateAttendance = async (date, athleteIds, status) => {
    const batch = writeBatch(db);
    athleteIds.forEach(id => {
      const key = `${date}_${id}`;
      batch.set(doc(db, 'attendance', key), { status });
    });
    try {
      await batch.commit();
    } catch (e) {
      console.error("Error bulk updating attendance:", e);
    }
  };

  const addNote = async (date, athleteId, type, content) => {
    const id = uuidv4();
    const newNote = { date, athleteId, type, content, timestamp: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'notes', id), newNote);
    } catch (e) {
      console.error("Error adding note:", e);
    }
  };

  const updateAthleteGroup = async (athleteId, groupId) => {
    try {
      await updateDoc(doc(db, 'athletes', athleteId), { groupId });
    } catch (e) {
      console.error("Error updating athlete group:", e);
    }
  };

  const assignGroupToAthlete = async (date, athleteId, groupId) => {
    const key = `${date}_${athleteId}`;
    try {
      await setDoc(doc(db, 'group_assignments', key), { groupId });
    } catch (e) {
      console.error("Error assigning group override:", e);
    }
  };

  const getAthleteGroup = (athleteId, date) => {
    const key = `${date}_${athleteId}`;
    if (groupAssignments[key]) return groupAssignments[key];
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete?.groupId || 'unassigned';
  };

  const addGroup = async (campId, name, color, icon = 'Circle') => {
    const newGroupId = uuidv4();
    try {
      await setDoc(doc(db, 'groups', newGroupId), { campId, name, color, icon });
    } catch (e) {
      console.error("Error adding group:", e);
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      await updateDoc(doc(db, 'groups', groupId), updates);
    } catch (e) {
      console.error("Error updating group:", e);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      // 1. Delete Group
      await deleteDoc(doc(db, 'groups', groupId));

      // 2. Reset athletes in this group to 'unassigned'
      const batch = writeBatch(db);
      athletes.filter(a => a.groupId === groupId).forEach(a => {
        batch.update(doc(db, 'athletes', a.id), { groupId: 'unassigned' });
      });
      await batch.commit();

    } catch (e) {
      console.error("Error deleting group:", e);
    }
  };

  const toggleDateLock = async (date) => {
    try {
      if (savedDates.includes(date)) {
        await deleteDoc(doc(db, 'saved_dates', date));
      } else {
        await setDoc(doc(db, 'saved_dates', date), { locked: true });
      }
    } catch (e) {
      console.error("Error toggling date lock:", e);
    }
  };

  const isDateLocked = (date) => savedDates.includes(date);

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
    updateCamp,
    deleteCamp
  };

  return (
    <CampContext.Provider value={value}>
      {children}
    </CampContext.Provider>
  );
};
