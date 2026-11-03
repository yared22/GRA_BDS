import React, { useState } from 'react';
import { 
  Building2, 
  Award, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  FileJson, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { OrgSettings } from '../../types';
import { StorageService } from '../../services/storageService';

interface OrgSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateData: () => void;
}

export const OrgSettingsModal: React.FC<OrgSettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdateData
}) => {
  const [settings, setSettings] = useState<OrgSettings>(StorageService.getOrgSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showImportSection, setShowImportSection] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveOrgSettings(settings);
    onUpdateData();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Export JSON file
  const handleExportJson = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tms_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle JSON Import
  const handleImportJson = () => {
    if (!importText.trim()) {
      setImportStatus({ success: false, message: 'Please paste JSON data first.' });
      return;
    }
    const res = StorageService.importAllData(importText);
    setImportStatus(res);
    if (res.success) {
      onUpdateData();
      setSettings(StorageService.getOrgSettings());
      setTimeout(() => {
        setImportStatus(null);
        setShowImportSection(false);
        setImportText('');
      }, 1800);
    }
  };

  // Clear all data to start with empty canvas
  const handleClearAll = () => {
    if (window.confirm('Clear all participants, cohorts, modules and sessions? This provides an empty system for you to enter your own exact examples.')) {
      StorageService.clearAllData();
      onUpdateData();
      onClose();
    }
  };

  // Reset to generic defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings and load generic templates?')) {
      StorageService.resetToDefaults();
      onUpdateData();
      setSettings(StorageService.getOrgSettings());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Program, Organization & Certificate Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customize titles, signatures, and manage data backups for testing your own examples.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          
          {/* Organization & Program Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Institution Name:
              </label>
              <input
                type="text"
                required
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                placeholder="e.g. Global Training Academy"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program Title:
              </label>
              <input
                type="text"
                required
                value={settings.programName}
                onChange={(e) => setSettings({ ...settings, programName: e.target.value })}
                placeholder="e.g. Executive Capability & Leadership Program"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tagline & Program Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Department:
              </label>
              <input
                type="text"
                value={settings.orgTagline}
                onChange={(e) => setSettings({ ...settings, orgTagline: e.target.value })}
                placeholder="e.g. Enterprise Development & Skills Institute"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program Code:
              </label>
              <input
                type="text"
                value={settings.programCode}
                onChange={(e) => setSettings({ ...settings, programCode: e.target.value })}
                placeholder="TMS-2026"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Certificate Signatories */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certificate Signatories & Seal</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Signatory 1 (Trainer / Specialist):
                </label>
                <input
                  type="text"
                  value={settings.signatory1Name}
                  onChange={(e) => setSettings({ ...settings, signatory1Name: e.target.value })}
                  placeholder="e.g. Lead Instructor"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={settings.signatory1Title}
                  onChange={(e) => setSettings({ ...settings, signatory1Title: e.target.value })}
                  placeholder="e.g. Curriculum Lead"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Signatory 2 (Director / Chair):
                </label>
                <input
                  type="text"
                  value={settings.signatory2Name}
                  onChange={(e) => setSettings({ ...settings, signatory2Name: e.target.value })}
                  placeholder="e.g. Program Director"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={settings.signatory2Title}
                  onChange={(e) => setSettings({ ...settings, signatory2Title: e.target.value })}
                  placeholder="e.g. Certification Board"
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Seal Badge Text</label>
                <input
                  type="text"
                  value={settings.sealText}
                  onChange={(e) => setSettings({ ...settings, sealText: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Watermark Text</label>
                <input
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Cert ID Prefix</label>
                <input
                  type="text"
                  value={settings.certificatePrefix}
                  onChange={(e) => setSettings({ ...settings, certificatePrefix: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Support Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Support Email (Shown in Bot & Help):
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Support Phone:
              </label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Save Status */}
          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" />
              Settings updated successfully! Certificates will reflect your custom organization.
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowImportSection(!showImportSection)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Data Backup & JSON Import</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>

        {/* DATA BACKUP & IMPORT/EXPORT DRAWER */}
        {showImportSection && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileJson className="w-4 h-4 text-sky-500" />
              <span>Data Backup, Export & Reset</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Export your current participants and modules as a reusable JSON file, import your own custom datasets, or wipe all records to start completely from scratch.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All Data (JSON Backup)</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-300 dark:border-rose-900 flex items-center space-x-1.5 cursor-pointer"
                title="Wipe all participants, cohorts and modules to start empty"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Records (Start Empty)</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Generic Demo</span>
              </button>
            </div>

            {/* Paste JSON Import Area */}
            <div className="pt-2 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                Paste Custom JSON Dataset to Import:
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"cohorts": [...], "modules": [...], "participants": [...]}'
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px]"
              />

              {importStatus && (
                <div className={`p-2 rounded font-semibold text-[11px] ${
                  importStatus.success ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {importStatus.message}
                </div>
              )}

              <button
                onClick={handleImportJson}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON Dataset</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
