import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudentLmsPortal } from './components/lms/StudentLmsPortal';
import { ModuleBuilder } from './components/lms/ModuleBuilder';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ParticipantManagement } from './components/admin/ParticipantManagement';
import { AttendanceManager } from './components/admin/AttendanceManager';
import { CertificationWorkflow } from './components/admin/CertificationWorkflow';
import { TelegramBotSimulator } from './components/telegram/TelegramBotSimulator';
import { PublicVerifier } from './components/certificate/PublicVerifier';
import { CertificateView } from './components/certificate/CertificateView';
import { BeginnerGuide } from './components/guide/BeginnerGuide';
import { FreeHostingGuide } from './components/hosting/FreeHostingGuide';
import { OrgSettingsModal } from './components/settings/OrgSettingsModal';
import { OwnerAuthModal } from './components/admin/OwnerAuthModal';
import { LearningMisPortal } from './components/lmis/LearningMisPortal';
import { StorageService } from './services/storageService';
import { Cohort, LmsModule, Participant, TrainingSession, CertificationCriteria, SystemStats, OwnerSession } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lms-portal');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [modules, setModules] = useState<LmsModule[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [criteria, setCriteria] = useState<CertificationCriteria>(StorageService.getCriteria());
  const [stats, setStats] = useState<SystemStats>({
    totalParticipants: 0,
    activeCohorts: 0,
    averageAttendance: 0,
    averageScore: 0,
    eligibleCount: 0,
    certifiedCount: 0,
    inProgressCount: 0
  });

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [viewingCertificateFor, setViewingCertificateFor] = useState<Participant | null>(null);
  const [verificationInitialQuery, setVerificationInitialQuery] = useState<string>('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [ownerSession, setOwnerSession] = useState<OwnerSession | null>(StorageService.getOwnerSession());
  const [isOwnerAuthModalOpen, setIsOwnerAuthModalOpen] = useState(false);

  // Load and refresh state from StorageService
  const refreshData = () => {
    const pList = StorageService.getParticipants();
    const mList = StorageService.getModules();
    const cList = StorageService.getCohorts();
    const sList = StorageService.getSessions();
    const crit = StorageService.getCriteria();
    const computedStats = StorageService.getStats();
    const curSession = StorageService.getOwnerSession();

    setParticipants(pList);
    setModules(mList);
    setCohorts(cList);
    setSessions(sList);
    setCriteria(crit);
    setStats(computedStats);
    setOwnerSession(curSession);

    // If a participant was selected in dossier, refresh their state
    if (selectedParticipant) {
      const refreshed = pList.find(p => p.id === selectedParticipant.id) || null;
      setSelectedParticipant(refreshed);
    }

    if (viewingCertificateFor) {
      const refreshedCert = pList.find(p => p.id === viewingCertificateFor.id) || null;
      setViewingCertificateFor(refreshedCert);
    }
  };

  useEffect(() => {
    StorageService.ensureCleanTrialState();
    refreshData();

    // Check URL parameters for direct verification link (e.g. ?verify=CERT-2026-00042)
    const urlParams = new URLSearchParams(window.location.search);
    const verifyCode = urlParams.get('verify');
    if (verifyCode) {
      setVerificationInitialQuery(verifyCode);
      setActiveTab('verification');
    }
  }, []);

  // Clean trial reset
  const handleResetData = () => {
    if (window.confirm('Reset application to a completely clean trial slate? All trial modules and participants will be cleared.')) {
      StorageService.resetToDefaults();
      refreshData();
      setViewingCertificateFor(null);
      setSelectedParticipant(null);
    }
  };

  // View certificate for a participant
  const handleViewCertificate = (p: Participant) => {
    setViewingCertificateFor(p);
  };

  const isOwner = Boolean(ownerSession);
  const isOwnerRestrictedTab = [
    'modules', 
    'dashboard', 
    'lmis', 
    'participants', 
    'attendance', 
    'certification', 
    'telegram-bot', 
    'guide'
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setViewingCertificateFor(null);
          setActiveTab(tab);
        }}
        onResetData={handleResetData}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        pendingApprovalsCount={stats.eligibleCount}
        isOwnerAuthenticated={isOwner}
        ownerSession={ownerSession}
        onOpenOwnerAuth={() => setIsOwnerAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If certificate view is requested, render high-res printable certificate */}
        {viewingCertificateFor ? (
          <CertificateView
            participant={viewingCertificateFor}
            onBack={() => setViewingCertificateFor(null)}
          />
        ) : isOwnerRestrictedTab && !isOwner ? (
          /* Owner Access Restriction Guard */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 my-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Owner Feature Restricted</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                This management section is reserved strictly for the course owner (<span className="font-semibold text-slate-700 dark:text-slate-300">biruksahlu06@gmail.com</span>) and authorized team members.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsOwnerAuthModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Owner Studio</span>
              </button>
              <button
                onClick={() => setActiveTab('lms-portal')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Go to Participant Classroom
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Student Web Video Classroom & Pilot LMS */}
            {activeTab === 'lms-portal' && (
              <StudentLmsPortal
                modules={modules}
                participants={participants}
                onUpdateData={refreshData}
                onViewCertificate={handleViewCertificate}
                onSwitchToModuleBuilder={() => setActiveTab('modules')}
                isOwner={isOwner}
                onOpenOwnerAuth={() => setIsOwnerAuthModalOpen(true)}
              />
            )}

            {/* Curriculum & Video Builder */}
            {activeTab === 'modules' && (
              <ModuleBuilder
                modules={modules}
                onUpdateData={refreshData}
                onSwitchToStudentPortal={() => setActiveTab('lms-portal')}
              />
            )}

            {/* MIS Executive Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                stats={stats}
                participants={participants}
                cohorts={cohorts}
                setActiveTab={setActiveTab}
                onSelectParticipant={(p) => {
                  setSelectedParticipant(p);
                  setActiveTab('participants');
                }}
                onOpenAddModal={() => setActiveTab('participants')}
              />
            )}

            {/* Learning Management Information System (Learning MIS) */}
            {activeTab === 'lmis' && (
              <LearningMisPortal
                participants={participants}
                modules={modules}
                cohorts={cohorts}
                onUpdateData={refreshData}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Participant Directory */}
            {activeTab === 'participants' && (
              <ParticipantManagement
                participants={participants}
                cohorts={cohorts}
                onUpdateParticipants={refreshData}
                selectedParticipant={selectedParticipant}
                onSelectParticipant={setSelectedParticipant}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Attendance & QR Scanner */}
            {activeTab === 'attendance' && (
              <AttendanceManager
                sessions={sessions}
                cohorts={cohorts}
                participants={participants}
                onUpdateData={refreshData}
              />
            )}

            {/* Certification Approval Queue */}
            {activeTab === 'certification' && (
              <CertificationWorkflow
                participants={participants}
                criteria={criteria}
                onUpdateData={refreshData}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Telegram Bot Simulator */}
            {activeTab === 'telegram-bot' && (
              <TelegramBotSimulator
                participants={participants}
                cohorts={cohorts}
                onUpdateData={refreshData}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Public Certificate Verification */}
            {activeTab === 'verification' && (
              <PublicVerifier
                participants={participants}
                initialQuery={verificationInitialQuery}
                onViewCertificate={handleViewCertificate}
              />
            )}

            {/* Free Hosting Guide */}
            {activeTab === 'hosting' && (
              <FreeHostingGuide />
            )}

            {/* Architecture Guide */}
            {activeTab === 'guide' && (
              <BeginnerGuide />
            )}
          </>
        )}

      </main>

      {/* Program & Organization Settings Modal */}
      <OrgSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateData={refreshData}
      />

      {/* Owner Access & Team Delegation Modal */}
      <OwnerAuthModal
        isOpen={isOwnerAuthModalOpen}
        onClose={() => setIsOwnerAuthModalOpen(false)}
        session={ownerSession}
        onAuthChange={refreshData}
      />

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">TMS v3.0</span>
            <span>·</span>
            <span>Universal Training Management &amp; Verifiable Certification</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                setViewingCertificateFor(null);
                setActiveTab('hosting');
              }} 
              className="hover:underline text-emerald-500 font-bold"
            >
              🚀 Free Hosting Guide
            </button>
            <span>·</span>
            <button 
              onClick={() => {
                setViewingCertificateFor(null);
                setActiveTab('lms-portal');
              }} 
              className="hover:underline text-amber-500 font-semibold"
            >
              Student Portal
            </button>
            {isOwner ? (
              <>
                <span>·</span>
                <button 
                  onClick={() => {
                    setViewingCertificateFor(null);
                    setActiveTab('modules');
                  }} 
                  className="hover:underline text-sky-500 font-semibold"
                >
                  Curriculum Builder
                </button>
                <span>·</span>
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="hover:underline text-slate-400 font-semibold"
                >
                  Settings &amp; Backup
                </button>
              </>
            ) : (
              <>
                <span>·</span>
                <button 
                  onClick={() => setIsOwnerAuthModalOpen(true)} 
                  className="hover:underline text-amber-500 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Owner Login</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
