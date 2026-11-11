import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, Clock, 
  Sparkles, AlertTriangle, UserCheck, Droplets, 
  Plus, Printer, FileText, Check, Calendar, ArrowRight, X
} from 'lucide-react';

interface VisitorLog {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  purpose: string;
  vehicleNo?: string;
  disinfected: boolean;
  approvedBy: string;
}

export const BioSecurityAuditCard: React.FC = () => {
  // Disinfection Checklist State
  const [checklist, setChecklist] = useState([
    { id: 'c1', area: 'শেড-১ (ডেইরি ক্যাটেল জোন)', chemical: 'ভাইরকন-এস (Virkon-S ১:১০০)', time: 'সকাল ০৭:১৫', done: true, by: 'করিম হোসেন' },
    { id: 'c2', area: 'শেড-২ (ছাগল ও খাসি পেন)', chemical: 'পটাশিয়াম পারম্যাঙ্গানেট স্প্রে', time: 'সকাল ০৭:৪৫', done: true, by: 'সফিকুল ইসলাম' },
    { id: 'c3', area: 'শেড-৩ (পোল্ট্রি ও হ্যাচারি শেড)', chemical: 'গ্লুটারালডিহাইড বেসড অ্যারোসল', time: 'সকাল ০৮:৩০', done: true, by: 'করিম হোসেন' },
    { id: 'c4', area: 'খামারের মূল ফটক ও ফুটবাথ ডিপ', chemical: 'ব্লিচিং পাউডার + কস্টিক সোডা ২%', time: 'সকাল ০৬:৩০', done: true, by: 'আব্দুল কাদের' },
    { id: 'c5', area: 'মৎস্য পুকুরের পাড় ও ওয়াটার চ্যানেল', chemical: 'কৃষি চুন ও পটাশ লাইট ডাইল্যুশন', time: 'বিকাল ০৪:৩০', done: false, by: 'অপেক্ষমাণ' },
  ]);

  // Visitor Entry Log State
  const [visitors, setVisitors] = useState<VisitorLog[]>([
    {
      id: 'V-101',
      timestamp: '২০২৬-১১-১০ ০৯:১৫ AM',
      name: 'ডাঃ মোস্তাফিজুর রহমান',
      phone: '০১৭১১-২২৩৩৪৪',
      purpose: 'উপজেলা প্রাণিসম্পদ কর্মকর্তা (মাসিক স্বাস্থ্য অডিট)',
      vehicleNo: 'ঢাকা মেট্রো-গ ১২-৩৪৫৬',
      disinfected: true,
      approvedBy: 'ফার্ম ইনচার্জ'
    },
    {
      id: 'V-102',
      timestamp: '২০২৬-১১-১০ ১০:৩০ AM',
      name: 'জনাব রফিকুল আলম',
      phone: '০১৮২০-৫৫৮৮৫৮',
      purpose: 'গাভী ও খাসি ক্রয় ও পরিদর্শনের জন্য আগমন',
      vehicleNo: 'চট্ট মেট্রো-খ ৯৮-৭৬৫৪',
      disinfected: true,
      approvedBy: 'ম্যানেজার'
    },
    {
      id: 'V-103',
      timestamp: '২০২৬-১১-০৯ ০৩:৪৫ PM',
      name: 'মেসার্স নারিশ ফিড ডেলিভারি চালক',
      phone: '০১৯৮৭-৬৫৪৩২১',
      purpose: 'পশুখাদ্য ও সাইলেজ আনলোড',
      vehicleNo: 'ঢাকা মেট্রো-ট ৪৪-৫৫৬৬',
      disinfected: true,
      approvedBy: 'গুদাম রক্ষক'
    }
  ]);

  // Modal State for adding a visitor
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vPurpose, setVPurpose] = useState('');
  const [vVehicle, setVVehicle] = useState('');
  const [vDisinfected, setVDisinfected] = useState(true);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          done: !item.done,
          time: !item.done ? 'এখনই সম্পন্ন' : 'বাকি',
          by: !item.done ? 'ডিউটি অফিসার' : 'অপেক্ষমাণ'
        };
      }
      return item;
    }));
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) return;

    const newV: VisitorLog = {
      id: `V-${Math.floor(Math.random() * 899) + 100}`,
      timestamp: new Date().toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }),
      name: vName,
      phone: vPhone || 'প্রযোজ্য নয়',
      purpose: vPurpose || 'সাধারণ পরিদর্শন',
      vehicleNo: vVehicle || 'পায়ে হেঁটে',
      disinfected: vDisinfected,
      approvedBy: 'অ্যাডমিন'
    };

    setVisitors(prev => [newV, ...prev]);
    setVName('');
    setVPhone('');
    setVPurpose('');
    setVVehicle('');
    setShowAddVisitorModal(false);
  };

  const completedCount = checklist.filter(c => c.done).length;
  const complianceScore = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              বায়ো-সিকিউরিটি ও সরকারি কমপ্লায়েন্স
            </span>
            <span className="text-xs font-bold text-slate-500">DLS গ্রেড-১ মানদণ্ড</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>খামার বায়ো-সিকিউরিটি, শেড পরিচ্ছন্নতা ও ভিজিটর অডিট ট্রেইল</span>
          </h3>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>অডিট রিপোর্ট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">দৈনিক স্যানিটেশন অগ্রগতি</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{complianceScore}%</span>
            <span className="text-xs text-emerald-600 font-bold">({completedCount}/{checklist.length} সম্পন্ন)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
          <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">ফুটবাথ ও ভেহিকেল ডিপ</span>
          <div className="flex items-center gap-1.5 mt-1 text-teal-700 dark:text-teal-400 font-extrabold text-sm">
            <Droplets className="w-4 h-4" />
            <span>সক্রিয় ও জীবাণুমুক্ত (১০০%)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">আজকের রেজিস্টার্ড ভিজিটর</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{visitors.length}</span>
            <span className="text-xs text-amber-600">জন</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500">বায়ো-সিকিউরিটি সার্টিফাইড</span>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>প্রাণিসম্পদ অধিদপ্তর নিরীক্ষিত</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shed Disinfection Schedule & Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>দৈনিক শেড জীবাণুনাশক স্প্রে ও পরিচ্ছন্নতা রুটিন</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">ক্লিক করে টিক দিন</span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.done
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    item.done ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 text-transparent'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${item.done ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.area}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      কেমিক্যাল: <span className="font-semibold text-emerald-600">{item.chemical}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 shrink-0">
                  <span className="font-mono block">{item.time}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">{item.by}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visitor & External Vehicle Entry Log */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>খামারে বহিরাগত প্রবেশ ও যানবাহন জীবাণুমুক্তকরণ লগ</span>
            </h4>

            <button
              onClick={() => setShowAddVisitorModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold flex items-center gap-1 cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ভিজিটর এন্ট্রি</span>
            </button>
          </div>

          <div className="space-y-3">
            {visitors.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white">{v.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({v.phone})</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{v.timestamp}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">{v.purpose}</p>

                <div className="flex items-center justify-between pt-1 text-[10px] border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">যানবাহন: <b className="text-slate-700 dark:text-slate-200">{v.vehicleNo}</b></span>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>স্প্রে ও জীবাণুমুক্তকরণ সম্পন্ন ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Visitor Modal */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowAddVisitorModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">নতুন ভিজিটর / ভেহিকেল রেজিস্ট্রি</h3>

            <form onSubmit={handleAddVisitor} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ভিজিটরের পূর্ণ নাম:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ কামরুল হাসান"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">আগমনের উদ্দেশ্য:</label>
                <input
                  type="text"
                  placeholder="যেমন: দুধ/ডিম ক্রয় বা পরামর্শ"
                  value={vPurpose}
                  onChange={(e) => setVPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">যানবাহন নম্বর (যদি থাকে):</label>
                <input
                  type="text"
                  placeholder="যেমন: চট্ট মেট্রো-ল ১২৩৪ বা পায়ে হেঁটে"
                  value={vVehicle}
                  onChange={(e) => setVVehicle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="disinfectedCheck"
                  checked={vDisinfected}
                  onChange={(e) => setVDisinfected(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <label htmlFor="disinfectedCheck" className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  গেটে জীবাণুনাশক স্প্রে ও হ্যান্ড স্যানিটাইজিং নিশ্চিত করা হয়েছে
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVisitorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
