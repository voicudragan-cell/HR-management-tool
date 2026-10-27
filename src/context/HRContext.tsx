import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { db, auth, signInWithPopup, signOut, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Employee,
  OnboardingTask,
  LeaveRequest,
  PerformanceReview,
  PayrollRecord,
  MobilityRecord,
  InternalJobOpening,
  AppNotification,
  UserRole
} from '../types/hr';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ONBOARDING_TASKS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PERFORMANCE_REVIEWS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_MOBILITY_RECORDS,
  INITIAL_JOB_OPENINGS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';

interface HRContextType {
  // State
  firebaseUser: FirebaseUser | null;
  activeProfile: Employee;
  allProfiles: Employee[];
  employees: Employee[];
  onboardingTasks: OnboardingTask[];
  leaveRequests: LeaveRequest[];
  performanceReviews: PerformanceReview[];
  payrollRecords: PayrollRecord[];
  mobilityRecords: MobilityRecord[];
  jobOpenings: InternalJobOpening[];
  notifications: AppNotification[];
  isLoading: boolean;
  isOnline: boolean;
  activeRole: UserRole;

  // Role / Profile controls
  setActiveProfileId: (id: string) => void;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;

  // Operations
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<string>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addOnboardingTask: (task: Omit<OnboardingTask, 'id'>) => Promise<void>;
  updateOnboardingTaskStatus: (id: string, status: OnboardingTask['status']) => Promise<void>;
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  reviewLeaveRequest: (id: string, status: 'approved' | 'rejected', comments?: string) => Promise<void>;
  submitPerformanceReview: (review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
  finalizePerformanceReview: (id: string) => Promise<void>;
  updatePayrollStatus: (id: string, status: PayrollRecord['status']) => Promise<void>;
  disburseAllPendingPayroll: (period: string) => Promise<void>;
  nominatePromotion: (data: Omit<MobilityRecord, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  reviewPromotion: (id: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
  addJobOpening: (job: Omit<InternalJobOpening, 'id' | 'postedDate'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  triggerAutomatedAlerts: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(INITIAL_ONBOARDING_TASKS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(INITIAL_PERFORMANCE_REVIEWS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [mobilityRecords, setMobilityRecords] = useState<MobilityRecord[]>(INITIAL_MOBILITY_RECORDS);
  const [jobOpenings, setJobOpenings] = useState<InternalJobOpening[]>(INITIAL_JOB_OPENINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [activeProfileId, setActiveProfileIdState] = useState<string>('emp-voicu');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && user.email === 'voicu.dragan@interqas.com') {
        setActiveProfileIdState('emp-voicu');
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize & Listen to Firestore Collections in Real Time
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initFirestore() {
      try {
        // Check if employees collection is seeded
        const empSnap = await getDocs(collection(db, 'employees'));
        if (empSnap.empty) {
          console.info('Seeding initial HR data into Firestore...');
          // Seed Employees
          for (const emp of INITIAL_EMPLOYEES) {
            await setDoc(doc(db, 'employees', emp.id), emp);
          }
          // Seed Tasks
          for (const task of INITIAL_ONBOARDING_TASKS) {
            await setDoc(doc(db, 'onboarding_tasks', task.id), task);
          }
          // Seed Leaves
          for (const req of INITIAL_LEAVE_REQUESTS) {
            await setDoc(doc(db, 'leave_requests', req.id), req);
          }
          // Seed Reviews
          for (const rev of INITIAL_PERFORMANCE_REVIEWS) {
            await setDoc(doc(db, 'performance_reviews', rev.id), rev);
          }
          // Seed Payroll
          for (const pay of INITIAL_PAYROLL_RECORDS) {
            await setDoc(doc(db, 'payroll_records', pay.id), pay);
          }
          // Seed Mobility
          for (const mob of INITIAL_MOBILITY_RECORDS) {
            await setDoc(doc(db, 'mobility_records', mob.id), mob);
          }
          // Seed Notifications
          for (const notif of INITIAL_NOTIFICATIONS) {
            await setDoc(doc(db, 'notifications', notif.id), notif);
          }
        }
      } catch (err) {
        console.warn('Initial seeding note (continuing with local state & listeners):', err);
      } finally {
        setIsLoading(false);
      }

      // Attach onSnapshot listeners with required error handlers
      try {
        const u1 = onSnapshot(collection(db, 'employees'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as Employee);
            setEmployees(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'employees'));
        unsubs.push(u1);

        const u2 = onSnapshot(collection(db, 'onboarding_tasks'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as OnboardingTask);
            setOnboardingTasks(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'onboarding_tasks'));
        unsubs.push(u2);

        const u3 = onSnapshot(collection(db, 'leave_requests'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as LeaveRequest);
            setLeaveRequests(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'leave_requests'));
        unsubs.push(u3);

        const u4 = onSnapshot(collection(db, 'performance_reviews'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as PerformanceReview);
            setPerformanceReviews(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'performance_reviews'));
        unsubs.push(u4);

        const u5 = onSnapshot(collection(db, 'payroll_records'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as PayrollRecord);
            setPayrollRecords(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'payroll_records'));
        unsubs.push(u5);

        const u6 = onSnapshot(collection(db, 'mobility_records'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as MobilityRecord);
            setMobilityRecords(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'mobility_records'));
        unsubs.push(u6);

        const u7 = onSnapshot(collection(db, 'notifications'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as AppNotification);
            // Sort newest first
            list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            setNotifications(list);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'notifications'));
        unsubs.push(u7);
      } catch (err) {
        console.warn('Realtime subscription initial catch:', err);
      }
    }

    initFirestore();

    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  const activeProfile = useMemo(() => {
    return employees.find(e => e.id === activeProfileId) || employees[0] || INITIAL_EMPLOYEES[0];
  }, [employees, activeProfileId]);

  const activeRole: UserRole = activeProfile.role;

  const setActiveProfileId = (id: string) => {
    setActiveProfileIdState(id);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-Out failed:', err);
    }
  };

  // Add Employee
  const addEmployee = async (empData: Omit<Employee, 'id'>): Promise<string> => {
    const newId = `emp-${Date.now()}`;
    const newEmployee: Employee = {
      ...empData,
      id: newId,
      leaveBalance: empData.leaveBalance || {
        annual: 20,
        annualUsed: 0,
        sick: 10,
        sickUsed: 0,
        personal: 5,
        personalUsed: 0,
        remoteUsed: 0,
      },
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setEmployees(prev => [...prev, newEmployee]);

    // Create default onboarding checklist for new hire
    const defaultTasks: OnboardingTask[] = [
      {
        id: `task-${Date.now()}-1`,
        employeeId: newId,
        employeeName: newEmployee.name,
        department: newEmployee.department,
        title: 'Sign Employee Agreement & Tax W-4 Compliance',
        category: 'documentation',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        assignedTo: 'People & HR',
      },
      {
        id: `task-${Date.now()}-2`,
        employeeId: newId,
        employeeName: newEmployee.name,
        department: newEmployee.department,
        title: 'Workstation Setup & Hardware Provisioning',
        category: 'it_setup',
        status: 'pending',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        assignedTo: 'IT Helpdesk',
      },
      {
        id: `task-${Date.now()}-3`,
        employeeId: newId,
        employeeName: newEmployee.name,
        department: newEmployee.department,
        title: 'Complete Security & Data Privacy Training',
        category: 'compliance',
        status: 'pending',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        assignedTo: 'Compliance Officer',
      },
    ];

    setOnboardingTasks(prev => [...prev, ...defaultTasks]);

    // Notify team
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetRole: 'all',
      title: 'New Team Member Onboarded',
      message: `${newEmployee.name} joined as ${newEmployee.jobTitle} in ${newEmployee.department}.`,
      type: 'onboarding',
      relatedTab: 'onboarding',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await setDoc(doc(db, 'employees', newId), newEmployee);
      for (const t of defaultTasks) {
        await setDoc(doc(db, 'onboarding_tasks', t.id), t);
      }
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'employees');
    }

    return newId;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)));
    try {
      await updateDoc(doc(db, 'employees', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `employees/${id}`);
    }
  };

  // Onboarding Tasks
  const addOnboardingTask = async (taskData: Omit<OnboardingTask, 'id'>) => {
    const newId = `task-${Date.now()}`;
    const newTask: OnboardingTask = { ...taskData, id: newId };
    setOnboardingTasks(prev => [...prev, newTask]);
    try {
      await setDoc(doc(db, 'onboarding_tasks', newId), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `onboarding_tasks/${newId}`);
    }
  };

  const updateOnboardingTaskStatus = async (id: string, status: OnboardingTask['status']) => {
    const completedAt = status === 'completed' ? new Date().toISOString().split('T')[0] : undefined;
    setOnboardingTasks(prev => prev.map(t => (t.id === id ? { ...t, status, completedAt } : t)));
    try {
      await updateDoc(doc(db, 'onboarding_tasks', id), {
        status,
        ...(completedAt ? { completedAt } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `onboarding_tasks/${id}`);
    }
  };

  // Leave Requests
  const submitLeaveRequest = async (reqData: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    const newId = `leave-${Date.now()}`;
    const newRequest: LeaveRequest = {
      ...reqData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    // Notification for managers & admin
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetRole: 'manager',
      title: 'New Leave Request Pending Review',
      message: `${newRequest.employeeName} requested ${newRequest.totalDays} day(s) ${newRequest.leaveType} leave starting ${newRequest.startDate}.`,
      type: 'approval',
      relatedTab: 'leave',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await setDoc(doc(db, 'leave_requests', newId), newRequest);
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `leave_requests/${newId}`);
    }
  };

  const reviewLeaveRequest = async (id: string, status: 'approved' | 'rejected', comments?: string) => {
    const reviewedAt = new Date().toISOString().split('T')[0];
    const targetReq = leaveRequests.find(r => r.id === id);

    setLeaveRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status,
      reviewedBy: activeProfile.id,
      reviewedByName: activeProfile.name,
      reviewedAt,
      comments: comments || r.comments,
    } : r));

    // If approved, deduct days from employee leave balance
    if (status === 'approved' && targetReq) {
      setEmployees(prev => prev.map(e => {
        if (e.id === targetReq.employeeId) {
          const lb = { ...e.leaveBalance };
          if (targetReq.leaveType === 'annual') lb.annualUsed += targetReq.totalDays;
          if (targetReq.leaveType === 'sick') lb.sickUsed += targetReq.totalDays;
          if (targetReq.leaveType === 'personal') lb.personalUsed += targetReq.totalDays;
          if (targetReq.leaveType === 'remote') lb.remoteUsed += targetReq.totalDays;
          return { ...e, leaveBalance: lb };
        }
        return e;
      }));
    }

    // Create decision notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetRole: 'employee',
      targetUserId: targetReq?.employeeId,
      title: `Leave Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
      message: `Your ${targetReq?.leaveType || ''} leave request was ${status} by ${activeProfile.name}.`,
      type: 'approval',
      relatedTab: 'leave',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await updateDoc(doc(db, 'leave_requests', id), {
        status,
        reviewedBy: activeProfile.id,
        reviewedByName: activeProfile.name,
        reviewedAt,
        ...(comments ? { comments } : {}),
      });
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leave_requests/${id}`);
    }
  };

  // Performance Reviews
  const submitPerformanceReview = async (revData: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `rev-${Date.now()}`;
    const newReview: PerformanceReview = {
      ...revData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setPerformanceReviews(prev => [newReview, ...prev]);

    try {
      await setDoc(doc(db, 'performance_reviews', newId), newReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `performance_reviews/${newId}`);
    }
  };

  const updatePerformanceReview = async (id: string, updates: Partial<PerformanceReview>) => {
    const updatedAt = new Date().toISOString().split('T')[0];
    setPerformanceReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt } : r));

    try {
      await updateDoc(doc(db, 'performance_reviews', id), {
        ...updates,
        updatedAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `performance_reviews/${id}`);
    }
  };

  const finalizePerformanceReview = async (id: string) => {
    await updatePerformanceReview(id, { status: 'finalized' });
    const rev = performanceReviews.find(r => r.id === id);
    if (rev) {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetRole: 'employee',
        targetUserId: rev.employeeId,
        title: 'Performance Review Finalized',
        message: `Your review for ${rev.cycle} has been officially finalized with a rating of ${rev.overallRating}/5.0.`,
        type: 'deadline',
        relatedTab: 'performance',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setNotifications(prev => [newNotif, ...prev]);
      try {
        await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `notifications/${newNotif.id}`);
      }
    }
  };

  // Payroll
  const updatePayrollStatus = async (id: string, status: PayrollRecord['status']) => {
    const paidAt = status === 'paid' ? new Date().toISOString().split('T')[0] : undefined;
    setPayrollRecords(prev => prev.map(p => p.id === id ? { ...p, status, paidAt } : p));

    try {
      await updateDoc(doc(db, 'payroll_records', id), {
        status,
        ...(paidAt ? { paidAt } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payroll_records/${id}`);
    }
  };

  const disburseAllPendingPayroll = async (period: string) => {
    const paidAt = new Date().toISOString().split('T')[0];
    setPayrollRecords(prev => prev.map(p => p.period === period && p.status !== 'paid' ? { ...p, status: 'paid', paidAt } : p));

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Notify company
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetRole: 'all',
      title: 'Payroll Disbursed Successfully',
      message: `${period} monthly compensation run has been completed and disbursed to all staff bank accounts.`,
      type: 'payroll',
      relatedTab: 'payroll',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      const pending = payrollRecords.filter(p => p.period === period && p.status !== 'paid');
      for (const item of pending) {
        await updateDoc(doc(db, 'payroll_records', item.id), { status: 'paid', paidAt });
      }
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'payroll_records');
    }
  };

  // Promotion & Mobility
  const nominatePromotion = async (data: Omit<MobilityRecord, 'id' | 'createdAt' | 'status'>) => {
    const newId = `mob-${Date.now()}`;
    const newRecord: MobilityRecord = {
      ...data,
      id: newId,
      status: 'nominated',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMobilityRecords(prev => [newRecord, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      targetRole: 'admin',
      title: 'Promotion Nomination Submitted',
      message: `${newRecord.employeeName} was nominated for promotion to ${newRecord.proposedTitle} (+${newRecord.salaryAdjustmentPercent}%).`,
      type: 'promotion',
      relatedTab: 'mobility',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'mobility_records', newId), newRecord);
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `mobility_records/${newId}`);
    }
  };

  const reviewPromotion = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    const rec = mobilityRecords.find(m => m.id === id);
    setMobilityRecords(prev => prev.map(m => m.id === id ? {
      ...m,
      status,
      approvedBy: activeProfile.name,
      managerNotes: notes || m.managerNotes,
    } : m));

    if (status === 'approved' && rec) {
      // Confetti!
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      // Update employee job title and salary
      setEmployees(prev => prev.map(e => {
        if (e.id === rec.employeeId) {
          const newSalary = Math.round(e.salary * (1 + (rec.salaryAdjustmentPercent || 10) / 100));
          return {
            ...e,
            jobTitle: rec.proposedTitle,
            department: rec.targetDepartment,
            salary: newSalary,
          };
        }
        return e;
      }));

      // Broadcast celebration notification
      const promoNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetRole: 'all',
        title: 'Promotion Announcement 🎉',
        message: `Congratulations to ${rec.employeeName} on their official promotion to ${rec.proposedTitle}!`,
        type: 'promotion',
        relatedTab: 'mobility',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setNotifications(prev => [promoNotif, ...prev]);

      try {
        await updateDoc(doc(db, 'mobility_records', id), {
          status,
          approvedBy: activeProfile.name,
          ...(notes ? { managerNotes: notes } : {}),
        });
        const targetEmp = employees.find(e => e.id === rec.employeeId);
        if (targetEmp) {
          const newSalary = Math.round(targetEmp.salary * (1 + (rec.salaryAdjustmentPercent || 10) / 100));
          await updateDoc(doc(db, 'employees', rec.employeeId), {
            jobTitle: rec.proposedTitle,
            department: rec.targetDepartment,
            salary: newSalary,
          });
        }
        await setDoc(doc(db, 'notifications', promoNotif.id), promoNotif);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `mobility_records/${id}`);
      }
    } else {
      try {
        await updateDoc(doc(db, 'mobility_records', id), {
          status,
          approvedBy: activeProfile.name,
          ...(notes ? { managerNotes: notes } : {}),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `mobility_records/${id}`);
      }
    }
  };

  const addJobOpening = async (jobData: Omit<InternalJobOpening, 'id' | 'postedDate'>) => {
    const newId = `job-${Date.now()}`;
    const newJob: InternalJobOpening = {
      ...jobData,
      id: newId,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setJobOpenings(prev => [newJob, ...prev]);
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {
      // Local state is already updated
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      for (const n of notifications.filter(x => !x.read)) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    } catch {
      // Local state is updated
    }
  };

  // Automated notification scanner for pending approvals & deadlines
  const triggerAutomatedAlerts = async () => {
    const alertsToCreate: AppNotification[] = [];

    // Check pending leave requests
    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
    if (pendingLeaves.length > 0) {
      alertsToCreate.push({
        id: `auto-leave-${Date.now()}`,
        targetRole: 'manager',
        title: `${pendingLeaves.length} Pending Leave Approval${pendingLeaves.length > 1 ? 's' : ''}`,
        message: `Action needed: ${pendingLeaves.map(l => l.employeeName).join(', ')} awaiting manager decision.`,
        type: 'approval',
        relatedTab: 'leave',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    // Check pending performance reviews
    const pendingReviews = performanceReviews.filter(r => r.status !== 'finalized');
    if (pendingReviews.length > 0) {
      alertsToCreate.push({
        id: `auto-rev-${Date.now()}`,
        targetRole: 'manager',
        title: `${pendingReviews.length} Performance Review${pendingReviews.length > 1 ? 's' : ''} in Progress`,
        message: `Approaching deadline: Ensure self-reviews and manager evaluations are submitted on time.`,
        type: 'deadline',
        relatedTab: 'performance',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    // Check onboarding tasks pending
    const pendingTasks = onboardingTasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length > 0) {
      alertsToCreate.push({
        id: `auto-task-${Date.now()}`,
        targetRole: 'admin',
        title: `${pendingTasks.length} Onboarding Task${pendingTasks.length > 1 ? 's' : ''} Active`,
        message: `New hire ramp-up checklist requires compliance & IT follow-ups.`,
        type: 'onboarding',
        relatedTab: 'onboarding',
        read: false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    if (alertsToCreate.length > 0) {
      setNotifications(prev => [...alertsToCreate, ...prev]);
      try {
        for (const a of alertsToCreate) {
          await setDoc(doc(db, 'notifications', a.id), a);
        }
      } catch (err) {
        console.warn('Alerts push error:', err);
      }
    }
  };

  const resetToDefaultData = async () => {
    setEmployees(INITIAL_EMPLOYEES);
    setOnboardingTasks(INITIAL_ONBOARDING_TASKS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setPerformanceReviews(INITIAL_PERFORMANCE_REVIEWS);
    setPayrollRecords(INITIAL_PAYROLL_RECORDS);
    setMobilityRecords(INITIAL_MOBILITY_RECORDS);
    setJobOpenings(INITIAL_JOB_OPENINGS);
    setNotifications(INITIAL_NOTIFICATIONS);

    try {
      for (const emp of INITIAL_EMPLOYEES) {
        await setDoc(doc(db, 'employees', emp.id), emp);
      }
      for (const t of INITIAL_ONBOARDING_TASKS) {
        await setDoc(doc(db, 'onboarding_tasks', t.id), t);
      }
      for (const l of INITIAL_LEAVE_REQUESTS) {
        await setDoc(doc(db, 'leave_requests', l.id), l);
      }
      for (const r of INITIAL_PERFORMANCE_REVIEWS) {
        await setDoc(doc(db, 'performance_reviews', r.id), r);
      }
      for (const p of INITIAL_PAYROLL_RECORDS) {
        await setDoc(doc(db, 'payroll_records', p.id), p);
      }
      for (const m of INITIAL_MOBILITY_RECORDS) {
        await setDoc(doc(db, 'mobility_records', m.id), m);
      }
      for (const n of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
    } catch (err) {
      console.warn('Reset sync warning:', err);
    }
  };

  return (
    <HRContext.Provider
      value={{
        firebaseUser,
        activeProfile,
        allProfiles: employees,
        employees,
        onboardingTasks,
        leaveRequests,
        performanceReviews,
        payrollRecords,
        mobilityRecords,
        jobOpenings,
        notifications,
        isLoading,
        isOnline,
        activeRole,
        setActiveProfileId,
        signInWithGoogle,
        logOut,
        addEmployee,
        updateEmployee,
        addOnboardingTask,
        updateOnboardingTaskStatus,
        submitLeaveRequest,
        reviewLeaveRequest,
        submitPerformanceReview,
        updatePerformanceReview,
        finalizePerformanceReview,
        updatePayrollStatus,
        disburseAllPendingPayroll,
        nominatePromotion,
        reviewPromotion,
        addJobOpening,
        markNotificationRead,
        markAllNotificationsRead,
        triggerAutomatedAlerts,
        resetToDefaultData,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
