import React, { useState, useEffect } from 'react';
import { authService, RegisteredUser, PermissionMode } from '../../services/authService';
import { 
  Users, UserPlus, Key, ShieldCheck, ShieldAlert, 
  Trash2, Edit3, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, User, Shield, PenTool
} from 'lucide-react';

export const UserManagementSectorView: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUser[]>(() => authService.getUsers());
  const [currentUser] = useState(() => authService.getCurrentUser());
  
  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'owner' | 'manager' | 'vet_doctor' | 'staff'>('manager');
  const [newPermissionMode, setNewPermissionMode] = useState<PermissionMode>('data_entry');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Edit password modal state
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [editPasswordValue, setEditPasswordValue] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    return authService.subscribe(() => {
      setUsers(authService.getUsers());
    });
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = authService.addUser({
      username: newUsername,
      password: newPassword,
      displayName: newDisplayName,
      role: newRole,
      permissionMode: newPermissionMode,
      phone: newPhone
    });

    if (res.success) {
      setFormSuccess(`সফলভাবে "${newUsername}" ব্যবহারকারীর অ্যাকাউন্ট তৈরি হয়েছে! পারমিশন: ${newPermissionMode === 'read_only' ? 'Read-Only (শুধুমাত্র দেখার অনুমতি)' : newPermissionMode === 'data_entry' ? 'Data Entry (তথ্য ইনপুট ও পরিবর্তন)' : 'Full Access (সর্বময় ক্ষমতা)'}`);
      setNewUsername('');
      setNewPassword('');
      setNewDisplayName('');
      setNewPhone('');
      setShowAddForm(false);
      setTimeout(() => setFormSuccess(null), 5000);
    } else {
      setFormError(res.message || 'ইউজার তৈরি করা সম্ভব হয়নি।');
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" ব্যবহারকারীর অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      const res = authService.deleteUser(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editPasswordValue.trim()) return;

    authService.updateUser(editingUser.id, { password: editPasswordValue.trim() });
    setEditingUser(null);
    setEditPasswordValue('');
    setFormSuccess(`"${editingUser.displayName}"-এর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।`);
    setTimeout(() => setFormSuccess(null), 4000);
  };

  const handleToggleStatus = (u: RegisteredUser) => {
    authService.updateUser(u.id, { isActive: !u.isActive });
  };

  const handlePermissionChange = (u: RegisteredUser, perm: PermissionMode) => {
    const res = authService.updateUser(u.id, { permissionMode: perm });
    if (res.success) {
      setFormSuccess(`"${u.displayName}"-এর পারমিশন আপডেট করে "${perm === 'read_only' ? 'Read-Only (শুধুমাত্র দেখা)' : perm === 'data_entry' ? 'Data Entry (এন্ট্রি ও এডিটিং)' : 'Full Access (সর্বময় ক্ষমতা)'}" করা হয়েছে।`);
      setTimeout(() => setFormSuccess(null), 4000);
    }
  };

  const roleLabels = {
    owner: { label: 'খামার মালিক / পরিচালক', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    manager: { label: 'খামার ম্যানেজার', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    vet_doctor: { label: 'পশু চিকিৎসক (Vet)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    staff: { label: 'খামার কর্মী', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ইউজার ও একাউন্ট খাতের ডেডিকেটেড ড্যাশবোর্ড (Dashboard at Top) */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-[2.5rem] text-white p-6 sm:p-8 border border-indigo-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-inner">
                🔐
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">নিরাপত্তা ও RBAC এক্সেস কন্ট্রোল</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ইউজার রোল ও পারমিশন কন্ট্রোল</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  ব্যবহারকারীদের জন্য নির্দিষ্ট **Read-Only (শুধুমাত্র দেখার)** অথবা **Data Entry (এন্ট্রি ও সম্পাদনা)** পারমিশন নির্ধারণ করুন।
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAddForm(prev => !prev);
                setFormError(null);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ইউজার ও পারমিশন তৈরি করুন'}</span>
            </button>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">মোট অনুমোদিত একাউন্ট</p>
              <p className="text-3xl font-black font-mono text-white">{users.length} <span className="text-xs font-normal">জন</span></p>
              <p className="text-[10px] text-slate-400 font-medium">নিবন্ধিত ও নিয়ন্ত্রিত</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Full Access ইউজার</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{users.filter(u => u.permissionMode === 'full_access' || u.role === 'owner').length} <span className="text-xs font-normal">জন</span></p>
              <p className="text-[10px] text-slate-400 font-medium">মালিক ও প্রধান অ্যাডমিন</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Data Entry পারমিশন</p>
              <p className="text-3xl font-black font-mono text-amber-300">{users.filter(u => u.permissionMode === 'data_entry').length} <span className="text-xs font-normal">জন</span></p>
              <p className="text-[10px] text-slate-400 font-medium">ইনপুট ও সম্পাদনা অনুমতি</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">Read-Only পারমিশন</p>
              <p className="text-3xl font-black font-mono text-sky-300">{users.filter(u => u.permissionMode === 'read_only').length} <span className="text-xs font-normal">জন</span></p>
              <p className="text-[10px] text-slate-400 font-medium">শুধুমাত্র দেখার অনুমতিপ্রাপ্ত</p>
            </div>
          </div>

        </div>
      </div>

      {/* Notifications */}
      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-bold">{formSuccess}</p>
        </div>
      )}

      {/* New User Creation Form */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">নতুন ইউজার ও পারমিশন সেটআপ করুন</h3>
              <p className="text-xs text-slate-500 mt-0.5">যাকে অ্যাডমিন প্যানেলে কাজ করার অনুমতি দিতে চান তার পদবি ও পারমিশন লেভেল নির্বাচন করুন</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">নতুন অ্যাকাউন্ট</span>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">পুরো নাম *</label>
              <input
                type="text"
                placeholder="যেমন: মোঃ কামরুল ইসলাম"
                value={newDisplayName}
                onChange={e => setNewDisplayName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">ইউজারনেম (Username) *</label>
              <input
                type="text"
                placeholder="যেমন: kamrul_manager (ছোট হাতের অক্ষর)"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">পাসওয়ার্ড (Password) *</label>
              <input
                type="text"
                placeholder="একটি শক্তিশালী পাসওয়ার্ড দিন"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">ভূমিকা / পদবি (Role)</label>
              <select
                value={newRole}
                onChange={e => {
                  const val = e.target.value as any;
                  setNewRole(val);
                  if (val === 'owner') setNewPermissionMode('full_access');
                  else if (val === 'vet_doctor') setNewPermissionMode('read_only');
                  else setNewPermissionMode('data_entry');
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="owner">খামার মালিক / সহ-পরিচালক (Full Access)</option>
                <option value="manager">খামার ম্যানেজার (Daily Management)</option>
                <option value="vet_doctor">পশু চিকিৎসক (Health & Medical)</option>
                <option value="staff">খামার কর্মী (Feed & Entry)</option>
              </select>
            </div>

            {/* RBAC Permission Mode Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>RBAC পারমিশন লেভেল (Permission Access Level) *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  newPermissionMode === 'read_only' 
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="permissionMode"
                    value="read_only"
                    checked={newPermissionMode === 'read_only'}
                    onChange={() => setNewPermissionMode('read_only')}
                    className="mt-0.5 accent-sky-500"
                  />
                  <div>
                    <span className="text-xs font-black block flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      <span>Read-Only</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      শুধুমাত্র ড্যাশবোর্ড, চার্ট ও ডাটাবেজ দেখার অনুমতি। পরিবর্তন নিষ্ক্রিয়।
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  newPermissionMode === 'data_entry' 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="permissionMode"
                    value="data_entry"
                    checked={newPermissionMode === 'data_entry'}
                    onChange={() => setNewPermissionMode('data_entry')}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <span className="text-xs font-black block flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-amber-500" />
                      <span>Data Entry</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      দৈনিক খাদ্য, পশু ক্রয়, চিকিৎসা রেকর্ড ইনপুট ও সম্পাদনার অনুমতি।
                    </span>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  newPermissionMode === 'full_access' 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="permissionMode"
                    value="full_access"
                    checked={newPermissionMode === 'full_access'}
                    onChange={() => setNewPermissionMode('full_access')}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black block flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Full Access</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      মালিক বা প্রধান পরিচালক — সকল ফাংশন ও ইউজার নিয়ন্ত্রণের সর্বময় ক্ষমতা।
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">মোবাইল নম্বর (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="০১৭১২-XXXXXX"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                অ্যাকাউন্ট তৈরি ও পারমিশন প্রয়োগ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            অনুমোদিত ব্যবহারকারীদের তালিকা ও পারমিশন সেটিংস ({users.length} জন)
          </h3>
          <span className="text-xs text-slate-500">প্রধান অ্যাডমিন হিসেবে যেকোনো ইউজারের Read-Only বা Data Entry পারমিশন পরিবর্তন করুন</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-4 sm:p-5">ব্যবহারকারীর নাম ও ইউজারনেম</th>
                  <th className="p-4 sm:p-5">পদবি / রোল</th>
                  <th className="p-4 sm:p-5">RBAC পারমিশন লেভেল (Access Control)</th>
                  <th className="p-4 sm:p-5">পাসওয়ার্ড</th>
                  <th className="p-4 sm:p-5">স্ট্যাটাস</th>
                  <th className="p-4 sm:p-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => {
                  const roleInfo = roleLabels[u.role] || roleLabels.staff;
                  const isOwner = u.role === 'owner' || u.username === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{u.displayName}</p>
                            <p className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>

                      {/* RBAC Permission Dropdown / Badge */}
                      <td className="p-4 sm:p-5">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-black text-[11px] border border-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Full Access (সর্বময় ক্ষমতা)</span>
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={u.permissionMode || 'data_entry'}
                              onChange={e => handlePermissionChange(u, e.target.value as PermissionMode)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                                (u.permissionMode || 'data_entry') === 'read_only'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                                  : (u.permissionMode || 'data_entry') === 'data_entry'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              <option value="data_entry">✍️ Data Entry (এন্ট্রি ও এডিটিং)</option>
                              <option value="read_only">👁️ Read-Only (শুধুমাত্র দেখা)</option>
                              <option value="full_access">👑 Full Access (সর্বময় ক্ষমতা)</option>
                            </select>
                          </div>
                        )}
                      </td>

                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {u.password}
                          </span>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditPasswordValue(u.password);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="পাসওয়ার্ড পরিবর্তন করুন"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isOwner}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                            isOwner 
                              ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                              : u.isActive 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 cursor-pointer'
                          }`}
                        >
                          {u.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Blocked)'}
                        </button>
                      </td>

                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditPasswordValue(u.password);
                            }}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="পাসওয়ার্ড এডিট"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {!isOwner && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.displayName)}
                              className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="ব্যবহারকারী মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              "{editingUser.displayName}"-এর পাসওয়ার্ড পরিবর্তন
            </h4>
            <p className="text-xs text-slate-500">ইউজারনেম: @{editingUser.username}</p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নতুন পাসওয়ার্ড</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={editPasswordValue}
                    onChange={e => setEditPasswordValue(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  পাসওয়ার্ড সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
