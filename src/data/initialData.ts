import { 
  Cohort, 
  LmsModule, 
  Participant, 
  QuizQuestion, 
  TrainingSession, 
  CertificationCriteria, 
  OrgSettings,
  JobVacancy,
  JobApplication,
  EmployerPartner,
  LmsSubmission,
  LmsDiscussion,
  LmsStudentNote
} from '../types';

export const DEFAULT_ORG_SETTINGS: OrgSettings = {
  orgName: 'Training & Certification Institute',
  orgTagline: 'Professional Capability & Enterprise Development',
  programName: 'Professional Training & Certification Program',
  programCode: 'TMS-2026',
  signatory1Name: 'Lead Instructor / Specialist',
  signatory1Title: 'Curriculum & Assessment Lead',
  signatory2Name: 'Program Director',
  signatory2Title: 'Certification & Accreditation Board',
  sealText: 'OFFICIAL SEAL',
  watermarkText: 'CERTIFIED',
  certificatePrefix: 'CERT-2026-',
  supportEmail: 'training-support@example.org',
  supportPhone: '+1 (555) 012-3456'
};

export const DEFAULT_CRITERIA: CertificationCriteria = {
  minAttendancePercent: 0,      // 0% so self-paced participants don't get blocked by session logs
  requireAllModules: true,       // All published modules must be completed
  minAssessmentScore: 70,       // 70% passing score on assessment
  requireTrainerSignoff: false,  // false for immediate automatic certificate generation
  autoIssueOnFinish: true
};

// CLEAN BASELINE: 1 generic cohort for trial
export const INITIAL_COHORTS: Cohort[] = [
  {
    id: 'cohort-1',
    name: 'General Training Cohort',
    code: 'TRN-2026',
    region: 'Online Campus',
    venue: 'Learning Management System Portal',
    onlinePlatform: 'Web LMS Classroom & Telegram Assistant',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    leadTrainer: 'Course Administrator',
    status: 'active',
    description: 'Primary training cohort for course modules, video lectures, and certification.'
  }
];

// Clean empty slate for trial: Owner will add modules, participants will take them
export const INITIAL_MODULES: LmsModule[] = [];

// Optional starter template module for 1-click owner testing
export const SAMPLE_STARTER_MODULES: LmsModule[] = [
  {
    id: 'mod-starter-1',
    code: 'MOD-101',
    title: 'Core Fundamentals & Strategy',
    durationHours: 3,
    summary: 'Essential concepts, operational frameworks, and practical methods for capability development.',
    topics: ['Opportunity identification', 'Framework design', 'Operational execution', 'Measuring outcomes'],
    lessons: [
      {
        id: 'les-starter-1',
        moduleId: 'mod-starter-1',
        title: 'Lesson 1: Foundations & Core Principles',
        durationMinutes: 12,
        videoUrl: 'https://www.youtube.com/watch?v=IP0cUBWTgpY',
        notes: 'Understand the foundational principles of strategy and disciplined execution. Review core frameworks and metrics before moving to practical application.',
        transcript: 'Welcome to Lesson 1. In this lesson, we introduce the essential building blocks that form the backbone of modern operations.',
        resources: [
          { id: 'res-s-1', title: 'Foundations Framework Checklist', type: 'pdf', url: '#', size: '240 KB' }
        ],
        order: 1
      },
      {
        id: 'les-starter-2',
        moduleId: 'mod-starter-1',
        title: 'Lesson 2: Practical Application & Execution',
        durationMinutes: 15,
        videoUrl: 'https://www.youtube.com/watch?v=QoAOzMTLP5s',
        notes: 'Translating strategy into concrete actionable workflows. Track unit metrics and establish feedback loops.',
        transcript: 'In this second lesson, we translate strategy into daily execution and metrics.',
        resources: [
          { id: 'res-s-2', title: 'Action Plan Template (Editable)', type: 'template', url: '#', size: '320 KB' }
        ],
        assignment: {
          id: 'asg-starter-2',
          moduleId: 'mod-starter-1',
          lessonId: 'les-starter-2',
          title: 'Practical Action Plan Submission',
          description: 'Document 3 actionable priorities and key performance indicators based on the lesson frameworks.',
          dueDate: 'Flexible',
          rubric: [
            'Clear definition of objectives (30 pts)',
            'Actionable milestones with deadlines (40 pts)',
            'Measurable evaluation criteria (30 pts)'
          ],
          maxPoints: 100
        },
        order: 2
      }
    ]
  }
];

// Clean empty submissions, discussions, notes, vacancies, employers
export const INITIAL_SUBMISSIONS: LmsSubmission[] = [];
export const INITIAL_DISCUSSIONS: LmsDiscussion[] = [];
export const INITIAL_STUDENT_NOTES: LmsStudentNote[] = [];
export const INITIAL_SESSIONS: TrainingSession[] = [];
export const INITIAL_VACANCIES: JobVacancy[] = [];
export const INITIAL_APPLICATIONS: JobApplication[] = [];
export const INITIAL_EMPLOYERS: EmployerPartner[] = [];

// Clean empty participants: Trial users or owner will enroll or add their own participants!
export const INITIAL_PARTICIPANTS: Participant[] = [];

// Standard Evaluation Assessment Questions
export const BDS_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'In modern strategy design, which element defines how an organization communicates with and delivers value to its audience?',
    options: ['Key Partners', 'Distribution Channels', 'Cost Structure', 'Revenue Streams'],
    correctIndex: 1,
    explanation: 'Distribution Channels describe how an organization communicates with and reaches its audience to deliver value.'
  },
  {
    id: 2,
    question: 'Why is it critical to establish structured tracking of operational performance and unit metrics?',
    options: [
      'It is only required for public corporations',
      'To accurately measure progress, maintain accountability, and allocate resources efficiently',
      'It reduces standard banking transaction fees',
      'It completely eliminates operational risk'
    ],
    correctIndex: 1,
    explanation: 'Structured tracking provides data-driven visibility, clear accountability, and objective resource allocation.'
  },
  {
    id: 3,
    question: 'What is the primary indicator of sustainable organizational performance?',
    options: [
      'Short-term vanity metrics',
      'Repeatable positive net cash flow and disciplined cost management',
      'Number of external endorsements',
      'Total office square footage'
    ],
    correctIndex: 1,
    explanation: 'Repeatable positive net cash flow and disciplined expenditure control are foundational to organizational longevity.'
  },
  {
    id: 4,
    question: 'Which of the following is considered best practice when establishing multi-channel outreach?',
    options: [
      'Relying solely on a single unmeasured referral path',
      'Combining direct communication channels with targeted inbound promotion and clear follow-up',
      'Withholding program details until registration is finalized',
      'Ceasing communication immediately after initial contact'
    ],
    correctIndex: 1,
    explanation: 'Effective multi-channel outreach integrates direct communication channels with consistent follow-up.'
  }
];
