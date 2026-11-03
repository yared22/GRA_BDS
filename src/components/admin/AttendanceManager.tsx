import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Sparkles, 
  Check, 
  Search,
  FileText
} from 'lucide-react';
import { Cohort, Participant, TrainingSession } from '../../types';
import { StorageService } from '../../services/storageService';

interface AttendanceManagerProps {
  sessions: TrainingSession[];
  cohorts: Cohort[];
  participants: Participant[];
  onUpdateData: () => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  sessions,
  cohorts,
  participants,
  onUpdateData
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [scannerInput, setScannerInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);
  
  // Online batch import state
  const [onlineBatchText, setOnlineBatchText] = useState('');
  const [onlineBatchResult, setOnlineBatchResult] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const activeCohort = cohorts.find(c => c.id === activeSession?.cohortId);

  // Participants enrolled in this session's cohort
  const cohortParticipants = participants.filter(p => p.cohortId === activeSession?.cohortId);

  // Scan Check-in Logic
  const handleCheckInToken = (token: string) => {
    if (!token.trim()) return;

    // Token could be Participant ID, Phone, or QR code token
    const cleanToken = token.trim().toLowerCase();
    const target = cohortParticipants.find(p => 
      p.id.toLowerCase() === cleanToken ||
      p.phone.replace(/\s+/g, '').includes(cleanToken.replace(/\s+/g, '')) ||
      p.fullName.toLowerCase().includes(cleanToken)
    );

    if (!target) {
      setScanMessage({
        text: `No participant matching "${token}" found in cohort ${activeCohort?.name || ''}.`,
        type: 'error'
      });
      return;
    }

    // Mark attendance
    StorageService.markSessionAttendance(
      target.id,
      activeSession.id,
      true,
      activeSession.mode,
      activeSession.trainerName
    );

    onUpdateData();
    setScanMessage({
      text: `✓ Checked-in: ${target.fullName} (${target.organization}) at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'success'
    });
    setScannerInput('');
  };

  // Toggle individual participant attendance
  const handleToggleAttendance = (p: Participant, currentAttended: boolean) => {
    StorageService.markSessionAttendance(
      p.id,
      activeSession.id,
      !currentAttended,
      activeSession.mode,
      activeSession.trainerName
    );
    onUpdateData();
  };

  // Online Batch Import
  const handleOnlineBatchVerify = () => {
    if (!onlineBatchText.trim()) return;

    const lines = onlineBatchText.split(/[\n,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    let matched = 0;

    cohortParticipants.forEach(p => {
      const emailMatch = lines.some(line => line.includes(p.email.toLowerCase()));
      const phoneMatch = lines.some(line => line.includes(p.phone.replace(/\s+/g, '')));
      const nameMatch = lines.some(line => line.includes(p.fullName.toLowerCase()));

      if (emailMatch || phoneMatch || nameMatch) {
        StorageService.markSessionAttendance(
          p.id,
          activeSession.id,
          true,
          'online',
          'Online Meeting Export Log'
        );
        matched++;
      }
    });

    onUpdateData();
    setOnlineBatchResult(`Matched and marked ${matched} participants as present from the online log!`);
    setOnlineBatchText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Session Selector Strip */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            <span>Hybrid Attendance & Session Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track physical classroom attendance via QR code scanner and online webinar logs.
          </p>
        </div>

        {/* Session Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Selected Session:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setScanMessage(null);
            }}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-amber-500 max-w-xs"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.date} - {s.title} ({s.mode.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Session Info Card */}
      {activeSession && (
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-amber-400">{activeSession.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {activeSession.moduleCode}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  activeSession.mode === 'physical' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                }`}>
                  {activeSession.mode} Training
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {activeSession.date} ({activeSession.time})
                </span>
                <span className="flex items-center">
                  {activeSession.mode === 'physical' ? <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> : <Video className="w-3.5 h-3.5 mr-1 text-slate-400" />}
                  {activeSession.venueOrLink}
                </span>
                <span><strong>Trainer:</strong> {activeSession.trainerName}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              {(() => {
                const attendedCount = cohortParticipants.filter(p => 
                  p.attendance.find(a => a.sessionId === activeSession.id)?.attended
                ).length;
                const percent = cohortParticipants.length ? Math.round((attendedCount / cohortParticipants.length) * 100) : 0;

                return (
                  <div>
                    <div className="text-xl font-black text-emerald-400">{attendedCount} / {cohortParticipants.length}</div>
                    <div className="text-xs text-slate-400">{percent}% Session Attendance</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* DUAL CHECK-IN TOOLS: QR SCANNER + ONLINE BATCH IMPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tool 1: QR Code Scanner for Physical Sessions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Trainer QR Code Scanner (Physical Classroom)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Live Scanner
            </span>
          </div>

          {/* Scanner Simulation Window */}
          <div className="relative bg-slate-950 rounded-xl p-6 text-center border-2 border-dashed border-slate-700 overflow-hidden">
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-24 h-24 mx-auto rounded-xl border-2 border-amber-400 relative flex items-center justify-center bg-slate-900/60 shadow-inner">
                <QrCode className="w-12 h-12 text-amber-400/80 animate-pulse" />
                <div className="absolute inset-x-0 h-0.5 bg-red-500 top-1/2 -translate-y-1/2 animate-bounce"></div>
              </div>

              <p className="text-xs text-slate-300">
                Point trainer device camera at participant's Telegram badge or enter ID:
              </p>

              {/* Quick Participant Token Clicker for Instant Testing */}
              <div className="text-left bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Quick-Scan Demo Participant:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cohortParticipants.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleCheckInToken(p.id)}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-mono transition-colors cursor-pointer"
                    >
                      {p.id.split('-').pop()}: {p.fullName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input / Scan Bar */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter ID (e.g. BDS-2026-ETH-002)..."
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckInToken(scannerInput)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleCheckInToken(scannerInput)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap cursor-pointer shadow"
                >
                  Check In
                </button>
              </div>
            </div>

            {/* Notification message */}
            {scanMessage && (
              <div className={`mt-4 p-2.5 rounded-lg text-xs font-semibold ${
                scanMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {scanMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Online Webinar Attendance Log Importer */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Video className="w-4 h-4 text-blue-500" />
              <span>Online Session Attendance Importer (Zoom/Teams)</span>
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Webinar Log
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Paste participant emails or phones from your Zoom / Teams meeting attendee report. 
              The system matches them against registered participants and updates their attendance automatically.
            </p>

            <button
              onClick={() => {
                const sampleEmails = cohortParticipants.slice(0, 3).map(p => p.email).join('\n');
                setOnlineBatchText(sampleEmails);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 underline font-semibold cursor-pointer"
            >
              + Paste Sample 3 Attendee Emails
            </button>

            <textarea
              rows={4}
              value={onlineBatchText}
              onChange={(e) => setOnlineBatchText(e.target.value)}
              placeholder="almaz.agro@gmail.com&#10;dawit.leather@ethionet.et&#10;betty.ict@gmail.com..."
              className="w-full p-2.5 font-mono text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />

            {onlineBatchResult && (
              <p className="text-emerald-500 font-semibold">{onlineBatchResult}</p>
            )}

            <button
              onClick={handleOnlineBatchVerify}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow transition-all cursor-pointer"
            >
              Verify & Mark Online Attendees
            </button>
          </div>
        </div>

      </div>

      {/* Live Session Attendance Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cohort Attendance Roster ({cohortParticipants.length} Participants)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any toggle to manually override or mark present/absent
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Enterprise</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Check-in Time</th>
                <th className="py-2.5 px-3">Verifier</th>
                <th className="py-2.5 px-3 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cohortParticipants.map((p) => {
                const attRecord = p.attendance.find(a => a.sessionId === activeSession.id);
                const isAttended = attRecord?.attended || false;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      <div>{p.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {p.organization}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {p.phone}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {isAttended ? (attRecord?.checkInTime || '09:00 AM') : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {isAttended ? (attRecord?.verifiedBy || 'Trainer') : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleAttendance(p, isAttended)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                          isAttended 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-rose-100 hover:text-rose-700' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {isAttended ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Mark Present</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
