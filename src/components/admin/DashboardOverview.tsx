import React from 'react';
import { 
  Users, 
  Layers, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  QrCode, 
  UserPlus, 
  FileSpreadsheet, 
  Send,
  Building,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Briefcase,
  BarChart3
} from 'lucide-react';
import { Cohort, Participant, SystemStats } from '../../types';
import { StorageService } from '../../services/storageService';
import { ActiveTab } from '../Navbar';

interface DashboardOverviewProps {
  stats: SystemStats;
  participants: Participant[];
  cohorts: Cohort[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectParticipant: (p: Participant) => void;
  onOpenAddModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  participants,
  cohorts,
  setActiveTab,
  onSelectParticipant,
  onOpenAddModal
}) => {
  const org = StorageService.getOrgSettings();
  // Compute gender distribution
  const femaleCount = participants.filter(p => p.gender === 'Female').length;
  const femalePercent = participants.length > 0 ? Math.round((femaleCount / participants.length) * 100) : 0;

  // Compute training mode distribution
  const hybridCount = participants.filter(p => p.trainingMode === 'hybrid').length;
  const physicalCount = participants.filter(p => p.trainingMode === 'physical').length;
  const onlineCount = participants.filter(p => p.trainingMode === 'online').length;

  // Recent 5 participants
  const recentParticipants = [...participants].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 rounded-2xl border border-slate-700/60 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            {org.orgName} · {org.programCode}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {org.programName}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Manage the complete participant training lifecycle across online video, hybrid, and physical cohorts. 
            Track session attendance, verify module progression, conduct evaluations, and issue verifiable digital certificates.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Launch QR Attendance Scanner</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm border border-slate-600 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Enroll New Participant</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram-bot')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Open Telegram Bot Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('lmis')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-indigo-200" />
              <span>Learning MIS (Analytics)</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Participants */}
        <div 
          onClick={() => setActiveTab('participants')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalParticipants}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center">
            <span>{femalePercent}% Women SMEs</span>
          </p>
        </div>

        {/* Active Cohorts */}
        <div 
          onClick={() => setActiveTab('participants')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cohorts</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeCohorts}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active Training Cohorts
          </p>
        </div>

        {/* Avg Attendance */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageAttendance}%</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Threshold: ≥80%
          </p>
        </div>

        {/* Avg Assessment Score */}
        <div 
          onClick={() => setActiveTab('certification')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Assessment</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageScore}%</p>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
            Pass Mark: ≥70%
          </p>
        </div>

        {/* Pending Certification Approvals (High Priority) */}
        <div 
          onClick={() => setActiveTab('certification')}
          className={`p-4 rounded-xl border shadow-sm transition-all cursor-pointer group relative overflow-hidden ${
            stats.eligibleCount > 0 
              ? 'bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ready for Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.eligibleCount}</p>
            {stats.eligibleCount > 0 && (
              <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-400/20 px-1.5 py-0.5 rounded animate-pulse">
                Action Req.
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 font-medium flex items-center">
            <span>Approve & Issue &rarr;</span>
          </p>
        </div>

        {/* Certificates Issued */}
        <div 
          onClick={() => setActiveTab('verification')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Certified</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.certifiedCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Verifiable Digital IDs
          </p>
        </div>

      </div>

      {/* Cohort Status & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Cohorts List (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Active BDS Training Cohorts</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hybrid, physical and virtual cohorts currently in session
              </p>
            </div>
            <button
              onClick={() => setActiveTab('participants')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center"
            >
              <span>View All Participants</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {cohorts.map((cohort) => {
              const cohortParticipants = participants.filter(p => p.cohortId === cohort.id);
              const certifiedInCohort = cohortParticipants.filter(p => p.certificationStatus === 'approved').length;
              const eligibleInCohort = cohortParticipants.filter(p => p.certificationStatus === 'eligible').length;

              return (
                <div 
                  key={cohort.id} 
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-400/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{cohort.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {cohort.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-3">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {cohort.region}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {cohort.startDate} to {cohort.endDate}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {cohortParticipants.length} Enrolled
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {certifiedInCohort} certified · {eligibleInCohort} eligible
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('participants')}
                        className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-medium"
                      >
                        Filter
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span><strong>Trainer:</strong> {cohort.leadTrainer}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{cohort.onlinePlatform}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Delivery Modes & Quick Insights */}
        <div className="space-y-6">
          
          {/* Training Delivery Modes Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-500" />
              <span>Training Delivery Mode Split</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                    Hybrid (Classroom + Online)
                  </span>
                  <span>{hybridCount} ({participants.length ? Math.round((hybridCount/participants.length)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${participants.length ? (hybridCount/participants.length)*100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                    Physical Classroom Only
                  </span>
                  <span>{physicalCount} ({participants.length ? Math.round((physicalCount/participants.length)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${participants.length ? (physicalCount/participants.length)*100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></span>
                    100% Online / Virtual
                  </span>
                  <span>{onlineCount} ({participants.length ? Math.round((onlineCount/participants.length)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${participants.length ? (onlineCount/participants.length)*100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              Registration Channels: <strong>{participants.filter(p => p.registrationSource === 'telegram').length} via Telegram Bot</strong>, {participants.filter(p => p.registrationSource === 'admin').length} via Admin Bulk Upload.
            </div>
          </div>

          {/* Quick Registration & Bot Status */}
          <div className="bg-gradient-to-br from-sky-900/30 to-slate-900 rounded-xl border border-sky-500/30 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Telegram Bot Gateway</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                    Webhook Active & Listening
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('telegram-bot')}
                className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Test Bot
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Participants can message <strong>@BDSTrainingAssistant_bot</strong> to register, track module progress, pull their QR check-in token, and download certificates.
            </p>
          </div>

        </div>

      </div>

      {/* Recent Participants Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Recent Participant Records</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest registrations and progress updates</p>
          </div>
          <button
            onClick={() => setActiveTab('participants')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Manage All {participants.length} Participants &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2.5 px-3">Participant ID</th>
                <th className="py-2.5 px-3">Full Name & Enterprise</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Assessment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentParticipants.map((p) => {
                const attendanceRate = p.attendance.length > 0 
                  ? Math.round((p.attendance.filter(a => a.attended).length / p.attendance.length) * 100) 
                  : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {p.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{p.fullName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{p.organization}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {p.region}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {p.assessmentScore !== null ? (
                        <span className={`font-semibold ${p.assessmentScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {p.assessmentScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not taken</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {p.certificationStatus === 'approved' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-500/20">
                          <Check className="w-3 h-3 mr-1" />
                          Certified
                        </span>
                      )}
                      {p.certificationStatus === 'eligible' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20 animate-pulse">
                          Ready for Approval
                        </span>
                      )}
                      {p.certificationStatus === 'in_progress' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          In Progress
                        </span>
                      )}
                      {p.certificationStatus === 'revoked' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectParticipant(p)}
                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500"
                      >
                        Inspect Dossier &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
              {recentParticipants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No participants enrolled yet. Use <strong>"Participant: Take Modules"</strong> or click <strong>"+ Add Participant"</strong> to start trial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
