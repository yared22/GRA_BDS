import React, { useState, useEffect } from 'react';
import { Participant } from '../../types';
import { StorageService } from '../../services/storageService';
import { ShieldCheck, Search, AlertCircle, CheckCircle2, Building, Calendar, Award, UserCheck, XCircle } from 'lucide-react';

interface PublicVerifierProps {
  participants: Participant[];
  initialQuery?: string;
  onViewCertificate: (p: Participant) => void;
}

export const PublicVerifier: React.FC<PublicVerifierProps> = ({
  participants,
  initialQuery = '',
  onViewCertificate
}) => {
  const org = StorageService.getOrgSettings();
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Participant | null>(null);

  const demoCert = participants.find(p => p.certificateId)?.certificateId || `${org.certificatePrefix || 'CERT-2026-'}00042`;

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  const handleVerify = (searchVal = query) => {
    const clean = searchVal.trim().toLowerCase();
    if (!clean) return;

    setSearched(true);
    const found = participants.find(p => 
      (p.certificateId && p.certificateId.toLowerCase() === clean) ||
      (p.certificateVerificationCode && p.certificateVerificationCode.toLowerCase() === clean) ||
      (p.id.toLowerCase() === clean)
    );

    setResult(found || null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Public Certificate Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Verify the authenticity and validity of any official Certificate of Completion issued by {org.orgName}.
        </p>

        {/* Verification Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-inner">
            <input
              type="text"
              placeholder={`Enter Certificate No (e.g. ${demoCert})...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full px-3 py-2 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-mono"
            />
            <button
              onClick={() => handleVerify()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap transition-colors cursor-pointer shadow"
            >
              Verify Now
            </button>
          </div>

          {/* Quick Demo Pill */}
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 mt-3">
            <span>Try sample certificate:</span>
            <button
              onClick={() => {
                setQuery(demoCert);
                handleVerify(demoCert);
              }}
              className="text-amber-400 hover:underline font-mono"
            >
              {demoCert}
            </button>
          </div>
        </div>
      </div>

      {/* VERIFICATION RESULT CARD */}
      {searched && (
        <div>
          {result ? (
            result.certificationStatus === 'approved' ? (
              // VALID CERTIFICATE
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                          Authentic &amp; Verified
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {result.certificateId}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {result.fullName}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewCertificate(result)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    View Certificate
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Awarded Enterprise / Organization</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{result.organization}</span>
                    <span className="text-slate-500 block text-[11px]">{result.businessSector}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Training Program</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{org.programName}</span>
                    <span className="text-slate-500 block text-[11px]">{org.orgName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Issue Date</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{result.certificateIssueDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Authorized Signatory</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{result.approvedBy || org.signatory2Name}</span>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span>Participant ID: {result.id}</span>
                    <span>Security Hash: {result.certificateVerificationCode}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This record is officially verified on the secure database and satisfies all certification requirements.</span>
                </div>
              </div>
            ) : (
              // REVOKED CERTIFICATE
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500/40 p-6 sm:p-8 shadow-xl space-y-4 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                      Certificate Revoked
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {result.fullName} ({result.certificateId})
                    </h2>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  <p className="font-bold">Notice of Revocation:</p>
                  <p className="mt-1">{result.trainerRemarks || 'This certificate was revoked by system administrators.'}</p>
                </div>
              </div>
            )
          ) : (
            // NOT FOUND
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Certificate Found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please verify that the Certificate ID or Security Code is spelled correctly (e.g. <code>{demoCert}</code>).
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
