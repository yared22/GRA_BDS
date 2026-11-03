import React, { useState, useMemo } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  Award, 
  BookOpen, 
  ChevronRight, 
  RotateCcw, 
  Video, 
  Clock, 
  FileText, 
  Sparkles, 
  HelpCircle,
  ExternalLink,
  Printer,
  UserCheck,
  MessageSquare,
  Download,
  ThumbsUp,
  Send,
  Trash2,
  Search,
  PenTool,
  Bookmark,
  Share2,
  Check,
  FileCheck,
  Layers,
  GraduationCap,
  Plus,
  UserPlus
} from 'lucide-react';
import { 
  LmsLesson, 
  LmsModule, 
  Participant, 
  LmsSubmission, 
  LmsDiscussion, 
  LmsStudentNote,
  LmsResource
} from '../../types';
import { StorageService } from '../../services/storageService';
import { BDS_QUIZ_QUESTIONS } from '../../data/initialData';
import confetti from 'canvas-confetti';
import { Lock } from 'lucide-react';

interface StudentLmsPortalProps {
  modules: LmsModule[];
  participants: Participant[];
  onUpdateData: () => void;
  onViewCertificate: (p: Participant) => void;
  onSwitchToModuleBuilder?: () => void;
  isOwner?: boolean;
  onOpenOwnerAuth?: () => void;
}

type LessonTab = 'overview' | 'transcript' | 'resources' | 'assignment' | 'discussion' | 'notes';

