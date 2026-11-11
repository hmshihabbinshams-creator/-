import React, { useState } from 'react';
import { LivestockItem } from '../../types';
import { farmStore } from '../../services/farmStore';
import { 
  Plus, Search, Droplets, Award, Activity, 
  Sparkles, Filter, ChevronRight, Eye, Calendar,
  ShieldCheck, TrendingUp, AlertTriangle, FileSpreadsheet, LayoutGrid, Table
} from 'lucide-react';
import { AnimalProfileModal } from '../AnimalProfileModal';
import { exportLivestockCsv } from '../../services/exportService';
import { exportAnimalTablePdf } from '../../services/pdfReportGenerator';
import { LivestockGrowthChart } from '../LivestockGrowthChart';
import { SectorFinancialModal } from '../SectorFinancialModal';
import { FileText, Printer } from 'lucide-react';

interface CattleSectorViewProps {
  onOpenAddModal: () => void;
  onOpenEasyEntry?: (cat?: any) => void;
}

export const CattleSectorView: React.FC<CattleSectorViewProps> = ({
  onOpenAddModal,
  onOpenEasyEntry
}) => {
  const [livestock, setLivestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to dynamic table as requested
  const [showSectorFinancialModal, setShowSectorFinancialModal] = useState(false);

  // Advanced Filters
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [vaccinationFilter, setVaccinationFilter] = useState<string>('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>('all'); // 'all', 'young', 'adult', 'senior'

  const [selectedAnimalForProfile, setSelectedAnimalForProfile] = useState<LivestockItem | null>(null);

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setLivestock(farmStore.getLivestock());
    });
  }, []);

  // Filter cattle items only (গরু / গাভী / বলদ / বাছুর)
  const cattleItems = livestock.filter(item => 
    item.type.includes('গরু') || 
    item.type.includes('গাভী') || 
    item.type.includes('ষাঁড়') || 
    item.type.includes('বলদ') || 
    item.type.includes('বাছুর')
  );

  // Sector Metrics calculation
  const totalCattle = cattleItems.length;
  const pregnantCount = cattleItems.filter(c => c.breedingStatus === 'গর্ভবতী (Pregnant)').length;
  const forSaleCount = cattleItems.filter(c => c.isForSale).length;
  const totalValuation = cattleItems.reduce((acc, c) => acc + (c.sellingPrice || c.purchasePrice), 0);
  const avgWeight = totalCattle > 0 ? Math.round(cattleItems.reduce((acc, c) => acc + c.currentWeight, 0) / totalCattle) : 0;

  // Advanced Filtering logic
  const filteredList = cattleItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.breed.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Health filter
    if (healthFilter !== 'all' && item.status !== healthFilter) return false;

    // Vaccination filter
    if (vaccinationFilter !== 'all' && item.vaccinationStatus !== vaccinationFilter) return false;

    // Age range filter
    if (ageRangeFilter !== 'all') {
      const ageStr = item.age.toLowerCase();
      const isMonths = ageStr.includes('মাস');
      const numericAge = parseFloat(ageStr) || 1;
      const ageInMonths = isMonths ? numericAge : numericAge * 12;

      if (ageRangeFilter === 'young' && ageInMonths > 12) return false; // under 1 year
      if (ageRangeFilter === 'adult' && (ageInMonths <= 12 || ageInMonths > 48)) return false; // 1 to 4 years
      if (ageRangeFilter === 'senior' && ageInMonths <= 48) return false; // above 4 years
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ডেইরি ও গরু খাতের ডেডিকেটেড ড্যাশবোর্ড (Sector Dashboard at Top) */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shadow-inner">
                🐄
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ডেইরি ও গবাদিপশু খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">সাহীওয়াল, ফ্রিজিয়ান ও দেশি ডেইরি গাভী এবং মাংসের ষাঁড় ব্যবস্থাপনা</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                onClick={() => setShowSectorFinancialModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>আলাদা খাতের হিসাব ও প্রিন্ট</span>
              </button>

              <button
                onClick={() => onOpenEasyEntry?.('milk')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Droplets className="w-4 h-4" />
                <span>আজকের দুধ সংগ্রহ এন্ট্রি</span>
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন গরু ক্রয় এন্ট্রি</span>
              </button>
            </div>
          </div>

          {/* 4 Core Cattle Sector Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">মোট গরু ও গাভী</p>
              <p className="text-3xl font-black font-mono text-white">{totalCattle} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">গড় ওজন: {avgWeight} কেজি</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">আজকের দুধ ফলন</p>
              <p className="text-3xl font-black font-mono text-blue-300">১৩০.৪ <span className="text-xs font-normal">লিটার</span></p>
              <p className="text-[10px] text-slate-400 font-medium">ফ্যাট: ৪.৮% · গুণগত মান A+</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">গর্ভবতী / প্রজননকালীন</p>
              <p className="text-3xl font-black font-mono text-amber-300">{pregnantCount} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">বিশেষ পুষ্টি ও ভিটামিন পর্যবেক্ষণ</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">খাতে মোট সম্পদমূল্য</p>
              <p className="text-3xl font-black font-mono text-white">{(totalValuation / 100000).toFixed(2)} <span className="text-xs font-normal">লক্ষ ৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">{forSaleCount} টি পশু শপে বিক্রয়তালিকায়</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ডেইরি ও গরু খাতের শারীরিক বৃদ্ধি ও লিনিয়ার রিগ্রেশন প্রেডিকশন চার্ট */}
      <LivestockGrowthChart livestock={cattleItems} />

      {/* 3. Advanced Filters & Dynamic Data Table Section */}
      <div className="space-y-6">
        
        {/* Controls Bar & Advanced Filters */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="গরুর নাম, আইডি বা জাত দিয়ে খুঁজুন..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* View Mode Toggle (Table vs Grid) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>ডায়নামিক টেবিল</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>গ্রিড কার্ড</span>
              </button>

              <button
                onClick={() => exportLivestockCsv(cattleItems)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="CSV এক্সপোর্ট"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filtering Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            
            {/* Health Status Filter */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">স্বাস্থ্য স্ট্যাটাস ফিল্টার</label>
              <select
                value={healthFilter}
                onChange={e => setHealthFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল স্বাস্থ্য স্ট্যাটাস</option>
                <option value="সুস্থ (Healthy)">সুস্থ (Healthy)</option>
                <option value="অসুস্থ (Sick)">অসুস্থ (Sick)</option>
                <option value="পর্যবেক্ষণাধীন">পর্যবেক্ষণাধীন</option>
              </select>
            </div>

            {/* Vaccination Status Filter */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">টিকা স্ট্যাটাস ফিল্টার</label>
              <select
                value={vaccinationFilter}
                onChange={e => setVaccinationFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল টিকা স্ট্যাটাস</option>
                <option value="সম্পূর্ণ (Fully Vaccinated)">সম্পূর্ণ (Fully Vaccinated)</option>
                <option value="চলমান (In Progress)">চলমান (In Progress)</option>
                <option value="বাকি আছে (Pending)">বাকি আছে (Pending)</option>
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">বয়স সীমা ফিল্টার</label>
              <select
                value={ageRangeFilter}
                onChange={e => setAgeRangeFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল বয়স</option>
                <option value="young">বাছুর ও তরুণ (&lt; ১ বছর)</option>
                <option value="adult">প্রাপ্তবয়স্ক (১ - ৪ বছর)</option>
                <option value="senior">বয়স্ক (&gt; ৪ বছর)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-bold text-slate-500">
            ফিল্টারকৃত গরু পাওয়া গেছে: <strong className="text-slate-900 dark:text-white font-mono">{filteredList.length} টি</strong> (মোট {cattleItems.length} টি থেকে)
          </p>
        </div>

        {/* DYNAMIC TABLE VIEW */}
        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="p-4">গরুর আইডি ও নাম</th>
                    <th className="p-4">জাত ও লিঙ্গ</th>
                    <th className="p-4 text-center">বয়স</th>
                    <th className="p-4 text-center">বর্তমান ওজন</th>
                    <th className="p-4 text-center">স্বাস্থ্য স্ট্যাটাস</th>
                    <th className="p-4">টিকা ইতিহাস / স্ট্যাটাস</th>
                    <th className="p-4 text-right">মূল্য (৳)</th>
                    <th className="p-4 text-center">প্রোফাইল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                        কোনো গরু পাওয়া যায়নি। ফিল্টার রিসেট করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-lg shrink-0">
                              🐄
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                              <span className="block font-mono text-[10px] text-emerald-600 font-bold">ID: #{item.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.breed}</span>
                          <span className="block text-[10px] text-slate-400">{item.type}</span>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.age}
                        </td>

                        <td className="p-4 text-center font-mono font-black text-slate-900 dark:text-white">
                          {item.currentWeight} কেজি
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            item.status === 'সুস্থ (Healthy)' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            item.status === 'অসুস্থ (Sick)' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {item.status || 'সুস্থ (Healthy)'}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                              item.vaccinationStatus === 'সম্পূর্ণ (Fully Vaccinated)' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.vaccinationStatus || 'সম্পূর্ণ (Fully Vaccinated)'}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">শেষ ডোজ: ১৫ দিন পূর্বে</span>
                          </div>
                        </td>

                        <td className="p-4 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                          {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ইন-ফার্ম'}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedAnimalForProfile(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>প্রোফাইল</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredList.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">🐄</span>
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-black">
                          #{item.id}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">{item.name}</h4>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                      item.isForSale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>জাত: <strong className="text-slate-800 dark:text-slate-200">{item.breed}</strong> ({item.age})</p>
                    <p>বর্তমান ওজন: <strong className="text-slate-800 dark:text-slate-200 font-mono">{item.currentWeight} কেজি</strong></p>
                    <p>টিকা স্ট্যাটাস: <span className="text-blue-600 dark:text-blue-400 font-bold">{item.vaccinationStatus || 'সম্পূর্ণ'}</span></p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">নির্ধারিত মূল্য:</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ইন-ফার্ম'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnimalForProfile(item)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ডিজিটাল পাসপোর্ট ও স্বাস্থ্য প্রোফাইল</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Individual Animal Profile Modal */}
      {selectedAnimalForProfile && (
        <AnimalProfileModal
          animal={selectedAnimalForProfile}
          isOpen={!!selectedAnimalForProfile}
          onClose={() => setSelectedAnimalForProfile(null)}
        />
      )}

      {/* Sector Financial Report Modal */}
      <SectorFinancialModal
        isOpen={showSectorFinancialModal}
        onClose={() => setShowSectorFinancialModal(false)}
        sectorKey="cattle"
        sectorTitle="ডেইরি ও গবাদিপশু খাত"
        sectorIcon="🐄"
        items={cattleItems}
      />

    </div>
  );
};
