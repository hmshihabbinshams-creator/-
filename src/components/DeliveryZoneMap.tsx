import React, { useState } from 'react';
import { 
  MapPin, Truck, Search, ShieldCheck, Clock, 
  CheckCircle2, Navigation, Phone, Sparkles, Compass
} from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  bnName: string;
  areaType: 'এক্সেক্লুসিভ এক্সপ্রেস' | 'স্ট্যান্ডার্ড ডেলিভারি' | 'আঞ্চলিক হাব';
  deliveryTime: string;
  deliveryFee: number;
  freeShippingOver: number;
  hubs: string[];
  status: 'সক্রিয়' | 'সীমিত পরিষেবা';
  coordinates: { x: number; y: number }; // SVG map percentage coordinates
}

const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Dhaka North & South',
    bnName: 'ঢাকা মেট্রোপলিটন (গুলশান, ধানমণ্ডি, উত্তরা, মিরপুর, মোহাম্মদপুর)',
    areaType: 'এক্সেক্লুসিভ এক্সপ্রেস',
    deliveryTime: 'আজকের মধ্যেই বা ২৪ ঘণ্টা',
    deliveryFee: 60,
    freeShippingOver: 1500,
    hubs: ['ধানমণ্ডি মেইন আউটলেট', 'গুলশান হাব-১', 'উতারা ডিসপ্যাচ পয়েন্ট'],
    status: 'সক্রিয়',
    coordinates: { x: 48, y: 52 }
  },
  {
    id: 'zone-2',
    name: 'Gazipur & Savar',
    bnName: 'গাজীপুর ও সাভার (খামার সংলগ্ন এলাকা)',
    areaType: 'এক্সেক্লুসিভ এক্সপ্রেস',
    deliveryTime: 'সরাসরি খামার থেকে ১২-২৪ ঘণ্টা',
    deliveryFee: 50,
    freeShippingOver: 1200,
    hubs: ['RS Khamar সেন্ট্রাল ফার্ম হাব', 'গাজীপুর চৌরাস্তা প্যান্ট্রি'],
    status: 'সক্রিয়',
    coordinates: { x: 47, y: 44 }
  },
  {
    id: 'zone-3',
    name: 'Narayanganj & Munshiganj',
    bnName: 'নারায়ণগঞ্জ ও মুন্সীগঞ্জ জোন',
    areaType: 'স্ট্যান্ডার্ড ডেলিভারি',
    deliveryTime: '২৪-৪৮ ঘণ্টা',
    deliveryFee: 80,
    freeShippingOver: 2000,
    hubs: ['চাষাড়া ডেলিভারি হাব'],
    status: 'সক্রিয়',
    coordinates: { x: 52, y: 56 }
  },
  {
    id: 'zone-4',
    name: 'Chattogram Metro',
    bnName: 'চট্টগ্রাম মেট্রোপলিটন (জিইসি, আগ্রাবাদ, হালিশহর)',
    areaType: 'আঞ্চলিক হাব',
    deliveryTime: '৪৮ ঘণ্টা (কোল্ড চেইন ফ্রিজার ভ্যান)',
    deliveryFee: 120,
    freeShippingOver: 3500,
    hubs: ['জিইসি মোর রিজিওনাল সেন্টার'],
    status: 'সক্রিয়',
    coordinates: { x: 72, y: 75 }
  },
  {
    id: 'zone-5',
    name: 'Sylhet & Cumilla',
    bnName: 'সিলেট মেট্রো ও কুমিল্লা শহর',
    areaType: 'আঞ্চলিক হাব',
    deliveryTime: '৪৮-৭২ ঘণ্টা',
    deliveryFee: 150,
    freeShippingOver: 4000,
    hubs: ['সিলেট জিন্দাবাজার পিকআপ পয়েন্ট'],
    status: 'সক্রিয়',
    coordinates: { x: 70, y: 35 }
  }
];

