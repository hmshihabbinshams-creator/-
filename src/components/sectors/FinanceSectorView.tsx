import React, { useState } from 'react';
import { farmStore } from '../../services/farmStore';
import { 
  Wallet, Landmark, TrendingUp, DollarSign, 
  ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 
} from 'lucide-react';
import { MonthlyProfitLossSummaryCard } from '../MonthlyProfitLossSummaryCard';
import { ExpenseSectorChart } from '../ExpenseSectorChart';

export const FinanceSectorView: React.FC = () => {
  const [financial, setFinancial] = useState(() => farmStore.getFinancialOverview());
  const [ledger, setLedger] = useState(() => farmStore.getOwnerTransactions());
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendNote, setDividendNote] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setFinancial(farmStore.getFinancialOverview());
      setLedger(farmStore.getOwnerTransactions());
    });
  }, []);

  const handleDistributeDividend = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(dividendAmount);
    if (!amt || amt <= 0 || amt > financial.withdrawableProfit) {
      alert('সঠিক ও বরাদ্দকৃত মুনাফার সমান বা কম পরিমাণ টাকা লিখুন।');
      return;
    }

    farmStore.addOwnerTransaction({
      ownerName: 'খামার অংশীদারগণ',
      type: 'উত্তোলন (Withdrawal)',
      amount: amt,
      note: dividendNote || 'লভ্যাংশ বন্টন ও উত্তোলন',
    });

    setShowDividendModal(false);
    setDividendAmount('');
    setDividendNote('');
    setSuccessMsg(`${amt.toLocaleString('bn-BD')} ৳ সফলভাবে লভ্যাংশ হিসেবে বিতরণ করা হয়েছে।`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. অর্থ ও হিসাব খাতের ডেডিকেটেড ড্যাশবোর্ড (Financial Dashboard at Top) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-indigo-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-inner">
                💰
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">অর্থ, মুনাফা ও লেজার খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">পরিচালন তহবিল, নিট লাভ, ক্যাপিটাল স্টক ও অংশীদারদের লভ্যাংশ লেজার</p>
              </div>
            </div>

            <button
              onClick={() => setShowDividendModal(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <Landmark className="w-4 h-4" />
              <span>লভ্যাংশ বন্টন করুন</span>
            </button>
          </div>

          {/* 4 Core Financial Sector Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">পরিচালন ক্যাশ (Cash)</p>
              <p className="text-3xl font-black font-mono text-white">{financial.businessCash.toLocaleString('bn-BD')} <span className="text-xs font-normal">৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">দৈনন্দিন খরচ ও ক্রয় তহবিল</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">বন্টনযোগ্য মুনাফা</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{financial.withdrawableProfit.toLocaleString('bn-BD')} <span className="text-xs font-normal">৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">মালিকদের উত্তোলনের জন্য তৈরি</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">পশুতে ক্যাপিটাল স্টক</p>
              <p className="text-3xl font-black font-mono text-indigo-300">{financial.capitalInStock.toLocaleString('bn-BD')} <span className="text-xs font-normal">৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">বর্তমান পশুর বুক ভ্যালু</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">অর্জিত নিট লভ্যাংশ</p>
              <p className="text-3xl font-black font-mono text-white">{financial.netProfit.toLocaleString('bn-BD')} <span className="text-xs font-normal">৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">মোট রাজস্ব - পরিচালন ব্যয়</p>
            </div>
          </div>

        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* 2. আর্থিক বিশ্লেষণ ও মালিকানা লেজার (Below Dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyProfitLossSummaryCard />
        <ExpenseSectorChart />
      </div>

      {/* Ledger Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">মালিকানা ও শেয়ারহোল্ডার লেনদেন লেজার ({ledger.length} টি রেকর্ড)</h3>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4">অংশীদার / মালিক</th>
                  <th className="p-4">লেনদেনের ধরন</th>
                  <th className="p-4">বিবরণ / নোট</th>
                  <th className="p-4 text-right">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {ledger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-500">{entry.date}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white font-sans">{entry.ownerName}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        entry.type.includes('বিনিয়োগ') ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-sans">{entry.note}</td>
                    <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                      {entry.amount.toLocaleString('bn-BD')} ৳
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dividend Modal */}
      {showDividendModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white">লভ্যাংশ বন্টন ও অংশীদারদের প্রদান</h4>
            <p className="text-xs text-slate-500">
              বর্তমানে বন্টনযোগ্য মুনাফা: <strong className="text-emerald-600 font-mono">{financial.withdrawableProfit.toLocaleString('bn-BD')} ৳</strong>
            </p>

            <form onSubmit={handleDistributeDividend} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">উত্তোলনযোগ্য টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  placeholder="যেমন: ৫০০০০"
                  value={dividendAmount}
                  onChange={e => setDividendAmount(e.target.value)}
                  max={financial.withdrawableProfit}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নোট বা রেফারেন্স</label>
                <input
                  type="text"
                  placeholder="যেমন: ২০২৬ ১ম ত্রৈমাসিক লভ্যাংশ প্রদান"
                  value={dividendNote}
                  onChange={e => setDividendNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDividendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  লভ্যাংশ অনুমোদন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
