import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Award, Sparkles, ChevronLeft, ChevronRight, 
  Clock, HeartHandshake, Eye, Share2, MessageCircle, 
  ThumbsUp, CheckCircle2, Bookmark, Flame
} from 'lucide-react';

export interface FarmNewsItem {
  id: string;
  category: 'অর্জন ও অ্যাওয়ার্ড' | 'কৃষি টিপস' | 'খামার আপডেট' | 'হ্যাচারি সংবাদ';
  categoryColor: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  readTime: string;
  likes: number;
  imageBgGradient: string;
  imageEmoji: string;
  fullTipText?: string;
}

const FARM_NEWS_FEED: FarmNewsItem[] = [
  {
    id: 'news-1',
    category: 'অর্জন ও অ্যাওয়ার্ড',
    categoryColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300',
    title: 'জাতীয় প্রাণিসম্পদ প্রদর্শনীতে RS Khamar "সেরা ডিজিটাল মডেল খামার ২০২৬" পুরস্কৃত!',
    summary: 'উপজেলা ও জেলা প্রাণিসম্পদ দপ্তরের যৌথ মূল্যায়নে IoT সেন্সর মনিটরিং, বায়োসিকিউরিটি প্রটোকল ও শতভাগ অর্গানিক দুগ্ধ উৎপাদনের স্বীকৃতি হিসেবে সম্মাননা ক্রেস্ট লাভ।',
    author: 'ফার্ম ম্যানেজমেন্ট টিম',
    date: '০৮ নভেম্বর ২০২৬',
    readTime: '২ মিনিট পড়া',
    likes: 142,
    imageBgGradient: 'from-amber-500/20 via-emerald-500/10 to-transparent',
    imageEmoji: '🏆'
  },
  {
    id: 'news-2',
    category: 'কৃষি টিপস',
    categoryColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    title: 'শীতকালে গাভী ও বাছুরের ঠান্ডা প্রতিরোধে সুষম সাইলেজ ও ভিটামিন-সি সমৃদ্ধ ডায়েট টিপস',
    summary: 'শীতের সকালে দুধাল গাভীর শরীরের তাপমাত্রা সঠিক রাখতে নেপিয়ারের সাথে ১০% ভুট্টা ভাঙা, কাঁচা খৈল ও কুসুম গরম পানিতে ১ চা চামচ ভিটামিন-সি মিশিয়ে পান করানোর বৈজ্ঞানিক পরমর্শ।',
    author: 'ডাঃ মোস্তাফিজুর রহমান (ভেটেরিনারি সার্জন)',
    date: '০৫ নভেম্বর ২০২৬',
    readTime: '৩ মিনিট পড়া',
    likes: 248,
    imageBgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    imageEmoji: '🌿'
  },
  {
    id: 'news-3',
    category: 'খামার আপডেট',
    categoryColor: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300',
    title: 'সাহীওয়াল প্রিমিয়াম গাভী "সাহীওয়াল প্রিন্সেস"-এর দৈনিক ১৫.৫ লিটার দুধের নতুন রেকর্ড!',
    summary: 'উচ্চ পুষ্টিসম্পন্ন হাই-প্রোটিন সাইলেজ ও মিনারেল ফর্টিফাইড ডায়েট প্রয়োগের মাত্র ২১ দিনে দৈনিক দুধ উৎপাদন ১৩.৫ লিটার থেকে বৃদ্ধি পেয়ে ১৫.৫ লিটারে পৌঁছেছে।',
    author: 'সিনিয়র শেড সুপারভাইজার',
    date: '০৩ নভেম্বর ২০২৬',
    readTime: '১ মিনিট পড়া',
    likes: 312,
    imageBgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    imageEmoji: '🥛'
  },
  {
    id: 'news-4',
    category: 'হ্যাচারি সংবাদ',
    categoryColor: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300',
    title: 'উন্নত খাঁটি খাকি ক্যাম্পবেল হাঁসের নতুন ৫০০ পিস সুস্থ ছানা সফলভাবে হ্যাচ সম্পন্ন',
    summary: 'আমাদের আধুনিক হ্যাচারি ইনকিউবেটরে সফলভাবে ফুটিয়ে তোলা সুস্থ ডিম্ব উৎপাদনকারী খাকি ক্যাম্পবেল বাচ্চার নতুন ব্যাচ বুকিং এর জন্য প্রস্তুত।',
    author: 'হ্যাচারি ইনচার্জ',
    date: '০১ নভেম্বর ২০২৬',
    readTime: '২ মিনিট পড়া',
    likes: 185,
    imageBgGradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    imageEmoji: '🐣'
  }
];

export const FarmNewsSocialFeedCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoSliding, setIsAutoSliding] = useState<boolean>(true);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (!isAutoSliding) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % FARM_NEWS_FEED.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoSliding]);

  const activeNews = FARM_NEWS_FEED[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? FARM_NEWS_FEED.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % FARM_NEWS_FEED.length);
  };

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden"
      onMouseEnter={() => setIsAutoSliding(false)}
      onMouseLeave={() => setIsAutoSliding(true)}
    >
      {/* Background Subtle Blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 relative z-10">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 w-max">
            <Megaphone className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>খামারের লাইভ সোশ্যাল ফিড ও খবরাখবর</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            RS Khamar অর্জন, আপডেট ও বিশেষজ্ঞ কৃষি টিপস
          </h3>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title="পূর্ববর্তী খবর"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Indicator dots */}
          <div className="flex items-center gap-1.5 px-2">
            {FARM_NEWS_FEED.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-7 bg-emerald-600' : 'w-2.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            title="পরবর্তী খবর"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[260px]">
        
        {/* News Visual Tile (4 cols) */}
        <div className={`lg:col-span-4 p-8 rounded-3xl bg-gradient-to-br ${activeNews.imageBgGradient} border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative group`}>
          <span className="text-6xl sm:text-7xl transform group-hover:scale-110 transition-transform duration-300">
            {activeNews.imageEmoji}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black border ${activeNews.categoryColor}`}>
            {activeNews.category}
          </span>
        </div>

        {/* News Details & Interactive Engagement (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeNews.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeNews.date} ({activeNews.readTime})</span>
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {activeNews.title}
          </h4>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {activeNews.summary}
          </p>

          {/* Social Interactions: Like, Share, Views */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLike(activeNews.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                  likedItems[activeNews.id]
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${likedItems[activeNews.id] ? 'fill-rose-600' : ''}`} />
                <span>{likedItems[activeNews.id] ? activeNews.likes + 1 : activeNews.likes} পছন্দ করেছেন</span>
              </button>

              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>১.২k ভিউ</span>
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-bold italic">
              {isAutoSliding ? '⏹️ স্বয়ংক্রিয় স্লাইড চলছে (হভার করলে থামবে)' : '▶️ স্লাইডার পজড'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
