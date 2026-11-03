import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  CalendarCheck2, 
  PlaySquare, 
  Video, 
  Settings, 
  Globe,
  Briefcase,
  BarChart3,
  Lock,
  Unlock,
  Crown
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { OwnerSession } from '../types';

export type ActiveTab = 
  | 'lms-portal' 
  | 'modules' 
  | 'dashboard' 
  | 'lmis'
  | 'participants' 
  | 'attendance' 
  | 'certification' 
  | 'telegram-bot' 
  | 'verification' 
  | 'hosting'
  | 'guide';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  onOpenSettings: () => void;
  pendingApprovalsCount: number;
  isOwnerAuthenticated: boolean;
  ownerSession: OwnerSession | null;
  onOpenOwnerAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  onOpenSettings,
  pendingApprovalsCount,
  isOwnerAuthenticated,
  ownerSession,
  onOpenOwnerAuth
}) => {
  const org = StorageService.getOrgSettings();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('lms-portal')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">{org.programCode || 'TMS-2026'}</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Training &amp; LMS
                </span>
                <span className="text-[10px] uppercase font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full hidden sm:inline-block truncate max-w-[180px]">
                  {org.orgName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block truncate max-w-md">
                {org.programName}
              </p>
            </div>
          </div>

          {/* Quick Action Center */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Free Hosting Tab Shortcut */}
            <button
              onClick={() => setActiveTab('hosting')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hosting'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title="Step-by-step instructions for 100% free hosting (Vercel, Netlify, GitHub Pages)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🚀 Free Hosting</span>
              <span className="sm:hidden">Host</span>
            </button>

            {/* Owner Access & Auth Badge / Button */}
            {isOwnerAuthenticated ? (
              <button
                onClick={onOpenOwnerAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/10"
                title="Manage owner access, team delegation, or change passcode"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline truncate max-w-[140px]">{ownerSession?.name || 'Owner'}</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                  {ownerSession?.role === 'owner' ? 'Owner' : 'Staff'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenOwnerAuth}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                title="Restricted owner login for biruksahlu06@gmail.com and authorized instructors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Owner Login</span>
              </button>
            )}

            {/* Owner Only: Pending Approval Badge */}
            {isOwnerAuthenticated && pendingApprovalsCount > 0 && (
              <button
                onClick={() => setActiveTab('certification')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors animate-pulse"
                title="Candidates ready for certificate approval"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{pendingApprovalsCount} Ready</span>
              </button>
            )}

            {/* Owner Only: Custom Settings & Data Modal Button */}
            {isOwnerAuthenticated && (
              <button
                onClick={onOpenSettings}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Customize program title, organization name, signatures, or backup/reset data"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Settings &amp; Data</span>
              </button>
            )}

            {/* Owner Only: Clean Trial Slate Reset Button */}
            {isOwnerAuthenticated && (
              <button
                onClick={onResetData}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
                title="Wipe data and reset to clean trial slate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Clean Slate</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs sm:text-sm font-medium">
          
          {/* PRIMARY: Student Video Learning Portal (Always visible) */}
          <button
            onClick={() => setActiveTab('lms-portal')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-sm cursor-pointer ${
              activeTab === 'lms-portal'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-amber-500/20'
                : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>🎓 Participant: Take Modules</span>
          </button>

          {/* Public Verification (Always visible) */}
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Certificate</span>
          </button>

          {/* Free Hosting Guide (Always visible) */}
          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Free Hosting Guide</span>
          </button>

          {/* LOCKED INDICATOR IF NOT LOGGED IN */}
          {!isOwnerAuthenticated && (
            <button
              onClick={onOpenOwnerAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 border border-dashed border-slate-700/80 text-xs ml-auto"
              title="Click to unlock owner features (restricted to biruksahlu06@gmail.com and authorized staff)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Owner Studio &amp; MIS (Locked)</span>
            </button>
          )}

          {/* OWNER FEATURES (SHOWN ONLY WHEN LOGGED IN AS OWNER OR AUTHORIZED USER) */}
          {isOwnerAuthenticated && (
            <>
              {/* Curriculum & Module Builder */}
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'modules'
                    ? 'bg-sky-500 text-slate-950 font-extrabold shadow-sky-500/20'
                    : 'text-sky-300 hover:text-white hover:bg-slate-800 border border-sky-500/30'
                }`}
              >
                <Video className="w-4 h-4 text-sky-400" />
                <span>🛠️ Owner: Add Modules</span>
              </button>

              {/* MIS Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* Learning MIS: Institutional Learning Management Information System */}
              <button
                onClick={() => setActiveTab('lmis')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'lmis'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800 border border-indigo-500/20'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>📊 Learning MIS</span>
              </button>

              {/* Participants */}
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'participants'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Participants</span>
              </button>

              {/* Certification */}
              <button
                onClick={() => setActiveTab('certification')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'certification'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certifications</span>
                {pendingApprovalsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>

              {/* Attendance */}
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Attendance / QR</span>
              </button>

              {/* Telegram Simulator */}
              <button
                onClick={() => setActiveTab('telegram-bot')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'telegram-bot'
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-sky-400 hover:bg-sky-500/10'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Telegram Bot</span>
              </button>

              {/* Architecture Guide */}
              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>System Guide</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};
