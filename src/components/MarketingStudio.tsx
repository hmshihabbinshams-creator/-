import React, { useState, useMemo } from 'react';
import { farmStore } from '../services/farmStore';
import { LivestockItem } from '../types';
import { 
  Share2, Image as ImageIcon, Copy, Check, 
  Sparkles, Megaphone, Layout, MessageCircle, Send, 
  Tag, Activity, Award, ArrowRight, Printer
} from 'lucide-react';

export const MarketingStudio: React.FC = () => {
  const livestock = farmStore.getLivestock().filter(l => l.status !== 'বিক্রিত (Sold)');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(livestock[0]?.id || '');
  const [postType, setPostType] = useState<'SocialPost' | 'Flyer'>('SocialPost');
  const [copied, setCopied] = useState(false);

  const selectedAnimal = useMemo(() => 
    livestock.find(l => l.id === selectedAnimalId), 
    [selectedAnimalId, livestock]
  );

  const marketingCopy = useMemo(() => {
    if (!selectedAnimal) return { title: '', content: '' };

    const weight = selectedAnimal.currentWeight;
    const type = selectedAnimal.type;
    const breed = selectedAnimal.breed;
    const health = selectedAnimal.healthStatus;
    const price = selectedAnimal.sellingPrice || (selectedAnimal.purchasePrice * 1.3);

    const title = postType === 'SocialPost' 
      ? `অসাধারণ কোয়ালিটির ${type} বিক্রির জন্য প্রস্তুত!` 
      : `${selectedAnimal.name} - প্রিমিয়াম লাইভস্টক কালেকশন`;

    const content = `
🌟 আর এস সৌখিন খামারের সেরা আয়োজন!

আমাদের খামারের অন্যতম সেরা ${type} এখন আপনি আপনার সংগ্রহে নিতে পারেন। 

🔹 জাত: ${breed}
🔹 বর্তমান ওজন: ${weight} কেজি
🔹 স্বাস্থ্য অবস্থা: ${health} (শতভাগ পশুচিকিৎসক দ্বারা পরীক্ষিত)
🔹 বিশেষ বৈশিষ্ট্য: প্রাকৃতিক সুষম খাদ্যে পালিত, অ্যান্টিবায়োটিক মুক্ত।

💰 আকর্ষণীয় মূল্য: ${price.toLocaleString('bn-BD')} ৳

দ্রুত যোগাযোগ করুন:
📞 ০১৭১২-৩৪৫৬৭৮
📍 গ্রাম: সবুজপুর, রংপুর।

#RSFarm #LivestockSale #AgroBusiness #QualityMeat #RSTomaroFarm
    `.trim();

    return { title, content };
  }, [selectedAnimal, postType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(marketingCopy.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedAnimal) return <div>কোনো পশু খুঁজে পাওয়া যায়নি।</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Sidebar: Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">মার্কেটিং স্টুডিও</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">প্রচারণা তৈরি করুন</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">পশু নির্বাচন করুন</label>
              <select 
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
              >
                {livestock.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">কন্টেন্ট টাইপ</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <button 
                  onClick={() => setPostType('SocialPost')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                    postType === 'SocialPost' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  সোশ্যাল পোস্ট
                </button>
                <button 
                  onClick={() => setPostType('Flyer')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                    postType === 'Flyer' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  ডিজিটাল ফ্লায়ার
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
             <button 
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               <span>কপি টেক্সট</span>
             </button>
             <button 
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-black text-xs transition-all hover:bg-slate-800 active:scale-95"
             >
               <Printer className="w-4 h-4" />
               <span>ফ্লায়ার প্রিন্ট করুন</span>
             </button>
          </div>
        </div>

        {/* Health Card Overlay for Marketing */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white space-y-4 shadow-xl">
           <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-200" />
              <h4 className="font-black text-xs uppercase tracking-widest text-indigo-100">সার্টিফাইড হেলথ রিপোর্ট</h4>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs">
                <span className="opacity-70">বর্তমান ওজন</span>
                <span className="font-black">{selectedAnimal.currentWeight} কেজি</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs">
                <span className="opacity-70">স্বাস্থ্য অবস্থা</span>
                <span className="font-black text-emerald-300">{selectedAnimal.healthStatus}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="opacity-70">ভ্যাকসিনেশন</span>
                <span className="font-black">১০০% কমপ্লিট ✓</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right Content: Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-10">
          <div className="flex items-center justify-between mb-4 px-2">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ডিজাইন প্রিভিউ</h4>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
             </div>
          </div>

          {postType === 'SocialPost' ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl">🌾</div>
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white">আর এস সৌখিন খামার</h5>
                  <p className="text-[10px] text-slate-500">Just now · <span className="flex inline items-center gap-1">Public <Activity className="w-3 h-3" /></span></p>
                </div>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {marketingCopy.content}
              </div>
              <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden group">
                 {/* This would be where the 3D screenshot or photo goes */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 to-transparent z-10" />
                 <div className="z-20 text-center space-y-2">
                    <ImageIcon className="w-10 h-10 text-white/50 mx-auto" />
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">3D খামার থেকে ইমেজ লোড হচ্ছে...</p>
                 </div>
                 <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white text-emerald-600 text-[10px] font-black">PREMIUM STOCK</div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black">{selectedAnimal.id}</div>
                 </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-4">
                  <span className="text-[10px] font-bold text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Like</span>
                  <span className="text-[10px] font-bold text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors flex items-center gap-1"><Layout className="w-3.5 h-3.5" /> Comment</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share Now</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-none shadow-2xl border border-slate-200 aspect-[1/1.414] w-full max-w-[500px] mx-auto p-12 flex flex-col items-center text-center space-y-10 print:shadow-none print:border-none">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">আর এস সৌখিন খামার</h2>
                <p className="text-xs font-bold text-emerald-600 tracking-[0.3em] uppercase">Premium Livestock Collection</p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">{marketingCopy.title}</h3>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                  ID: {selectedAnimal.id} | {selectedAnimal.type}
                </div>
              </div>

              <div className="relative w-full aspect-square rounded-3xl bg-slate-50 border-4 border-slate-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase opacity-20">Animal Photo or 3D Render</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-xl shadow-lg">
                  {selectedAnimal.currentWeight} KG
                </div>
              </div>

              <div className="grid grid-cols-2 w-full gap-4 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">জাত (Breed)</p>
                  <p className="text-sm font-black text-slate-900">{selectedAnimal.breed}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">স্বাস্থ্য (Health)</p>
                  <p className="text-sm font-black text-emerald-600">CERTIFIED ✓</p>
                </div>
              </div>

              <div className="space-y-4 w-full">
                <p className="text-3xl font-black text-slate-900">৳ {selectedAnimal.sellingPrice?.toLocaleString('bn-BD') || '---'}</p>
                <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
                  <p className="text-xs font-bold leading-relaxed opacity-90">সংগ্রহের জন্য দ্রুত যোগাযোগ করুন:</p>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-lg font-black tracking-tighter">০১৭১২-৩৪৫৬৭৮</p>
                    <p className="text-[10px] font-medium opacity-60">সবুজপুর, রংপুর, বাংলাদেশ</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                   <Tag className="w-3 h-3" />
                   <span>Quality Guaranteed by RS AGRO</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
