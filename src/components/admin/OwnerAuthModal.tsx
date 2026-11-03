import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  UserPlus, 
  Trash2, 
  Check, 
  AlertCircle, 
  X, 
  Crown, 
  Users, 
  Mail, 
  User, 
  ShieldAlert,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { StorageService, PRIMARY_OWNER_EMAIL, DEFAULT_OWNER_PASSCODE } from '../../services/storageService';
import { AuthorizedUser, OwnerRole, OwnerSession } from '../../types';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: OwnerSession | null;
  onAuthChange: () => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onAuthChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'login' | 'manage' | 'passcode'>('login');
  
  // Login State
  const [emailInput, setEmailInput] = useState(PRIMARY_OWNER_EMAIL);
  const [passcodeInput, setPasscodeInput] = useState(DEFAULT_OWNER_PASSCODE);
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Delegation State (Grant access to others)
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [newRole, setNewRole] = useState<OwnerRole>('instructor');
  const [delegateMessage, setDelegateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Passcode State
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [passcodeMessage, setPasscodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load authorized users list
  const refreshUsers = () => {
    setAuthorizedUsers(StorageService.getAuthorizedUsers());
  };

  useEffect(() => {
    if (isOpen) {
      refreshUsers();
      if (session) {
        setActiveSubTab('manage');
      } else {
        setActiveSubTab('login');
      }
      setLoginError('');
      setLoginSuccess('');
      setDelegateMessage(null);
      setPasscodeMessage(null);
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const res = StorageService.loginOwner(emailInput, passcodeInput);
    if (!res.success) {
      setLoginError(res.message || 'Authentication failed.');
      return;
    }

    setLoginSuccess('Authentication successful! Owner features unlocked.');
    onAuthChange();
    setTimeout(() => {
      setActiveSubTab('manage');
      onClose();
    }, 600);
  };

  // Handle Logout
  const handleLogout = () => {
    StorageService.clearOwnerSession();
    onAuthChange();
    setActiveSubTab('login');
    setLoginSuccess('Successfully locked. The system is now in participant mode.');
  };

  // Handle Grant Access
  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setDelegateMessage(null);

    const res = StorageService.addAuthorizedUser(newEmail, newName, newPasscode, newRole);
    if (!res.success) {
      setDelegateMessage({ type: 'error', text: res.message });
      return;
    }

    setDelegateMessage({ type: 'success', text: res.message });
    setNewEmail('');
    setNewName('');
    setNewPasscode('');
    refreshUsers();
    onAuthChange();
  };

  // Handle Revoke Access
  const handleRevoke = (userId: string, targetName: string) => {
    if (window.confirm(`Revoke owner/instructor access from ${targetName}? They will no longer be able to access the Module Builder or Admin tools.`)) {
      const res = StorageService.removeAuthorizedUser(userId);
      if (res.success) {
        setDelegateMessage({ type: 'success', text: res.message });
        refreshUsers();
        onAuthChange();
      } else {
        setDelegateMessage({ type: 'error', text: res.message });
      }
    }
  };

  // Handle Update Passcode
  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeMessage(null);

    if (!session) return;
    if (newPasswordValue !== confirmPasswordValue) {
      setPasscodeMessage({ type: 'error', text: 'New passcodes do not match.' });
      return;
    }

    const res = StorageService.updateOwnerPasscode(session.userId, newPasswordValue);
    if (!res.success) {
      setPasscodeMessage({ type: 'error', text: res.message });
      return;
    }

    setPasscodeMessage({ type: 'success', text: res.message });
    setNewPasswordValue('');
    setConfirmPasswordValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              {session ? <Crown className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight text-white">Owner Access &amp; Permissions</h2>
                {session ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Restricted to <span className="font-semibold text-amber-300">{PRIMARY_OWNER_EMAIL}</span> &amp; authorized staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation if logged in */}
        {session && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2 text-xs font-semibold gap-2">
            <button
              onClick={() => setActiveSubTab('manage')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'manage'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team &amp; Access Delegation ({authorizedUsers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('passcode')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'passcode'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Passcode</span>
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6">

          {/* VIEW 1: LOGIN (WHEN LOCKED) */}
          {!session && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-800 dark:text-amber-300">Owner Privacy &amp; Control Guard</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Participants can only view published courses, take modules, and verify certificates. The curriculum editor, participant dossiers, and certification approvals are visible exclusively to the owner.
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="biruksahlu06@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-slate-400">Primary owner account</span>
                  <button
                    type="button"
                    onClick={() => setEmailInput(PRIMARY_OWNER_EMAIL)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                  >
                    Use {PRIMARY_OWNER_EMAIL}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Security Passcode / PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    required
                    placeholder="Enter owner passcode"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Initial default owner passcode: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono font-bold">owner2026</code> (you can customize it once unlocked).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Continue as Participant
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Owner Features</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: MANAGE TEAM & ACCESS DELEGATION (WHEN UNLOCKED) */}
          {session && activeSubTab === 'manage' && (
            <div className="space-y-6">
              
              {/* Active Session Info Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-sm">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{session.name}</span>
                      <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        {session.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{session.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock &amp; Logout</span>
                </button>
              </div>

              {/* Feedback Message */}
              {delegateMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  delegateMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {delegateMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{delegateMessage.text}</span>
                </div>
              )}

              {/* Form to Grant Access */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>Grant Access to a Team Member or Co-Instructor</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Only authorized persons can view owner tools</span>
                </div>

                <form onSubmit={handleGrantAccess} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="e.g. Dr. Abebe Tessema"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      placeholder="e.g. colleague@example.com"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Access Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as OwnerRole)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="instructor">Instructor (Curriculum &amp; Attendance)</option>
                      <option value="owner">Co-Owner (Full Administrative Access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Passcode / PIN</label>
                    <input
                      type="text"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      required
                      placeholder="Min 4 characters"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Grant Access</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Authorized Users */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Authorized Users List ({authorizedUsers.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Anyone not in this list is strictly restricted to participant mode
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {authorizedUsers.map((user) => (
                    <div key={user.id} className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          user.isPrimary 
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {user.isPrimary ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                            {user.isPrimary && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                                Primary Owner
                              </span>
                            )}
                            <span className="text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-semibold">
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                            <span>{user.email}</span>
                            <span>·</span>
                            <span>Passcode: <code className="font-mono text-slate-700 dark:text-slate-300 font-bold">{user.passcode}</code></span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {user.isPrimary ? (
                          <span className="text-[11px] text-slate-400 font-medium px-2 py-1 italic">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevoke(user.id, user.name)}
                            className="px-2.5 py-1 text-xs rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer flex items-center gap-1"
                            title="Revoke access"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW 3: PASSCODE CHANGE (WHEN UNLOCKED) */}
          {session && activeSubTab === 'passcode' && (
            <form onSubmit={handleUpdatePasscode} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Update Your Access Passcode / PIN
                </h3>
                <p className="text-xs text-slate-500">
                  Changing passcode for: <span className="font-semibold text-slate-700 dark:text-slate-300">{session.email}</span>
                </p>
              </div>

              {passcodeMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  passcodeMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {passcodeMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passcodeMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Passcode
                </label>
                <input
                  type="password"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  required
                  placeholder="Min 4 characters"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Passcode
                </label>
                <input
                  type="password"
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  required
                  placeholder="Retype new passcode"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('manage')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
