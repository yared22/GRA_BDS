import React from 'react';
import { Participant } from '../../types';
import { generateQrSvg } from '../../utils/qrCode';
import { StorageService } from '../../services/storageService';
import { Printer, Download, ArrowLeft, ShieldCheck, Check } from 'lucide-react';

interface CertificateViewProps {
  participant: Participant;
  onBack: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  participant,
  onBack
}) => {
  const org = StorageService.getOrgSettings();
  const certId = participant.certificateId || `${org.certificatePrefix || 'CERT-2026-'}00042`;
  const issueDate = participant.certificateIssueDate || new Date().toISOString().split('T')[0];
  const verificationCode = participant.certificateVerificationCode || 'VER-TMS-99420-AA';
  
  // Verification URL
  const verificationUrl = `${window.location.origin}?verify=${certId}`;
  const qrSvg = generateQrSvg(verificationUrl, 110, 110, '#0f172a');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Toolbar (Hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Management</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Print resolution: High-DPI Landscape A4
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* THE OFFICIAL CERTIFICATE CONTAINER (A4 Landscape Layout) */}
      <div className="bg-slate-100 dark:bg-slate-950 p-2 sm:p-6 rounded-2xl flex justify-center">
        
        <div 
          id="official-tms-certificate"
          className="w-full max-w-4xl aspect-[1.414/1] bg-gradient-to-br from-amber-50/70 via-white to-amber-50/50 text-slate-900 p-8 sm:p-12 rounded-xl border-8 border-double border-amber-600/60 shadow-2xl relative flex flex-col justify-between overflow-hidden select-none print:shadow-none print:border-8 print:p-8 print:m-0 print:w-full print:max-w-none"
          style={{ minHeight: '580px' }}
        >
          {/* Subtle corner ornamental borders */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-700 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-700 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-700 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-700 pointer-events-none"></div>

          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <div className="w-96 h-96 rounded-full border-8 border-slate-900 flex items-center justify-center font-serif text-6xl font-black text-center p-4">
              {org.watermarkText || 'CERTIFIED'}
            </div>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-1 z-10">
            <div className="flex items-center justify-center space-x-2 text-amber-800 text-[11px] font-extrabold tracking-[0.25em] uppercase">
              <span>{org.orgName}</span>
              <span>·</span>
              <span>{org.orgTagline}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-wide uppercase pt-2">
              Certificate of Completion
            </h1>

            <p className="text-xs sm:text-sm text-amber-900/80 font-serif italic pt-1">
              {org.programName}
            </p>
          </div>

          {/* Certificate Body */}
          <div className="text-center my-auto py-4 space-y-2 z-10">
            <p className="text-xs sm:text-sm text-slate-600 font-sans tracking-wider uppercase">
              This is officially awarded to
            </p>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-950 tracking-tight underline decoration-amber-500/40 underline-offset-8">
              {participant.fullName}
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 pt-2">
              Representing: <span className="font-bold text-slate-900">{participant.organization}</span>
              <span className="text-slate-500 font-normal"> ({participant.businessSector})</span>
            </p>

            <p className="max-w-2xl mx-auto text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans pt-1">
              for having successfully fulfilled all prescribed curriculum coursework, session attendance criteria, 
              practical application frameworks, and rigorous competency assessment under the 
              official {org.programName} at {org.orgName}.
            </p>
          </div>

          {/* Signatures & Verification Strip */}
          <div className="pt-4 border-t border-amber-900/20 grid grid-cols-3 items-end gap-4 text-center z-10">
            
            {/* Signature 1: Trainer / Specialist */}
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 px-4 pb-0.5">
                  {org.signatory1Name}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{org.signatory1Title}</p>
              <p className="text-[9px] text-slate-500">{org.orgName}</p>
            </div>

            {/* Middle: Official Stamp & QR Code */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              {/* Gold Seal Badge */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-dashed border-amber-950/40 bg-amber-500 flex flex-col items-center justify-center text-slate-950">
                  <span className="text-[7px] font-black tracking-widest uppercase">OFFICIAL</span>
                  <span className="text-[9px] font-black">{org.sealText?.split(' ')[0] || 'SEAL'}</span>
                  <span className="text-[6px] font-bold">{new Date().getFullYear()}</span>
                </div>
              </div>

              {/* QR Code */}
              <div 
                className="p-1 bg-white rounded border border-slate-200 shadow-sm"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />

              <div className="text-[9px] font-mono text-slate-600">
                <span className="font-bold text-slate-900">ID:</span> {certId}
              </div>
            </div>

            {/* Signature 2: Programme Director */}
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-base text-slate-800 font-bold border-b border-slate-400 px-4 pb-0.5">
                  {participant.approvedBy || org.signatory2Name}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{org.signatory2Title}</p>
              <p className="text-[9px] text-slate-500">{org.orgName}</p>
            </div>

          </div>

          {/* Verification Footer Text */}
          <div className="pt-2 text-[9px] text-slate-500 flex justify-between items-center font-mono">
            <span>Issue Date: {issueDate}</span>
            <span>Security Code: {verificationCode}</span>
            <span className="flex items-center">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
              Cryptographically Verifiable
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
