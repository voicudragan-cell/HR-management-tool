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
  OnboardingCategory,
  OnboardingTask,
  TaskDocument,
  LeaveRequest,
  PerformanceReview,
  PayrollRecord,
  MobilityRecord,
  CareerLevel,
  InternalJobOpening,
  AppNotification,
  UserRole
} from '../types/hr';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ONBOARDING_CATEGORIES,
  INITIAL_ONBOARDING_TASKS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PERFORMANCE_REVIEWS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_MOBILITY_RECORDS,
  INITIAL_CAREER_LEVELS,
  INITIAL_JOB_OPENINGS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';

interface HRContextType {
  // State
  firebaseUser: FirebaseUser | null;
  activeProfile: Employee;
  allProfiles: Employee[];
  employees: Employee[];
  onboardingCategories: OnboardingCategory[];
  onboardingTasks: OnboardingTask[];
  leaveRequests: LeaveRequest[];
  performanceReviews: PerformanceReview[];
  payrollRecords: PayrollRecord[];
  mobilityRecords: MobilityRecord[];
  careerLevels: CareerLevel[];
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
  deleteEmployee: (id: string) => Promise<void>;

  // Dynamic Onboarding Categories
  addOnboardingCategory: (cat: Omit<OnboardingCategory, 'id' | 'createdAt'>) => Promise<string>;
  updateOnboardingCategory: (id: string, updates: Partial<OnboardingCategory>) => Promise<void>;
  deleteOnboardingCategory: (id: string) => Promise<void>;
  attachDocumentToCategory: (categoryId: string, docData: Omit<TaskDocument, 'id'>) => Promise<void>;

  // Onboarding Tasks & Document Comprehension
  addOnboardingTask: (task: Omit<OnboardingTask, 'id'>) => Promise<void>;
  updateOnboardingTask: (id: string, updates: Partial<OnboardingTask>) => Promise<void>;
  updateOnboardingTaskStatus: (id: string, status: OnboardingTask['status']) => Promise<void>;
  attachDocumentToTask: (taskId: string, docData: Omit<TaskDocument, 'id'>) => Promise<void>;
  confirmTaskComprehension: (taskId: string, documentId: string) => Promise<void>;

