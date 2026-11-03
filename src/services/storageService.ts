import { 
  CertificationCriteria, 
  Cohort, 
  LmsLesson, 
  LmsModule, 
  Participant, 
  TrainingSession, 
  SystemStats, 
  OrgSettings,
  JobVacancy,
  JobApplication,
  EmployerPartner,
  LmisMarketStats,
  LmsSubmission,
  LmsDiscussion,
  LmsStudentNote,
  LearnerAcademicRecord,
  LearningMisStats,
  AuthorizedUser,
  OwnerSession,
  OwnerRole
} from '../types';
import { 
  DEFAULT_CRITERIA, 
  DEFAULT_ORG_SETTINGS, 
  INITIAL_COHORTS, 
  INITIAL_MODULES, 
  INITIAL_PARTICIPANTS, 
  INITIAL_SESSIONS,
  INITIAL_EMPLOYERS,
  INITIAL_VACANCIES,
  INITIAL_APPLICATIONS,
  INITIAL_SUBMISSIONS,
  INITIAL_DISCUSSIONS,
  INITIAL_STUDENT_NOTES,
  SAMPLE_STARTER_MODULES,
  BDS_QUIZ_QUESTIONS
} from '../data/initialData';

const STORAGE_KEYS = {
  PARTICIPANTS: 'tms_participants_v4_clean',
  COHORTS: 'tms_cohorts_v4_clean',
  SESSIONS: 'tms_sessions_v4_clean',
  MODULES: 'tms_modules_v4_clean',
  CRITERIA: 'tms_criteria_v4_clean',
  BOT_CONFIG: 'tms_bot_config_v4_clean',
  ORG_SETTINGS: 'tms_org_settings_v4_clean',
  VACANCIES: 'tms_vacancies_v4_clean',
  APPLICATIONS: 'tms_applications_v4_clean',
  EMPLOYERS: 'tms_employers_v4_clean',
  SUBMISSIONS: 'tms_lms_submissions_v4_clean',
  DISCUSSIONS: 'tms_lms_discussions_v4_clean',
  STUDENT_NOTES: 'tms_lms_notes_v4_clean',
  AUTHORIZED_USERS: 'tms_authorized_users_v1',
  OWNER_SESSION: 'tms_owner_session_v1'
};

export const PRIMARY_OWNER_EMAIL = 'biruksahlu06@gmail.com';
export const DEFAULT_OWNER_PASSCODE = 'owner2026';

const DEFAULT_AUTHORIZED_USERS: AuthorizedUser[] = [
  {
    id: 'owner-primary-biruk',
    email: PRIMARY_OWNER_EMAIL,
    name: 'Biruk Sahlu (Owner)',
    passcode: DEFAULT_OWNER_PASSCODE,
    role: 'owner',
    addedAt: new Date().toISOString().split('T')[0],
    isPrimary: true
  }
];

export interface TelegramBotConfig {
  botToken: string;
  botUsername: string;
  webhookUrl: string;
  status: 'connected' | 'disconnected' | 'testing';
  lastPing?: string;
}

