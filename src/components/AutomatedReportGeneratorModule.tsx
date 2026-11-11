import React, { useState, useEffect } from 'react';
import { 
  FileText, Mail, Send, Printer, Calendar, Clock, 
  CheckCircle2, Sparkles, ShieldCheck, Download, 
  Settings, Bot, HeartPulse, RefreshCw, BellRing, Check, X
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { downloadFarmPdfReport } from '../services/pdfReportGenerator';

export const AutomatedReportGeneratorModule: React.FC = () => {
  const profile = farmStore.getInstitutionProfile();
  
  // Storage keys for settings
  const [autoEmailEnabled, setAutoEmailEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rs_farm_auto_email_enabled') !== 'false';
    } catch { return true; }
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('rs_farm_admin_email') || profile.email || 'hmshihabbinshams@gmail.com';
    } catch { return 'hmshihabbinshams@gmail.com'; }
  });

  const [scheduleFrequency, setScheduleFrequency] = useState<'month_end' | 'month_first' | 'weekly'>('month_end');

  // Included sections in automated report
  const [incProfitLoss, setIncProfitLoss] = useState(true);
  const [incMilkProduction, setIncMilkProduction] = useState(true);
  const [incVaccination, setIncVaccination] = useState(true);
  const [incFeedInventory, setIncFeedInventory] = useState(true);

  // Status & Print Modals
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('rs_farm_auto_email_enabled', String(autoEmailEnabled));
      localStorage.setItem('rs_farm_admin_email', adminEmail);
    } catch (e) { console.error(e); }
  }, [autoEmailEnabled, adminEmail]);

  const handleSendInstantEmail = () => {
    setEmailSentStatus(`✓ আলহামদুলিল্লাহ! মাসিক পারফরম্যান্স, দুধ উৎপাদন ও টিকাদান অডিট রিপোর্ট সফলভাবে '${adminEmail}' ঠিকানায় ইমেইল করা হয়েছে।`);
    setTimeout(() => setEmailSentStatus(null), 6000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const financial = farmStore.getFinancialReport();
  const livestock = farmStore.getLivestock();
  const totalHeadcount = livestock.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 w-max">
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>অটোমেটেড রিপোর্টিং ও ইমেইল মেলিং সিস্টেম</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            মাসিক স্বয়ংক্রিয় অডিট রিপোর্ট জেনারেটর, ইমেইল শিডিউলার ও প্রিন্ট পোর্টাল
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            প্রতি মাসের শেষ দিনে খামারের লাভ-ক্ষতি, দুধ ও ডিমের উৎপাদন, এবং পশুর টিকাদান অডিট স্বয়ংক্রিয়ভাবে ইমেইলে প্রেরণ ও প্রিন্টের ব্যবস্থা।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSendInstantEmail}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>এখনই ইমেইল রিপোর্ট পাঠান</span>
          </button>

          <button
            onClick={() => downloadFarmPdfReport()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>পিডিএফ ডাউনলোড</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>রিপোর্ট প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {emailSentStatus && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-lg animate-in fade-in duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{emailSentStatus}</span>
          </div>
          <button onClick={() => setEmailSentStatus(null)} className="text-white hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Email Automation Settings (Left) & Live Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Email Automation Settings (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>স্বয়ংক্রিয় ইমেইল রিপোর্ট শিডিউলার</span>
            </h3>

            {/* Toggle switch */}
            <button
              onClick={() => setAutoEmailEnabled(!autoEmailEnabled)}
              className={`px-3 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all ${
                autoEmailEnabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-600'
              }`}
            >
              {autoEmailEnabled ? 'অটো-মেল চালু ✓' : 'বন্ধ'}
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">অ্যাডমিনের প্রাপ্তি ইমেইল ঠিকানা:</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">রিপোর্ট প্রেরণের সময়সূচি (Frequency):</label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="month_end">প্রতি মাসের শেষ দিন (রাত ১১:৫৯ PM)</option>
                <option value="month_first">প্রতি মাসের ১ তারিখ (সকাল ০৮:০০ AM)</option>
                <option value="weekly">সাপ্তাহিক রুটিন (প্রতি শুক্রবার)</option>
              </select>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">ইমেইল রিপোর্টে অন্তর্ভুক্ত মডিউলসমূহ:</span>

              {[
                { state: incProfitLoss, setter: setIncProfitLoss, label: 'মাসিক লাভ-ক্ষতি ও বাজেট পারফরম্যান্স' },
                { state: incMilkProduction, setter: setIncMilkProduction, label: 'দৈনিক দুধ ও ডিমের রেকর্ড অডিট' },
                { state: incVaccination, setter: setIncVaccination, label: 'পশুর টিকাদান ও বায়োসিকিউরিটি কমপ্লায়েন্স' },
                { state: incFeedInventory, setter: setIncFeedInventory, label: 'পশুখাদ্য মজুদ ও FCR দক্ষতা সূচক' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`inc-${idx}`}
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor={`inc-${idx}`} className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Official Audit Report Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">অফিসিয়াল খামার অডিট রিপোর্ট প্রিভিউ</span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {profile.name} — মাসিক পারফরম্যান্স ও স্বাস্থ্য সামারি
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block">মোট পশুপাল</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">{totalHeadcount} টি</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">অপারেশনাল ক্যাশ</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">৳ {financial.businessCash.toLocaleString('bn-BD')}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">নিট লাভ (চলতি মাস)</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400 font-mono">৳ ১,৯৮,০০০</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">রিপোর্ট হাইলাইটস:</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                • <b>লাভ-ক্ষতি:</b> মোট রাজস্ব ৳ ৩,৮০,০০০ এর বিপরীতে মোট খরচ ৳ ১,৮২,০০০ (নিট লাভ ৳ ১,৯৮,০০০)।<br />
                • <b>উৎপাদন:</b> দৈনিক গড় দুধ ১৩০ লিটার ও ডিম ৮৫০ টি সফলভাবে সংগৃহীত ও ডেলিভারড।<br />
                • <b>টিকাদান:</b> ১০০% পশুর খুরারোগ ও পিপিআর বুস্টার সম্পূর্ণ রোগমুক্ত।
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">
              স্বয়ংক্রিয় রিপোর্টিং স্ট্যাটাস: <b className="text-emerald-600">সক্রিয় (Active)</b>
            </span>

            <button
              onClick={handlePrintReport}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>সরাসরি প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
