export type TrainingMode = 'physical' | 'online' | 'hybrid';
export type RegistrationSource = 'telegram' | 'admin' | 'portal';
export type CertificationStatus = 'in_progress' | 'eligible' | 'approved' | 'rejected' | 'revoked';
export type EmploymentStatus = 'unemployed' | 'employed' | 'self_employed' | 'internship' | 'seeking_opportunity';

export interface SessionAttendance {
  sessionId: string;
  sessionTitle: string;
  date: string;
  mode: 'physical' | 'online';
  attended: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  verifiedBy: string;
}

export interface ModuleProgress {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  completed: boolean;
  completedAt?: string;
}

export interface LmsResource {
  id: string;
  title: string;
  type: 'pdf' | 'template' | 'sheet' | 'link';
  url: string;
  size?: string;
}

export interface LmsAssignment {
  id: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  description: string;
  rubric: string[];
  maxPoints: number;
  dueDate?: string;
}

export interface LmsSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  participantId: string;
  participantName: string;
  submittedAt: string;
  content: string;
  status: 'submitted' | 'reviewed';
  grade?: number;
  maxPoints: number;
  feedback?: string;
}

export interface LmsDiscussion {
  id: string;
  lessonId: string;
  authorName: string;
  authorRole: 'learner' | 'instructor' | 'ta';
  avatar: string;
  createdAt: string;
  content: string;
  likes: number;
}

export interface LmsStudentNote {
  id: string;
  participantId: string;
  lessonId: string;
  text: string;
  timestamp: string;
  videoTime?: string;
}

export interface LmsLesson {
  id: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  videoUrl?: string;
  notes?: string;
  transcript?: string;
  resources?: LmsResource[];
  assignment?: LmsAssignment;
  order: number;
}

export interface LmsModule {
  id: string;
  code: string;
  title: string;
  durationHours: number;
  summary: string;
  topics: string[];
  lessons: LmsLesson[];
}

export interface Participant {
  id: string; // e.g. "TMS-2026-001"
  fullName: string;
  phone: string;
  email: string;
  gender: 'Female' | 'Male' | 'Other';
  organization: string; // Enterprise / SME Name
  businessSector: string; // e.g. "Agri-processing", "Textiles", "ICT & Retail"
  region: string;
  city: string;
  cohortId: string;
  trainingMode: TrainingMode;
  registrationSource: RegistrationSource;
  registeredAt: string;
  telegramUserId?: string;
  telegramUsername?: string;
  
  // LMS & Video Tracking
  completedLessonIds: string[]; // array of finished lesson IDs
  attendance: SessionAttendance[];
  moduleProgress: ModuleProgress[];
  assessmentScore: number | null; // e.g. 85 (%)
  assessmentPassed: boolean;
  assessmentAttempts: number;
  
  // Certification
  certificationStatus: CertificationStatus;
  certificateId?: string; // e.g. "CERT-2026-00042"
  certificateIssueDate?: string;
  certificateVerificationCode?: string;
  trainerRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;

  // LMIS & Employment Outcomes
  employmentStatus?: EmploymentStatus;
  currentEmployer?: string;
  placedJobId?: string;
  placedSalary?: string;
  placedDate?: string;
}

export interface Cohort {
  id: string;
  name: string;
  code: string;
  region: string;
  venue: string;
  onlinePlatform: string;
  startDate: string;
  endDate: string;
  leadTrainer: string;
  status: 'upcoming' | 'active' | 'completed';
  description: string;
}

