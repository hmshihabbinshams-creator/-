import React, { useState } from 'react';
import { LivestockItem } from '../../types';
import { farmStore } from '../../services/farmStore';
import { 
  Plus, Search, Award, Activity, Sparkles, 
  ChevronRight, Eye, ShieldCheck, Scale, FileSpreadsheet, LayoutGrid, Table
} from 'lucide-react';
import { AnimalProfileModal } from '../AnimalProfileModal';
import { exportLivestockCsv } from '../../services/exportService';
import { LivestockGrowthChart } from '../LivestockGrowthChart';
import { SectorFinancialModal } from '../SectorFinancialModal';
import { Printer } from 'lucide-react';

interface GoatSectorViewProps {
  onOpenAddModal: () => void;
  onOpenEasyEntry?: (cat?: any) => void;
}

export const GoatSectorView: React.FC<GoatSectorViewProps> = ({
  onOpenAddModal,
  onOpenEasyEntry
}) => {
  const [livestock, setLivestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showSectorFinancialModal, setShowSectorFinancialModal] = useState(false);

  // Advanced Filters
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [vaccinationFilter, setVaccinationFilter] = useState<string>('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>('all');

  const [selectedAnimalForProfile, setSelectedAnimalForProfile] = useState<LivestockItem | null>(null);

  React.useEffect(() => {
    return farmStore.subscribe(() => {
      setLivestock(farmStore.getLivestock());
    });
  }, []);

  // Filter goat items only (ছাগল / খাসি / বকরি / পাঁঠা)
  const goatItems = livestock.filter(item => 
    item.type.includes('ছাগল') || 
    item.type.includes('খাসি') || 
    item.type.includes('বকরি') ||
    item.breed.toLowerCase().includes('bengal') ||
    item.breed.toLowerCase().includes('jamunapari')
  );

  const totalGoats = goatItems.length;
  const khashiCount = goatItems.filter(g => g.gender === 'পুরুষ (Male)' || g.name.includes('খাসি')).length;
  const forSaleCount = goatItems.filter(g => g.isForSale).length;
  const avgWeight = totalGoats > 0 ? Math.round(goatItems.reduce((acc, g) => acc + g.currentWeight, 0) / totalGoats) : 0;
  const totalValuation = goatItems.reduce((acc, g) => acc + (g.sellingPrice || g.purchasePrice), 0);

  const filteredList = goatItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.breed.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (healthFilter !== 'all' && item.status !== healthFilter) return false;
    if (vaccinationFilter !== 'all' && item.vaccinationStatus !== vaccinationFilter) return false;

    if (ageRangeFilter !== 'all') {
      const ageStr = item.age.toLowerCase();
      const isMonths = ageStr.includes('মাস');
      const numericAge = parseFloat(ageStr) || 1;
      const ageInMonths = isMonths ? numericAge : numericAge * 12;

      if (ageRangeFilter === 'young' && ageInMonths > 6) return false;
      if (ageRangeFilter === 'adult' && (ageInMonths <= 6 || ageInMonths > 24)) return false;
      if (ageRangeFilter === 'senior' && ageInMonths <= 24) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ছাগল ও খাসি খাতের ডেডিকেটেড ড্যাশবোর্ড */}
      <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-amber-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner">
                🐐
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ছাগল ও খাসি খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">খাঁটি ব্ল্যাক বেঙ্গল ও উন্নত যমুনাপারি খাসি লালন-পালন ও প্রজনন</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                onClick={() => setShowSectorFinancialModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>আলাদা খাতের হিসাব ও প্রিন্ট</span>
              </button>

              <button
                onClick={() => onOpenEasyEntry?.('feed')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>দৈনিক খাদ্য বণ্টন এন্ট্রি</span>
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ছাগল এন্ট্রি</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">মোট ছাগল ও খাসি</p>
              <p className="text-3xl font-black font-mono text-white">{totalGoats} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">ব্ল্যাক বেঙ্গল ও যমুনাপারি জাত</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">বিক্রয়যোগ্য প্রিমিয়াম খাসি</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{forSaleCount} <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">কোরবানি ও মাংসের জন্য প্রস্তুত</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">গড় লাইভ ওজন</p>
              <p className="text-3xl font-black font-mono text-blue-300">{avgWeight} <span className="text-xs font-normal">কেজি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">দৈনিক প্রবৃদ্ধি: +১৫০ গ্রাম/দিন</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">খাতে মোট বাজারমূল্য</p>
              <p className="text-3xl font-black font-mono text-white">{(totalValuation / 1000).toFixed(0)} <span className="text-xs font-normal">হাজার ৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">সুস্থতার হার: ১০০% (PPR মুক্ত)</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ছাগল ও খাসি খাতের ওজন অর্জন ও লিনিয়ার রিগ্রেশন প্রেডিকশন চার্ট */}
      <LivestockGrowthChart livestock={goatItems} />

      {/* 3. Advanced Filters & Dynamic Table */}
      <div className="space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ছাগলের নাম, আইডি বা জাত দিয়ে খুঁজুন..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>ডায়নামিক টেবিল</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>গ্রিড কার্ড</span>
              </button>

              <button
                onClick={() => exportLivestockCsv(goatItems)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="CSV এক্সপোর্ট"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">স্বাস্থ্য স্ট্যাটাস ফিল্টার</label>
              <select
                value={healthFilter}
                onChange={e => setHealthFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">সকল স্বাস্থ্য স্ট্যাটাস</option>
                <option value="সুস্থ (Healthy)">সুস্থ (Healthy)</option>
                <option value="অসুস্থ (Sick)">অসুস্থ (Sick)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">টিকা স্ট্যাটাস ফিল্টার</label>
              <select
                value={vaccinationFilter}
                onChange={e => setVaccinationFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">সকল টিকা স্ট্যাটাস</option>
                <option value="সম্পূর্ণ (Fully Vaccinated)">সম্পূর্ণ (Fully Vaccinated)</option>
                <option value="চলমান (In Progress)">চলমান (In Progress)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">বয়স সীমা ফিল্টার</label>
              <select
                value={ageRangeFilter}
                onChange={e => setAgeRangeFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">সকল বয়স</option>
                <option value="young">বাছুর ও ছাগী ছানা (&lt; ৬ মাস)</option>
                <option value="adult">প্রাপ্তবয়স্ক খাসি (৬ - ২৪ মাস)</option>
                <option value="senior">বংশবৃদ্ধিকারী প্রজনন ছাগল (&gt; ২৪ মাস)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-bold text-slate-500">
            ফিল্টারকৃত ছাগল পাওয়া গেছে: <strong className="text-slate-900 dark:text-white font-mono">{filteredList.length} টি</strong>
          </p>
        </div>

        {/* Dynamic Table */}
        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="p-4">ছাগলের আইডি ও নাম</th>
                    <th className="p-4">জাত ও লিঙ্গ</th>
                    <th className="p-4 text-center">বয়স</th>
                    <th className="p-4 text-center">বর্তমান ওজন</th>
                    <th className="p-4 text-center">স্বাস্থ্য স্ট্যাটাস</th>
                    <th className="p-4">টিকা স্ট্যাটাস</th>
                    <th className="p-4 text-right">মূল্য (৳)</th>
                    <th className="p-4 text-center">প্রোফাইল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                        কোনো ছাগল পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-lg shrink-0">
                              🐐
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                              <span className="block font-mono text-[10px] text-amber-600 font-bold">ID: #{item.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.breed}</span>
                          <span className="block text-[10px] text-slate-400">{item.gender}</span>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.age}
                        </td>

                        <td className="p-4 text-center font-mono font-black text-slate-900 dark:text-white">
                          {item.currentWeight} কেজি
                        </td>

                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {item.status || 'সুস্থ (Healthy)'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {item.vaccinationStatus || 'সম্পূর্ণ (Fully Vaccinated)'}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-black text-amber-700 dark:text-amber-400">
                          {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ইন-ফার্ম'}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedAnimalForProfile(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
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
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredList.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">🐐</span>
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-black">
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
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">নির্ধারিত মূল্য:</span>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400 font-mono">
                      {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ইন-ফার্ম'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnimalForProfile(item)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>ডিজিটাল পাসপোর্ট ও স্বাস্থ্য প্রোফাইল</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

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
        sectorKey="goat"
        sectorTitle="ছাগল ও খাসি খাত"
        sectorIcon="🐐"
        items={goatItems}
      />

    </div>
  );
};
