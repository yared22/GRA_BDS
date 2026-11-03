import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Layers, 
  Percent, 
  Sparkles, 
  FileCheck, 
  Printer, 
  X, 
  ChevronRight, 
  HelpCircle,
  ShieldCheck,
  Send,
  Eye,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { 
  Participant, 
  LmsModule, 
  Cohort, 
  LearnerAcademicRecord, 
  LearningMisStats 
} from '../../types';
import { StorageService } from '../../services/storageService';

interface LearningMisPortalProps {
  participants: Participant[];
  modules: LmsModule[];
  cohorts: Cohort[];
  onUpdateData: () => void;
  onViewCertificate?: (p: Participant) => void;
}

type MisTab = 'gradebook' | 'competencies' | 'cohort-health' | 'item-analysis' | 'assignments-monitor' | 'compliance-audit';

export const LearningMisPortal: React.FC<LearningMisPortalProps> = ({
  participants,
  modules,
  cohorts,
  onUpdateData,
  onViewCertificate
}) => {
  const [activeTab, setActiveTab] = useState<MisTab>('gradebook');

  // Academic records & MIS stats
  const academicRecords = useMemo(() => StorageService.getLearnerAcademicRecords(), [participants, modules]);
  const misStats = useMemo(() => StorageService.getLearningMisStats(), [academicRecords, modules, cohorts]);
  const submissions = useMemo(() => StorageService.getSubmissions(), [participants]);
  const org = StorageService.getOrgSettings();

  // Filters for Gradebook
  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState('all');
  const [standingFilter, setStandingFilter] = useState('all');

  // Selected learner for academic transcript drawer
  const [selectedRecordForTranscript, setSelectedRecordForTranscript] = useState<LearnerAcademicRecord | null>(null);

  // Intervention modal state
  const [interventionAlertSent, setInterventionAlertSent] = useState<string | null>(null);

  // Filtered Gradebook records
  const filteredRecords = useMemo(() => {
    return academicRecords.filter(r => {
      const matchesSearch = 
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.participantId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCohort = cohortFilter === 'all' || r.cohortId === cohortFilter;
      const matchesStanding = standingFilter === 'all' || r.academicStanding === standingFilter;

      return matchesSearch && matchesCohort && matchesStanding;
    });
  }, [academicRecords, searchTerm, cohortFilter, standingFilter]);

  // Export Academic Ledger as CSV
  const handleExportLedgerCsv = () => {
    const rows = [
      ['Participant ID', 'Learner Name', 'Cohort', 'Overall GPA %', 'Lessons Finished', 'Attendance %', 'Exam Score %', 'Assignments Graded', 'Academic Standing', 'Certificate ID'],
      ...academicRecords.map(r => [
        r.participantId,
        `"${r.fullName}"`,
        `"${r.cohortName}"`,
        `${r.overallGpaPercent}%`,
        `${r.completedLessonsCount}/${r.totalLessonsCount}`,
        `${r.attendanceRate}%`,
        r.assessmentScore !== null ? `${r.assessmentScore}%` : 'Pending',
        r.assignmentsSubmittedCount,
        r.academicStanding,
        r.certificateId || 'N/A'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Learning_MIS_Academic_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger simulated academic tutoring notification
  const handleSendIntervention = (learnerName: string) => {
    setInterventionAlertSent(learnerName);
    setTimeout(() => setInterventionAlertSent(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Learning MIS Mission Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                <BarChart3 className="w-3.5 h-3.5 mr-1" />
                Learning Management Information System (Learning MIS)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Institutional Academic Analytics &amp; Student Transcripts
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Learning MIS &amp; Academic Performance Intelligence
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Centralized institutional monitoring of learner velocity, curriculum mastery, assignment grading, cohort health, and official academic transcript ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportLedgerCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Academic Ledger (CSV)
            </button>
            <button
              onClick={() => setActiveTab('compliance-audit')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Compliance Audit
            </button>
          </div>
        </div>

        {/* Executive Learning Analytics Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Course Completion</span>
              <Percent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {misStats.averageProgressPercent}%
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              Average across {misStats.totalLearners} enrolled learners
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Avg Assessment Score</span>
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {misStats.averageAssessmentScore}%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {misStats.overallPassRate}% exam pass rate
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Task Compliance</span>
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {misStats.assignmentSubmissionRate}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {submissions.length} practical submissions
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Learning Hours Logged</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {misStats.totalLearningHoursLogged} hrs
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              Video &amp; session instruction
            </div>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>Academic Standing</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 flex items-center justify-between">
              <span className="text-emerald-600 font-bold">{misStats.honorsCount} Honors</span>
              <span className="text-amber-500 font-bold">{misStats.atRiskCount} At Risk</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Early warning monitoring active
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Toast Notification */}
      {interventionAlertSent && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Academic tutoring support notification dispatched to {interventionAlertSent}!</span>
          </div>
          <button onClick={() => setInterventionAlertSent(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Learning MIS Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'gradebook'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          Master Gradebook ({academicRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'competencies'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          Curriculum &amp; Competency Mastery
        </button>

        <button
          onClick={() => setActiveTab('cohort-health')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'cohort-health'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Cohort Velocity &amp; Early Warning
        </button>

        <button
          onClick={() => setActiveTab('item-analysis')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'item-analysis'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          Exam Item Difficulty Analysis
        </button>

        <button
          onClick={() => setActiveTab('assignments-monitor')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'assignments-monitor'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4 text-purple-600" />
          Tasks &amp; Rubric Compliance
        </button>

        <button
          onClick={() => setActiveTab('compliance-audit')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'compliance-audit'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Compliance &amp; Accreditation Audit
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MASTER GRADEBOOK & ACADEMIC TRANSCRIPTS */}
      {/* ========================================================= */}
      {activeTab === 'gradebook' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search learner name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={cohortFilter}
                onChange={e => setCohortFilter(e.target.value)}
                aria-label="Filter gradebook by cohort"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Cohorts</option>
                {cohorts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={standingFilter}
                onChange={e => setStandingFilter(e.target.value)}
                aria-label="Filter gradebook by academic standing"
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Academic Standings</option>
                <option value="Honors">Honors Standing (≥ 88%)</option>
                <option value="Good Standing">Good Standing (≥ 70%)</option>
                <option value="At Risk">At Risk / Warning</option>
                <option value="Incomplete">Coursework Incomplete</option>
              </select>

              {(searchTerm || cohortFilter !== 'all' || standingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCohortFilter('all');
                    setStandingFilter('all');
                  }}
                  className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Master Gradebook Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Learner Profile</th>
                    <th className="px-4 py-3">Cohort</th>
                    <th className="px-4 py-3">Course Velocity</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Exam Score</th>
                    <th className="px-4 py-3">Overall GPA</th>
                    <th className="px-4 py-3">Standing</th>
                    <th className="px-4 py-3 text-right">Academic Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map(rec => (
                    <tr key={rec.participantId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {rec.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {rec.participantId}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {rec.cohortName}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.round((rec.completedLessonsCount / (rec.totalLessonsCount || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {rec.completedLessonsCount}/{rec.totalLessonsCount}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {rec.attendanceRate}%
                      </td>

                      <td className="px-4 py-3">
                        {rec.assessmentScore !== null ? (
                          <span className={`font-bold ${rec.assessmentScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                            {rec.assessmentScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not taken</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`font-extrabold text-sm ${
                          rec.overallGpaPercent >= 88 ? 'text-emerald-600 dark:text-emerald-400' :
                          rec.overallGpaPercent >= 70 ? 'text-indigo-600 dark:text-indigo-400' :
                          'text-amber-600 dark:text-amber-400'
                        }`}>
                          {rec.overallGpaPercent}%
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          rec.academicStanding === 'Honors' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          rec.academicStanding === 'Good Standing' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          rec.academicStanding === 'At Risk' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {rec.academicStanding}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecordForTranscript(rec)}
                            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Transcript</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CURRICULUM & COMPETENCY MASTERY */}
      {/* ========================================================= */}
      {activeTab === 'competencies' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {misStats.moduleMetrics.map((mod, i) => (
              <div 
                key={mod.moduleCode} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {mod.moduleCode}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    mod.difficultyRating === 'Introductory' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    mod.difficultyRating === 'Intermediate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {mod.difficultyRating}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {mod.moduleTitle}
                </h3>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Cohort Completion Rate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{mod.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${mod.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 text-slate-500">
                  <span>Average Assignment Score:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{mod.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COHORT VELOCITY & AT-RISK EARLY WARNING */}
      {/* ========================================================= */}
      {activeTab === 'cohort-health' && (
        <div className="space-y-5">
          {/* Cohort Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misStats.cohortHealth.map(c => (
              <div 
                key={c.cohortId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Cohort Academic Velocity
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {c.cohortName}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.enrolledCount} Enrolled
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">Completion</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{c.completionRate}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">Attendance</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{c.avgAttendance}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Exam</span>
                    <span className="text-lg font-bold text-emerald-600">{c.avgExamScore}%</span>
                  </div>
                </div>

                {c.atRiskStudents > 0 ? (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {c.atRiskStudents} student{c.atRiskStudents > 1 ? 's' : ''} flagged at risk
                    </span>
                    <span className="text-[10px]">Intervention recommended</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ All students on track with course timeline
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* At-Risk Learner Intervention Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Academic Early Warning &amp; Tutoring Intervention Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Learners falling behind on video lessons or scoring below 70% on assessments.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {academicRecords
                .filter(r => r.academicStanding === 'At Risk' || r.completedLessonsCount < r.totalLessonsCount / 2)
                .map(r => (
                  <div key={r.participantId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{r.fullName}</span>
                        <span className="text-xs text-slate-400 font-mono">({r.participantId})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Needs Support
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Cohort: {r.cohortName}</span>
                        <span>•</span>
                        <span>Lessons: {r.completedLessonsCount} of {r.totalLessonsCount}</span>
                        <span>•</span>
                        <span>Attendance: {r.attendanceRate}%</span>
                        <span>•</span>
                        <span>Exam: {r.assessmentScore !== null ? `${r.assessmentScore}%` : 'Not Taken'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleSendIntervention(r.fullName)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Tutoring Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}

              {academicRecords.filter(r => r.academicStanding === 'At Risk').length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No learners currently flagged for urgent academic intervention.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: EXAM ITEM DIFFICULTY & PSYCHOMETRIC ANALYSIS */}
      {/* ========================================================= */}
      {activeTab === 'item-analysis' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Assessment Question Psychometric &amp; Item Difficulty Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Item-level pass rate analysis to identify curriculum concepts that may require reinforcement or instructional refinement.
            </p>
          </div>

          <div className="space-y-3">
            {misStats.itemAnalysis.map(q => (
              <div 
                key={q.questionId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Question #{q.questionId}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {q.questionText}
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    q.difficulty === 'Moderate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Cohort Accuracy Rate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{q.correctPercent}% Correct</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        q.correctPercent >= 85 ? 'bg-emerald-500' :
                        q.correctPercent >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${q.correctPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: TASKS & RUBRIC COMPLIANCE MONITOR */}
      {/* ========================================================= */}
      {activeTab === 'assignments-monitor' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Practical Task Submissions &amp; Rubric Scoring
              </h3>
              <p className="text-xs text-slate-500">
                Tracking all practical exercise submissions, grading compliance, and trainer feedback.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {submissions.length} Total Submissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map(sub => (
              <div 
                key={sub.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Student Submission
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {sub.assignmentTitle}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      By <strong className="text-slate-800 dark:text-slate-200">{sub.participantName}</strong> ({sub.participantId})
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    sub.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {sub.grade !== undefined ? `${sub.grade}/${sub.maxPoints} pts` : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 max-h-28 overflow-y-auto leading-relaxed">
                  {sub.content}
                </div>

                {sub.feedback && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                    <strong>Trainer Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: COMPLIANCE & ACCREDITATION AUDIT */}
      {/* ========================================================= */}
      {activeTab === 'compliance-audit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Institutional Accreditation &amp; Quality Audit Standards
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Formal compliance metrics required for issuing accredited training certification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Criterion 1: Attendance Verification</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Minimum attendance of 75% required across all webinar &amp; physical workshops with cryptographic QR scan timestamps.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Criterion 2: Curriculum Completion</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  100% of video lessons and practical worksheets across TMS-101, TMS-102, and TMS-103 must be completed.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Criterion 3: Competency Evaluation Exam</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Minimum passing grade of 70% required on comprehensive end-of-course assessment exam.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Criterion 4: Board Dual-Signatory</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Validated against {org.signatory1Name} ({org.signatory1Title}) and {org.signatory2Name} ({org.signatory2Title}).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL: OFFICIAL ACADEMIC TRANSCRIPT */}
      {/* ========================================================= */}
      {selectedRecordForTranscript && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official Learner Academic Transcript
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRecordForTranscript(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Institution Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {org.orgName}
                  </h4>
                  <p className="text-slate-500">{org.programName} · {org.programCode}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600 text-sm">{selectedRecordForTranscript.academicStanding}</span>
                  <p className="text-[10px] text-slate-400">Status: {selectedRecordForTranscript.certificationStatus.toUpperCase()}</p>
                </div>
              </div>

              {/* Student Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] block">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRecordForTranscript.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Student ID:</span>
                  <span className="font-mono font-semibold">{selectedRecordForTranscript.participantId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Cohort:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedRecordForTranscript.cohortName}</span>
                </div>
              </div>

              {/* Academic Performance Breakdown */}
              <div className="p-4 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Evaluated Competencies &amp; Course Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Lessons Completed</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedRecordForTranscript.completedLessonsCount}/{selectedRecordForTranscript.totalLessonsCount}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Attendance Rate</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedRecordForTranscript.attendanceRate}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Assessment Exam</span>
                    <span className="font-bold text-sm text-emerald-600">
                      {selectedRecordForTranscript.assessmentScore !== null ? `${selectedRecordForTranscript.assessmentScore}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Overall GPA</span>
                    <span className="font-bold text-sm text-indigo-600">
                      {selectedRecordForTranscript.overallGpaPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate status if certified */}
              {selectedRecordForTranscript.certificateId && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                        Official Certificate Issued: {selectedRecordForTranscript.certificateId}
                      </span>
                      <span className="text-[10px] text-emerald-600">Cryptographically verifiable with QR token</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Transcript</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecordForTranscript(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