  // Other modules
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  reviewLeaveRequest: (id: string, status: 'approved' | 'rejected', comments?: string) => Promise<void>;
  submitPerformanceReview: (review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
  finalizePerformanceReview: (id: string) => Promise<void>;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => Promise<void>;
  updatePayrollStatus: (id: string, status: PayrollRecord['status']) => Promise<void>;
  disburseAllPendingPayroll: (period: string) => Promise<void>;
  nominatePromotion: (data: Omit<MobilityRecord, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateMobilityRecord: (id: string, updates: Partial<MobilityRecord>) => Promise<void>;
  deleteMobilityRecord: (id: string) => Promise<void>;
  reviewPromotion: (id: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
  updateCareerLevel: (id: string, updates: Partial<CareerLevel>) => Promise<void>;
  addCareerLevel: (level: Omit<CareerLevel, 'id'>) => Promise<string>;
  deleteCareerLevel: (id: string) => Promise<void>;
  addJobOpening: (job: Omit<InternalJobOpening, 'id' | 'postedDate'>) => Promise<string>;
  updateJobOpening: (id: string, updates: Partial<InternalJobOpening>) => Promise<void>;
  deleteJobOpening: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  triggerAutomatedAlerts: () => Promise<void>;
  clearToBlankStart: () => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [onboardingCategories, setOnboardingCategories] = useState<OnboardingCategory[]>(INITIAL_ONBOARDING_CATEGORIES);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(INITIAL_ONBOARDING_TASKS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(INITIAL_PERFORMANCE_REVIEWS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [mobilityRecords, setMobilityRecords] = useState<MobilityRecord[]>(INITIAL_MOBILITY_RECORDS);
  const [careerLevels, setCareerLevels] = useState<CareerLevel[]>(INITIAL_CAREER_LEVELS);
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
        // Fetch current employees from Firestore
        const empSnap = await getDocs(collection(db, 'employees'));

        // Check if database contains old example employees (e.g. emp-sarah, emp-marcus, emp-elena)
        const oldSampleIds = ['emp-sarah', 'emp-marcus', 'emp-elena', 'emp-liam', 'emp-maya', 'emp-david'];
        const hasOldSampleData = empSnap.docs.some(d => oldSampleIds.includes(d.id));

        if (hasOldSampleData) {
          console.info('Cleaning up old sample data from Firestore for requested blank start...');
          // Clean up old sample employees
          for (const oldId of oldSampleIds) {
            await deleteDoc(doc(db, 'employees', oldId)).catch(() => {});
          }

          // Clean up old tasks, leaves, reviews, payroll, mobility, notifications
          const taskSnap = await getDocs(collection(db, 'onboarding_tasks'));
          for (const d of taskSnap.docs) {
            await deleteDoc(doc(db, 'onboarding_tasks', d.id)).catch(() => {});
          }

          const leaveSnap = await getDocs(collection(db, 'leave_requests'));
          for (const d of leaveSnap.docs) {
            await deleteDoc(doc(db, 'leave_requests', d.id)).catch(() => {});
          }

          const revSnap = await getDocs(collection(db, 'performance_reviews'));
          for (const d of revSnap.docs) {
            await deleteDoc(doc(db, 'performance_reviews', d.id)).catch(() => {});
          }

          const paySnap = await getDocs(collection(db, 'payroll_records'));
          for (const d of paySnap.docs) {
            await deleteDoc(doc(db, 'payroll_records', d.id)).catch(() => {});
          }

          const mobSnap = await getDocs(collection(db, 'mobility_records'));
          for (const d of mobSnap.docs) {
            await deleteDoc(doc(db, 'mobility_records', d.id)).catch(() => {});
          }

          const notifSnap = await getDocs(collection(db, 'notifications'));
          for (const d of notifSnap.docs) {
            await deleteDoc(doc(db, 'notifications', d.id)).catch(() => {});
          }
        }

        // Ensure Voicu Dragan exists as the clean-slate admin
        await setDoc(doc(db, 'employees', INITIAL_EMPLOYEES[0].id), INITIAL_EMPLOYEES[0], { merge: true });

        // Ensure Voicu has an initial Euro payroll record for March 2026 if none exists
        const paySnap = await getDocs(collection(db, 'payroll_records'));
        if (paySnap.empty) {
          const monthly = Math.round(INITIAL_EMPLOYEES[0].salary / 12);
          const tax = Math.round(monthly * 0.25);
          const voicuPay: PayrollRecord = {
            id: `pay-${INITIAL_EMPLOYEES[0].id}-mar26`,
            employeeId: INITIAL_EMPLOYEES[0].id,
            employeeName: INITIAL_EMPLOYEES[0].name,
            directReportName: INITIAL_EMPLOYEES[0].directReportName || '',
            department: INITIAL_EMPLOYEES[0].department,
            period: 'March 2026',
            baseSalary: monthly,
            bonus: 1500,
            allowances: 450,
            deductions: 200,
            tax,
            netSalary: monthly + 1500 + 450 - 200 - tax,
            status: 'pending_approval',
            paymentMethod: 'SEPA Direct Deposit (IBAN)',
          };
          await setDoc(doc(db, 'payroll_records', voicuPay.id), voicuPay);
        }

        // Ensure Career Levels & Target Bands in Euros are seeded
        const lvlSnap = await getDocs(collection(db, 'career_levels'));
        if (lvlSnap.empty) {
          for (const lvl of INITIAL_CAREER_LEVELS) {
            await setDoc(doc(db, 'career_levels', lvl.id), lvl);
          }
        }

        // Ensure Onboarding Categories are seeded
        const catSnap = await getDocs(collection(db, 'onboarding_categories'));
        if (catSnap.empty) {
          for (const cat of INITIAL_ONBOARDING_CATEGORIES) {
            await setDoc(doc(db, 'onboarding_categories', cat.id), cat);
          }
        }
      } catch (err) {
        console.warn('Initial seeding note (continuing with listeners):', err);
      } finally {
        setIsLoading(false);
      }

      // Attach onSnapshot listeners with required error handlers
      try {
        // Employees
        const u1 = onSnapshot(collection(db, 'employees'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as Employee);
            // Filter out any lingering sample employee ids
            const cleanList = list.filter(e => !['emp-sarah', 'emp-marcus', 'emp-elena', 'emp-liam', 'emp-maya', 'emp-david'].includes(e.id));
            if (cleanList.length > 0) {
              setEmployees(cleanList);
            } else {
              setEmployees(INITIAL_EMPLOYEES);
            }
          } else {
            setEmployees(INITIAL_EMPLOYEES);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'employees'));
        unsubs.push(u1);

        // Career Levels & Target Bands in Euros
        const uLevels = onSnapshot(collection(db, 'career_levels'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as CareerLevel);
            list.sort((a, b) => a.level.localeCompare(b.level));
            setCareerLevels(list);
          } else {
            setCareerLevels(INITIAL_CAREER_LEVELS);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'career_levels'));
        unsubs.push(uLevels);

        // Internal Job Openings
        const uJobs = onSnapshot(collection(db, 'job_openings'), (snap) => {
          const list = snap.docs.map(d => d.data() as InternalJobOpening);
          setJobOpenings(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'job_openings'));
        unsubs.push(uJobs);

        // Onboarding Categories
        const uCat = onSnapshot(collection(db, 'onboarding_categories'), (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as OnboardingCategory);
            setOnboardingCategories(list);
          } else {
            setOnboardingCategories(INITIAL_ONBOARDING_CATEGORIES);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, 'onboarding_categories'));
        unsubs.push(uCat);

        // Onboarding Tasks
        const u2 = onSnapshot(collection(db, 'onboarding_tasks'), (snap) => {
          const list = snap.docs.map(d => d.data() as OnboardingTask);
          setOnboardingTasks(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'onboarding_tasks'));
        unsubs.push(u2);

        // Leave Requests
        const u3 = onSnapshot(collection(db, 'leave_requests'), (snap) => {
          const list = snap.docs.map(d => d.data() as LeaveRequest);
          setLeaveRequests(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'leave_requests'));
        unsubs.push(u3);

        // Performance Reviews
        const u4 = onSnapshot(collection(db, 'performance_reviews'), (snap) => {
          const list = snap.docs.map(d => d.data() as PerformanceReview);
          setPerformanceReviews(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'performance_reviews'));
        unsubs.push(u4);

        // Payroll Records
        const u5 = onSnapshot(collection(db, 'payroll_records'), (snap) => {
          const list = snap.docs.map(d => d.data() as PayrollRecord);
          setPayrollRecords(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'payroll_records'));
        unsubs.push(u5);

        // Mobility Records
        const u6 = onSnapshot(collection(db, 'mobility_records'), (snap) => {
          const list = snap.docs.map(d => d.data() as MobilityRecord);
          setMobilityRecords(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'mobility_records'));
        unsubs.push(u6);

        // Notifications
        const u7 = onSnapshot(collection(db, 'notifications'), (snap) => {
          const list = snap.docs.map(d => d.data() as AppNotification);
          list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          setNotifications(list);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'notifications'));
        unsubs.push(u7);
      } catch (err) {
        console.warn('Realtime subscription catch:', err);
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

    setEmployees(prev => [...prev, newEmployee]);

    // Create default onboarding tasks based on available categories
    const defaultTasks: OnboardingTask[] = onboardingCategories.slice(0, 3).map((cat, idx) => ({
      id: `task-${Date.now()}-${idx + 1}`,
      employeeId: newId,
      employeeName: newEmployee.name,
      department: newEmployee.department,
      title: `Complete ${cat.name} requirements`,
      category: cat.name,
      categoryId: cat.id,
      status: 'pending',
      dueDate: new Date(Date.now() + (idx + 1) * 7 * 86400000).toISOString().split('T')[0],
      assignedTo: 'People & HR',
      documents: cat.attachedDocuments ? [...cat.attachedDocuments] : [],
      requiresComprehension: (cat.attachedDocuments && cat.attachedDocuments.length > 0) || false,
      comprehensionConfirmed: false,
    }));

    if (defaultTasks.length > 0) {
      setOnboardingTasks(prev => [...prev, ...defaultTasks]);
    }

    try {
      await setDoc(doc(db, 'employees', newId), newEmployee);
      for (const t of defaultTasks) {
        await setDoc(doc(db, 'onboarding_tasks', t.id), t);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'employees');
    }

    return newId;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const updatedAt = new Date().toISOString();
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt } : e)));

    // Propagate changes to local state for instant responsiveness
    if (updates.name || updates.department) {
      setOnboardingTasks(prev => prev.map(t => t.employeeId === id ? {
        ...t,
        ...(updates.name ? { employeeName: updates.name } : {}),
        ...(updates.department ? { department: updates.department } : {}),
      } : t));

      setLeaveRequests(prev => prev.map(l => l.employeeId === id ? {
        ...l,
        ...(updates.name ? { employeeName: updates.name } : {}),
        ...(updates.department ? { department: updates.department } : {}),
      } : l));

      setPayrollRecords(prev => prev.map(p => p.employeeId === id ? {
        ...p,
        ...(updates.name ? { employeeName: updates.name } : {}),
        ...(updates.department ? { department: updates.department } : {}),
      } : p));

      setMobilityRecords(prev => prev.map(m => m.employeeId === id ? {
        ...m,
        ...(updates.name ? { employeeName: updates.name } : {}),
        ...(updates.department ? { currentDepartment: updates.department } : {}),
        ...(updates.jobTitle ? { currentTitle: updates.jobTitle } : {}),
      } : m));
    }

    if (updates.name || updates.department || updates.jobTitle) {
      setPerformanceReviews(prev => prev.map(r => r.employeeId === id ? {
        ...r,
        ...(updates.name ? { employeeName: updates.name } : {}),
        ...(updates.department ? { department: updates.department } : {}),
        ...(updates.jobTitle ? { jobTitle: updates.jobTitle } : {}),
      } : r));
    }

    if (updates.directReportName !== undefined) {
      setLeaveRequests(prev => prev.map(l => l.employeeId === id ? { ...l, directReportName: updates.directReportName } : l));
      setPerformanceReviews(prev => prev.map(r => r.employeeId === id ? { ...r, directReportName: updates.directReportName } : r));
      setMobilityRecords(prev => prev.map(m => m.employeeId === id ? { ...m, directReportName: updates.directReportName } : m));
      setPayrollRecords(prev => prev.map(p => p.employeeId === id ? { ...p, directReportName: updates.directReportName } : p));
    }

    try {
      await updateDoc(doc(db, 'employees', id), {
        ...updates,
        updatedAt,
      });

      // Synchronize affected Firestore collections asynchronously
      if (updates.name || updates.department) {
        const relatedTasks = onboardingTasks.filter(t => t.employeeId === id);
        for (const t of relatedTasks) {
          await updateDoc(doc(db, 'onboarding_tasks', t.id), {
            ...(updates.name ? { employeeName: updates.name } : {}),
            ...(updates.department ? { department: updates.department } : {}),
          }).catch(() => {});
        }

        const relatedLeaves = leaveRequests.filter(l => l.employeeId === id);
        for (const l of relatedLeaves) {
          await updateDoc(doc(db, 'leave_requests', l.id), {
            ...(updates.name ? { employeeName: updates.name } : {}),
            ...(updates.department ? { department: updates.department } : {}),
          }).catch(() => {});
        }

        const relatedPayroll = payrollRecords.filter(p => p.employeeId === id);
        for (const p of relatedPayroll) {
          await updateDoc(doc(db, 'payroll_records', p.id), {
            ...(updates.name ? { employeeName: updates.name } : {}),
            ...(updates.department ? { department: updates.department } : {}),
          }).catch(() => {});
        }
      }

      if (updates.name || updates.department || updates.jobTitle) {
        const relatedReviews = performanceReviews.filter(r => r.employeeId === id);
        for (const r of relatedReviews) {
          await updateDoc(doc(db, 'performance_reviews', r.id), {
            ...(updates.name ? { employeeName: updates.name } : {}),
            ...(updates.department ? { department: updates.department } : {}),
            ...(updates.jobTitle ? { jobTitle: updates.jobTitle } : {}),
          }).catch(() => {});
        }
      }

      if (updates.directReportName !== undefined) {
        const relatedLeaves = leaveRequests.filter(l => l.employeeId === id);
        for (const l of relatedLeaves) {
          await updateDoc(doc(db, 'leave_requests', l.id), { directReportName: updates.directReportName }).catch(() => {});
        }
        const relatedReviews = performanceReviews.filter(r => r.employeeId === id);
        for (const r of relatedReviews) {
          await updateDoc(doc(db, 'performance_reviews', r.id), { directReportName: updates.directReportName }).catch(() => {});
        }
        const relatedMobility = mobilityRecords.filter(m => m.employeeId === id);
        for (const m of relatedMobility) {
          await updateDoc(doc(db, 'mobility_records', m.id), { directReportName: updates.directReportName }).catch(() => {});
        }
        const relatedPayroll = payrollRecords.filter(p => p.employeeId === id);
        for (const p of relatedPayroll) {
          await updateDoc(doc(db, 'payroll_records', p.id), { directReportName: updates.directReportName }).catch(() => {});
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `employees/${id}`);
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `employees/${id}`);
    }
  };

  // Dynamic Onboarding Categories
  const addOnboardingCategory = async (catData: Omit<OnboardingCategory, 'id' | 'createdAt'>): Promise<string> => {
    const newId = `cat-${Date.now()}`;
    const newCat: OnboardingCategory = {
      ...catData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      attachedDocuments: catData.attachedDocuments || [],
    };

    setOnboardingCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'onboarding_categories', newId), newCat);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `onboarding_categories/${newId}`);
    }
    return newId;
  };

  const updateOnboardingCategory = async (id: string, updates: Partial<OnboardingCategory>) => {
    setOnboardingCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    
    // If category name was renamed, update tasks referencing this category
    if (updates.name) {
      setOnboardingTasks(prev => prev.map(t => t.categoryId === id ? { ...t, category: updates.name! } : t));
    }

    try {
      await updateDoc(doc(db, 'onboarding_categories', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `onboarding_categories/${id}`);
    }
  };

  const deleteOnboardingCategory = async (id: string) => {
    setOnboardingCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'onboarding_categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `onboarding_categories/${id}`);
    }
  };

  const attachDocumentToCategory = async (categoryId: string, docData: Omit<TaskDocument, 'id'>) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: TaskDocument = { ...docData, id: newDocId };

    const targetCat = onboardingCategories.find(c => c.id === categoryId);
    if (!targetCat) return;

    const updatedDocs = [...(targetCat.attachedDocuments || []), newDoc];
    await updateOnboardingCategory(categoryId, { attachedDocuments: updatedDocs });
  };

  // Onboarding Tasks & Document Comprehension
  const addOnboardingTask = async (taskData: Omit<OnboardingTask, 'id'>) => {
    const newId = `task-${Date.now()}`;
    
    // If category matches an onboarding category, inherit any attached documents
    const matchingCat = onboardingCategories.find(c => c.id === taskData.categoryId || c.name === taskData.category);
    const docs = taskData.documents && taskData.documents.length > 0
      ? taskData.documents
      : (matchingCat?.attachedDocuments ? [...matchingCat.attachedDocuments] : []);

    const requiresComprehension = docs.some(d => d.requiredComprehension);

    const newTask: OnboardingTask = {
      ...taskData,
      id: newId,
      documents: docs,
      requiresComprehension,
      comprehensionConfirmed: false,
    };

    setOnboardingTasks(prev => [...prev, newTask]);
    try {
      await setDoc(doc(db, 'onboarding_tasks', newId), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `onboarding_tasks/${newId}`);
    }
  };

  const updateOnboardingTask = async (id: string, updates: Partial<OnboardingTask>) => {
    setOnboardingTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await updateDoc(doc(db, 'onboarding_tasks', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `onboarding_tasks/${id}`);
    }
  };

  const updateOnboardingTaskStatus = async (id: string, status: OnboardingTask['status']) => {
    const targetTask = onboardingTasks.find(t => t.id === id);

    // GATE CHECK: If task requires document comprehension, it cannot be marked completed until comprehension is confirmed!
    if (status === 'completed' && targetTask?.requiresComprehension && !targetTask?.comprehensionConfirmed) {
      throw new Error('Comprehension confirmation required: Please open and read the attached document and confirm comprehension before marking as completed.');
    }

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

  const attachDocumentToTask = async (taskId: string, docData: Omit<TaskDocument, 'id'>) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: TaskDocument = { ...docData, id: newDocId };

    const targetTask = onboardingTasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedDocs = [...(targetTask.documents || []), newDoc];
    const requiresComprehension = updatedDocs.some(d => d.requiredComprehension);

    await updateOnboardingTask(taskId, {
      documents: updatedDocs,
      requiresComprehension,
      comprehensionConfirmed: false,
    });
  };

  const confirmTaskComprehension = async (taskId: string, documentId: string) => {
    const confirmedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const confirmedBy = activeProfile.name;

    const targetTask = onboardingTasks.find(t => t.id === taskId);
    if (!targetTask || !targetTask.documents) return;

    const updatedDocs = targetTask.documents.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          comprehensionConfirmed: true,
          confirmedAt,
          confirmedBy,
        };
      }
      return d;
    });

    // Check if all required comprehension documents are confirmed
    const allRequiredConfirmed = updatedDocs
      .filter(d => d.requiredComprehension)
      .every(d => d.comprehensionConfirmed);

    setOnboardingTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      documents: updatedDocs,
      comprehensionConfirmed: allRequiredConfirmed,
      confirmedAt: allRequiredConfirmed ? confirmedAt : t.confirmedAt,
      confirmedBy: allRequiredConfirmed ? confirmedBy : t.confirmedBy,
    } : t));

    try {
      await updateDoc(doc(db, 'onboarding_tasks', taskId), {
        documents: updatedDocs,
        comprehensionConfirmed: allRequiredConfirmed,
        ...(allRequiredConfirmed ? { confirmedAt, confirmedBy } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `onboarding_tasks/${taskId}`);
    }
  };

  // Leave Requests
  const submitLeaveRequest = async (reqData: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    const newId = `leave-${Date.now()}`;
    const targetEmp = employees.find(e => e.id === reqData.employeeId);
    const newRequest: LeaveRequest = {
      ...reqData,
      directReportName: reqData.directReportName || targetEmp?.directReportName || '',
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    try {
      await setDoc(doc(db, 'leave_requests', newId), newRequest);
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

    try {
      await updateDoc(doc(db, 'leave_requests', id), {
        status,
        reviewedBy: activeProfile.id,
        reviewedByName: activeProfile.name,
        reviewedAt,
        ...(comments ? { comments } : {}),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `leave_requests/${id}`);
    }
  };

  // Performance Reviews
  const submitPerformanceReview = async (revData: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `rev-${Date.now()}`;
    const targetEmp = employees.find(e => e.id === revData.employeeId);
    const newReview: PerformanceReview = {
      ...revData,
      directReportName: revData.directReportName || targetEmp?.directReportName || '',
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
  };

  // Payroll
  const updatePayrollRecord = async (id: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await updateDoc(doc(db, 'payroll_records', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payroll_records/${id}`);
    }
  };

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

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      const pending = payrollRecords.filter(p => p.period === period && p.status !== 'paid');
      for (const item of pending) {
        await updateDoc(doc(db, 'payroll_records', item.id), { status: 'paid', paidAt });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'payroll_records');
    }
  };

  // Mobility
  const nominatePromotion = async (data: Omit<MobilityRecord, 'id' | 'createdAt' | 'status'>) => {
    const newId = `mob-${Date.now()}`;
    const targetEmp = employees.find(e => e.id === data.employeeId);
    const newRecord: MobilityRecord = {
      ...data,
      directReportName: data.directReportName || targetEmp?.directReportName || '',
      id: newId,
      status: 'nominated',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMobilityRecords(prev => [newRecord, ...prev]);

    try {
      await setDoc(doc(db, 'mobility_records', newId), newRecord);
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
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

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

  // Clean slate: completely purges old test/demo data and resets to blank start
  const clearToBlankStart = async () => {
    setEmployees(INITIAL_EMPLOYEES);
    setOnboardingCategories(INITIAL_ONBOARDING_CATEGORIES);
    setOnboardingTasks([]);
    setLeaveRequests([]);
    setPerformanceReviews([]);
    setPayrollRecords([]);
    setMobilityRecords([]);
    setJobOpenings([]);
    setNotifications([]);
    setActiveProfileIdState('emp-voicu');

    try {
      // Delete old sample employees
      const oldSampleIds = ['emp-sarah', 'emp-marcus', 'emp-elena', 'emp-liam', 'emp-maya', 'emp-david'];
      for (const id of oldSampleIds) {
        await deleteDoc(doc(db, 'employees', id)).catch(() => {});
      }

      // Ensure Voicu Dragan is saved
      await setDoc(doc(db, 'employees', INITIAL_EMPLOYEES[0].id), INITIAL_EMPLOYEES[0]);

      // Wipe all other collections
      const taskSnap = await getDocs(collection(db, 'onboarding_tasks'));
      for (const d of taskSnap.docs) {
        await deleteDoc(doc(db, 'onboarding_tasks', d.id)).catch(() => {});
      }

      const leaveSnap = await getDocs(collection(db, 'leave_requests'));
      for (const d of leaveSnap.docs) {
        await deleteDoc(doc(db, 'leave_requests', d.id)).catch(() => {});
      }

      const revSnap = await getDocs(collection(db, 'performance_reviews'));
      for (const d of revSnap.docs) {
        await deleteDoc(doc(db, 'performance_reviews', d.id)).catch(() => {});
      }

      const paySnap = await getDocs(collection(db, 'payroll_records'));
      for (const d of paySnap.docs) {
        await deleteDoc(doc(db, 'payroll_records', d.id)).catch(() => {});
      }

      const mobSnap = await getDocs(collection(db, 'mobility_records'));
      for (const d of mobSnap.docs) {
        await deleteDoc(doc(db, 'mobility_records', d.id)).catch(() => {});
      }

      const notifSnap = await getDocs(collection(db, 'notifications'));
      for (const d of notifSnap.docs) {
        await deleteDoc(doc(db, 'notifications', d.id)).catch(() => {});
      }

      // Reset categories
      for (const cat of INITIAL_ONBOARDING_CATEGORIES) {
        await setDoc(doc(db, 'onboarding_categories', cat.id), cat);
      }
    } catch (err) {
      console.warn('Blank start reset warning:', err);
    }
  };

  return (
    <HRContext.Provider
      value={{
        firebaseUser,
        activeProfile,
        allProfiles: employees,
        employees,
        onboardingCategories,
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
        deleteEmployee,
        addOnboardingCategory,
        updateOnboardingCategory,
        deleteOnboardingCategory,
        attachDocumentToCategory,
        addOnboardingTask,
        updateOnboardingTask,
        updateOnboardingTaskStatus,
        attachDocumentToTask,
        confirmTaskComprehension,
        submitLeaveRequest,
        reviewLeaveRequest,
        submitPerformanceReview,
        updatePerformanceReview,
        finalizePerformanceReview,
        updatePayrollRecord,
        updatePayrollStatus,
        disburseAllPendingPayroll,
        nominatePromotion,
        reviewPromotion,
        addJobOpening,
        markNotificationRead,
        markAllNotificationsRead,
        triggerAutomatedAlerts,
        clearToBlankStart,
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
