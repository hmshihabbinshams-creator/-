import React, { useState } from 'react';
import { LivestockItem } from '../../types';
import { farmStore } from '../../services/farmStore';
import { 
  Plus, Search, Egg, Sparkles, TrendingUp, 
  ChevronRight, Eye, ShieldCheck, Scale, FileSpreadsheet, LayoutGrid, Table
} from 'lucide-react';
import { AnimalProfileModal } from '../AnimalProfileModal';
import { exportLivestockCsv } from '../../services/exportService';
import { SectorFinancialModal } from '../SectorFinancialModal';
import { Printer } from 'lucide-react';

interface PoultrySectorViewProps {
  onOpenAddModal: () => void;
  onOpenEasyEntry?: (cat?: any) => void;
}

export const PoultrySectorView: React.FC<PoultrySectorViewProps> = ({
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

  const poultryItems = livestock.filter(item => 
    item.type.includes('হাঁস') || 
    item.type.includes('মুরগি') || 
    item.type.includes('পাখি') ||
    item.type.includes('কোয়েল')
  );

  const totalBirds = poultryItems.length;
  const ducksCount = poultryItems.filter(p => p.type.includes('হাঁস')).length;
  const hensCount = poultryItems.filter(p => p.type.includes('মুরগি')).length;

  const filteredList = poultryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.breed.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (healthFilter !== 'all' && item.status !== healthFilter) return false;
    if (vaccinationFilter !== 'all' && item.vaccinationStatus !== vaccinationFilter) return false;

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. পোল্ট্রি ও হাঁস-মুরগি খাতের ডেডিকেটেড ড্যাশবোর্ড */}
      <div className="bg-gradient-to-br from-yellow-900 via-amber-950 to-slate-900 rounded-[2.5rem] text-white p-6 sm:p-8 border border-yellow-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-3xl shadow-inner">
                🦆
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">খাতভিত্তিক ড্যাশবোর্ড</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">পোল্ট্রি ও হাঁস-মুরগি খাত</h2>
                <p className="text-xs text-slate-300 mt-0.5">খাকি ক্যাম্পবেল হাঁস, সোনালী মুরগি ও অর্গানিক ডিম উৎপাদন</p>
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
                onClick={() => onOpenEasyEntry?.('eggs')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Egg className="w-4 h-4" />
                <span>আজকের ডিম সংগ্রহ এন্ট্রি</span>
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ফ্লক / পাখি এন্ট্রি</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">আজকের ডিম সংগ্রহ</p>
              <p className="text-3xl font-black font-mono text-white">৮৫৮ <span className="text-xs font-normal">টি</span></p>
              <p className="text-[10px] text-slate-400 font-medium">হাঁসের ডিম: ৫১২ · মুরগির: ৩৪৬</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">ডিম পাড়ার হার (Lay Rate)</p>
              <p className="text-3xl font-black font-mono text-amber-300">৮৭.৪%</p>
              <p className="text-[10px] text-slate-400 font-medium">উচ্চ ডিম্বোৎপাদন সক্রিয়</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">মোট ফ্লক ও পাখি</p>
              <p className="text-3xl font-black font-mono text-emerald-300">{totalBirds} <span className="text-xs font-normal">ঝাঁক</span></p>
              <p className="text-[10px] text-slate-400 font-medium">হাঁস: {ducksCount} · মুরগি: {hensCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">দৈনিক রাজস্ব (ডিম)</p>
              <p className="text-3xl font-black font-mono text-white">১১,৫৮০ <span className="text-xs font-normal">৳</span></p>
              <p className="text-[10px] text-slate-400 font-medium">খামার গেট মূল্য: ১৩.৫ ৳/পিস</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Advanced Filters & Dynamic Table */}
      <div className="space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ফ্লকের নাম, আইডি বা জাত খুঁজুন..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-yellow-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>ডায়নামিক টেবিল</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-yellow-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>গ্রিড কার্ড</span>
              </button>

              <button
                onClick={() => exportLivestockCsv(poultryItems)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="CSV এক্সপোর্ট"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">স্বাস্থ্য স্ট্যাটাস ফিল্টার</label>
              <select
                value={healthFilter}
                onChange={e => setHealthFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">সকল টিকা স্ট্যাটাস</option>
                <option value="সম্পূর্ণ (Fully Vaccinated)">সম্পূর্ণ (Fully Vaccinated)</option>
                <option value="চলমান (In Progress)">চলমান (In Progress)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-bold text-slate-500">
            ফিল্টারকৃত পোল্ট্রি পাওয়া গেছে: <strong className="text-slate-900 dark:text-white font-mono">{filteredList.length} টি</strong>
          </p>
        </div>

        {/* Dynamic Table */}
        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="p-4">ফ্লক আইডি ও নাম</th>
                    <th className="p-4">প্রজাতি ও জাত</th>
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
                        কোনো পোল্ট্রি ফ্লক পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center text-lg shrink-0">
                              {item.type.includes('হাঁস') ? '🦆' : '🐓'}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                              <span className="block font-mono text-[10px] text-yellow-600 font-bold">ID: #{item.id}</span>
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
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {item.status || 'সুস্থ (Healthy)'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {item.vaccinationStatus || 'সম্পূর্ণ (Fully Vaccinated)'}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-black text-yellow-700 dark:text-yellow-400">
                          {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ডিম উৎপাদন'}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedAnimalForProfile(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Eye className="w-3 h-3 text-yellow-400" />
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
                      <span className="text-3xl">{item.type.includes('হাঁস') ? '🦆' : '🐓'}</span>
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 font-mono text-[9px] font-black">
                          #{item.id}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">{item.name}</h4>
                      </div>
                    </div>
                    
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>জাত: <strong className="text-slate-800 dark:text-slate-200">{item.breed}</strong></p>
                    <p>বয়স: {item.age} · ওজন: <strong className="font-mono">{item.currentWeight} কেজি</strong></p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">বিক্রয়মূল্য:</span>
                    <span className="text-sm font-black text-yellow-700 dark:text-yellow-400 font-mono">
                      {item.sellingPrice ? item.sellingPrice.toLocaleString('bn-BD') + ' ৳' : 'ডিম উৎপাদন'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAnimalForProfile(item)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-yellow-400" />
                  <span>ফ্লক প্রোফাইল ও উৎপাদন লগ</span>
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
        sectorKey="poultry"
        sectorTitle="পোল্ট্রি ও হাঁস-মুরগি খাত"
        sectorIcon="🦆"
        items={poultryItems}
      />

    </div>
  );
};