export const StudentLmsPortal: React.FC<StudentLmsPortalProps> = ({
  modules,
  participants,
  onUpdateData,
  onViewCertificate,
  onSwitchToModuleBuilder,
  isOwner = false,
  onOpenOwnerAuth
}) => {
  // Select active student profile for testing
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    participants[2]?.id || participants[0]?.id || ''
  );

  const activeStudent = participants.find(p => p.id === selectedStudentId) || participants[0];

  // Active lesson selected in player
  const allLessons = useMemo(() => {
    return modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title, moduleCode: m.code })));
  }, [modules]);

  const [activeLessonId, setActiveLessonId] = useState<string>(
    allLessons[0]?.id || ''
  );

  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];

  // Active bottom tab
  const [activeTab, setActiveTab] = useState<LessonTab>('overview');

  // Video playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.0x');

  // Curriculum search
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');

  // Discussions state
  const [discussions, setDiscussions] = useState<LmsDiscussion[]>(StorageService.getDiscussions());
  const [newCommentText, setNewCommentText] = useState('');

  // Notes state
  const [studentNotes, setStudentNotes] = useState<LmsStudentNote[]>(
    activeStudent ? StorageService.getStudentNotes(activeStudent.id) : []
  );
  const [newNoteText, setNewNoteText] = useState('');

  // Assignment submissions state
  const [submissions, setSubmissions] = useState<LmsSubmission[]>(StorageService.getSubmissions());
  const [assignmentAnswer, setAssignmentAnswer] = useState('');
  const [assignmentSubmittedSuccess, setAssignmentSubmittedSuccess] = useState(false);

  // Quiz state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Quick enroll state for trial testing
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollOrg, setEnrollOrg] = useState('');
  const [isQuickEnrollModalOpen, setIsQuickEnrollModalOpen] = useState(false);

  const handleQuickEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim()) return;
    const newP = StorageService.enrollQuickParticipant(enrollName, enrollEmail, enrollOrg);
    onUpdateData();
    setSelectedStudentId(newP.id);
    setEnrollName('');
    setEnrollEmail('');
    setEnrollOrg('');
    setIsQuickEnrollModalOpen(false);
  };

  const handleClaimCertificate = () => {
    if (!activeStudent) return;
    const cert = StorageService.approveCertification(
      activeStudent.id,
      'Program Director',
      'Successfully fulfilled all curriculum coursework and earned official certification.'
    );
    onUpdateData();
    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } catch {}
    if (cert) {
      onViewCertificate(cert);
    }
  };

  // Compute overall progress
  const completedCount = activeStudent?.completedLessonIds?.length || 0;
  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allLessonsCompleted = totalLessons > 0 && completedCount >= totalLessons;

  // Check if all modules are completed
  const allModulesDone = modules.length > 0 && modules.every(m => {
    const prog = activeStudent?.moduleProgress?.find(mp => mp.moduleId === m.id);
    return prog ? prog.completed : false;
  });

  const isCourseFinished = totalLessons > 0 ? allLessonsCompleted : allModulesDone;

  // Refresh notes & submissions when activeStudent or lesson changes
  useMemo(() => {
    if (activeStudent) {
      setStudentNotes(StorageService.getStudentNotes(activeStudent.id));
      setSubmissions(StorageService.getSubmissions());
      setDiscussions(StorageService.getDiscussions());
    }
  }, [activeStudent?.id, activeLessonId]);

  // Current lesson submission (if any)
  const currentLessonSubmission = useMemo(() => {
    if (!activeLesson?.assignment || !activeStudent) return null;
    return submissions.find(
      s => s.assignmentId === activeLesson.assignment?.id && s.participantId === activeStudent.id
    );
  }, [activeLesson, activeStudent, submissions]);

  // Current lesson discussions
  const lessonDiscussions = useMemo(() => {
    if (!activeLesson) return [];
    return discussions.filter(d => d.lessonId === activeLesson.id);
  }, [activeLesson, discussions]);

  // Current lesson notes
  const lessonNotes = useMemo(() => {
    if (!activeLesson || !activeStudent) return [];
    return studentNotes.filter(n => n.lessonId === activeLesson.id);
  }, [activeLesson, activeStudent, studentNotes]);

  // Toggle lesson complete
  const handleToggleComplete = (lessonId: string) => {
    if (!activeStudent) return;
    const updated = StorageService.toggleLessonCompletion(activeStudent.id, lessonId);
    onUpdateData();

    // Check if that was the last lesson!
    if (updated && updated.completedLessonIds.length === totalLessons) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Mark current lesson complete and advance to next
  const handleCompleteAndNext = () => {
    if (!activeLesson || !activeStudent) return;
    
    // Mark complete
    if (!activeStudent.completedLessonIds.includes(activeLesson.id)) {
      handleToggleComplete(activeLesson.id);
    }

    // Find next lesson
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[currentIndex + 1].id);
    }
  };

  // Previous lesson navigation
  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLessonId(allLessons[currentIndex - 1].id);
    }
  };

  // Reset progress for pilot testing
  const handleResetProgress = () => {
    if (!activeStudent) return;
    if (window.confirm(`Reset course progress for ${activeStudent.fullName} to test the full pilot again?`)) {
      StorageService.resetLearnerProgress(activeStudent.id);
      onUpdateData();
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
      setAssignmentSubmittedSuccess(false);
    }
  };

  // Helper to extract YouTube video embed URL
  const getEmbedVideoUrl = (url?: string): string | null => {
    if (!url) return null;
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
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

  // Handle Post Comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeLesson || !activeStudent) return;

    const newDisc = StorageService.addDiscussion(
      activeLesson.id,
      activeStudent.fullName,
      'learner',
      newCommentText.trim()
    );

    setDiscussions(prev => [...prev, newDisc]);
    setNewCommentText('');
  };

  // Handle Like Discussion
  const handleLikeComment = (id: string) => {
    StorageService.likeDiscussion(id);
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
  };

  // Handle Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeLesson || !activeStudent) return;

    const newNote = StorageService.addStudentNote(
      activeStudent.id,
      activeLesson.id,
      newNoteText.trim(),
      '04:15'
    );

    setStudentNotes(prev => [newNote, ...prev]);
    setNewNoteText('');
  };

  // Handle Delete Note
  const handleDeleteNote = (id: string) => {
    StorageService.deleteStudentNote(id);
    setStudentNotes(prev => prev.filter(n => n.id !== id));
  };

  // Handle Submit Assignment
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentAnswer.trim() || !activeLesson?.assignment || !activeStudent) return;

    const newSub = StorageService.addSubmission({
      assignmentId: activeLesson.assignment.id,
      assignmentTitle: activeLesson.assignment.title,
      participantId: activeStudent.id,
      participantName: activeStudent.fullName,
      content: assignmentAnswer.trim(),
      maxPoints: activeLesson.assignment.maxPoints
    });

    setSubmissions(prev => [newSub, ...prev]);
    setAssignmentAnswer('');
    setAssignmentSubmittedSuccess(true);
    setTimeout(() => setAssignmentSubmittedSuccess(false), 4000);
  };

  // Submit assessment quiz
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correct = 0;
    BDS_QUIZ_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / BDS_QUIZ_QUESTIONS.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (activeStudent) {
      StorageService.recordAssessmentResult(activeStudent.id, score);
      if (score >= 70) {
        StorageService.approveCertification(
          activeStudent.id,
          'Program Director',
          'Successfully passed competency assessment and completed course requirements.'
        );
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {}
      }
      onUpdateData();
    }
  };

  // Empty State 1: No modules created yet
  if (modules.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 my-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          No Course Modules Available Yet
        </h2>
        {isOwner ? (
          <>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your course catalog is clean. As the owner, add your course modules, video lectures, and worksheets in the Builder. Participants can then take them and receive their verified certificate!
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              {onSwitchToModuleBuilder && (
                <button
                  onClick={onSwitchToModuleBuilder}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Course Modules as Owner</span>
                </button>
              )}
              <button
                onClick={() => {
                  StorageService.loadStarterModule();
                  onUpdateData();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load 1-Click Starter Template Module</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The instructor is currently preparing curriculum modules. Please check back shortly or check with your training provider.
            </p>
            {onOpenOwnerAuth && (
              <div className="pt-2">
                <button
                  onClick={onOpenOwnerAuth}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Are you the course owner? Unlock Owner Studio</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Empty State 2: No trial participants enrolled yet
  if (!activeStudent) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 my-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <GraduationCap className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Enroll to Start the Course
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Enter your details below to enroll as a learner. Once you complete the modules, your official accredited certificate will be generated automatically!
          </p>
        </div>

        <form onSubmit={handleQuickEnroll} className="space-y-3.5 text-left bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Full Name (Printed on Certificate) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={enrollName}
              onChange={e => setEnrollName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (optional)
            </label>
            <input
              type="email"
              placeholder="e.g. jane.doe@example.com"
              value={enrollEmail}
              onChange={e => setEnrollEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Organization / Company (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              value={enrollOrg}
              onChange={e => setEnrollOrg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Enroll &amp; Begin Taking Modules &rarr;
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Persona Switcher */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Learning Management System (LMS) · Digital Classroom</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Curriculum Videos, Practical Toolkits &amp; Assessment
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Watch competency video lectures, access downloadable worksheets, submit practical assignments, and earn accredited certification.
          </p>
        </div>

        {/* Persona Switcher & Progress Reset */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Learner Persona:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setQuizSubmitted(false);
              }}
              aria-label="Select learner testing persona"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-xs font-semibold focus:ring-1 focus:ring-amber-500"
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.completedLessonIds?.length || 0} lessons · {p.certificationStatus})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsQuickEnrollModalOpen(true)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer mt-auto"
            title="Enroll another learner to test"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Enroll Learner</span>
          </button>

          <button
            onClick={handleResetProgress}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium border border-slate-600 transition-colors cursor-pointer mt-auto"
            title="Reset this student's progress to test from 0%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {isOwner && onSwitchToModuleBuilder && (
            <button
              onClick={onSwitchToModuleBuilder}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer mt-auto shadow-sm"
              title="Edit or add curriculum modules in the Instructor Studio"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Owner Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* OVERALL COURSE PROGRESS & CERTIFICATE BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Training Completion &amp; Certification Progress</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed <span className="font-bold text-slate-800 dark:text-slate-200">{completedCount} of {totalLessons} lessons</span> ({progressPercent}%) across {modules.length} curriculum modules
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pill & Certificate Action */}
            {activeStudent?.certificationStatus === 'approved' ? (
              <button
                onClick={() => onViewCertificate(activeStudent)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-md cursor-pointer animate-pulse"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>🏆 View Official Certificate ({activeStudent.certificateId})</span>
              </button>
            ) : isCourseFinished ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClaimCertificate}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md cursor-pointer animate-bounce"
                >
                  <Award className="w-4 h-4" />
                  <span>🎓 Claim Certificate Now!</span>
                </button>
                <button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeStudent?.assessmentScore !== null ? `Exam: ${activeStudent?.assessmentScore}%` : 'Take Final Assessment'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Complete all {totalLessons > 0 ? totalLessons : modules.length} lessons/modules to earn certificate</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: PLAYER + CURRICULUM SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 Cols): VIDEO PLAYER & INTERACTIVE LEARNING TABS */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Lesson Header & Controls */}
          {activeLesson ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              
              {/* VIDEO PLAYER CONTAINER */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {activeLesson.videoUrl ? (
                  <iframe
                    src={getEmbedVideoUrl(activeLesson.videoUrl) || ''}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <Video className="w-16 h-16 mx-auto mb-3 text-slate-600 opacity-60" />
                    <p className="text-sm font-semibold">Video material currently being updated by instructor</p>
                    <p className="text-xs text-slate-500 mt-1">Review lesson notes and resources below.</p>
                  </div>
                )}
              </div>

              {/* ACTION BAR: Title, Controls, Navigation */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                      <span>{activeLesson.moduleCode}</span>
                      <span>·</span>
                      <span>{activeLesson.durationMinutes} Minutes</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h2>
                  </div>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <span className="text-[11px] text-slate-400 font-medium">Speed:</span>
                    {['1.0x', '1.25x', '1.5x'].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          playbackSpeed === spd
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevLesson}
                      disabled={allLessons.findIndex(l => l.id === activeLesson.id) === 0}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      ← Prev Lesson
                    </button>

                    <button
                      onClick={() => handleToggleComplete(activeLesson.id)}
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        activeStudent?.completedLessonIds?.includes(activeLesson.id)
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {activeStudent?.completedLessonIds?.includes(activeLesson.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed ✓</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleCompleteAndNext}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Complete &amp; Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE LMS TABS: Overview, Transcript, Resources, Assignment, Discussion, Notes */}
              <div className="bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 flex items-center space-x-1 overflow-x-auto scrollbar-none text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'overview'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Overview &amp; Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'transcript'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Transcript</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'resources'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Resources &amp; Toolkits ({activeLesson.resources?.length || 0})</span>
                </button>

                {activeLesson.assignment && (
                  <button
                    onClick={() => setActiveTab('assignment')}
                    className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                      activeTab === 'assignment'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Practical Task</span>
                    {currentLessonSubmission && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'discussion'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Q&amp;A Community ({lessonDiscussions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                    activeTab === 'notes'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>My Notes ({lessonNotes.length})</span>
                </button>
              </div>

              {/* TAB CONTENT PANEL */}
              <div className="p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                
                {/* 1. OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">
                        Curriculum Summary &amp; Key Concepts
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">
                        {activeLesson.notes || 'In this lesson, you will master practical frameworks and operational best practices.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Key Competency Takeaways
                      </h5>
                      <ul className="text-xs text-amber-900 dark:text-amber-200/90 list-disc list-inside space-y-1">
                        <li>Systematic breakdown of the core business and operational mechanics.</li>
                        <li>Avoidance of common startup and enterprise pitfalls in financial and market planning.</li>
                        <li>Actionable metrics to measure progress before advancing to the next curriculum level.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. TRANSCRIPT */}
                {activeTab === 'transcript' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold">Full Lecture Transcript &amp; Audio Captions</span>
                      <span>Playback synced</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeLesson.transcript || `[00:00] Welcome to ${activeLesson.title}. In this video lecture, we review the foundational principles and practical case studies for sustainable enterprise execution.`}
                    </div>
                  </div>
                )}

                {/* 3. RESOURCES & TOOLKITS */}
                {activeTab === 'resources' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Downloadable Practical Toolkits &amp; Worksheets
                    </h4>
                    {activeLesson.resources && activeLesson.resources.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeLesson.resources.map(res => (
                          <div 
                            key={res.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-between hover:border-amber-500 transition-colors"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs uppercase">
                                {res.type}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                  {res.title}
                                </span>
                                <span className="text-[10px] text-slate-400">{res.size || '500 KB'} · Downloadable</span>
                              </div>
                            </div>
                            <button
                              onClick={() => alert(`Downloading "${res.title}" practical template.`)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                              title="Download resource"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        No supplementary files uploaded for this lecture yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PRACTICAL ASSIGNMENT TASK */}
                {activeTab === 'assignment' && activeLesson.assignment && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                          Assignment ({activeLesson.assignment.maxPoints} Points)
                        </span>
                        <span className="text-xs text-slate-500">
                          Due: {activeLesson.assignment.dueDate || 'Flexible'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {activeLesson.assignment.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {activeLesson.assignment.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/60">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Evaluation Rubric:
                        </span>
                        <ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                          {activeLesson.assignment.rubric.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Submission status or form */}
                    {currentLessonSubmission ? (
                      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-xs font-bold text-emerald-600 gap-1">
                            <Check className="w-4 h-4" />
                            Submitted on {new Date(currentLessonSubmission.submittedAt).toLocaleDateString()}
                          </span>
                          {currentLessonSubmission.grade !== undefined && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Grade: {currentLessonSubmission.grade}/{currentLessonSubmission.maxPoints}
                            </span>
                          )}
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                          {currentLessonSubmission.content}
                        </div>
                        {currentLessonSubmission.feedback && (
                          <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                            <strong>Trainer Feedback:</strong> {currentLessonSubmission.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAssignment} className="space-y-3">
                        {assignmentSubmittedSuccess && (
                          <div className="p-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Assignment submitted successfully! Trainer will review.
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Your Practical Submission Response / Analysis *
                          </label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Type or paste your completed assignment breakdown here..."
                            value={assignmentAnswer}
                            onChange={e => setAssignmentAnswer(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <FileCheck className="w-4 h-4" />
                          Submit Practical Assignment
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 5. Q&A COMMUNITY DISCUSSION */}
                {activeTab === 'discussion' && (
                  <div className="space-y-4">
                    <form onSubmit={handlePostComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a question about this lesson or share an insight..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </form>

                    <div className="space-y-3">
                      {lessonDiscussions.map(disc => (
                        <div 
                          key={disc.id}
                          className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                disc.authorRole === 'instructor' 
                                  ? 'bg-amber-500 text-slate-950' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {disc.avatar}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {disc.authorName}
                                </span>
                                {disc.authorRole === 'instructor' && (
                                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    Trainer
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 ml-2">{disc.createdAt}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLikeComment(disc.id)}
                              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-500"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{disc.likes}</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 pl-9">
                            {disc.content}
                          </p>
                        </div>
                      ))}

                      {lessonDiscussions.length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No questions posted on this lecture yet. Be the first to start the discussion!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. MY PERSONAL NOTES */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Write a private study note or highlight from this lecture..."
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save Private Note</span>
                      </button>
                    </form>

                    <div className="space-y-2">
                      {lessonNotes.map(note => (
                        <div 
                          key={note.id}
                          className="p-3 bg-amber-50/50 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 rounded-xl flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-400 font-semibold mb-1">
                              <span>Marker: {note.videoTime || 'Lecture Note'}</span>
                              <span>•</span>
                              <span>{note.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-slate-200">
                              {note.text}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {lessonNotes.length === 0 && (
                        <p className="text-xs text-slate-400 italic">
                          You haven't taken any private notes for this lesson yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Lesson Selected</h3>
              <p className="text-xs text-slate-500">Pick a lesson from the curriculum sidebar on the right to start learning.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1 Col): CURRICULUM SYLLABUS & LESSON NAVIGATION */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Course Syllabus &amp; Modules</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {modules.length} Modules
              </span>
            </div>

            {/* Quick search inside curriculum */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lessons or topics..."
                value={lessonSearchQuery}
                onChange={e => setLessonSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Modules List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {modules.map((mod, modIdx) => {
                const modCompletedCount = mod.lessons.filter(l => 
                  activeStudent?.completedLessonIds?.includes(l.id)
                ).length;
                const isModComplete = mod.lessons.length > 0 && modCompletedCount === mod.lessons.length;

                const filteredLessons = mod.lessons.filter(l => 
                  l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
                  mod.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())
                );

                if (lessonSearchQuery && filteredLessons.length === 0) return null;

                return (
                  <div key={mod.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                          Module {modIdx + 1}: {mod.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {mod.title}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isModComplete 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {modCompletedCount}/{mod.lessons.length}
                      </span>
                    </div>

                    {mod.lessons.length === 0 ? (
                      <div className="p-3 text-center bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                        <p className="text-[11px] text-slate-500">Standalone curriculum module (no sub-lessons).</p>
                        <button
                          onClick={() => {
                            if (activeStudent) {
                              StorageService.toggleModuleCompletion(activeStudent.id, mod.id);
                              onUpdateData();
                            }
                          }}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeStudent?.moduleProgress?.find(mp => mp.moduleId === mod.id)?.completed
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                          }`}
                        >
                          {activeStudent?.moduleProgress?.find(mp => mp.moduleId === mod.id)?.completed
                            ? '✓ Module Completed'
                            : 'Mark Module as Completed'}
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                        {filteredLessons.map(lesson => {
                          const isSelected = activeLesson?.id === lesson.id;
                          const isDone = activeStudent?.completedLessonIds?.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLessonId(lesson.id)}
                              className={`w-full p-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/15 border-l-4 border-amber-500 dark:bg-amber-500/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                                )}
                                <div className="truncate">
                                  <span className={`text-xs font-medium block truncate ${
                                    isSelected ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span>{lesson.durationMinutes}m</span>
                                    {lesson.assignment && (
                                      <span className="text-emerald-600 font-semibold">• Task</span>
                                    )}
                                    {lesson.resources && lesson.resources.length > 0 && (
                                      <span>• {lesson.resources.length} files</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-slate-300'}`} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* FINAL ASSESSMENT MODAL */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  End-of-Course Competency Assessment
                </h3>
              </div>
              <button 
                onClick={() => setIsQuizModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {quizSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black ${
                  quizScore !== null && quizScore >= 70
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {quizScore}%
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {quizScore !== null && quizScore >= 70
                      ? 'Congratulations! You Passed the Assessment.'
                      : 'Passing Score Not Met (≥ 70% Required)'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {quizScore !== null && quizScore >= 70
                      ? 'Your score has been registered in the system. Your official Certificate of Completion is now eligible for approval and issuance!'
                      : 'Review the video lessons and retry the evaluation to achieve certification eligibility.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  {quizScore !== null && quizScore >= 70 ? (
                    <button
                      onClick={() => {
                        setIsQuizModalOpen(false);
                        if (activeStudent) onViewCertificate(activeStudent);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      View Certificate Credential
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Retry Assessment
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} className="mt-4 space-y-5">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Please answer all {BDS_QUIZ_QUESTIONS.length} multiple-choice questions based on the video curriculum. You must achieve at least 70% to qualify for official certification.
                </p>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {BDS_QUIZ_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {idx + 1}. {q.question}
                      </span>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <label key={optIdx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`quiz_q_${q.id}`}
                              required
                              checked={selectedAnswers[q.id] === optIdx}
                              onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                              className="text-amber-500 focus:ring-amber-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Submit Assessment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUICK ENROLL LEARNER MODAL */}
      {isQuickEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enroll New Trial Learner
                </h3>
              </div>
              <button 
                onClick={() => setIsQuickEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickEnroll} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Appears on Certificate) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={enrollName}
                  onChange={e => setEnrollName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={enrollEmail}
                  onChange={e => setEnrollEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enterprise / Organization (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Global Tech"
                  value={enrollOrg}
                  onChange={e => setEnrollOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickEnrollModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Enroll Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
