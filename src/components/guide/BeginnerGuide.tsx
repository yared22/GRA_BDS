import React, { useState } from 'react';
import { 
  BookOpen, 
  Send, 
  Server, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  HelpCircle, 
  Copy, 
  Check, 
  Building, 
  Globe 
} from 'lucide-react';

export const BeginnerGuide: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/50 p-6 sm:p-8 rounded-2xl border border-indigo-500/30 text-white shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>System Architecture & Deployment Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Training Management & Verifiable Certification System
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
          Everything explained step-by-step: from setting up your free Telegram bot to launching on free cloud hosting (Vercel, Netlify, GitHub Pages), tracking attendance, and issuing verifiable certificates.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-900/60 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="text-amber-400 font-bold block">1. Architecture</span>
            <span className="text-slate-400 text-[11px]">How it works</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="text-sky-400 font-bold block">2. BotFather</span>
            <span className="text-slate-400 text-[11px]">Free Telegram bot</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="text-emerald-400 font-bold block">3. Free Hosting</span>
            <span className="text-slate-400 text-[11px]">Vercel / Netlify / GH</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20">
            <span className="text-teal-400 font-bold block">4. Launch</span>
            <span className="text-slate-400 text-[11px]">Enrollment to certs</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURE EXPLAINED IN PLAIN ENGLISH */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <span>1. The Architecture: How This Entire System Works</span>
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Instead of connecting multiple complex and paid plugins, you have a <strong>unified single-page application (SPA)</strong> that unifies three core operational pillars:
        </p>

        {/* 3 Pillars Flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-500/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-950 font-bold flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-sky-950 dark:text-sky-300">A. Participant Layer (Web & Telegram)</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Learners stream video lessons, review study notes, check progress, take competency exams, and pull their check-in QR codes via the web portal or Telegram bot.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">B. MIS Management Layer</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Organizers monitor cohorts, scan QR codes at venues, import online meeting logs, customize curriculum modules, and approve certificates with digital signatures.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300">C. Certification & Verification</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Generates high-resolution printable certificates with unique tracking IDs (e.g. <code>CERT-2026-00042</code>) and QR codes that anyone can scan to verify authenticity online.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 2: BOTFATHER STEP-BY-STEP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Send className="w-5 h-5 text-sky-500" />
          <span>2. How to Create Your Free Telegram Bot in 2 Minutes (Using @BotFather)</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Creating a Telegram bot is 100% free and takes less than 2 minutes. Follow these exact steps on your phone or computer:
        </p>

        <div className="space-y-4 text-xs">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Step 1: Open BotFather in Telegram</span>
              <span className="text-[10px] font-mono bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded">
                Official Telegram Tool
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Open Telegram, click the Search bar at the top, and search for <strong>@BotFather</strong> (look for the verified blue checkmark icon). Click <strong>Start</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Step 2: Send the /newbot command</span>
              <button 
                onClick={() => handleCopy('/newbot', 'step2')}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copiedStep === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Type and send <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono">/newbot</code>. 
              BotFather will reply: <em>&ldquo;Alright, a new bot. How are we going to call it? Please choose a name for your bot.&rdquo;</em>
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Step 3: Name Your Bot & Choose a Username</span>
            <p className="text-slate-600 dark:text-slate-400">
              1. Type your desired display name: e.g. <code className="font-mono text-slate-800 dark:text-slate-200">Academy Training Assistant</code>.<br />
              2. Next, BotFather will ask for a username ending in <code className="font-mono text-amber-500">_bot</code>. E.g. <code className="font-mono text-slate-800 dark:text-slate-200">MyAcademyTraining_bot</code>.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Step 4: Copy Your HTTP API Token</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              BotFather will reply with your API token (e.g. <code>1234567890:ABCdefGHIjklMNOpqrsTUVwxyz</code>).<br />
              Paste this token in the <strong>Telegram Bot &rarr; Real Bot Token Setup</strong> tab in this app to connect your live bot!
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 3: FREE HOSTING TOOLS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          <span>3. 100% Free Hosting Tools (Zero Server Costs)</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          This system requires no paid backend servers. You can deploy it completely free forever using these top platforms:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Option A: Vercel (Recommended)</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Connect your GitHub repository to <strong>Vercel</strong> for automatic deployments on every commit. Free SSL, custom domains, and global edge network included.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Option B: Netlify (Drag & Drop)</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Run <code className="font-mono text-teal-600">npm run build</code> and drag your <code>dist/</code> folder into <strong>Netlify Drop</strong> for instant 10-second deployment with zero commands.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Option C: GitHub Pages</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Use GitHub Actions to publish directly from your GitHub repository under your free <code>username.github.io/repo</code> subdomain.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Option D: Cloudflare Pages</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Deploy to Cloudflare Pages for unlimited bandwidth and fast speeds. Simply select the Vite framework preset.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 4: STEP-BY-STEP IMPLEMENTATION ROADMAP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-amber-500" />
          <span>4. Step-by-Step Training Delivery Roadmap</span>
        </h2>

        <div className="space-y-3 text-xs">
          
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Curriculum & Cohort Setup</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Define your training modules in the <strong>Curriculum Builder</strong>. Paste your training video links (YouTube, Vimeo, or MP4) and lesson notes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Participant Enrollment</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Share your Telegram bot link or web portal with participants, or upload an existing Excel/CSV spreadsheet using the <strong>Bulk CSV Import</strong> tool.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Delivery & Attendance Tracking</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                At physical workshops: Trainers scan participants&apos; QR codes with the built-in scanner. For online webinars: Paste attendee emails from meeting logs directly.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Competency Assessment</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Learners complete the interactive competency assessment in the video LMS portal or Telegram bot. Passing grade is set at &ge;70%.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
              5
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Administrator Review & Approval</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                The Program Director reviews eligible candidates in the <strong>Certification Approval Queue</strong>. Click <strong>Approve</strong> to sign and issue.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              6
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Certificate Issuance & Verification</span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Participants immediately receive their digital certificate. Anyone can scan the QR code to verify validity on the public portal!
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
