import React from 'react';
import { LivestockItem } from '../types';
import { farmStore } from '../services/farmStore';
import { exportSectorFinancialReportPdf } from '../services/pdfReportGenerator';
import { 
  Printer, FileText, DollarSign, TrendingUp, Scale, 
  BarChart3, CheckCircle2, ShieldCheck, X 
} from 'lucide-react';

interface SectorFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorKey: string; // e.g. 'cattle', 'goat', 'poultry', 'fishery', 'feed', 'health'
  sectorTitle: string; // e.g. 'ডেইরি ও গরু খাত'
  sectorIcon?: string;
  items: LivestockItem[];
}

export const SectorFinancialModal: React.FC<SectorFinancialModalProps> = ({
  isOpen,
  onClose,
  sectorKey,
  sectorTitle,
  sectorIcon = '📊',
  items
}) => {
  if (!isOpen) return null;

  // Sector Accounting Calculations
  let totalPurchaseCapital = 0;
  let totalFeedCost = 0;
  let totalHealthCost = 0;
  let totalValuation = 0;

  const itemLedger = items.map(item => {
    const stats = farmStore.getAnimalCostStats(item.id);
    totalPurchaseCapital += stats.purchasePrice;
    totalFeedCost += stats.totalFeedCost;
    totalHealthCost += stats.totalHealthCost;
    const valuation = item.sellingPrice || stats.suggestedPrice || stats.purchasePrice;
    totalValuation += valuation;

    return {
      ...item,
      stats,
      valuation,
      netProfit: valuation - stats.totalExpense
    };
  });

  const totalExpense = totalPurchaseCapital + totalFeedCost + totalHealthCost;
  const netSectorProfit = totalValuation - totalExpense;
  const roiPercentage = totalExpense > 0 ? ((netSectorProfit / totalExpense) * 100).toFixed(1) : '0';

  const handlePrintPdf = () => {
    exportSectorFinancialReportPdf(sectorTitle, sectorKey, items);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-inner">
              {sectorIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">আলাদা খাতের হিসাব ও অডিট</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono font-bold text-slate-300">
                  {items.length} Head Count
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {sectorTitle} - ফাইন্যান্সিয়াল রিপোর্ট
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPdf}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>খাতের রিপোর্ট প্রিন্ট (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Summary Financial Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">খাতে প্রারম্ভিক পুজি (Capital)</p>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {totalPurchaseCapital.toLocaleString('bn-BD')} <span className="text-xs font-bold text-slate-500">৳</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">পশু/পোনা ক্রয় বাবদ খরচ</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">খাদ্য ও চিকিৎসা ব্যয়</p>
              <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {(totalFeedCost + totalHealthCost).toLocaleString('bn-BD')} <span className="text-xs font-bold text-slate-500">৳</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">খাবার: {totalFeedCost.toLocaleString('bn-BD')}৳ | চিকিৎসা: {totalHealthCost.toLocaleString('bn-BD')}৳</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">খাতে মোট বর্তমান সম্পদমূল্য</p>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalValuation.toLocaleString('bn-BD')} <span className="text-xs font-bold text-slate-500">৳</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">বর্তমান বাজার বা বিক্রয়মূল্য</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">সম্ভাব্য নিট খাতের মুনাফা</p>
              <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                +{netSectorProfit.toLocaleString('bn-BD')} <span className="text-xs font-bold text-emerald-600">৳</span>
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ROI: +{roiPercentage}% নিট মার্জিন</p>
            </div>
          </div>

          {/* Itemized Sector Ledger Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>{sectorTitle} - গবাদিপশু ও ব্যয়ের পূর্ণাঙ্গ তালিকা</span>
              </h4>
              <span className="text-xs font-medium text-slate-400">লাইভ ডাটাবেজ সমন্বিত</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4">পশু / ব্যাচ নাম</th>
                    <th className="p-4">ক্রয়মূল্য</th>
                    <th className="p-4">খাবার ব্যয়</th>
                    <th className="p-4">মোট খরচ</th>
                    <th className="p-4">বর্তমান মূল্য</th>
                    <th className="p-4 text-right">মুনাফা (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {itemLedger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        এই খাতে বর্তমানে কোনো গবাদিপশু বা ডাটা রেকর্ড নেই।
                      </td>
                    </tr>
                  ) : (
                    itemLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <p className="font-black text-slate-900 dark:text-white">{row.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{row.id} · {row.breed}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {row.stats.purchasePrice.toLocaleString('bn-BD')} ৳
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                          {row.stats.totalFeedCost.toLocaleString('bn-BD')} ৳
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {row.stats.totalExpense.toLocaleString('bn-BD')} ৳
                        </td>
                        <td className="p-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {row.valuation.toLocaleString('bn-BD')} ৳
                        </td>
                        <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          +{row.netProfit.toLocaleString('bn-BD')} ৳
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            সরকারি নিবন্ধন: {farmStore.getInstitutionProfile().registrationNumber || 'DLS-REG-2024/8892'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>রিপোর্ট প্রিন্ট (Print PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
