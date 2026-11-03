import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Printer, 
  X, 
  RotateCcw, 
  Clock, 
  Check, 
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import { CertificationCriteria, Participant } from '../../types';
import { StorageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface CertificationWorkflowProps {
  participants: Participant[];
  criteria: CertificationCriteria;
  onUpdateData: () => void;
  onViewCertificate: (p: Participant) => void;
}

export const CertificationWorkflow: React.FC<CertificationWorkflowProps> = ({
  participants,
  criteria,
  onUpdateData,
  onViewCertificate
}) => {
  // Criteria settings state
  const [localCriteria, setLocalCriteria] = useState<CertificationCriteria>(criteria);
  const [isCriteriaSaved, setIsCriteriaSaved] = useState(false);

  // Approval remarks input
  const org = StorageService.getOrgSettings();
  const [approvalModalParticipant, setApprovalModalParticipant] = useState<Participant | null>(null);
  const [approverName, setApproverName] = useState(`${org.signatory2Name} (${org.signatory2Title})`);
  const [approvalRemarks, setApprovalRemarks] = useState('Participant fulfilled all coursework & attendance criteria and passed final assessment.');

  // Revoke state
  const [revokeModalParticipant, setRevokeModalParticipant] = useState<Participant | null>(null);
  const [revokeReason, setRevokeReason] = useState('Administrative correction / duplicate issuance');

  // Filter lists
  const eligibleCandidates = participants.filter(p => p.certificationStatus === 'eligible');
  const certifiedParticipants = participants.filter(p => p.certificationStatus === 'approved');
  const revokedParticipants = participants.filter(p => p.certificationStatus === 'revoked');

  // Save criteria changes and re-evaluate all participants
  const handleSaveCriteria = () => {
    StorageService.saveCriteria(localCriteria);
    // Re-evaluate all participants
    const all = StorageService.getParticipants();
    all.forEach(p => {
      p.certificationStatus = StorageService.evaluateParticipantEligibility(p, localCriteria);
    });
    StorageService.saveParticipants(all);
    onUpdateData();
    setIsCriteriaSaved(true);
    setTimeout(() => setIsCriteriaSaved(false), 2000);
  };

  // Perform Certificate Approval
  const handleConfirmApproval = () => {
    if (!approvalModalParticipant) return;

    StorageService.approveCertification(
      approvalModalParticipant.id,
      approverName,
      approvalRemarks
    );

    // Trigger celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onUpdateData();
    setApprovalModalParticipant(null);
  };

  // Perform Revocation
  const handleConfirmRevoke = () => {
    if (!revokeModalParticipant) return;

    StorageService.revokeCertification(
      revokeModalParticipant.id,
      revokeReason
    );

    onUpdateData();
    setRevokeModalParticipant(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Process Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>BDS Certification Governance & Approval Queue</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict two-stage workflow: <strong>Automatic System Eligibility</strong> &rarr; <strong>Final Administrator Review & Signing</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
            {eligibleCandidates.length} Pending Review
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
            {certifiedParticipants.length} Issued Certificates
          </span>
        </div>
      </div>

      {/* POLICY & THRESHOLD CONTROLS (EXPANDABLE/CUSTOMIZABLE) */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Certification Policy Thresholds</h3>
          </div>
          <button
            onClick={handleSaveCriteria}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer"
          >
            {isCriteriaSaved ? '✓ Policy Updated!' : 'Apply & Recalculate'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Minimum Attendance */}
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-300">Minimum Session Attendance:</span>
              <span className="text-amber-400 font-mono text-sm">{localCriteria.minAttendancePercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={localCriteria.minAttendancePercent}
              onChange={(e) => setLocalCriteria({ ...localCriteria, minAttendancePercent: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Recommended Policy Standard: 80%</p>
          </div>

          {/* Assessment Pass Mark */}
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-300">Assessment Pass Mark:</span>
              <span className="text-teal-400 font-mono text-sm">{localCriteria.minAssessmentScore}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={localCriteria.minAssessmentScore}
              onChange={(e) => setLocalCriteria({ ...localCriteria, minAssessmentScore: Number(e.target.value) })}
              className="w-full accent-teal-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">Passing Grade: ≥ 70%</p>
          </div>

          {/* LMS Curriculum Modules */}
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-semibold text-slate-300 block mb-1">LMS Modules Completion:</span>
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Completion (All 5 Modules)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">BDS 101 to BDS 105 required</p>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE (ACTION REQUIRED) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Pending Administrator Review Queue</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Participants who met all automated thresholds and await official programme sign-off.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {eligibleCandidates.length} Ready
          </span>
        </div>

        {eligibleCandidates.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">All eligible candidates have been reviewed!</p>
            <p className="mt-1">New candidates will appear here automatically when they reach 80% attendance and pass their assessment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eligibleCandidates.map((candidate) => {
              const attRate = StorageService.calculateAttendanceRate(candidate);

              return (
                <div 
                  key={candidate.id}
                  className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {candidate.fullName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {candidate.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      <strong>{candidate.organization}</strong> · {candidate.businessSector} ({candidate.region})
                    </p>

                    {/* Criteria audit mini badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Attendance: {attRate}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Modules: 5/5
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Assessment: {candidate.assessmentScore}%
                      </span>
                    </div>

                    {candidate.trainerRemarks && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1.5">
                        Trainer note: &ldquo;{candidate.trainerRemarks}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setApprovalModalParticipant(candidate)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>Review & Approve Certification</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ISSUED CERTIFICATES REGISTRY */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Official BDS Certificates Registry</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete tamper-evident log of verified certificates with unique tracking IDs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5 px-3">Certificate ID</th>
                <th className="py-2.5 px-3">Participant Name</th>
                <th className="py-2.5 px-3">Enterprise</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Approved By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {certifiedParticipants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {p.certificateId}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {p.fullName}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {p.organization}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {p.certificateIssueDate}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {p.approvedBy || 'Programme Director'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Check className="w-3 h-3 mr-1" />
                      Valid & Verifiable
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewCertificate(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center space-x-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Certificate</span>
                      </button>

                      <button
                        onClick={() => setRevokeModalParticipant(p)}
                        className="px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold cursor-pointer"
                        title="Revoke certificate if issued in error"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {approvalModalParticipant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Authorise Official Certificate Issuance</span>
              </h3>
              <button onClick={() => setApprovalModalParticipant(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">
                  {approvalModalParticipant.fullName}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Enterprise: {approvalModalParticipant.organization} ({approvalModalParticipant.businessSector})
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex space-x-3">
                  <span>Attendance: {StorageService.calculateAttendanceRate(approvalModalParticipant)}%</span>
                  <span>Assessment: {approvalModalParticipant.assessmentScore}%</span>
                  <span>Modules: 5/5 Completed</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorising Official (Signatory Name & Title):
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Programme Endorsement Remarks:
                </label>
                <textarea
                  rows={3}
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setApprovalModalParticipant(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApproval}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Confirm & Issue Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE CERTIFICATE MODAL */}
      {revokeModalParticipant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="font-extrabold text-base text-rose-600 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Revoke Certificate {revokeModalParticipant.certificateId}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Are you sure you want to revoke the certificate for <strong>{revokeModalParticipant.fullName}</strong>? 
              This will invalidate the certificate on the public verification portal.
            </p>

            <div className="mt-4 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Revocation:
              </label>
              <textarea
                rows={2}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setRevokeModalParticipant(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
