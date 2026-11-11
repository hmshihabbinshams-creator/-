import React, { useState } from 'react';
import { farmStore } from '../services/farmStore';
import { Phone, MapPin, ArrowRight, ShoppingBag, Leaf, ShieldCheck, Zap, Mail, CheckCircle2 } from 'lucide-react';

interface PublicHomeProps {
  onTabChange: (tab: any) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onTabChange }) => {
  const profile = farmStore.getInstitutionProfile();
  const [subscriberInput, setSubscriberInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberInput.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('rs_farm_newsletter') || '[]');
      existing.push({ contact: subscriberInput.trim(), date: new Date().toISOString() });
      localStorage.setItem('rs_farm_newsletter', JSON.stringify(existing));
    } catch {
      // Fallback
    }

    setIsSubscribed(true);
    setSubscriberInput('');
  };

  const whatsappLink = `https://wa.me/${profile.phone?.replace(/[^0-9]/g, '') || '8801712345678'}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আপনাদের খামারের পণ্য সম্পর্কে জানতে ও অর্ডার করতে আগ্রহী।')}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] transition-colors duration-500">
      
      {/* Hero Section - High End Digital Feel */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/modern_digital_farm_hero_1794407031731.jpg" 
            alt="Farm Hero" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#090d16] dark:to-[#090d16]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest animate-fade-in-up">
            <Zap className="w-4 h-4 fill-current" />
            <span>স্মার্ট এগ্রিকালচার ও ডিজিটাল খামার</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] animate-fade-in-up delay-100">
            প্রকৃতির ছোঁয়ায় <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">ডিজিটাল শুদ্ধতা</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium leading-relaxed animate-fade-in-up delay-200">
            {profile.name}-এ আমরা আধুনিক প্রযুক্তির সমন্বয়ে উৎপাদন করছি শতভাগ ভেজালমুক্ত এবং প্রাকৃতিক পুষ্টিগুণ সমৃদ্ধ খাবার। আমাদের পণ্য মানেই সুস্বাস্থ্য ও আস্থার নিশ্চয়তা।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
            <button 
              onClick={() => onTabChange('store')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>পণ্য শপ দেখুন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#contact-section"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white font-black text-sm transition-all cursor-pointer"
            >
              আমাদের সম্পর্কে জানুন
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative z-20 -mt-20 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            icon: Leaf, 
            title: '১০০% প্রাকৃতিক', 
            desc: 'সরাসরি খামার থেকে সংগ্রহকৃত, কোনো প্রকার কৃত্রিম হরমোন বা প্রিজারভেটিভ মুক্ত।',
            color: 'emerald'
          },
          { 
            icon: ShieldCheck, 
            title: 'নিরাপদ উৎপাদন', 
            desc: 'আধুনিক প্রযুক্তিতে মান নিয়ন্ত্রিত এবং ভেটেরিনারি চিকিৎসকের তত্ত্বাবধানে লালিত।',
            color: 'blue'
          },
          { 
            icon: Zap, 
            title: 'দ্রুত ডেলিভারি', 
            desc: 'অনলাইনে অর্ডার করার পর দ্রুততম সময়ে আপনার দোরগোড়ায় পৌঁছে দিচ্ছি আমাদের ফ্রেশ পণ্য।',
            color: 'amber'
          }
        ].map((feat, i) => (
          <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feat.color}-100 dark:bg-${feat.color}-900/30 text-${feat.color}-600 dark:text-${feat.color}-400 transition-colors group-hover:scale-110`}>
              <feat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{feat.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-emerald-900 to-slate-900 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="relative z-10 space-y-6 max-w-xl text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              আমাদের ফ্রেশ পণ্যগুলো <br />এখনই দেখে নিন
            </h2>
            <p className="text-emerald-100/80 text-lg">
              প্রতিটি পণ্য যত্ন সহকারে উৎপাদিত এবং স্বাস্থ্যসম্মত ভাবে প্যাকেজিং করা হয়েছে। আপনার পরিবারের সুস্বাস্থ্য নিশ্চিত করতে আমাদের ওপর আস্থা রাখতে পারেন।
            </p>
            <button 
              onClick={() => onTabChange('store')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-emerald-900 font-black text-sm shadow-xl hover:bg-emerald-50 transition-all cursor-pointer"
            >
              সব পণ্য দেখুন
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 w-full max-w-sm aspect-square rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-8xl shadow-inner">
            🌿
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px] -ml-20 -mb-20" />
        </div>
      </section>

      {/* Contact Section - Modernized */}
      <section id="contact-section" className="max-w-7xl mx-auto px-6 pb-24 w-full">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">যোগাযোগ করুন</h2>
          <div className="w-20 h-1.5 bg-emerald-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-6 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">অবস্থান</p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{profile.location}</h4>
              <p className="text-sm text-slate-500">{profile.district}</p>
            </div>
          </div>

          <div className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-6 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/20">
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">মোবাইল</p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">{profile.phone}</h4>
              <p className="text-sm text-slate-500">অর্ডার ও তথ্যের জন্য কল দিন</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discreet Minimalist Newsletter Subscription */}
      <section className="max-w-2xl mx-auto px-6 pb-16 w-full">
        <div className="p-6 sm:p-8 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 shadow-sm backdrop-blur-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto">
            <Mail className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              তাজা ফলন ও পণ্য প্রাপ্যতা আপডেট
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              নতুন খাঁটি দুধ, তাজা ডিম বা অর্গানিক মাছের স্টক এলে সবার আগে নোটিফিকেশন পান।
            </p>
          </div>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>ধন্যবাদ! খামারের নতুন পণ্য ও ফলনের আপডেট তালিকায় আপনি যুক্ত হয়েছেন।</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={subscriberInput}
                    onChange={(e) => setSubscriberInput(e.target.value)}
                    placeholder="আপনার ইমেইল অথবা মোবাইল নম্বর..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>যুক্ত হোন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                🔒 কোনো অবাঞ্ছিত স্প্যাম নয়। শুধুমাত্র খামারের ফলন ও প্রাপ্যতা আপডেট।
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Floating WhatsApp Order Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-full bg-[#25D366] text-white font-black text-sm shadow-[0_20px_50px_rgba(37,211,102,0.3)] hover:bg-[#128C7E] transition-all transform hover:scale-110 active:scale-95 group"
      >
        <span className="text-xl animate-bounce">💬</span>
        <span>অর্ডার করতে মেসেজ দিন</span>
      </a>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © ২০২৬ {profile.name} — প্রযুক্তিনির্ভর আধুনিক ও প্রাকৃতিক খামার।
        </p>
      </footer>
    </div>
  );
};


