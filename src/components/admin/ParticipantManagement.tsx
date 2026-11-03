import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  ShieldCheck, 
  Eye, 
  X, 
  Check, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Calendar,
  Send,
  Printer,
  GraduationCap
} from 'lucide-react';
import { Cohort, Participant, TrainingMode, CertificationStatus } from '../../types';
import { StorageService } from '../../services/storageService';

interface ParticipantManagementProps {
  participants: Participant[];
  cohorts: Cohort[];
  onUpdateParticipants: () => void;
  selectedParticipant: Participant | null;
  onSelectParticipant: (p: Participant | null) => void;
  onViewCertificate: (p: Participant) => void;
}

export const ParticipantManagement: React.FC<ParticipantManagementProps> = ({
  participants,
  cohorts,
  onUpdateParticipants,
  selectedParticipant,
  onSelectParticipant,
  onViewCertificate
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Precompute academic record map for fast badge and dossier lookups
  const academicRecordMap = useMemo(() => {
    const records = StorageService.getLearnerAcademicRecords();
    return new Map(records.map(r => [r.participantId, r]));
  }, [participants]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Add Participant Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    organization: '',
    businessSector: 'Enterprise & Professional Services',
    region: 'Metro Region',
    city: 'Metro City',
    cohortId: cohorts[0]?.id || '',
    trainingMode: 'hybrid' as TrainingMode,
    registrationSource: 'admin' as const
  });

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = 
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCohort = selectedCohort === 'all' || p.cohortId === selectedCohort;
      const matchesMode = selectedMode === 'all' || p.trainingMode === selectedMode;
      const matchesStatus = selectedStatus === 'all' || p.certificationStatus === selectedStatus;

      return matchesSearch && matchesCohort && matchesMode && matchesStatus;
    });
  }, [participants, searchQuery, selectedCohort, selectedMode, selectedStatus]);

  // Handle Add Participant Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please provide at least a full name and phone number.');
      return;
    }

    StorageService.addParticipant(formData);
    onUpdateParticipants();
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      gender: 'Female',
      organization: '',
      businessSector: 'Enterprise & Professional Services',
      region: 'Metro Region',
      city: 'Metro City',
      cohortId: cohorts[0]?.id || '',
      trainingMode: 'hybrid',
      registrationSource: 'admin'
    });
  };

  // Handle Bulk CSV Import
  const handleBulkImport = () => {
    setBulkError('');
    setBulkSuccess('');
    if (!bulkCsvText.trim()) {
      setBulkError('Please paste CSV text or load sample template.');
      return;
    }

    try {
      const lines = bulkCsvText.trim().split('\n');
      if (lines.length <= 1) {
        setBulkError('CSV must include a header and at least 1 participant row.');
        return;
      }

      const rows = lines.slice(1);
      let importedCount = 0;

      rows.forEach(row => {
        const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2 && cols[0]) {
          const fullName = cols[0];
          const phone = cols[1] || '+1 (555) 000-0000';
          const email = cols[2] || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
          const gender = (cols[3] === 'Male' || cols[3] === 'Female') ? cols[3] : 'Female';
          const organization = cols[4] || 'Enterprise Venture';
          const region = cols[5] || 'Metro Region';
          const cohortId = cohorts[0]?.id || 'cohort-alpha-01';

          StorageService.addParticipant({
            fullName,
            phone,
            email,
            gender: gender as any,
            organization,
            businessSector: 'Enterprise & Services',
            region,
            city: region,
            cohortId,
            trainingMode: 'hybrid',
            registrationSource: 'admin'
          });
          importedCount++;
        }
      });

      onUpdateParticipants();
      setBulkSuccess(`Successfully enrolled ${importedCount} participants!`);
      setTimeout(() => {
        setIsBulkModalOpen(false);
        setBulkCsvText('');
        setBulkSuccess('');
      }, 1500);
    } catch (err: any) {
      setBulkError(`Failed to parse CSV: ${err.message}`);
    }
  };

  // Load sample CSV
  const loadSampleCsv = () => {
    const sample = `Full Name,Phone,Email,Gender,Organization,Region\n"Morgan Taylor","+1 (555) 123-4567","morgan@example.com","Female","Apex Global Solutions","Metro Region"\n"Sam Rivera","+1 (555) 234-5678","sam@example.com","Male","Summit Tech Labs","Central Region"\n"Jordan Kelly","+1 (555) 345-6789","jordan@example.com","Female","Venture Design Studio","North Region"`;
    setBulkCsvText(sample);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Participant ID',
      'Full Name',
      'Phone',
      'Email',
      'Gender',
      'Organization',
      'Sector',
      'Region',
      'Cohort ID',
      'Training Mode',
      'Registration Source',
      'Registered Date',
      'Attendance %',
      'Assessment Score %',
      'Status',
      'Certificate ID',
      'Issue Date'
    ];

    const rows = participants.map(p => {
      const attendanceRate = StorageService.calculateAttendanceRate(p);
      return [
        `"${p.id}"`,
        `"${p.fullName}"`,
        `"${p.phone}"`,
        `"${p.email}"`,
        `"${p.gender}"`,
        `"${p.organization}"`,
        `"${p.businessSector}"`,
        `"${p.region}"`,
        `"${p.cohortId}"`,
        `"${p.trainingMode}"`,
        `"${p.registrationSource}"`,
        `"${p.registeredAt}"`,
        `"${attendanceRate}%"`,
        `"${p.assessmentScore !== null ? p.assessmentScore + '%' : 'N/A'}"`,
        `"${p.certificationStatus}"`,
        `"${p.certificateId || ''}"`,
        `"${p.certificateIssueDate || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bds_tms_participants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle immediate certification approval from dossier drawer
  const handleQuickApprove = (p: Participant) => {
    StorageService.approveCertification(p.id, 'Programme Administrator (BDS-TMS)');
    onUpdateParticipants();
    // Update local selection
    const updated = StorageService.getParticipants().find(x => x.id === p.id);
    if (updated) {
      onSelectParticipant(updated);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>BDS Participant Directory & Enrollment</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {participants.length} Total Records
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, enroll, and inspect participant attendance, LMS scores and certification eligibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Participant</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, enterprise, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Cohort Filter */}
        <div>
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Training Cohorts</option>
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Training Mode Filter */}
        <div>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Delivery Modes</option>
            <option value="hybrid">Hybrid (Classroom + Online)</option>
            <option value="physical">Physical Classroom Only</option>
            <option value="online">100% Online / Virtual</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Certification Statuses</option>
            <option value="eligible">⭐ Ready for Approval (Eligible)</option>
            <option value="approved">🏆 Certified (Approved)</option>
            <option value="in_progress">📚 In Progress</option>
            <option value="revoked">❌ Revoked</option>
          </select>
        </div>

      </div>

      {/* Participants Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-3">Enterprise / Sector</th>
                <th className="py-3 px-3">Cohort & Mode</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">LMS Modules</th>
                <th className="py-3 px-3">Assessment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No participants matched your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const attendanceRate = StorageService.calculateAttendanceRate(p);
                  const completedModulesCount = p.moduleProgress.filter(m => m.completed).length;
                  const cohortObj = cohorts.find(c => c.id === p.cohortId);

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>{p.fullName}</span>
                          {p.registrationSource === 'telegram' && (
                            <span className="text-[10px] text-sky-500 dark:text-sky-400 font-normal" title="Registered via Telegram Bot">
                              [Telegram]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {p.id} · {p.phone}
                        </div>
                      </td>

                      {/* Organization & Sector */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{p.organization}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.businessSector}</div>
                      </td>

                      {/* Cohort & Mode */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {cohortObj ? cohortObj.name.split(':')[0] : p.cohortId}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {p.trainingMode}
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold ${attendanceRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                            {attendanceRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({p.attendance.filter(a => a.attended).length}/{p.attendance.length})
                          </span>
                        </div>
                      </td>

                      {/* Modules */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          {p.moduleProgress.map((mp, idx) => (
                            <span 
                              key={mp.moduleId || idx} 
                              className={`w-3.5 h-3.5 rounded text-[8px] flex items-center justify-center font-bold ${
                                mp.completed 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              }`}
                              title={`${mp.moduleTitle || `Module ${idx+1}`}: ${mp.completed ? 'Completed' : 'Pending'}`}
                            >
                              {idx + 1}
                            </span>
                          ))}
                          <span className="text-[10px] text-slate-500 ml-1">
                            {p.moduleProgress.filter(m => m.completed).length}/{p.moduleProgress.length}
                          </span>
                        </div>
                      </td>

                      {/* Assessment */}
                      <td className="py-3 px-3">
                        {p.assessmentScore !== null ? (
                          <span className={`font-bold ${p.assessmentScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                            {p.assessmentScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending</span>
                        )}
                      </td>

                      {/* Status */}
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

                        {/* Learning MIS Academic Standing badge */}
                        {(() => {
                          const rec = academicRecordMap.get(p.id);
                          if (!rec) return null;
                          const badgeColor = 
                            rec.academicStanding === 'Honors' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                            rec.academicStanding === 'Good Standing' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                            rec.academicStanding === 'At Risk' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                          return (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border mt-1 block w-fit truncate max-w-[130px] ${badgeColor}`}>
                              🎓 {rec.academicStanding} ({rec.overallGpaPercent}%)
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectParticipant(p)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                          >
                            Dossier
                          </button>

                          {p.certificationStatus === 'approved' && (
                            <button
                              onClick={() => onViewCertificate(p)}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center"
                              title="View & Print Official Certificate"
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Certificate
                            </button>
                          )}

                          {p.certificationStatus === 'eligible' && (
                            <button
                              onClick={() => handleQuickApprove(p)}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm"
                              title="Approve and Issue Certificate Now"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PARTICIPANT DOSSIER DRAWER / MODAL */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedParticipant.fullName}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedParticipant.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedParticipant.organization} · {selectedParticipant.businessSector} ({selectedParticipant.region})
                </p>
              </div>

              <button
                onClick={() => onSelectParticipant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Quick Contact & Status Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedParticipant.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Training Mode</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{selectedParticipant.trainingMode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Source</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{selectedParticipant.registrationSource}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Enrolled Date</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedParticipant.registeredAt}</span>
                </div>
              </div>

              {/* Certification Eligibility Checklist */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Certification Eligibility Audit</span>
                  </h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedParticipant.certificationStatus === 'approved' 
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : selectedParticipant.certificationStatus === 'eligible'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    Status: {selectedParticipant.certificationStatus.toUpperCase()}
                  </span>
                </div>

                {/* Audit Items */}
                {(() => {
                  const attRate = StorageService.calculateAttendanceRate(selectedParticipant);
                  const attOk = attRate >= 80;
                  const modCount = selectedParticipant.moduleProgress.filter(m => m.completed).length;
                  const modOk = modCount >= 5;
                  const score = selectedParticipant.assessmentScore;
                  const scoreOk = score !== null && score >= 70;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className={`p-2.5 rounded-lg border ${attOk ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {attOk ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                          <span>Attendance: {attRate}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Requirement: ≥ 80%</p>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${modOk ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {modOk ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                          <span>Modules: {modCount}/5</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Requirement: 100% (5/5)</p>
                      </div>

                      <div className={`p-2.5 rounded-lg border ${scoreOk ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {scoreOk ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                          <span>Assessment: {score !== null ? `${score}%` : 'Not taken'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Requirement: ≥ 70%</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Trainer remarks */}
                {selectedParticipant.trainerRemarks && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    &ldquo;{selectedParticipant.trainerRemarks}&rdquo;
                  </p>
                )}

                {/* Action button in checklist */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {selectedParticipant.certificationStatus === 'eligible' && (
                    <button
                      onClick={() => handleQuickApprove(selectedParticipant)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Approve & Issue Official Certificate Now</span>
                    </button>
                  )}

                  {selectedParticipant.certificationStatus === 'approved' && (
                    <button
                      onClick={() => onViewCertificate(selectedParticipant)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>View & Print Official Certificate ({selectedParticipant.certificateId})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Learning MIS Academic Performance & Transcript Record */}
              {(() => {
                const rec = academicRecordMap.get(selectedParticipant.id);
                if (!rec) return null;
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Learning MIS Academic Standing &amp; GPA
                        </h4>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        rec.academicStanding === 'Honors'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : rec.academicStanding === 'Good Standing'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : rec.academicStanding === 'At Risk'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {rec.academicStanding}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Weighted GPA:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {rec.overallGpaPercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lessons Completed:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {rec.completedLessonsCount} / {rec.totalLessonsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Assessment Score:</span>
                        <span className={`font-semibold ${rec.assessmentScore !== null && rec.assessmentScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                          {rec.assessmentScore !== null ? `${rec.assessmentScore}%` : 'Pending Exam'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Learning Time Logged:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {rec.learningHoursLogged} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Session Attendance Records */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Session Attendance History ({selectedParticipant.attendance.length} Sessions)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedParticipant.attendance.map((att, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{att.sessionTitle}</span>
                        <div className="text-[10px] text-slate-400">
                          {att.date} · Mode: {att.mode} · Verified by: {att.verifiedBy}
                        </div>
                      </div>
                      <div>
                        {att.attended ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Present ({att.checkInTime || 'Checked in'})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-medium text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => onSelectParticipant(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD PARTICIPANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>Manual Participant Registration</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solomon Abebe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +251 91 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. solomon@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Enterprise / SME Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Leather Crafts"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Textiles, Agro-processing"
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Training Cohort</label>
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    {cohorts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Training Mode</label>
                  <select
                    value={formData.trainingMode}
                    onChange={(e) => setFormData({ ...formData, trainingMode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="hybrid">Hybrid (Classroom + Online)</option>
                    <option value="physical">Physical Classroom</option>
                    <option value="online">100% Online</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Save & Enroll Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Bulk Participant Import (CSV / Excel)</span>
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Paste CSV data below with columns: <strong>Full Name, Phone, Email, Gender, Organization, Region</strong>.
              </p>

              <button
                onClick={loadSampleCsv}
                className="text-xs text-amber-600 dark:text-amber-400 underline font-semibold cursor-pointer"
              >
                + Insert Sample 3-Row CSV Data
              </button>

              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder="Full Name,Phone,Email,Gender,Organization,Region..."
                className="w-full p-3 font-mono text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />

              {bulkError && (
                <p className="text-rose-500 font-semibold">{bulkError}</p>
              )}

              {bulkSuccess && (
                <p className="text-emerald-500 font-semibold">{bulkSuccess}</p>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Import Participants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