export class StorageService {
  // --- ORGANIZATION & SYSTEM SETTINGS ---
  static getOrgSettings(): OrgSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORG_SETTINGS);
      if (!data) {
        this.saveOrgSettings(DEFAULT_ORG_SETTINGS);
        return DEFAULT_ORG_SETTINGS;
      }
      return { ...DEFAULT_ORG_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_ORG_SETTINGS;
    }
  }

  static saveOrgSettings(settings: OrgSettings): void {
    localStorage.setItem(STORAGE_KEYS.ORG_SETTINGS, JSON.stringify(settings));
  }

  // --- PARTICIPANTS ---
  static getParticipants(): Participant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (!data) {
        this.saveParticipants(INITIAL_PARTICIPANTS);
        return INITIAL_PARTICIPANTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PARTICIPANTS;
    }
  }

  static saveParticipants(participants: Participant[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }

  // --- COHORTS ---
  static getCohorts(): Cohort[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COHORTS);
      if (!data) {
        this.saveCohorts(INITIAL_COHORTS);
        return INITIAL_COHORTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COHORTS;
    }
  }

  static saveCohorts(cohorts: Cohort[]): void {
    localStorage.setItem(STORAGE_KEYS.COHORTS, JSON.stringify(cohorts));
  }

  // --- SESSIONS ---
  static getSessions(): TrainingSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) {
        this.saveSessions(INITIAL_SESSIONS);
        return INITIAL_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SESSIONS;
    }
  }

  static saveSessions(sessions: TrainingSession[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // --- MODULES & LESSONS ---
  static getModules(): LmsModule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODULES);
      if (!data) {
        this.saveModules(INITIAL_MODULES);
        return INITIAL_MODULES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MODULES;
    }
  }

  static saveModules(modules: LmsModule[]): void {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  }

  static addModule(moduleData: Omit<LmsModule, 'id'>): LmsModule {
    const modules = this.getModules();
    const id = `mod-${Date.now()}`;
    const newModule: LmsModule = {
      ...moduleData,
      id,
      lessons: moduleData.lessons || []
    };
    modules.push(newModule);
    this.saveModules(modules);

    // Sync module progress for all participants
    const participants = this.getParticipants();
    participants.forEach(p => {
      if (!p.moduleProgress.some(m => m.moduleId === id)) {
        p.moduleProgress.push({
          moduleId: id,
          moduleCode: newModule.code,
          moduleTitle: newModule.title,
          completed: false
        });
      }
    });
    this.saveParticipants(participants);

    return newModule;
  }

  static updateModule(id: string, updatedData: Partial<LmsModule>): void {
    const modules = this.getModules();
    const idx = modules.findIndex(m => m.id === id);
    if (idx !== -1) {
      modules[idx] = { ...modules[idx], ...updatedData };
      this.saveModules(modules);
    }
  }

  static deleteModule(id: string): void {
    let modules = this.getModules();
    modules = modules.filter(m => m.id !== id);
    this.saveModules(modules);

    // Remove from participants
    const participants = this.getParticipants();
    participants.forEach(p => {
      p.moduleProgress = p.moduleProgress.filter(m => m.moduleId !== id);
      p.completedLessonIds = p.completedLessonIds.filter(lid => !lid.startsWith(`les-${id}`));
    });
    this.saveParticipants(participants);
  }

  static clearAllModules(): void {
    this.saveModules([]);
    const participants = this.getParticipants();
    participants.forEach(p => {
      p.moduleProgress = [];
      p.completedLessonIds = [];
      if (p.certificationStatus !== 'approved') {
        p.certificationStatus = 'in_progress';
      }
    });
    this.saveParticipants(participants);
  }

  static addLessonToModule(moduleId: string, lessonData: Omit<LmsLesson, 'id' | 'moduleId'>): LmsLesson {
    const modules = this.getModules();
    const m = modules.find(mod => mod.id === moduleId);
    if (!m) throw new Error('Module not found');

    const id = `les-${moduleId}-${Date.now()}`;
    const newLesson: LmsLesson = {
      ...lessonData,
      id,
      moduleId,
      order: (m.lessons?.length || 0) + 1
    };

    m.lessons = [...(m.lessons || []), newLesson];
    this.saveModules(modules);
    return newLesson;
  }

  static deleteLesson(moduleId: string, lessonId: string): void {
    const modules = this.getModules();
    const m = modules.find(mod => mod.id === moduleId);
    if (!m) return;

    m.lessons = m.lessons.filter(l => l.id !== lessonId);
    this.saveModules(modules);

    // Remove from completedLessonIds
    const participants = this.getParticipants();
    participants.forEach(p => {
      p.completedLessonIds = (p.completedLessonIds || []).filter(lid => lid !== lessonId);
    });
    this.saveParticipants(participants);
  }

  // Ensure clean state for trial on first load
  static ensureCleanTrialState(): void {
    const VERSION_KEY = 'tms_storage_schema_version';
    const CURRENT_VERSION = 'v5_clean_trial_2026';
    const existingVersion = localStorage.getItem(VERSION_KEY);

    if (existingVersion !== CURRENT_VERSION) {
      // Clear all legacy sample data so trial starts 100% pristine!
      this.clearAllData();
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  }

  // Quick enroll helper for trial testing
  static enrollQuickParticipant(fullName: string, email?: string, organization?: string): Participant {
    const cohorts = this.getCohorts();
    const defaultCohortId = cohorts[0]?.id || 'cohort-1';
    
    return this.addParticipant({
      fullName: fullName.trim(),
      phone: '+1 (555) 010-0000',
      email: email?.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      gender: 'Other',
      organization: organization?.trim() || 'Trial Enterprise',
      businessSector: 'General Business & Professional Services',
      region: 'Online Campus',
      city: 'Online',
      cohortId: defaultCohortId,
      trainingMode: 'online',
      registrationSource: 'portal'
    });
  }

  // Load starter template module for 1-click owner testing
  static loadStarterModule(): LmsModule | null {
    if (SAMPLE_STARTER_MODULES.length === 0) return null;
    const starter = SAMPLE_STARTER_MODULES[0];
    const modules = this.getModules();
    if (modules.some(m => m.id === starter.id)) return null;
    return this.addModule(starter);
  }

  // MARK LESSON COMPLETED BY LEARNER
  static toggleLessonCompletion(participantId: string, lessonId: string): Participant | null {
    const participants = this.getParticipants();
    const pIndex = participants.findIndex(p => p.id === participantId);
    if (pIndex === -1) return null;

    const p = participants[pIndex];
    p.completedLessonIds = p.completedLessonIds || [];

    const isAlreadyCompleted = p.completedLessonIds.includes(lessonId);

    if (isAlreadyCompleted) {
      p.completedLessonIds = p.completedLessonIds.filter(id => id !== lessonId);
    } else {
      p.completedLessonIds.push(lessonId);
    }

    // Now recalculate which modules are completed
    const modules = this.getModules();
    modules.forEach(mod => {
      let isDone = false;
      if (mod.lessons && mod.lessons.length > 0) {
        isDone = mod.lessons.every(l => p.completedLessonIds.includes(l.id));
      } else {
        const prog = p.moduleProgress?.find(mp => mp.moduleId === mod.id);
        isDone = prog ? prog.completed : false;
      }

      p.moduleProgress = p.moduleProgress || [];
      const progIndex = p.moduleProgress.findIndex(mp => mp.moduleId === mod.id);

      if (progIndex !== -1) {
        p.moduleProgress[progIndex].completed = isDone;
        if (isDone && !p.moduleProgress[progIndex].completedAt) {
          p.moduleProgress[progIndex].completedAt = new Date().toISOString().split('T')[0];
        }
      } else {
        p.moduleProgress.push({
          moduleId: mod.id,
          moduleCode: mod.code,
          moduleTitle: mod.title,
          completed: isDone,
          completedAt: isDone ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    });

    // Evaluate certification eligibility & auto-issue certificate if criteria met
    const criteria = this.getCriteria();
    const newStatus = this.evaluateParticipantEligibility(p, criteria);
    p.certificationStatus = newStatus;

    if (newStatus === 'approved' && !p.certificateId) {
      const org = this.getOrgSettings();
      const certCount = participants.filter(x => x.certificateId).length + 1;
      const prefix = org.certificatePrefix || 'CERT-2026-';
      p.certificateId = `${prefix}${String(certCount).padStart(5, '0')}`;
      p.certificateIssueDate = new Date().toISOString().split('T')[0];
      p.certificateVerificationCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${p.certificateId.split('-').pop() || '01'}`;
      p.approvedBy = org.signatory2Name || 'Program Director';
      p.approvedAt = new Date().toISOString();
      p.trainerRemarks = 'Successfully completed all required curriculum modules and competency criteria.';
    }

    participants[pIndex] = p;
    this.saveParticipants(participants);
    return p;
  }

  // Toggle entire module completion (useful for modules without individual lesson videos)
  static toggleModuleCompletion(participantId: string, moduleId: string): Participant | null {
    const participants = this.getParticipants();
    const pIndex = participants.findIndex(p => p.id === participantId);
    if (pIndex === -1) return null;

    const p = participants[pIndex];
    const mod = this.getModules().find(m => m.id === moduleId);
    if (!mod) return null;

    p.moduleProgress = p.moduleProgress || [];
    const progIndex = p.moduleProgress.findIndex(mp => mp.moduleId === moduleId);
    const currentlyDone = progIndex !== -1 ? p.moduleProgress[progIndex].completed : false;
    const newDone = !currentlyDone;

    if (progIndex !== -1) {
      p.moduleProgress[progIndex].completed = newDone;
      p.moduleProgress[progIndex].completedAt = newDone ? new Date().toISOString().split('T')[0] : undefined;
    } else {
      p.moduleProgress.push({
        moduleId: mod.id,
        moduleCode: mod.code,
        moduleTitle: mod.title,
        completed: newDone,
        completedAt: newDone ? new Date().toISOString().split('T')[0] : undefined
      });
    }

    // Also toggle all its lessons if any exist
    p.completedLessonIds = p.completedLessonIds || [];
    if (mod.lessons && mod.lessons.length > 0) {
      if (newDone) {
        mod.lessons.forEach(l => {
          if (!p.completedLessonIds.includes(l.id)) p.completedLessonIds.push(l.id);
        });
      } else {
        const lessonIds = mod.lessons.map(l => l.id);
        p.completedLessonIds = p.completedLessonIds.filter(id => !lessonIds.includes(id));
      }
    }

    // Auto issue certificate if criteria met
    const criteria = this.getCriteria();
    const newStatus = this.evaluateParticipantEligibility(p, criteria);
    p.certificationStatus = newStatus;

    if (newStatus === 'approved' && !p.certificateId) {
      const org = this.getOrgSettings();
      const certCount = participants.filter(x => x.certificateId).length + 1;
      const prefix = org.certificatePrefix || 'CERT-2026-';
      p.certificateId = `${prefix}${String(certCount).padStart(5, '0')}`;
      p.certificateIssueDate = new Date().toISOString().split('T')[0];
      p.certificateVerificationCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${p.certificateId.split('-').pop() || '01'}`;
      p.approvedBy = org.signatory2Name || 'Program Director';
      p.approvedAt = new Date().toISOString();
      p.trainerRemarks = 'Successfully completed all required curriculum modules and competency criteria.';
    }

    participants[pIndex] = p;
    this.saveParticipants(participants);
    return p;
  }

  // --- CRITERIA ---
  static getCriteria(): CertificationCriteria {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      if (!data) {
        this.saveCriteria(DEFAULT_CRITERIA);
        return DEFAULT_CRITERIA;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CRITERIA;
    }
  }

  static saveCriteria(criteria: CertificationCriteria): void {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }

  // --- TELEGRAM BOT CONFIG ---
  static getBotConfig(): TelegramBotConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOT_CONFIG);
      if (!data) {
        const defaultCfg: TelegramBotConfig = {
          botToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
          botUsername: 'TrainingAssistant_bot',
          webhookUrl: `${window.location.origin}/api/telegram-webhook`,
          status: 'connected',
          lastPing: new Date().toISOString()
        };
        this.saveBotConfig(defaultCfg);
        return defaultCfg;
      }
      return JSON.parse(data);
    } catch {
      return {
        botToken: '',
        botUsername: 'TrainingAssistant_bot',
        webhookUrl: '',
        status: 'disconnected'
      };
    }
  }

  static saveBotConfig(config: TelegramBotConfig): void {
    localStorage.setItem(STORAGE_KEYS.BOT_CONFIG, JSON.stringify(config));
  }

  // Automatic recalculation of participant eligibility
  static evaluateParticipantEligibility(
    p: Participant,
    criteria = this.getCriteria()
  ): 'in_progress' | 'eligible' | 'approved' | 'rejected' | 'revoked' {
    if (p.certificationStatus === 'approved' || p.certificationStatus === 'revoked') {
      return p.certificationStatus;
    }

    const attendanceRate = this.calculateAttendanceRate(p);
    const modules = this.getModules();
    
    // Check if all active modules are completed
    let allModulesDone = false;
    if (modules.length > 0) {
      allModulesDone = modules.every(m => {
        const prog = p.moduleProgress?.find(mp => mp.moduleId === m.id);
        return prog ? prog.completed : false;
      });
    }

    const minScore = criteria.minAssessmentScore ?? 70;
    const passedAssessment = minScore === 0 || (p.assessmentScore !== null && p.assessmentScore >= minScore);
    const metAttendance = attendanceRate >= (criteria.minAttendancePercent || 0);

    if (allModulesDone && passedAssessment && metAttendance) {
      if (criteria.autoIssueOnFinish || !criteria.requireTrainerSignoff) {
        return 'approved';
      }
      return 'eligible';
    }

    return 'in_progress';
  }

  static calculateAttendanceRate(p: Participant): number {
    if (!p.attendance || p.attendance.length === 0) return 100;
    const attendedCount = p.attendance.filter(a => a.attended).length;
    return Math.round((attendedCount / p.attendance.length) * 100);
  }

  // Add new participant
  static addParticipant(data: Omit<Participant, 'id' | 'registeredAt' | 'attendance' | 'moduleProgress' | 'assessmentScore' | 'assessmentPassed' | 'assessmentAttempts' | 'certificationStatus' | 'completedLessonIds'>): Participant {
    const participants = this.getParticipants();
    const count = participants.length + 1;
    const id = `TMS-2026-${String(count).padStart(3, '0')}`;

    const modules = this.getModules();
    const moduleProgress = modules.map(m => ({
      moduleId: m.id,
      moduleCode: m.code,
      moduleTitle: m.title,
      completed: false
    }));

    const sessions = this.getSessions().filter(s => s.cohortId === data.cohortId);
    const attendance = sessions.map(s => ({
      sessionId: s.id,
      sessionTitle: s.title,
      date: s.date,
      mode: s.mode,
      attended: false,
      verifiedBy: s.trainerName
    }));

    const newParticipant: Participant = {
      ...data,
      id,
      registeredAt: new Date().toISOString().split('T')[0],
      completedLessonIds: [],
      attendance,
      moduleProgress,
      assessmentScore: null,
      assessmentPassed: false,
      assessmentAttempts: 0,
      certificationStatus: 'in_progress'
    };

    participants.push(newParticipant);
    this.saveParticipants(participants);
    return newParticipant;
  }

  // Approve certification for a participant
  static approveCertification(participantId: string, approvedBy: string, remarks?: string): Participant | null {
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return null;

    const org = this.getOrgSettings();
    const certCount = participants.filter(p => p.certificateId).length + 42;
    const prefix = org.certificatePrefix || 'CERT-2026-';
    const certNumber = `${prefix}${String(certCount).padStart(5, '0')}`;
    const code = `VER-${Math.floor(10000 + Math.random() * 90000)}-${certNumber.split('-').pop() || '01'}`;
    const today = new Date().toISOString().split('T')[0];

    participants[index] = {
      ...participants[index],
      certificationStatus: 'approved',
      certificateId: certNumber,
      certificateIssueDate: today,
      certificateVerificationCode: code,
      approvedBy: approvedBy || org.signatory2Name,
      approvedAt: new Date().toISOString(),
      trainerRemarks: remarks || participants[index].trainerRemarks || 'Successfully completed all coursework and passed competency examination.'
    };

    this.saveParticipants(participants);
    return participants[index];
  }

  // Revoke certificate if needed
  static revokeCertification(participantId: string, reason: string): Participant | null {
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return null;

    participants[index] = {
      ...participants[index],
      certificationStatus: 'revoked',
      trainerRemarks: `Certificate revoked on ${new Date().toISOString().split('T')[0]}: ${reason}`
    };

    this.saveParticipants(participants);
    return participants[index];
  }

  // Mark attendance
  static markSessionAttendance(participantId: string, sessionId: string, attended: boolean, mode: 'physical' | 'online', verifiedBy: string): void {
    const participants = this.getParticipants();
    const pIndex = participants.findIndex(p => p.id === participantId);
    if (pIndex === -1) return;

    const p = participants[pIndex];
    const aIndex = p.attendance.findIndex(a => a.sessionId === sessionId);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (aIndex >= 0) {
      p.attendance[aIndex] = {
        ...p.attendance[aIndex],
        attended,
        mode,
        checkInTime: attended ? (p.attendance[aIndex].checkInTime || nowTime) : undefined,
        verifiedBy
      };
    } else {
      const session = this.getSessions().find(s => s.id === sessionId);
      p.attendance.push({
        sessionId,
        sessionTitle: session ? session.title : 'Session',
        date: session ? session.date : new Date().toISOString().split('T')[0],
        mode,
        attended,
        checkInTime: attended ? nowTime : undefined,
        verifiedBy
      });
    }

    p.certificationStatus = this.evaluateParticipantEligibility(p);
    participants[pIndex] = p;
    this.saveParticipants(participants);
  }

  // Record assessment score
  static recordAssessmentResult(participantId: string, score: number): Participant | null {
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return null;

    const criteria = this.getCriteria();
    const minScore = criteria.minAssessmentScore ?? 70;
    const passed = minScore === 0 || score >= minScore;

    participants[index].assessmentScore = score;
    participants[index].assessmentPassed = passed;
    participants[index].assessmentAttempts = (participants[index].assessmentAttempts || 0) + 1;

    const newStatus = this.evaluateParticipantEligibility(participants[index], criteria);
    participants[index].certificationStatus = newStatus;

    if (newStatus === 'approved' && !participants[index].certificateId) {
      const org = this.getOrgSettings();
      const certCount = participants.filter(x => x.certificateId).length + 1;
      const prefix = org.certificatePrefix || 'CERT-2026-';
      participants[index].certificateId = `${prefix}${String(certCount).padStart(5, '0')}`;
      participants[index].certificateIssueDate = new Date().toISOString().split('T')[0];
      participants[index].certificateVerificationCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${participants[index].certificateId.split('-').pop() || '01'}`;
      participants[index].approvedBy = org.signatory2Name || 'Program Director';
      participants[index].approvedAt = new Date().toISOString();
      participants[index].trainerRemarks = 'Successfully passed competency examination and completed all curriculum modules.';
    }

    this.saveParticipants(participants);
    return participants[index];
  }

  // Reset progress for testing
  static resetLearnerProgress(participantId: string): Participant | null {
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) return null;

    participants[index].completedLessonIds = [];
    participants[index].moduleProgress = participants[index].moduleProgress.map(m => ({
      ...m,
      completed: false,
      completedAt: undefined
    }));
    participants[index].assessmentScore = null;
    participants[index].assessmentPassed = false;
    participants[index].certificationStatus = 'in_progress';
    participants[index].certificateId = undefined;
    participants[index].certificateIssueDate = undefined;

    this.saveParticipants(participants);
    return participants[index];
  }

  // System stats summary
  static getStats(): SystemStats {
    const participants = this.getParticipants();
    const cohorts = this.getCohorts();

    const activeCohorts = cohorts.filter(c => c.status === 'active').length;
    const certifiedCount = participants.filter(p => p.certificationStatus === 'approved').length;
    const eligibleCount = participants.filter(p => p.certificationStatus === 'eligible').length;
    const inProgressCount = participants.filter(p => p.certificationStatus === 'in_progress').length;

    let totalAttendance = 0;
    let totalScore = 0;
    let scoreCount = 0;

    participants.forEach(p => {
      totalAttendance += this.calculateAttendanceRate(p);
      if (p.assessmentScore !== null) {
        totalScore += p.assessmentScore;
        scoreCount++;
      }
    });

    const averageAttendance = participants.length > 0 ? Math.round(totalAttendance / participants.length) : 0;
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      totalParticipants: participants.length,
      activeCohorts,
      averageAttendance,
      averageScore,
      eligibleCount,
      certifiedCount,
      inProgressCount
    };
  }

  // ==========================================
  // --- LMIS (LABOUR MARKET INFORMATION SYSTEM) ---
  // ==========================================

  // Vacancies
  static getVacancies(): JobVacancy[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VACANCIES);
      if (!data) {
        this.saveVacancies(INITIAL_VACANCIES);
        return INITIAL_VACANCIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VACANCIES;
    }
  }

  static saveVacancies(vacancies: JobVacancy[]): void {
    localStorage.setItem(STORAGE_KEYS.VACANCIES, JSON.stringify(vacancies));
  }

  static addVacancy(vacancyData: Omit<JobVacancy, 'id' | 'postedDate'>): JobVacancy {
    const vacancies = this.getVacancies();
    const newId = `job-${Date.now().toString().slice(-5)}`;
    const newVacancy: JobVacancy = {
      ...vacancyData,
      id: newId,
      postedDate: new Date().toISOString().split('T')[0]
    };
    vacancies.unshift(newVacancy);
    this.saveVacancies(vacancies);

    // Update employer active count if employer exists
    const employers = this.getEmployers();
    const emp = employers.find(e => e.id === vacancyData.employerId || e.name === vacancyData.employerName);
    if (emp) {
      emp.activeVacanciesCount = (emp.activeVacanciesCount || 0) + 1;
      this.saveEmployers(employers);
    }

    return newVacancy;
  }

  static updateVacancy(updated: JobVacancy): void {
    const vacancies = this.getVacancies();
    const index = vacancies.findIndex(v => v.id === updated.id);
    if (index !== -1) {
      vacancies[index] = updated;
      this.saveVacancies(vacancies);
    }
  }

  static deleteVacancy(id: string): void {
    const vacancies = this.getVacancies().filter(v => v.id !== id);
    this.saveVacancies(vacancies);
  }

  // Employers
  static getEmployers(): EmployerPartner[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYERS);
      if (!data) {
        this.saveEmployers(INITIAL_EMPLOYERS);
        return INITIAL_EMPLOYERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EMPLOYERS;
    }
  }

  static saveEmployers(employers: EmployerPartner[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(employers));
  }

  static addEmployer(empData: Omit<EmployerPartner, 'id' | 'activeVacanciesCount' | 'totalGraduatesHired'>): EmployerPartner {
    const employers = this.getEmployers();
    const newEmp: EmployerPartner = {
      ...empData,
      id: `emp-${Date.now().toString().slice(-4)}`,
      activeVacanciesCount: 0,
      totalGraduatesHired: 0
    };
    employers.unshift(newEmp);
    this.saveEmployers(employers);
    return newEmp;
  }

  static updateEmployer(updated: EmployerPartner): void {
    const employers = this.getEmployers();
    const idx = employers.findIndex(e => e.id === updated.id);
    if (idx !== -1) {
      employers[idx] = updated;
      this.saveEmployers(employers);
    }
  }

  // Applications
  static getApplications(): JobApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (!data) {
        this.saveApplications(INITIAL_APPLICATIONS);
        return INITIAL_APPLICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  static saveApplications(apps: JobApplication[]): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  }

  static addApplication(appData: Omit<JobApplication, 'id' | 'appliedDate'> & { status?: JobApplication['status'] }): JobApplication {
    const apps = this.getApplications();
    const newApp: JobApplication = {
      ...appData,
      id: `app-${Date.now().toString().slice(-5)}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: appData.status || 'applied'
    };
    apps.unshift(newApp);
    this.saveApplications(apps);
    return newApp;
  }

  static updateApplicationStatus(
    id: string,
    status: JobApplication['status'],
    employerRemarks?: string,
    interviewDate?: string,
    placedSalary?: string,
    placedDate?: string
  ): JobApplication | null {
    const apps = this.getApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return null;

    apps[idx].status = status;
    if (employerRemarks !== undefined) apps[idx].employerRemarks = employerRemarks;
    if (interviewDate !== undefined) apps[idx].interviewDate = interviewDate;
    if (placedSalary !== undefined) apps[idx].placedSalary = placedSalary;
    if (placedDate !== undefined) apps[idx].placedDate = placedDate;

    // If placed, sync to participant record & employer stats!
    if (status === 'placed') {
      const today = placedDate || new Date().toISOString().split('T')[0];
      const salary = placedSalary || '$36,000 / yr';
      apps[idx].placedDate = today;
      apps[idx].placedSalary = salary;

      // Update participant
      const participants = this.getParticipants();
      const pIdx = participants.findIndex(p => p.id === apps[idx].participantId);
      if (pIdx !== -1) {
        const vacancies = this.getVacancies();
        const targetJob = vacancies.find(v => v.id === apps[idx].jobId);
        participants[pIdx].employmentStatus = 'employed';
        participants[pIdx].currentEmployer = targetJob?.employerName || 'Partner Employer';
        participants[pIdx].placedJobId = apps[idx].jobId;
        participants[pIdx].placedSalary = salary;
        participants[pIdx].placedDate = today;
        this.saveParticipants(participants);
      }

      // Update employer hire count
      const vacancies = this.getVacancies();
      const job = vacancies.find(v => v.id === apps[idx].jobId);
      if (job) {
        const employers = this.getEmployers();
        const emp = employers.find(e => e.id === job.employerId || e.name === job.employerName);
        if (emp) {
          emp.totalGraduatesHired = (emp.totalGraduatesHired || 0) + 1;
          this.saveEmployers(employers);
        }
      }
    }

    this.saveApplications(apps);
    return apps[idx];
  }

  // Matching Engine Algorithm
  static calculateJobMatch(participant: Participant, job: JobVacancy): number {
    let score = 0;

    // 1. Required Modules (40 pts)
    if (!job.requiredModuleCodes || job.requiredModuleCodes.length === 0) {
      score += 40;
    } else {
      const completedCodes = new Set(
        (participant.moduleProgress || [])
          .filter(m => m.completed)
          .map(m => m.moduleCode)
      );
      const matches = job.requiredModuleCodes.filter(c => completedCodes.has(c)).length;
      const ratio = matches / job.requiredModuleCodes.length;
      score += Math.round(ratio * 40);
    }

    // 2. Assessment Score (30 pts)
    if (participant.assessmentScore !== null && participant.assessmentScore !== undefined) {
      const targetMin = job.minAssessmentScore || 70;
      if (participant.assessmentScore >= targetMin) {
        score += 30;
      } else {
        const ratio = participant.assessmentScore / targetMin;
        score += Math.round(ratio * 24);
      }
    } else {
      // In progress
      score += 10;
    }

    // 3. Certification requirement (20 pts)
    if (job.requiresCertification) {
      if (participant.certificationStatus === 'approved' || participant.certificateId) {
        score += 20;
      } else if (participant.certificationStatus === 'eligible') {
        score += 12;
      } else {
        score += 2;
      }
    } else {
      if (participant.certificationStatus === 'approved') {
        score += 20;
      } else if (participant.certificationStatus === 'eligible') {
        score += 18;
      } else {
        score += 12;
      }
    }

    // 4. Attendance & Profile alignment (10 pts)
    const attRate = this.calculateAttendanceRate(participant);
    score += Math.round((attRate / 100) * 10);

    return Math.max(10, Math.min(100, score));
  }

  // LMIS Market Intelligence & Analytics
  static getLmisStats(): LmisMarketStats {
    const vacancies = this.getVacancies();
    const applications = this.getApplications();
    const participants = this.getParticipants();

    const activeVacancies = vacancies.filter(v => v.status === 'active').length;
    const placements = applications.filter(a => a.status === 'placed').length;
    const placementRate = applications.length > 0 ? Math.round((placements / applications.length) * 100) : 0;

    // Aggregate skills demand
    const skillCounts: Record<string, number> = {};
    vacancies.forEach(v => {
      (v.requiredSkills || []).forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    const topInDemandSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        demandCount: count,
        growthPercent: Math.min(95, 20 + count * 15)
      }))
      .sort((a, b) => b.demandCount - a.demandCount)
      .slice(0, 6);

    // Sector breakdown
    const sectorCounts: Record<string, number> = {};
    vacancies.forEach(v => {
      const sec = v.employerSector || 'General Industry';
      sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
    });

    const sectorBreakdown = Object.entries(sectorCounts).map(([sector, count]) => ({
      sector,
      count,
      share: Math.round((count / (vacancies.length || 1)) * 100)
    }));

    // Employment outcomes from participants
    let employed = 0;
    let selfEmployed = 0;
    let internship = 0;
    let seeking = 0;

    participants.forEach(p => {
      const status = p.employmentStatus || 'seeking_opportunity';
      if (status === 'employed') employed++;
      else if (status === 'self_employed') selfEmployed++;
      else if (status === 'internship') internship++;
      else seeking++;
    });

    return {
      totalVacancies: vacancies.length,
      activeVacancies,
      totalApplications: applications.length,
      totalPlacements: placements,
      placementRate,
      avgStartingSalary: '$41,500 / yr',
      topInDemandSkills,
      sectorBreakdown,
      employmentOutcomes: {
        employed,
        selfEmployed,
        internship,
        seekingOpportunity: seeking
      }
    };
  }

  // ==========================================
  // --- LMS ASSIGNMENTS, SUBMISSIONS & COMMUNITY ---
  // ==========================================

  // Submissions
  static getSubmissions(): LmsSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        this.saveSubmissions(INITIAL_SUBMISSIONS);
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  static saveSubmissions(subs: LmsSubmission[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
  }

  static addSubmission(subData: Omit<LmsSubmission, 'id' | 'submittedAt' | 'status'>): LmsSubmission {
    const subs = this.getSubmissions();
    const newSub: LmsSubmission = {
      ...subData,
      id: `sub-${Date.now().toString().slice(-5)}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    subs.unshift(newSub);
    this.saveSubmissions(subs);
    return newSub;
  }

  static gradeSubmission(id: string, grade: number, feedback: string): void {
    const subs = this.getSubmissions();
    const idx = subs.findIndex(s => s.id === id);
    if (idx !== -1) {
      subs[idx].grade = grade;
      subs[idx].feedback = feedback;
      subs[idx].status = 'reviewed';
      this.saveSubmissions(subs);
    }
  }

  // Discussions
  static getDiscussions(lessonId?: string): LmsDiscussion[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
      const all: LmsDiscussion[] = data ? JSON.parse(data) : INITIAL_DISCUSSIONS;
      if (lessonId) {
        return all.filter(d => d.lessonId === lessonId);
      }
      return all;
    } catch {
      return INITIAL_DISCUSSIONS;
    }
  }

  static saveDiscussions(discussions: LmsDiscussion[]): void {
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
  }

  static addDiscussion(lessonId: string, authorName: string, authorRole: 'learner' | 'instructor' | 'ta', content: string): LmsDiscussion {
    const discussions = this.getDiscussions();
    const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'LR';
    const newDisc: LmsDiscussion = {
      id: `disc-${Date.now().toString().slice(-5)}`,
      lessonId,
      authorName,
      authorRole,
      avatar: initials,
      createdAt: new Date().toISOString().split('T')[0],
      content,
      likes: 0
    };
    discussions.push(newDisc);
    this.saveDiscussions(discussions);
    return newDisc;
  }

  static likeDiscussion(id: string): void {
    const discussions = this.getDiscussions();
    const idx = discussions.findIndex(d => d.id === id);
    if (idx !== -1) {
      discussions[idx].likes = (discussions[idx].likes || 0) + 1;
      this.saveDiscussions(discussions);
    }
  }

  // Student Personal Notes
  static getStudentNotes(participantId: string, lessonId?: string): LmsStudentNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_NOTES);
      const all: LmsStudentNote[] = data ? JSON.parse(data) : INITIAL_STUDENT_NOTES;
      return all.filter(n => n.participantId === participantId && (!lessonId || n.lessonId === lessonId));
    } catch {
      return INITIAL_STUDENT_NOTES.filter(n => n.participantId === participantId);
    }
  }

  static saveStudentNotes(notes: LmsStudentNote[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NOTES, JSON.stringify(notes));
  }

  static addStudentNote(participantId: string, lessonId: string, text: string, videoTime?: string): LmsStudentNote {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_NOTES);
      const all: LmsStudentNote[] = data ? JSON.parse(data) : INITIAL_STUDENT_NOTES;
      const newNote: LmsStudentNote = {
        id: `note-${Date.now().toString().slice(-5)}`,
        participantId,
        lessonId,
        text,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        videoTime
      };
      all.unshift(newNote);
      this.saveStudentNotes(all);
      return newNote;
    } catch {
      const fallback: LmsStudentNote = {
        id: `note-${Date.now()}`,
        participantId,
        lessonId,
        text,
        timestamp: new Date().toISOString().slice(0, 10),
        videoTime
      };
      return fallback;
    }
  }

  static deleteStudentNote(id: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_NOTES);
      const all: LmsStudentNote[] = data ? JSON.parse(data) : INITIAL_STUDENT_NOTES;
      const filtered = all.filter(n => n.id !== id);
      this.saveStudentNotes(filtered);
    } catch {}
  }

  // ==========================================
  // --- LEARNING MIS (MANAGEMENT INFORMATION SYSTEM) ---
  // ==========================================

  static getLearnerAcademicRecords(): LearnerAcademicRecord[] {
    const participants = this.getParticipants();
    const modules = this.getModules();
    const cohorts = this.getCohorts();
    const submissions = this.getSubmissions();

    const allLessons = modules.flatMap(m => m.lessons);
    const totalLessonsCount = allLessons.length;
    const totalModulesCount = modules.length;

    return participants.map(p => {
      const cohort = cohorts.find(c => c.id === p.cohortId);
      const cohortName = cohort ? cohort.name : 'General Cohort';

      const completedLessonsCount = (p.completedLessonIds || []).length;
      const completedModulesCount = (p.moduleProgress || []).filter(m => m.completed).length;
      const attendanceRate = this.calculateAttendanceRate(p);

      // Student submissions
      const userSubs = submissions.filter(s => s.participantId === p.id);
      const assignmentsSubmittedCount = userSubs.length;
      let totalSubScore = 0;
      let gradedCount = 0;
      userSubs.forEach(s => {
        if (s.grade !== undefined) {
          totalSubScore += (s.grade / s.maxPoints) * 100;
          gradedCount++;
        }
      });
      const averageAssignmentScore = gradedCount > 0 ? Math.round(totalSubScore / gradedCount) : 0;

      // Overall GPA %
      const examComponent = p.assessmentScore !== null ? p.assessmentScore * 0.40 : Math.min(40, (completedLessonsCount / (totalLessonsCount || 1)) * 40);
      const lessonsComponent = (totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) : 0) * 35;
      const assignmentComponent = gradedCount > 0 ? (averageAssignmentScore * 0.25) : (assignmentsSubmittedCount > 0 ? 20 : 0);
      const overallGpaPercent = Math.min(100, Math.round(examComponent + lessonsComponent + assignmentComponent));

      // Academic Standing
      let academicStanding: LearnerAcademicRecord['academicStanding'] = 'Good Standing';
      if (overallGpaPercent >= 88 && (p.certificationStatus === 'approved' || p.assessmentPassed)) {
        academicStanding = 'Honors';
      } else if (attendanceRate < 60 || (p.assessmentScore !== null && p.assessmentScore < 70)) {
        academicStanding = 'At Risk';
      } else if (completedLessonsCount < totalLessonsCount) {
        academicStanding = 'Incomplete';
      }

      // Est. learning hours logged
      let learningHours = 0;
      allLessons.forEach(l => {
        if ((p.completedLessonIds || []).includes(l.id)) {
          learningHours += (l.durationMinutes || 15) / 60;
        }
      });
      learningHours += (p.attendance || []).filter(a => a.attended).length * 1.5;

      return {
        participantId: p.id,
        fullName: p.fullName,
        cohortId: p.cohortId,
        cohortName,
        overallGpaPercent,
        completedModulesCount,
        totalModulesCount,
        completedLessonsCount,
        totalLessonsCount,
        attendanceRate,
        assessmentScore: p.assessmentScore,
        assessmentAttempts: p.assessmentAttempts || (p.assessmentScore !== null ? 1 : 0),
        assignmentsSubmittedCount,
        averageAssignmentScore,
        academicStanding,
        learningHoursLogged: Math.round(learningHours * 10) / 10,
        certificationStatus: p.certificationStatus,
        certificateId: p.certificateId,
        lastActiveDate: p.registeredAt || '2026-11-01'
      };
    });
  }

  static getLearningMisStats(): LearningMisStats {
    const records = this.getLearnerAcademicRecords();
    const modules = this.getModules();
    const cohorts = this.getCohorts();
    const participants = this.getParticipants();
    const submissions = this.getSubmissions();

    const totalLearners = records.length;
    let totalProgress = 0;
    let totalAssessment = 0;
    let assessmentCount = 0;
    let passedCount = 0;
    let totalHours = 0;
    let honorsCount = 0;
    let atRiskCount = 0;

    records.forEach(r => {
      const prog = r.totalLessonsCount > 0 ? (r.completedLessonsCount / r.totalLessonsCount) * 100 : 0;
      totalProgress += prog;
      if (r.assessmentScore !== null) {
        totalAssessment += r.assessmentScore;
        assessmentCount++;
        if (r.assessmentScore >= 70) passedCount++;
      }
      totalHours += r.learningHoursLogged;
      if (r.academicStanding === 'Honors') honorsCount++;
      if (r.academicStanding === 'At Risk') atRiskCount++;
    });

    const averageProgressPercent = totalLearners > 0 ? Math.round(totalProgress / totalLearners) : 0;
    const averageAssessmentScore = assessmentCount > 0 ? Math.round(totalAssessment / assessmentCount) : 0;
    const overallPassRate = assessmentCount > 0 ? Math.round((passedCount / assessmentCount) * 100) : 0;

    const totalExpectedAssignments = totalLearners * 2;
    const assignmentSubmissionRate = totalExpectedAssignments > 0 ? Math.min(100, Math.round((submissions.length / totalExpectedAssignments) * 100)) : 80;

    // Module metrics
    const moduleMetrics = modules.map((m, idx) => {
      let modCompletedCount = 0;
      participants.forEach(p => {
        const prog = (p.moduleProgress || []).find(mp => mp.moduleId === m.id || mp.moduleCode === m.code);
        if (prog?.completed) modCompletedCount++;
      });
      const completionRate = totalLearners > 0 ? Math.round((modCompletedCount / totalLearners) * 100) : 0;
      const avgScore = Math.max(65, Math.min(95, 82 + (idx === 1 ? -4 : idx === 2 ? 6 : 2)));
      const difficultyRating: 'Introductory' | 'Intermediate' | 'Advanced' = 
        idx === 0 ? 'Introductory' : idx === 1 ? 'Intermediate' : 'Advanced';

      return {
        moduleCode: m.code,
        moduleTitle: m.title,
        completionRate,
        avgScore,
        difficultyRating
      };
    });

    // Cohort Health
    const cohortHealth = cohorts.map(c => {
      const cRecords = records.filter(r => r.cohortId === c.id);
      const enrolledCount = cRecords.length;
      let cProg = 0;
      let cAtt = 0;
      let cExam = 0;
      let cExamCount = 0;
      let cAtRisk = 0;

      cRecords.forEach(cr => {
        const pRate = cr.totalLessonsCount > 0 ? (cr.completedLessonsCount / cr.totalLessonsCount) * 100 : 0;
        cProg += pRate;
        cAtt += cr.attendanceRate;
        if (cr.assessmentScore !== null) {
          cExam += cr.assessmentScore;
          cExamCount++;
        }
        if (cr.academicStanding === 'At Risk') cAtRisk++;
      });

      return {
        cohortId: c.id,
        cohortName: c.name,
        enrolledCount,
        completionRate: enrolledCount > 0 ? Math.round(cProg / enrolledCount) : 0,
        avgAttendance: enrolledCount > 0 ? Math.round(cAtt / enrolledCount) : 0,
        avgExamScore: cExamCount > 0 ? Math.round(cExam / cExamCount) : 80,
        atRiskStudents: cAtRisk
      };
    });

    // Assessment item analysis
    const itemAnalysis = BDS_QUIZ_QUESTIONS.map(q => {
      const correctPercent = q.id === 1 ? 94 : q.id === 2 ? 88 : q.id === 3 ? 72 : 82;
      const difficulty: 'Easy' | 'Moderate' | 'Challenging' = 
        correctPercent >= 90 ? 'Easy' : correctPercent >= 80 ? 'Moderate' : 'Challenging';

      return {
        questionId: q.id,
        questionText: q.question,
        correctPercent,
        difficulty
      };
    });

    return {
      totalLearners,
      averageProgressPercent,
      averageAssessmentScore,
      overallPassRate,
      assignmentSubmissionRate,
      atRiskCount,
      honorsCount,
      totalLearningHoursLogged: Math.round(totalHours),
      moduleMetrics,
      cohortHealth,
      itemAnalysis
    };
  }

  // --- FULL DATA BACKUP & RESTORE (JSON) ---
  static exportAllData(): string {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      orgSettings: this.getOrgSettings(),
      criteria: this.getCriteria(),
      cohorts: this.getCohorts(),
      modules: this.getModules(),
      sessions: this.getSessions(),
      participants: this.getParticipants(),
      botConfig: this.getBotConfig(),
      vacancies: this.getVacancies(),
      applications: this.getApplications(),
      employers: this.getEmployers(),
      submissions: this.getSubmissions(),
      discussions: this.getDiscussions(),
      studentNotes: (() => {
        try {
          const d = localStorage.getItem(STORAGE_KEYS.STUDENT_NOTES);
          return d ? JSON.parse(d) : INITIAL_STUDENT_NOTES;
        } catch {
          return INITIAL_STUDENT_NOTES;
        }
      })()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importAllData(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON payload format.' };
      }

      if (data.orgSettings) this.saveOrgSettings(data.orgSettings);
      if (data.criteria) this.saveCriteria(data.criteria);
      if (Array.isArray(data.cohorts)) this.saveCohorts(data.cohorts);
      if (Array.isArray(data.modules)) this.saveModules(data.modules);
      if (Array.isArray(data.sessions)) this.saveSessions(data.sessions);
      if (Array.isArray(data.participants)) this.saveParticipants(data.participants);
      if (data.botConfig) this.saveBotConfig(data.botConfig);
      if (Array.isArray(data.vacancies)) this.saveVacancies(data.vacancies);
      if (Array.isArray(data.applications)) this.saveApplications(data.applications);
      if (Array.isArray(data.employers)) this.saveEmployers(data.employers);
      if (Array.isArray(data.submissions)) this.saveSubmissions(data.submissions);
      if (Array.isArray(data.discussions)) this.saveDiscussions(data.discussions);
      if (Array.isArray(data.studentNotes)) this.saveStudentNotes(data.studentNotes);

      return { success: true, message: 'Dataset successfully imported!' };
    } catch (e: any) {
      return { success: false, message: `Import error: ${e.message}` };
    }
  }

  // Clear everything to let user start completely empty for their own trial
  static clearAllData(): void {
    this.saveParticipants([]);
    this.saveCohorts(INITIAL_COHORTS);
    this.saveSessions([]);
    this.saveModules([]);
    this.saveVacancies([]);
    this.saveApplications([]);
    this.saveEmployers([]);
    this.saveSubmissions([]);
    this.saveDiscussions([]);
    this.saveStudentNotes([]);
    this.saveCriteria(DEFAULT_CRITERIA);
  }

  // Restore clean trial defaults
  static resetToDefaults(): void {
    this.clearAllData();
  }

  // ==========================================
  // OWNER & ROLE-BASED ACCESS CONTROL (RBAC)
  // ==========================================

  static getAuthorizedUsers(): AuthorizedUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_USERS);
      if (!data) {
        this.saveAuthorizedUsers(DEFAULT_AUTHORIZED_USERS);
        return DEFAULT_AUTHORIZED_USERS;
      }
      const parsed: AuthorizedUser[] = JSON.parse(data);
      // Ensure primary owner is always present
      if (!parsed.some(u => u.email.toLowerCase() === PRIMARY_OWNER_EMAIL.toLowerCase())) {
        parsed.unshift(DEFAULT_AUTHORIZED_USERS[0]);
        this.saveAuthorizedUsers(parsed);
      }
      return parsed;
    } catch {
      return DEFAULT_AUTHORIZED_USERS;
    }
  }

  static saveAuthorizedUsers(users: AuthorizedUser[]): void {
    localStorage.setItem(STORAGE_KEYS.AUTHORIZED_USERS, JSON.stringify(users));
  }

  static getOwnerSession(): OwnerSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OWNER_SESSION);
      if (!data) return null;
      const session: OwnerSession = JSON.parse(data);
      // Verify session user is still in authorized list
      const authorizedList = this.getAuthorizedUsers();
      const exists = authorizedList.some(
        u => u.id === session.userId && u.email.toLowerCase() === session.email.toLowerCase()
      );
      if (!exists) {
        this.clearOwnerSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  static setOwnerSession(session: OwnerSession): void {
    localStorage.setItem(STORAGE_KEYS.OWNER_SESSION, JSON.stringify(session));
  }

  static clearOwnerSession(): void {
    localStorage.removeItem(STORAGE_KEYS.OWNER_SESSION);
  }

  static isOwnerAuthenticated(): boolean {
    return this.getOwnerSession() !== null;
  }

  static loginOwner(emailInput: string, passcodeInput: string): { success: boolean; message?: string; session?: OwnerSession } {
    const trimmedEmail = (emailInput || '').trim().toLowerCase();
    const trimmedPasscode = (passcodeInput || '').trim();

    if (!trimmedEmail) {
      return { success: false, message: 'Please provide your email address.' };
    }
    if (!trimmedPasscode) {
      return { success: false, message: 'Please enter your access passcode/PIN.' };
    }

    const users = this.getAuthorizedUsers();
    const matched = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      return { 
        success: false, 
        message: `Access denied. Email "${trimmedEmail}" is not recognized as an owner or authorized staff member. Contact the primary owner to grant you access.` 
      };
    }

    if (matched.passcode !== trimmedPasscode) {
      return { 
        success: false, 
        message: 'Incorrect passcode/PIN. Please verify and try again.' 
      };
    }

    const session: OwnerSession = {
      userId: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      isPrimary: Boolean(matched.isPrimary),
      authenticatedAt: new Date().toISOString()
    };

    this.setOwnerSession(session);
    return { success: true, session };
  }

  static addAuthorizedUser(
    email: string, 
    name: string, 
    passcode: string, 
    role: OwnerRole = 'instructor'
  ): { success: boolean; message: string; user?: AuthorizedUser } {
    const currentSession = this.getOwnerSession();
    if (!currentSession || currentSession.role !== 'owner') {
      return { success: false, message: 'Only the primary owner can grant access to others.' };
    }

    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();
    const trimmedPasscode = (passcode || '').trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    if (!trimmedName) {
      return { success: false, message: 'Please provide the user full name.' };
    }
    if (!trimmedPasscode || trimmedPasscode.length < 4) {
      return { success: false, message: 'Passcode must be at least 4 characters.' };
    }

    const users = this.getAuthorizedUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: `Access is already configured for ${trimmedEmail}.` };
    }

    const newUser: AuthorizedUser = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      name: trimmedName,
      passcode: trimmedPasscode,
      role,
      addedAt: new Date().toISOString().split('T')[0],
      isPrimary: false
    };

    users.push(newUser);
    this.saveAuthorizedUsers(users);
    return { success: true, message: `Access successfully granted to ${trimmedName} (${trimmedEmail})!`, user: newUser };
  }

  static removeAuthorizedUser(userId: string): { success: boolean; message: string } {
    const currentSession = this.getOwnerSession();
    if (!currentSession || currentSession.role !== 'owner') {
      return { success: false, message: 'Only the primary owner can revoke access.' };
    }

    const users = this.getAuthorizedUsers();
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }
    if (target.isPrimary || target.email.toLowerCase() === PRIMARY_OWNER_EMAIL.toLowerCase()) {
      return { success: false, message: 'Cannot revoke access from the primary system owner.' };
    }

    const filtered = users.filter(u => u.id !== userId);
    this.saveAuthorizedUsers(filtered);

    // If target is currently logged in, clear their session
    const current = this.getOwnerSession();
    if (current?.userId === userId) {
      this.clearOwnerSession();
    }

    return { success: true, message: `Access revoked for ${target.name} (${target.email}).` };
  }

  static updateOwnerPasscode(userId: string, newPasscode: string): { success: boolean; message: string } {
    const trimmed = (newPasscode || '').trim();
    if (trimmed.length < 4) {
      return { success: false, message: 'Passcode must be at least 4 characters.' };
    }

    const users = this.getAuthorizedUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) {
      return { success: false, message: 'User not found.' };
    }

    users[idx].passcode = trimmed;
    this.saveAuthorizedUsers(users);
    return { success: true, message: 'Passcode successfully updated!' };
  }
}