export interface TrainingSession {
  id: string;
  cohortId: string;
  title: string;
  moduleCode: string;
  date: string;
  time: string;
  durationHours: number;
  mode: 'physical' | 'online';
  venueOrLink: string;
  trainerName: string;
  qrCheckinToken: string;
  isCompleted: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CertificationCriteria {
  minAttendancePercent: number; // default: 75
  requireAllModules: boolean;   // default: true (100%)
  minAssessmentScore: number;   // default: 70 (%)
  requireTrainerSignoff: boolean; // default: true
  autoIssueOnFinish?: boolean;
}

export interface OrgSettings {
  orgName: string;
  orgTagline: string;
  programName: string;
  programCode: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  sealText: string;
  watermarkText: string;
  certificatePrefix: string;
  supportEmail: string;
  supportPhone: string;
}

export interface SystemStats {
  totalParticipants: number;
  activeCohorts: number;
  averageAttendance: number;
  averageScore: number;
  eligibleCount: number;
  certifiedCount: number;
  inProgressCount: number;
}

// ==========================================
// Learning MIS (Learning Management Information System) Types
// ==========================================

export interface LearnerAcademicRecord {
  participantId: string;
  fullName: string;
  cohortId: string;
  cohortName: string;
  overallGpaPercent: number; // 0 - 100%
  completedModulesCount: number;
  totalModulesCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  attendanceRate: number;
  assessmentScore: number | null;
  assessmentAttempts: number;
  assignmentsSubmittedCount: number;
  averageAssignmentScore: number;
  academicStanding: 'Honors' | 'Good Standing' | 'At Risk' | 'Incomplete';
  learningHoursLogged: number;
  certificationStatus: CertificationStatus;
  certificateId?: string;
  lastActiveDate: string;
}

export interface LearningMisStats {
  totalLearners: number;
  averageProgressPercent: number;
  averageAssessmentScore: number;
  overallPassRate: number; // e.g. 88%
  assignmentSubmissionRate: number; // e.g. 92%
  atRiskCount: number;
  honorsCount: number;
  totalLearningHoursLogged: number;
  moduleMetrics: {
    moduleCode: string;
    moduleTitle: string;
    completionRate: number;
    avgScore: number;
    difficultyRating: 'Introductory' | 'Intermediate' | 'Advanced';
  }[];
  cohortHealth: {
    cohortId: string;
    cohortName: string;
    enrolledCount: number;
    completionRate: number;
    avgAttendance: number;
    avgExamScore: number;
    atRiskStudents: number;
  }[];
  itemAnalysis: {
    questionId: number;
    questionText: string;
    correctPercent: number;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
  }[];
}

// ==========================================
// Optional Labour Market / Employment Outcome Types
// ==========================================

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'apprenticeship';
export type JobStatus = 'active' | 'filled' | 'closed';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'placed' | 'rejected';

export interface JobVacancy {
  id: string;
  title: string;
  employerId: string;
  employerName: string;
  employerSector: string;
  location: string;
  workplaceType: 'on-site' | 'hybrid' | 'remote';
  jobType: JobType;
  salaryRange: string;
  openingsCount: number;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  requiredModuleCodes: string[];
  minAssessmentScore?: number;
  requiresCertification: boolean;
  postedDate: string;
  deadline: string;
  status: JobStatus;
  contactEmail: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  certificateId?: string;
  hasCertificate: boolean;
  matchScore: number; // 0 to 100%
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  employerRemarks?: string;
  interviewDate?: string;
  placedSalary?: string;
  placedDate?: string;
}

export interface EmployerPartner {
  id: string;
  name: string;
  sector: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  activeVacanciesCount: number;
  totalGraduatesHired: number;
  partnershipTier: 'Strategic Partner' | 'Hiring Partner' | 'Internship Host';
  verified: boolean;
  website?: string;
  description?: string;
}

export interface LmisMarketStats {
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  totalPlacements: number;
  placementRate: number; // e.g. 78%
  avgStartingSalary: string;
  topInDemandSkills: { skill: string; demandCount: number; growthPercent: number }[];
  sectorBreakdown: { sector: string; count: number; share: number }[];
  employmentOutcomes: {
    employed: number;
    selfEmployed: number;
    internship: number;
    seekingOpportunity: number;
  };
}

// ==========================================
// Owner & Access Delegation Control (RBAC)
// ==========================================

export type OwnerRole = 'owner' | 'instructor';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  passcode: string;
  role: OwnerRole;
  addedAt: string;
  isPrimary?: boolean;
}

export interface OwnerSession {
  userId: string;
  email: string;
  name: string;
  role: OwnerRole;
  isPrimary: boolean;
  authenticatedAt: string;
}
