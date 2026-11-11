import React, { useState, useMemo } from 'react';
import { LivestockItem } from '../types';
import { farmStore } from '../services/farmStore';
import { AnimalProfileModal } from './AnimalProfileModal';
import { 
  ZoomIn, ZoomOut, RotateCcw, MapPin, Activity, 
  ShieldCheck, Droplets, Egg, TrendingUp, Search, 
  CheckCircle2, AlertTriangle, Eye, ArrowRight,
  Sparkles, Layers, Box, Scale
} from 'lucide-react';

type FarmSection = 'all' | 'cows' | 'goats' | 'poultry' | 'quails' | 'pond';

export const InteractiveLiveDashboard: React.FC<{ onExploreShop?: () => void }> = ({ onExploreShop }) => {
  const [livestock, setLivestock] = useState<LivestockItem[]>(() => farmStore.getLivestock());
  const [activeSection, setActiveSection] = useState<FarmSection>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimalForProfile, setSelectedAnimalForProfile] = useState<LivestockItem | null>(null);

  React.useEffect(() => {
    const unsub = farmStore.subscribe(() => {
      setLivestock(farmStore.getLivestock());
    });
    return () => unsub();
  }, []);

  // Section Counts
  const counts = useMemo(() => {
    const cows = livestock.filter(i => i.type.includes('গরু')).reduce((s, i) => s + i.quantity, 0);
    const goats = livestock.filter(i => i.type.includes('ছাগল')).reduce((s, i) => s + i.quantity, 0);
    const poultry = livestock.filter(i => i.type.includes('মুরগি') || i.type.includes('হাঁস')).reduce((s, i) => s + i.quantity, 0);
    const quails = livestock.filter(i => i.type.includes('পাখি')).reduce((s, i) => s + i.quantity, 0) || 120;
    const fish = livestock.filter(i => i.type.includes('মাছ')).length || 2;
    const totalAnimals = cows + goats + poultry + quails;
    return { cows, goats, poultry, quails, fish, totalAnimals };
  }, [livestock]);

  // Filtered by section & search
  const filteredAnimals = useMemo(() => {
    return livestock.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.breed.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (activeSection === 'all') return true;
      if (activeSection === 'cows') return item.type.includes('গরু');
      if (activeSection === 'goats') return item.type.includes('ছাগল');
      if (activeSection === 'poultry') return item.type.includes('মুরগি') || item.type.includes('হাঁস');
      if (activeSection === 'quails') return item.type.includes('পাখি');
      if (activeSection === 'pond') return item.type.includes('মাছ');
      return true;
    });
  }, [livestock, activeSection, searchQuery]);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(140, Math.max(75, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Controller Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              লাইভ ইন্টারঅ্যাক্টিভ ড্যাশবোর্ড
            </span>
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">·</span>
            <span className="text-xs font-bold text-slate-500">রিয়েল-টাইম লাইভস্টক কাউন্টার ও স্বাস্থ্য সূচক</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            আর এস খামার প্রাঙ্গণ ও প্রাণী মনিটরিং
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            জুম ইন/আউট করে প্রতিটি শেড পরিদর্শন করুন এবং যেকোনো প্রাণীর ওপর ক্লিক করে পূর্ণাঙ্গ জীবনবৃত্তান্ত ও স্বাস্থ্য প্রোফাইল দেখুন
          </p>
        </div>

        {/* Zoom Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="প্রাণীর নাম বা আইডি খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => handleZoom(-15)}
              className="p-2 rounded-xl hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="জুম আউট"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-black text-slate-700 px-2">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(15)}
              className="p-2 rounded-xl hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="জুম ইন"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="রিসেট"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Colorful Livestock Counts Summary Row (Crisp White Base) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'উন্নত গরু', count: counts.cows, unit: 'টি', icon: '🐄', color: 'border-emerald-300 text-emerald-700 bg-emerald-50/70', section: 'cows' },
          { label: 'ছাগল ও খাসি', count: counts.goats, unit: 'টি', icon: '🐐', color: 'border-amber-300 text-amber-700 bg-amber-50/70', section: 'goats' },
          { label: 'হাঁস ও মুরগি', count: counts.poultry, unit: 'টি', icon: '🐔', color: 'border-teal-300 text-teal-700 bg-teal-50/70', section: 'poultry' },
          { label: 'কোয়েল ও পাখি', count: counts.quails, unit: 'টি', icon: '🕊️', color: 'border-purple-300 text-purple-700 bg-purple-50/70', section: 'quails' },
          { label: 'মৎস্য পুকুর লট', count: counts.fish, unit: 'পুকুর', icon: '🐟', color: 'border-blue-300 text-blue-700 bg-blue-50/70', section: 'pond' },
          { label: 'সর্বমোট লাইভস্টক', count: counts.totalAnimals, unit: 'প্রাণী', icon: '🌾', color: 'border-slate-300 text-slate-900 bg-slate-50', section: 'all' },
        ].map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(c.section as FarmSection)}
            className={`p-4 rounded-3xl bg-white border text-left transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
              activeSection === c.section ? `ring-2 ring-emerald-500 ${c.color}` : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-[10px] font-black uppercase text-slate-400">লাইভ</span>
            </div>
            <p className="text-2xl font-black font-mono mt-2 text-slate-900">
              {c.count} <span className="text-xs font-bold text-slate-400 font-sans">{c.unit}</span>
            </p>
            <p className="text-xs font-bold text-slate-600 truncate mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'সব সেকশন (সম্পূর্ণ খামার)' },
          { id: 'cows', label: '১ নং শেড: ডেইরি ও গোশালা (Cattle)' },
          { id: 'goats', label: '২ নং শেড: ছাগল ও প্রজনন (Goats)' },
          { id: 'poultry', label: '৩ নং শেড: হাঁস-মুরগি (Poultry)' },
          { id: 'quails', label: '৪ নং শেড: কোয়েল ও ব্রুডার (Quails)' },
          { id: 'pond', label: 'পদ্মপুকুর: মৎস্য হ্যাচারি (Fisheries)' },
        ].map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as FarmSection)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeSection === sec.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Zoomable Container with Livestock Grid */}
      <div className="p-6 sm:p-8 rounded-[3rem] bg-slate-50/70 border border-slate-200 shadow-inner overflow-hidden">
        <div 
          className="transition-transform duration-300 origin-top"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimals.map(animal => {
              const isVaccinated = !animal.healthStatus.includes('অসুস্থ');
              return (
                <div
                  key={animal.id}
                  onClick={() => setSelectedAnimalForProfile(animal)}
                  className="bg-white p-5 rounded-[2rem] border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
                          {animal.photoPlaceholder ? (
                            <img src={animal.photoPlaceholder} alt={animal.name} className="w-full h-full object-cover rounded-2xl" />
                          ) : animal.type.includes('গরু') ? '🐄' : animal.type.includes('ছাগল') ? '🐐' : animal.type.includes('হাঁস') ? '🦆' : animal.type.includes('মুরগি') ? '🐔' : '🐟'}
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-black text-slate-400 block">#{animal.id}</span>
                          <h4 className="font-black text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {animal.name}
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        animal.isForSale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {animal.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">জাত ও বয়স</span>
                        <p className="font-bold text-slate-800 truncate">{animal.breed}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{animal.age}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">বর্তমান ওজন</span>
                        <p className="font-black text-emerald-600 font-mono">{animal.currentWeight} কেজি</p>
                        <span className="text-[9px] text-slate-400">টার্গেট: {animal.targetWeight || Math.round(animal.currentWeight * 1.3)}kg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 truncate">{animal.healthStatus}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                    <span>পূর্ণাঙ্গ প্রোফাইল দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-black text-slate-700">কোনো প্রাণী খুঁজে পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400">অনুগ্রহ করে ভিন্ন কোনো নাম বা আইডি দিয়ে চেষ্টা করুন</p>
            </div>
          )}
        </div>
      </div>

      {/* Individual Animal Profile Modal Popup */}
      {selectedAnimalForProfile && (
        <AnimalProfileModal
          animal={selectedAnimalForProfile}
          onClose={() => setSelectedAnimalForProfile(null)}
          onUpdateAnimal={(updated) => {
            setLivestock(prev => prev.map(a => a.id === updated.id ? updated : a));
            setSelectedAnimalForProfile(updated);
          }}
        />
      )}
    </div>
  );
};
