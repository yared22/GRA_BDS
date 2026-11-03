import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  CheckCheck, 
  Award, 
  Calendar, 
  QrCode, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  Settings,
  Shield,
  ArrowRight
} from 'lucide-react';
import { Cohort, Participant, QuizQuestion } from '../../types';
import { StorageService } from '../../services/storageService';
import { BDS_QUIZ_QUESTIONS } from '../../data/initialData';
import { generateQrSvg } from '../../utils/qrCode';

interface TelegramBotSimulatorProps {
  participants: Participant[];
  cohorts: Cohort[];
  onUpdateData: () => void;
  onViewCertificate: (p: Participant) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  buttons?: { label: string; action: string }[];
  qrData?: string;
  isQuiz?: boolean;
  quizQuestion?: QuizQuestion;
  certificateParticipant?: Participant;
}

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  participants,
  cohorts,
  onUpdateData,
  onViewCertificate
}) => {
  // Active participant perspective in the bot simulator
  // Can switch between demo participants (e.g. Alex, Jordan, or register fresh!)
  const [activeParticipantId, setActiveParticipantId] = useState<string>(participants[1]?.id || participants[0]?.id || '');
  const activeParticipant = participants.find(p => p.id === activeParticipantId) || null;

  // Telegram bot config tab toggle
  const [activeTab, setActiveTab] = useState<'simulator' | 'config'>('simulator');

  // BotFather token state
  const [botConfig, setBotConfig] = useState(StorageService.getBotConfig());
  const [tokenSaved, setTokenSaved] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Registration multi-step state
  const [regStep, setRegStep] = useState<number>(0);
  const [regData, setRegData] = useState<{
    fullName: string;
    phone: string;
    organization: string;
    cohortId: string;
    trainingMode: 'hybrid' | 'physical' | 'online';
  }>({
    fullName: '',
    phone: '',
    organization: '',
    cohortId: cohorts[0]?.id || '',
    trainingMode: 'hybrid'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial welcome message on mount
  useEffect(() => {
    resetChatToWelcome();
  }, [activeParticipantId]);

  const resetChatToWelcome = () => {
    const currentP = participants.find(p => p.id === activeParticipantId);
    const org = StorageService.getOrgSettings();
    
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: `👋 Hello${currentP ? ` ${currentP.fullName.split(' ')[0]}` : ''}! Welcome to the official **${org.programName} Assistant**.\n\nI am here to guide you through registration, session attendance check-ins, module progress, assessments, and your official Certificate of Completion.\n\nPlease choose an option below:`,
        timestamp: '10:00 AM',
        buttons: [
          { label: '📝 Register for Training', action: 'cmd_register' },
          { label: '📚 My Training Progress', action: 'cmd_progress' },
          { label: '📅 Training Schedule', action: 'cmd_schedule' },
          { label: '📱 My Check-in QR Code', action: 'cmd_qr' },
          { label: '📝 Take Assessment', action: 'cmd_quiz' },
          { label: '🏆 My Certificate', action: 'cmd_certificate' },
          { label: '📊 Academic Transcript (MIS)', action: 'cmd_transcript' },
          { label: '❓ Contact Support', action: 'cmd_help' }
        ]
      }
    ]);
  };

  // Bot response simulator
  const sendBotResponse = (text: string, options?: Partial<ChatMessage>) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...options
        }
      ]);
    }, 450);
  };

  // User message submit
  const handleUserSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Handle ongoing registration flow
    if (regStep > 0) {
      handleRegistrationFlow(text);
      return;
    }

    // Handle command shortcuts
    const lower = text.trim().toLowerCase();
    if (lower === '/start' || lower === 'start') {
      resetChatToWelcome();
    } else if (lower.includes('register') || lower === '/register') {
      startRegistration();
    } else if (lower.includes('progress') || lower === '/progress') {
      handleCheckProgress();
    } else if (lower.includes('schedule') || lower === '/schedule') {
      handleCheckSchedule();
    } else if (lower.includes('qr') || lower.includes('checkin') || lower === '/checkin') {
      handleShowQr();
    } else if (lower.includes('quiz') || lower.includes('assessment') || lower === '/quiz') {
      handleStartQuiz();
    } else if (lower.includes('certificate') || lower === '/certificate') {
      handleCheckCertificate();
    } else if (lower.includes('transcript') || lower.includes('grade') || lower.includes('mis') || lower === '/transcript' || lower === '/grades') {
      handleCheckTranscript();
    } else {
      sendBotResponse(`I didn't quite catch that. Please select one of the menu options below or type /start.`, {
        buttons: [
          { label: '📚 My Training Progress', action: 'cmd_progress' },
          { label: '📱 My Check-in QR Code', action: 'cmd_qr' },
          { label: '🏆 My Certificate', action: 'cmd_certificate' },
          { label: '📊 Academic Transcript (MIS)', action: 'cmd_transcript' }
        ]
      });
    }
  };

  // Action button clicks
  const handleButtonClick = (action: string) => {
    if (action === 'cmd_register') {
      startRegistration();
    } else if (action === 'cmd_progress') {
      handleCheckProgress();
    } else if (action === 'cmd_schedule') {
      handleCheckSchedule();
    } else if (action === 'cmd_qr') {
      handleShowQr();
    } else if (action === 'cmd_quiz') {
      handleStartQuiz();
    } else if (action === 'cmd_certificate') {
      handleCheckCertificate();
    } else if (action === 'cmd_transcript') {
      handleCheckTranscript();
    } else if (action === 'cmd_help') {
      const org = StorageService.getOrgSettings();
      sendBotResponse(`📞 **${org.orgName} Help Desk**\n\nFor questions regarding attendance, session venues, or certification eligibility:\n• Email: ${org.supportEmail}\n• Phone: ${org.supportPhone}\n• Program: ${org.programName}`);
    } else if (action.startsWith('quiz_ans_')) {
      const selectedIdx = Number(action.replace('quiz_ans_', ''));
      handleQuizAnswer(selectedIdx);
    }
  };

  const handleCheckTranscript = () => {
    const currentP = participants.find(p => p.id === activeParticipantId);
    if (!currentP) return;

    const records = StorageService.getLearnerAcademicRecords();
    const myRecord = records.find(r => r.participantId === currentP.id);
    const org = StorageService.getOrgSettings();

    if (!myRecord) {
      sendBotResponse(`📊 **Learning MIS Academic Record**\n\nNo records found for your account.`);
      return;
    }

    let text = `📊 **${org.programName} — Official Learning MIS Transcript**\n\n`;
    text += `👤 **Student:** ${myRecord.fullName} (${myRecord.participantId})\n`;
    text += `🏛 **Cohort:** ${myRecord.cohortName}\n`;
    text += `🎖 **Academic Standing:** **${myRecord.academicStanding.toUpperCase()}**\n\n`;
    text += `📈 **Performance Summary:**\n`;
    text += `• Overall GPA: **${myRecord.overallGpaPercent}%**\n`;
    text += `• Lessons Finished: **${myRecord.completedLessonsCount} / ${myRecord.totalLessonsCount}**\n`;
    text += `• Attendance Rate: **${myRecord.attendanceRate}%**\n`;
    text += `• Assessment Exam: **${myRecord.assessmentScore !== null ? `${myRecord.assessmentScore}%` : 'Not Taken'}**\n`;
    text += `• Learning Hours Logged: **${myRecord.learningHoursLogged} hrs**\n`;
    if (myRecord.certificateId) {
      text += `\n🏆 **Official Certificate:** \`${myRecord.certificateId}\` (Verified)\n`;
    }

    text += `\n👉 *View full curriculum competency breakdown in the **Learning MIS** tab.*`;

    sendBotResponse(text, {
      buttons: [
        { label: '🏆 My Certificate', action: 'cmd_certificate' },
        { label: '📚 My Training Progress', action: 'cmd_progress' }
      ]
    });
  };

  // Registration conversation steps
  const startRegistration = () => {
    setRegStep(1);
    sendBotResponse(`📝 **Participant Registration (Step 1 of 4)**\n\nWelcome! Please type your **Full Name** (as it should officially appear on your certificate):`);
  };

  const handleRegistrationFlow = (input: string) => {
    if (regStep === 1) {
      setRegData(prev => ({ ...prev, fullName: input }));
      setRegStep(2);
      sendBotResponse(`Thank you, **${input}**!\n\n**Step 2 of 4:** What is your **Phone Number**? (e.g. +1 (555) 012-3456)`);
    } else if (regStep === 2) {
      setRegData(prev => ({ ...prev, phone: input }));
      setRegStep(3);
      sendBotResponse(`Got it! **Step 3 of 4:** What is the name of your **Enterprise / SME or Organization**?`);
    } else if (regStep === 3) {
      setRegData(prev => ({ ...prev, organization: input }));
      setRegStep(4);
      const cohortOptions = cohorts.map((c, i) => `${i + 1}. ${c.name} (${c.venue})`).join('\n');
      sendBotResponse(`Great! **Step 4 of 4:** Which training cohort are you joining?\n\n${cohortOptions || '1. Online Video LMS Cohort'}\n\n*(Type 1, 2, etc.)*`);
    } else if (regStep === 4) {
      const selectedNum = parseInt(input.trim()) || 1;
      const chosenCohort = cohorts[selectedNum - 1] || cohorts[0] || {
        id: 'cohort-default',
        name: 'Open Training Cohort',
        region: 'Global',
        venue: 'Video LMS Portal',
        leadTrainer: 'Lead Specialist'
      };

      // Create new participant in database
      const newP = StorageService.addParticipant({
        fullName: regData.fullName,
        phone: regData.phone,
        email: `${regData.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        gender: 'Female',
        organization: regData.organization,
        businessSector: 'Enterprise & Professional Services',
        region: chosenCohort.region,
        city: chosenCohort.region,
        cohortId: chosenCohort.id,
        trainingMode: 'hybrid',
        registrationSource: 'telegram',
        telegramUserId: String(Math.floor(100000000 + Math.random() * 900000000)),
        telegramUsername: regData.fullName.toLowerCase().replace(/\s+/g, '_')
      });

      onUpdateData();
      setActiveParticipantId(newP.id);
      setRegStep(0);

      sendBotResponse(`🎉 **Enrollment Successful!**\n\nYou are now registered in **${chosenCohort.name}**.\n\n• **Your Participant ID:** \`${newP.id}\`\n• **Training Venue/Link:** ${chosenCohort.venue}\n• **Lead Trainer:** ${chosenCohort.leadTrainer}\n\nYou can now use your ID or QR code for session check-in!`, {
        buttons: [
          { label: '📱 Show My Check-in QR', action: 'cmd_qr' },
          { label: '📅 View Training Schedule', action: 'cmd_schedule' },
          { label: '📚 My Progress', action: 'cmd_progress' }
        ]
      });
    }
  };

  // Progress check
  const handleCheckProgress = () => {
    const p = participants.find(x => x.id === activeParticipantId);
    if (!p) {
      sendBotResponse(`No active enrollment found. Please click **Register for Training** to enroll.`, {
        buttons: [{ label: '📝 Register for Training', action: 'cmd_register' }]
      });
      return;
    }

    const attRate = StorageService.calculateAttendanceRate(p);
    const modCount = p.moduleProgress.filter(m => m.completed).length;

    sendBotResponse(`📊 **Your Training Progress Dossier**\n\n👤 **Participant:** ${p.fullName} (\`${p.id}\`)\n🏢 **Enterprise:** ${p.organization}\n\n• **Session Attendance:** ${attRate}% ${attRate >= 80 ? '✅ (Met requirement)' : '⏳ (Needs ≥80%)'}\n• **Modules Completed:** ${modCount}/5 ${modCount >= 5 ? '✅ (100% complete)' : '⏳ (In progress)'}\n• **Assessment Score:** ${p.assessmentScore !== null ? `${p.assessmentScore}%` : 'Not yet taken'}\n• **Certification Status:** ${p.certificationStatus === 'approved' ? '🏆 Certified' : p.certificationStatus === 'eligible' ? '⭐ Eligible (Awaiting Sign-Off)' : '📚 In Progress'}`, {
      buttons: [
        { label: '📱 Show My Check-in QR', action: 'cmd_qr' },
        { label: '📝 Take Assessment', action: 'cmd_quiz' },
        { label: '🏆 Check Certificate', action: 'cmd_certificate' }
      ]
    });
  };

  // Schedule check
  const handleCheckSchedule = () => {
    const sessions = StorageService.getSessions();
    const sessionList = sessions.length > 0 
      ? sessions.map((s, i) => `${i + 1}. **${s.title}**\n• Date: ${s.date} (${s.time}) · Mode: ${s.mode} (${s.venueOrLink})`).join('\n\n')
      : '1. **Orientation Webinar** · Online LMS\n2. **Strategy Workshop** · Hybrid Classroom';

    sendBotResponse(`📅 **Upcoming Training Sessions**\n\n${sessionList}\n\n*Remember to bring your QR check-in code to every session!*`, {
      buttons: [
        { label: '📱 My Check-in QR Code', action: 'cmd_qr' },
        { label: '📚 My Training Progress', action: 'cmd_progress' }
      ]
    });
  };

  // QR Check-in badge
  const handleShowQr = () => {
    const p = participants.find(x => x.id === activeParticipantId);
    if (!p) {
      sendBotResponse(`Please register first to generate your personal check-in badge.`);
      return;
    }

    sendBotResponse(`📱 **Personal Check-in QR Badge**\n\nShow this QR code or give your ID to the trainer at the classroom door or online lobby:\n\n• **Participant ID:** \`${p.id}\`\n• **Name:** ${p.fullName}\n• **Enterprise:** ${p.organization}`, {
      qrData: p.id,
      buttons: [
        { label: '📚 My Training Progress', action: 'cmd_progress' },
        { label: '📅 Training Schedule', action: 'cmd_schedule' }
      ]
    });
  };

  // Quiz assessment in bot
  const handleStartQuiz = () => {
    const p = participants.find(x => x.id === activeParticipantId);
    if (!p) {
      sendBotResponse(`Please register first before taking the assessment.`);
      return;
    }

    const q = BDS_QUIZ_QUESTIONS[0];
    sendBotResponse(`📝 **BDS Competency Assessment (Sample Question)**\n\n${q.question}`, {
      isQuiz: true,
      quizQuestion: q,
      buttons: q.options.map((opt, idx) => ({
        label: `${idx + 1}. ${opt}`,
        action: `quiz_ans_${idx}`
      }))
    });
  };

  const handleQuizAnswer = (idx: number) => {
    const q = BDS_QUIZ_QUESTIONS[0];
    const isCorrect = idx === q.correctIndex;
    const score = isCorrect ? 90 : 60;

    // Record score
    if (activeParticipantId) {
      StorageService.recordAssessmentResult(activeParticipantId, score);
      onUpdateData();
    }

    if (isCorrect) {
      sendBotResponse(`🎉 **Correct Answer!**\n\n${q.explanation}\n\nYour score has been updated to **${score}%** in the BDS database. If you have also satisfied the 80% attendance requirement, your profile is now automatically marked as **Eligible for Certification**!`, {
        buttons: [
          { label: '📚 View Updated Progress', action: 'cmd_progress' },
          { label: '🏆 Check Certificate Status', action: 'cmd_certificate' }
        ]
      });
    } else {
      sendBotResponse(`❌ **Incorrect.**\n\nCorrect answer: **${q.options[q.correctIndex]}**\n\n${q.explanation}\n\nYour score: ${score}%. You need ≥70% to pass. You can retake the assessment after reviewing the module.`, {
        buttons: [
          { label: '🔄 Retake Assessment', action: 'cmd_quiz' },
          { label: '📚 My Training Progress', action: 'cmd_progress' }
        ]
      });
    }
  };

  // Certificate check
  const handleCheckCertificate = () => {
    const p = participants.find(x => x.id === activeParticipantId);
    if (!p) {
      sendBotResponse(`Please register first.`);
      return;
    }

    if (p.certificationStatus === 'approved') {
      const org = StorageService.getOrgSettings();
      sendBotResponse(`🏆 **Official Certificate Issued!**\n\nCongratulations, **${p.fullName}**! Your official ${org.programName} Certificate of Completion has been reviewed and signed by ${p.approvedBy || org.signatory2Name}.\n\n• **Certificate ID:** \`${p.certificateId}\`\n• **Issue Date:** ${p.certificateIssueDate}\n• **Security Code:** ${p.certificateVerificationCode}\n\nClick the button below to view and print your high-resolution certificate:`, {
        certificateParticipant: p,
        buttons: [
          { label: '🎓 View / Print Certificate', action: 'cmd_open_cert' }
        ]
      });
    } else if (p.certificationStatus === 'eligible') {
      sendBotResponse(`⭐ **Certificate Pending Final Approval**\n\nYou have met all automated requirements (attendance ≥80%, modules 5/5, assessment ≥70%)!\n\nYour portfolio is currently in the **Administrator Review Queue** awaiting final sign-off. You will receive an instant notification here once approved.`);
    } else {
      sendBotResponse(`⏳ **Certificate Requirements Not Yet Met**\n\nTo become eligible for certification, you must satisfy:\n1. Session Attendance: ≥80% (Current: ${StorageService.calculateAttendanceRate(p)}%)\n2. Complete all 5 LMS Modules\n3. Final Assessment: ≥70%\n\nCheck **My Training Progress** to see your missing items!`, {
        buttons: [
          { label: '📚 My Training Progress', action: 'cmd_progress' },
          { label: '📝 Take BDS Assessment', action: 'cmd_quiz' }
        ]
      });
    }
  };

  // Save Bot Token
  const handleSaveBotConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveBotConfig(botConfig);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Send className="w-5 h-5 text-sky-500" />
            <span>Telegram Participant Bot Portal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate the participant experience or configure real Telegram BotFather webhook credentials.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'simulator' 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            📱 Interactive Bot Simulator
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'config' 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Real Bot Token Setup</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        /* INTERACTIVE TELEGRAM CHAT SIMULATOR */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Participant Switcher / Controls */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-sky-500" />
              <span>Simulate As Participant:</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an existing participant or register a brand-new one via the bot chat:
            </p>

            <div className="space-y-2">
              {participants.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveParticipantId(p.id)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    activeParticipantId === p.id 
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-950 dark:text-sky-200 font-bold' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div>{p.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    p.certificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : p.certificationStatus === 'eligible' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.certificationStatus}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={startRegistration}
                className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
              >
                + Register New Participant in Bot
              </button>
            </div>
          </div>

          {/* Center/Right: Telegram Chat Phone Simulator */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-lg bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px]">
              
              {/* Telegram Top Header Bar */}
              <div className="bg-[#242f3d] text-white p-3 flex items-center justify-between border-b border-slate-700 select-none">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-bold shadow">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-sm text-white">BDS Training Assistant</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-[9px] font-black">✓</span>
                    </div>
                    <p className="text-[11px] text-sky-300 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                      bot · online
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  @BDSTrainingAssistant_bot
                </div>
              </div>

              {/* Chat Message Scroll Window */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0e1621] text-xs">
                {messages.map((msg) => {
                  const isBot = msg.sender === 'bot';

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                        isBot 
                          ? 'bg-[#182533] text-slate-100 rounded-tl-none border border-slate-700/40' 
                          : 'bg-[#2b5278] text-white rounded-tr-none'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>

                        {/* If QR Code attachment */}
                        {msg.qrData && (
                          <div className="mt-3 p-3 bg-white rounded-xl text-center">
                            <div 
                              className="inline-block"
                              dangerouslySetInnerHTML={{ __html: generateQrSvg(msg.qrData, 140, 140, '#0f172a') }}
                            />
                            <p className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                              Scan Token: {msg.qrData}
                            </p>
                          </div>
                        )}

                        {/* If Certificate Attachment */}
                        {msg.certificateParticipant && (
                          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <div className="flex items-center space-x-2 text-amber-300 font-bold">
                              <Award className="w-4 h-4 text-amber-400" />
                              <span>Official BDS Certificate #{msg.certificateParticipant.certificateId}</span>
                            </div>
                            <button
                              onClick={() => onViewCertificate(msg.certificateParticipant!)}
                              className="w-full mt-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center justify-center space-x-1"
                            >
                              <span>Open Official Certificate</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </button>
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end space-x-1">
                          <span>{msg.timestamp}</span>
                          {!isBot && <CheckCheck className="w-3 h-3 text-sky-400" />}
                        </div>
                      </div>

                      {/* Bot Interactive Reply Buttons */}
                      {isBot && msg.buttons && msg.buttons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                          {msg.buttons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => {
                                if (btn.action === 'cmd_open_cert' && msg.certificateParticipant) {
                                  onViewCertificate(msg.certificateParticipant);
                                } else {
                                  handleButtonClick(btn.action);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#2b5278]/60 hover:bg-[#2b5278] text-sky-200 border border-sky-500/30 text-[11px] font-medium transition-colors shadow-sm cursor-pointer"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center space-x-1 text-slate-400 text-xs italic">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-[11px]">BDS Assistant is typing...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Command Keyboard Bar */}
              <div className="bg-[#17212b] p-2 border-t border-slate-700/80 flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <button
                  onClick={() => handleUserSend('/progress')}
                  className="px-2.5 py-1 rounded bg-[#242f3d] hover:bg-slate-700 text-slate-200 whitespace-nowrap"
                >
                  📚 /progress
                </button>
                <button
                  onClick={() => handleUserSend('/checkin')}
                  className="px-2.5 py-1 rounded bg-[#242f3d] hover:bg-slate-700 text-slate-200 whitespace-nowrap"
                >
                  📱 /checkin
                </button>
                <button
                  onClick={() => handleUserSend('/certificate')}
                  className="px-2.5 py-1 rounded bg-[#242f3d] hover:bg-slate-700 text-slate-200 whitespace-nowrap"
                >
                  🏆 /certificate
                </button>
                <button
                  onClick={() => handleUserSend('/schedule')}
                  className="px-2.5 py-1 rounded bg-[#242f3d] hover:bg-slate-700 text-slate-200 whitespace-nowrap"
                >
                  📅 /schedule
                </button>
              </div>

              {/* Input bar */}
              <div className="bg-[#17212b] p-3 border-t border-slate-700 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message or select an option above..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSend(inputText)}
                  className="flex-1 bg-[#242f3d] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  onClick={() => handleUserSend(inputText)}
                  className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* REAL TELEGRAM BOT CONFIGURATION TAB */
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-sky-500" />
              <span>Connect to Real Telegram Bot (@BotFather)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You can connect this BDS-TMS system directly to a real Telegram bot using your BotFather token.
            </p>
          </div>

          <form onSubmit={handleSaveBotConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telegram Bot Token (from @BotFather):
              </label>
              <input
                type="text"
                placeholder="e.g. 7829104821:AAH8jQvLz39kdK210Lpw93kLd8102"
                value={botConfig.botToken}
                onChange={(e) => setBotConfig({ ...botConfig, botToken: e.target.value })}
                className="w-full font-mono px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Get this token by opening Telegram, messaging <strong>@BotFather</strong>, and sending <code>/newbot</code>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bot Username:
              </label>
              <input
                type="text"
                placeholder="@BDSTrainingAssistant_bot"
                value={botConfig.botUsername}
                onChange={(e) => setBotConfig({ ...botConfig, botUsername: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Webhook URL Endpoint:
              </label>
              <input
                type="text"
                value={botConfig.webhookUrl || `${window.location.origin}/api/telegram-webhook`}
                onChange={(e) => setBotConfig({ ...botConfig, webhookUrl: e.target.value })}
                className="w-full font-mono px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {tokenSaved && (
              <p className="text-emerald-500 font-bold">✓ Bot configuration saved successfully!</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md cursor-pointer"
              >
                Save & Update Bot Configuration
              </button>
            </div>
          </form>

          {/* Quick instructions */}
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <h4 className="font-bold text-sky-900 dark:text-sky-300 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-sky-500" />
              <span>How Webhook Synchronization Works:</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>When a participant messages your bot on Telegram, Telegram forwards the JSON payload to your webhook.</li>
              <li>The BDS-TMS server registers them, updates attendance, and evaluates certification eligibility.</li>
              <li>You can also run the full system right here in the simulator without needing any external server setup!</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
