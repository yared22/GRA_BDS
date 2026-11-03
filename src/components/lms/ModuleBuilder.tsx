import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Video, 
  Clock, 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  X, 
  AlertTriangle,
  FileCheck,
  Check,
  Award,
  Layers,
  Search,
  MessageSquare,
  Download
} from 'lucide-react';
import { LmsLesson, LmsModule, LmsSubmission } from '../../types';
import { StorageService } from '../../services/storageService';
import { SAMPLE_STARTER_MODULES } from '../../data/initialData';

interface ModuleBuilderProps {
  modules: LmsModule[];
  onUpdateData: () => void;
  onSwitchToStudentPortal: () => void;
}

type StudioView = 'curriculum' | 'grading';

export const ModuleBuilder: React.FC<ModuleBuilderProps> = ({
  modules,
  onUpdateData,
  onSwitchToStudentPortal
}) => {
  const [studioView, setStudioView] = useState<StudioView>('curriculum');

  // Add Module Modal
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModuleCode, setNewModuleCode] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleSummary, setNewModuleSummary] = useState('');
  const [newModuleDuration, setNewModuleDuration] = useState<number>(4);

  // Add Lesson Modal
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<LmsModule | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState<number>(15);
  const [newLessonNotes, setNewLessonNotes] = useState('');
  const [newLessonTranscript, setNewLessonTranscript] = useState('');

  // Optional Assignment in Lesson
  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState(100);

  // Video Test Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Grading State
  const [submissions, setSubmissions] = useState<LmsSubmission[]>(StorageService.getSubmissions());
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<LmsSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('Well formulated analysis meeting all core rubric criteria.');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (submissionFilter === 'pending') return s.status === 'submitted';
      if (submissionFilter === 'reviewed') return s.status === 'reviewed';
      return true;
    });
  }, [submissions, submissionFilter]);

  // Add Module Submit
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    StorageService.addModule({
      code: newModuleCode.trim() || `MOD-${modules.length + 1}`,
      title: newModuleTitle.trim(),
      summary: newModuleSummary.trim(),
      durationHours: Number(newModuleDuration) || 4,
      topics: [],
      lessons: []
    });

    onUpdateData();
    setIsAddModuleOpen(false);
    setNewModuleCode('');
    setNewModuleTitle('');
    setNewModuleSummary('');
    setNewModuleDuration(4);
  };

  // Delete Module
  const handleDeleteModule = (id: string, title: string) => {
    if (window.confirm(`Delete module "${title}" and all its lessons?`)) {
      StorageService.deleteModule(id);
      onUpdateData();
    }
  };

  // Clear All Examples to start completely fresh
  const handleClearAllExamples = () => {
    if (window.confirm('Remove all example modules? This will give you a clean slate to add your own training videos and modules.')) {
      StorageService.clearAllModules();
      onUpdateData();
    }
  };

  // Load starter template module for trial testing
  const handleLoadSampleModules = () => {
    StorageService.loadStarterModule();
    onUpdateData();
  };

  // Add Lesson Submit
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForLesson || !newLessonTitle.trim()) return;

    const assignment = hasAssignment && assignmentTitle.trim() ? {
      id: `asg-${Date.now().toString().slice(-4)}`,
      moduleId: activeModuleForLesson.id,
      title: assignmentTitle.trim(),
      description: assignmentDesc.trim() || 'Complete the practical analysis using the lesson concepts.',
      rubric: ['Quality of analysis (40%)', 'Practical applicability (30%)', 'Feasibility (30%)'],
      maxPoints: Number(assignmentMaxPoints) || 100
    } : undefined;

    StorageService.addLessonToModule(activeModuleForLesson.id, {
      title: newLessonTitle.trim(),
      durationMinutes: Number(newLessonDuration) || 15,
      videoUrl: newLessonVideoUrl.trim(),
      notes: newLessonNotes.trim(),
      transcript: newLessonTranscript.trim() || undefined,
      assignment,
      order: (activeModuleForLesson.lessons?.length || 0) + 1
    });

    onUpdateData();
    setActiveModuleForLesson(null);
    setNewLessonTitle('');
    setNewLessonVideoUrl('');
    setNewLessonDuration(15);
    setNewLessonNotes('');
    setNewLessonTranscript('');
    setHasAssignment(false);
    setAssignmentTitle('');
    setAssignmentDesc('');
  };

  // Delete Lesson
  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    StorageService.deleteLesson(moduleId, lessonId);
    onUpdateData();
  };

  // Submit Grade
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;

    StorageService.gradeSubmission(
      selectedSubmissionForGrading.id,
      Number(gradeInput),
      feedbackInput
    );

    setSubmissions(StorageService.getSubmissions());
    setSelectedSubmissionForGrading(null);
  };

  // Helper for embed video url
  const getEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar with Action Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Instructor Studio &amp; Curriculum Control</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Curriculum, Video Modules &amp; Assignment Grading
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage course structure, upload lecture video URLs, attach worksheets, and grade student practical exercises.
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Studio Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStudioView('curriculum')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                studioView === 'curriculum'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Curriculum Modules ({modules.length})
            </button>

            <button
              onClick={() => {
                setSubmissions(StorageService.getSubmissions());
                setStudioView('grading');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                studioView === 'grading'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Student Submissions ({submissions.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModuleOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>

          <button
            onClick={onSwitchToStudentPortal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Student Classroom &rarr;</span>
          </button>

          {modules.length > 0 ? (
            <button
              onClick={handleClearAllExamples}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 text-xs font-semibold border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title="Remove all example modules to start from a blank canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : (
            <button
              onClick={handleLoadSampleModules}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Template Modules</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CURRICULUM & VIDEO MODULE MANAGER */}
      {/* ========================================================= */}
      {studioView === 'curriculum' && (
        <div className="space-y-4">
          
          {/* Owner Workflow Guide Banner */}
          <div className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-200 dark:border-sky-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-300">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Owner &rarr; Participant &rarr; Certification Lifecycle:</span>
              </div>
              <p className="text-sky-700 dark:text-sky-400 text-[11px] leading-relaxed">
                1. As owner, click <strong>"+ Add Module"</strong> to create courses and add video lessons. &bull; 
                2. Switch to <strong>"Participant: Take Modules"</strong> (or have students enroll) to take the coursework. &bull; 
                3. When participants finish all lessons, they are automatically awarded their verified certificate!
              </p>
            </div>
            <button
              onClick={onSwitchToStudentPortal}
              className="shrink-0 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Test as Participant &rarr;</span>
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Your Curriculum is Clean &amp; Ready for Trial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                All sample modules and example participants have been cleared. Add your first training module below, or load a starter template module with 1 click to test right away.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsAddModuleOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Your First Module</span>
                </button>
                <button
                  onClick={handleLoadSampleModules}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Load Starter Template Module</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, modIdx) => (
                <div 
                  key={mod.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Module Header */}
                  <div className="p-5 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                          {mod.code}
                        </span>
                        <span>·</span>
                        <span>Module {modIdx + 1} of {modules.length}</span>
                        <span>·</span>
                        <span>Est. {mod.durationHours} Hours</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {mod.title}
                      </h3>
                      {mod.summary && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                          {mod.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setActiveModuleForLesson(mod)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson / Video</span>
                      </button>

                      <button
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons in this module */}
                  <div className="p-4 sm:p-5">
                    {mod.lessons.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-xs">No lessons added to this module yet.</p>
                        <button
                          onClick={() => setActiveModuleForLesson(mod)}
                          className="mt-2 text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
                        >
                          + Add first video lesson
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mod.lessons.map((lesson, lesIdx) => (
                          <div 
                            key={lesson.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                {lesIdx + 1}
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {lesson.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.durationMinutes} min</span>
                                  </span>
                                  {lesson.videoUrl && (
                                    <span className="flex items-center space-x-1 text-sky-600 dark:text-sky-400">
                                      <Video className="w-3 h-3" />
                                      <span className="truncate max-w-[200px]">{lesson.videoUrl}</span>
                                    </span>
                                  )}
                                  {lesson.assignment && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                      Task: {lesson.assignment.maxPoints} pts
                                    </span>
                                  )}
                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <span className="text-purple-600">
                                      • {lesson.resources.length} worksheets
                                    </span>
                                  )}
                                </div>
                                {lesson.notes && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 italic">
                                    &ldquo;{lesson.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-end md:self-center">
                              {lesson.videoUrl && (
                                <button
                                  onClick={() => setPreviewVideoUrl(lesson.videoUrl || null)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 transition-colors"
                                >
                                  <Play className="w-3 h-3 text-amber-500 fill-current" />
                                  <span>Preview</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete Lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STUDENT SUBMISSIONS & GRADING HUB */}
      {/* ========================================================= */}
      {studioView === 'grading' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>Student Practical Assignment Submissions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review submitted assignments, grade out of 100 points, and provide constructive feedback.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={submissionFilter}
                onChange={e => setSubmissionFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="all">All Submissions ({submissions.length})</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Graded / Reviewed</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Assignment Title</th>
                    <th className="px-4 py-3">Submitted Date</th>
                    <th className="px-4 py-3">Status &amp; Grade</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sub.participantName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {sub.participantId}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {sub.assignmentTitle}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {sub.content}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        {sub.status === 'reviewed' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {sub.grade}/{sub.maxPoints} pts
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Needs Grading
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmissionForGrading(sub);
                            setGradeInput(sub.grade || 85);
                            setFeedbackInput(sub.feedback || 'Great work applying the framework.');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          {sub.status === 'reviewed' ? 'Edit Grade' : 'Review & Grade'}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No assignment submissions found. Learners can submit practical tasks from the Student Classroom portal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD MODULE */}
      {/* ========================================================= */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add New Training Module
              </h3>
              <button onClick={() => setIsAddModuleOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TMS-104"
                    value={newModuleCode}
                    onChange={(e) => setNewModuleCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Export Logistics & Trade Compliance"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={newModuleDuration}
                  onChange={(e) => setNewModuleDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Module Summary & Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core learning goals and capabilities covered..."
                  value={newModuleSummary}
                  onChange={(e) => setNewModuleSummary(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD LESSON / VIDEO */}
      {/* ========================================================= */}
      {activeModuleForLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add Video Lesson to {activeModuleForLesson.code}
                </h3>
                <p className="text-xs text-slate-500">{activeModuleForLesson.title}</p>
              </div>
              <button onClick={() => setActiveModuleForLesson(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lesson 1: How to Calculate Working Capital"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Video URL (YouTube / Vimeo / MP4)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newLessonVideoUrl}
                    onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Supports regular YouTube links or direct video files.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Notes &amp; Study Guide
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide key takeaways, steps, formulas or reading notes for participants..."
                  value={newLessonNotes}
                  onChange={(e) => setNewLessonNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Practical Task Option */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAssignment}
                    onChange={e => setHasAssignment(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Attach Practical Assignment / Hands-On Task</span>
                </label>

                {hasAssignment && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Assignment Title (e.g. Formulate Cash Flow Projection)"
                      value={assignmentTitle}
                      onChange={e => setAssignmentTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Prompt / instructions for learners..."
                      value={assignmentDesc}
                      onChange={e => setAssignmentDesc(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModuleForLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Save &amp; Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GRADE STUDENT SUBMISSION */}
      {/* ========================================================= */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Grade Practical Assignment
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmissionForGrading.participantName} ({selectedSubmissionForGrading.participantId})
                </p>
              </div>
              <button onClick={() => setSelectedSubmissionForGrading(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assignment:</span>
                <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium">
                  {selectedSubmissionForGrading.assignmentTitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Submission:</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto font-mono text-[11px] leading-relaxed">
                  {selectedSubmissionForGrading.content}
                </div>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade (Points out of {selectedSubmissionForGrading.maxPoints}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedSubmissionForGrading.maxPoints}
                    required
                    value={gradeInput}
                    onChange={e => setGradeInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trainer Constructive Feedback *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmissionForGrading(null)}
                    className="px-3.5 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Save Grade &amp; Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIDEO PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-800 flex items-center justify-between text-white text-xs">
              <span className="font-bold flex items-center space-x-2">
                <Play className="w-4 h-4 text-amber-400" />
                <span>Video Test Preview</span>
              </span>
              <button onClick={() => setPreviewVideoUrl(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              {(() => {
                const embedUrl = getEmbedUrl(previewVideoUrl);
                if (embedUrl && (embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com/video'))) {
                  return (
                    <iframe
                      src={embedUrl}
                      title="Video Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (previewVideoUrl.endsWith('.mp4') || previewVideoUrl.endsWith('.webm')) {
                  return (
                    <video src={previewVideoUrl} controls className="w-full h-full" autoPlay />
                  );
                } else {
                  return (
                    <div className="text-center p-6 text-slate-400">
                      <ExternalLink className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs font-semibold">External Video Link</p>
                      <a href={previewVideoUrl} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline mt-1 block">
                        Open {previewVideoUrl} in new tab &rarr;
                      </a>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