export const DeliveryZoneMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(DELIVERY_ZONES[0]);
  const [searchArea, setSearchArea] = useState('');
  const [userLocationResult, setUserLocationResult] = useState<string | null>(null);

  const handleSearchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchArea.trim()) return;

    const query = searchArea.toLowerCase();
    const matched = DELIVERY_ZONES.find(z => 
      z.bnName.toLowerCase().includes(query) || z.name.toLowerCase().includes(query)
    );

    if (matched) {
      setSelectedZone(matched);
      setUserLocationResult(`✓ '${searchArea}' আমাদের ${matched.bnName} এর আওতায় পড়ে!`);
    } else {
      setSelectedZone(DELIVERY_ZONES[0]);
      setUserLocationResult(`ℹ️ '${searchArea}' এলাকায় কুরিয়ার এক্সপ্রেস সার্ভিসের মাধ্যমে ডেলিভারি করা হবে।`);
    }
  };

  return (
    <section className="p-6 sm:p-10 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 font-extrabold text-[11px] border border-emerald-800 flex items-center gap-1.5 w-max">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>হোম ডেলিভারি ও লজিস্টিকস নেটওয়ার্ক</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-emerald-400 shrink-0" />
            <span>পণ্য ডেলিভারি জোন ম্যাপ ও নিকটতম পিকআপ হাব</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            খামারের খাঁটি দুধ, ঘি, অর্গানিক ডিম ও তাজা মাংস সরাসরি কোল্ড চেইন ভ্যানে ডেলিভারির এলাকা দেখুন।
          </p>
        </div>

        {/* Location Search Bar */}
        <form onSubmit={handleSearchLocation} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="আপনার থানা বা এলাকার নাম লিখুন (যেমন: গুলশান, সাভার)..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 text-xs text-white border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer transition-all"
          >
            খুঁজুন
          </button>
        </form>
      </div>

      {userLocationResult && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{userLocationResult}</span>
          <button onClick={() => setUserLocationResult(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Interactive Map (Left) & Zone Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Interactive Stylized Bangladesh/Dhaka Map SVG */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-3xl border border-slate-800 p-6 relative flex flex-col items-center justify-center min-h-[340px]">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500">
            [INTERACTIVE MAP ZONE SELECTOR]
          </div>

          {/* SVG Map Representation */}
          <svg className="w-full h-72 max-w-md" viewBox="0 0 100 100" fill="none">
            {/* Outline / Rivers styling */}
            <path d="M 20 20 Q 35 15 50 30 T 75 40 T 80 80 T 40 90 T 20 50 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 30 10 Q 55 35 45 65 T 70 95" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

            {/* Pins for each Zone */}
            {DELIVERY_ZONES.map(z => {
              const isSelected = z.id === selectedZone.id;
              return (
                <g key={z.id} className="cursor-pointer group" onClick={() => setSelectedZone(z)}>
                  {/* Pulse circle */}
                  <circle
                    cx={z.coordinates.x}
                    cy={z.coordinates.y}
                    r={isSelected ? "7" : "4"}
                    fill={isSelected ? "#10b981" : "#0d9488"}
                    className={isSelected ? "animate-ping opacity-75" : "opacity-40"}
                  />
                  {/* Main Marker */}
                  <circle
                    cx={z.coordinates.x}
                    cy={z.coordinates.y}
                    r={isSelected ? "5" : "3.5"}
                    fill={isSelected ? "#10b981" : "#14b8a6"}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  {/* Text Label */}
                  <text
                    x={z.coordinates.x + 4}
                    y={z.coordinates.y + 2}
                    fill={isSelected ? "#34d399" : "#94a3b8"}
                    fontSize="3.5"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {z.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Zone Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-800/80 w-full">
            {DELIVERY_ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  z.id === selectedZone.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {z.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Zone Details Box */}
        <div className="lg:col-span-5 space-y-5 bg-slate-800/60 p-6 rounded-3xl border border-slate-700">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                {selectedZone.areaType}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {selectedZone.bnName}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
              {selectedZone.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>আনুমানিক ডেলিভারি সময়:</span>
              </div>
              <span className="font-extrabold text-white">{selectedZone.deliveryTime}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>ডেলিভারি চার্জ:</span>
              </div>
              <span className="font-extrabold text-white">৳ {selectedZone.deliveryFee} (৳ {selectedZone.freeShippingOver}+ অর্ডারে ফ্রি)</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-400 block text-[11px]">নিকটতম পিকআপ ও ডিসপ্যাচ হাবসমূহ:</span>
              <div className="space-y-1">
                {selectedZone.hubs.map((hub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{hub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-400">কোল্ড চেইন ভেহিকেল তাপমাত্রা: <b>৪°C</b></span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>হেল্পলাইন: ০১৭০০-০০০০০০</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
