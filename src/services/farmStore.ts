import { 
  LivestockItem, FeedLog, MedicalLog, CustomerOrder, EmployeeRecord, 
  InstitutionProfile, HealthLog, FeedInventoryItem, OwnerTransaction, 
  SeasonalFeedGuideline, StructuredFeedItem, DailyFeedingRecord, 
  AutomatedFeedingSchedule, FeedingTimeSlot, FarmObject, DailyProductionRecord,
  VoicePhraseMapping, PurchaseOrder
} from '../types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  collection, doc, setDoc, onSnapshot, query, where, getDocs, 
  writeBatch, enableIndexedDbPersistence, terminate 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const INITIAL_VOICE_PHRASES: VoicePhraseMapping[] = [
  {
    id: 'vp-1',
    phrase: 'সব গাভী এখন কি করছে',
    actions: [{ type: 'livestock_status', targetTab: 'admin', adminTabKey: 'dashboard' }],
    responseText: 'খামারের সকল গাভীর বর্তমান লাইভস্টক স্ট্যাটাস ও হেলথ মনিটর খোলা হচ্ছে।',
    isActive: true,
    createdAt: '2026-11-10'
  },
  {
    id: 'vp-2',
    phrase: 'আজকের দুধের উৎপাদন দেখাও',
    actions: [{ type: 'query_milk', targetTab: 'admin', adminTabKey: 'dashboard' }],
    responseText: 'আজকের খামারে মোট দুধ সংগ্রহ ১৩০.৪ লিটার। গড়া ফ্যাট ৪.৮%।',
    isActive: true,
    createdAt: '2026-11-10'
  },
  {
    id: 'vp-3',
    phrase: 'আজকের ডিমের হিসাব দেখাও',
    actions: [{ type: 'query_eggs', targetTab: 'admin', adminTabKey: 'dashboard' }],
    responseText: 'আজকের অর্গানিক ডিম সংগ্রহ ৮৫৮টি। হ্যাচারি ও শপ রিপোর্ট প্রদর্শন করা হচ্ছে।',
    isActive: true,
    createdAt: '2026-11-10'
  },
  {
    id: 'vp-4',
    phrase: 'বিক্রির পশু দেখাও',
    actions: [{ type: 'tab_navigate', targetTab: 'store' }],
    responseText: 'বিক্রয়যোগ্য পশুর শপে নিয়ে যাওয়া হচ্ছে।',
    isActive: true,
    createdAt: '2026-11-10'
  },
  {
    id: 'vp-5',
    phrase: 'খাদ্যের স্টক দেখাও',
    actions: [{ type: 'query_feed', targetTab: 'admin', adminTabKey: 'feed' }],
    responseText: 'খামারের ভুট্টা সাইলেজ ও দানাদার ফিড স্টক ইনভেন্টরি খোলা হচ্ছে।',
    isActive: true,
    createdAt: '2026-11-10'
  },
  {
    id: 'vp-6',
    phrase: 'ভ্যাকসিন শিডিউল দেখাও',
    actions: [{ type: 'query_health', targetTab: 'admin', adminTabKey: 'vaccine' }],
    responseText: 'আগামী ৭ দিনের ভ্যাকসিন শিডিউল ও বায়োসিকিউরিটি পোর্টাল খোলা হচ্ছে।',
    isActive: true,
    createdAt: '2026-11-10'
  }
];

export function getDefaultStructuredFeedPlan(speciesType: string): { dailyBudgetTaka: number; items: StructuredFeedItem[] } {
  const type = speciesType.toLowerCase();
  
  if (type.includes('গরু') || type.includes('cattle') || type.includes('cow')) {
    return {
      dailyBudgetTaka: 220,
      items: [
        { id: 'f-c1', name: 'দানাদার মিশ্রণ (গমের ভুসি + খৈল + ভুট্টা)', targetAmountKg: 3.5, unit: 'কেজি', estimatedCostTaka: 140 },
        { id: 'f-c2', name: 'কাঁচা ঘাস (নেপিয়ার / জার্মানি হাইব্রিড)', targetAmountKg: 15.0, unit: 'কেজি', estimatedCostTaka: 50 },
        { id: 'f-c3', name: 'শুষ্ক খড়', targetAmountKg: 3.0, unit: 'কেজি', estimatedCostTaka: 20 },
        { id: 'f-c4', name: 'মিনারেল ব্লক ও লবণ', targetAmountKg: 0.1, unit: 'কেজি', estimatedCostTaka: 10 },
      ]
    };
  }

  if (type.includes('ছাগল') || type.includes('goat')) {
    return {
      dailyBudgetTaka: 85,
      items: [
        { id: 'f-g1', name: 'কাঁঠাল পাতা ও সুদান ঘাস', targetAmountKg: 3.0, unit: 'কেজি', estimatedCostTaka: 25 },
        { id: 'f-g2', name: 'স্পেশাল দানাদার ভুষি মিক্স', targetAmountKg: 0.6, unit: 'কেজি', estimatedCostTaka: 40 },
        { id: 'f-g3', name: 'ভুট্টা ভাঙা ও কড়ই ডাল', targetAmountKg: 0.3, unit: 'কেজি', estimatedCostTaka: 20 },
      ]
    };
  }

  if (type.includes('হাঁস') || type.includes('duck')) {
    return {
      dailyBudgetTaka: 35,
      items: [
        { id: 'f-d1', name: 'পেকিন/খাকি ফ্লোটিং গ্রোয়ার ফিড', targetAmountKg: 0.25, unit: 'কেজি', estimatedCostTaka: 20 },
        { id: 'f-d2', name: 'সেদ্ধ ধান ও শাকসবজি কুচি', targetAmountKg: 0.15, unit: 'কেজি', estimatedCostTaka: 10 },
        { id: 'f-d3', name: 'ঝিনুক গুড়া (ক্যালসিয়াম)', targetAmountKg: 0.05, unit: 'কেজি', estimatedCostTaka: 5 },
      ]
    };
  }

  if (type.includes('মুরগি') || type.includes('chicken') || type.includes('poultry')) {
    return {
      dailyBudgetTaka: 18,
      items: [
        { id: 'f-p1', name: 'সোনালী / লেয়ার ১ কমপ্লিট ফিড', targetAmountKg: 0.12, unit: 'কেজি', estimatedCostTaka: 11 },
        { id: 'f-p2', name: 'গম ভাঙা ও চালের খুদ', targetAmountKg: 0.05, unit: 'কেজি', estimatedCostTaka: 4 },
        { id: 'f-p3', name: 'ভিটামিন ও মিনারেল প্রিমিক্স', targetAmountKg: 0.01, unit: 'কেজি', estimatedCostTaka: 3 },
      ]
    };
  }

  if (type.includes('পাখি') || type.includes('birds')) {
    return {
      dailyBudgetTaka: 8,
      items: [
        { id: 'f-b1', name: 'হাই-প্রোটিন বার্ড ফিড (২৪% প্রোটিন)', targetAmountKg: 0.04, unit: 'কেজি', estimatedCostTaka: 5 },
        { id: 'f-b2', name: 'সূক্ষ্ম ভুট্টা ও মিলেট মিক্স', targetAmountKg: 0.02, unit: 'কেজি', estimatedCostTaka: 3 },
      ]
    };
  }

  if (type.includes('মাছ') || type.includes('fish')) {
    return {
      dailyBudgetTaka: 25,
      items: [
        { id: 'f-fi1', name: 'ভাসমান ফিশ ফিড (পুকুর)', targetAmountKg: 0.1, unit: 'কেজি', estimatedCostTaka: 15 },
        { id: 'f-fi2', name: 'সরিষার খৈল ও কুঁড়া মিশ্রণ', targetAmountKg: 0.05, unit: 'কেজি', estimatedCostTaka: 10 },
      ]
    };
  }

  return {
    dailyBudgetTaka: 100,
    items: [
      { id: 'f-def1', name: 'সুষম দানাদার খাদ্য', targetAmountKg: 1.0, unit: 'কেজি', estimatedCostTaka: 70 },
      { id: 'f-def2', name: 'কাঁচা ঘাস ও লতা', targetAmountKg: 5.0, unit: 'কেজি', estimatedCostTaka: 30 },
    ]
  };
}

export function getAutomatedFeedingSchedule(animal: LivestockItem): AutomatedFeedingSchedule {
  const ageStr = animal.age || '১ বছর';
  let ageMonths = 12;

  const bnToEnNums: Record<string, string> = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  const normalizedAgeStr = ageStr.replace(/[০-৯]/g, m => bnToEnNums[m] || m);
  const matchNum = normalizedAgeStr.match(/(\d+(\.\d+)?)/);
  const numVal = matchNum ? parseFloat(matchNum[1]) : 1;

  if (ageStr.includes('মাস')) {
    ageMonths = numVal;
  } else if (ageStr.includes('বছর') || ageStr.includes('year')) {
    ageMonths = numVal * 12;
  } else if (numVal < 5) {
    ageMonths = numVal * 12;
  }

  const type = (animal.type || '').toLowerCase();
  let ageGroupLabel = 'পূর্ণাঙ্গ প্রজনন ও পালন বয়স্ক পর্যায়';
  let multiplier = 1.0;
  let rationGuidelines = 'প্রমাণিত দৈহিক ওজন ও দৈনিক পুষ্টি চাহিদা অনুযায়ী খাদ্য বরাদ্দ।';

  if (type.includes('গরু') || type.includes('cattle') || type.includes('cow')) {
    if (ageMonths < 4) {
      ageGroupLabel = 'বাচ্চা বাছুর (Calf Stage: ১-৩ মাস)';
      multiplier = 0.45;
      rationGuidelines = 'কাফ স্টার্টার মিক্স, ভিটামিন লিকুইড এবং নরম কচি সবুজ ঘাস।';
    } else if (ageMonths <= 12) {
      ageGroupLabel = 'বাড়ন্ত বকনা/ষাঁড় (Growing Stage: ৪-১২ মাস)';
      multiplier = 0.8;
      rationGuidelines = 'উচ্চ প্রোটিনযুক্ত দানাদার খাবার ও সবুজ নেপিয়ার ঘাস দৈনিক দৈহিক ওজনের ৩.৫%।';
    } else {
      ageGroupLabel = 'পূর্ণাঙ্গ গাভী/বলদ (Adult Stage: ১২+ মাস)';
      multiplier = 1.15;
      rationGuidelines = 'দুগ্ধ উৎপাদন ও ফ্যাটেনিং উপযোগী সুষম দানাদার মিক্স, ইউরিয়া মোলাসেস ও খড়।';
    }
  } else if (type.includes('ছাগল') || type.includes('goat')) {
    if (ageMonths < 4) {
      ageGroupLabel = 'ছাগল ছানা (Kid Stage: ১-৩ মাস)';
      multiplier = 0.5;
      rationGuidelines = 'মায়ের দুধের পাশাপাশি কচি কাঁঠাল পাতা ও কচি সুদান ঘাস সূক্ষ্ম কুচি।';
    } else if (ageMonths <= 12) {
      ageGroupLabel = 'বাড়ন্ত খাসি/পাঠী (Growing Stage: ৪-১২ মাস)';
      multiplier = 0.85;
      rationGuidelines = 'দানাদার ভুষি মিক্স (৬০০ গ্রাম) এবং তাজা কাঁঠাল ও ইপিল-ইপিল পাতা।';
    } else {
      ageGroupLabel = 'পূর্ণাঙ্গ প্রজনন খাসি/ছাগী (Adult Stage: ১২+ মাস)';
      multiplier = 1.15;
      rationGuidelines = 'উচ্চ এনার্জি ফিড ও খনিজ লবণ ব্লক।';
    }
  } else if (type.includes('হাঁস') || type.includes('duck')) {
    if (ageMonths < 2) {
      ageGroupLabel = 'হাঁসের ছানা (Duckling Stage)';
      multiplier = 0.4;
      rationGuidelines = 'স্টার্টার পেলেট ফিড পানি ভিজিয়ে সূক্ষ্ম পরিবেশন।';
    } else if (ageMonths <= 5) {
      ageGroupLabel = 'বাড়ন্ত হাঁস (Duck Grower Stage)';
      multiplier = 0.8;
      rationGuidelines = 'গ্রোয়ার পেলেট ফিড ও সেদ্ধ ধানের মিশ্রণ।';
    } else {
      ageGroupLabel = 'ডিম্পাড়া পূর্ণাঙ্গ হাঁস (Layer Duck Stage)';
      multiplier = 1.1;
      rationGuidelines = 'লেয়ার ফিড এবং ক্যালসিয়াম সমৃদ্ধ ঝিনুক গুঁড়া।';
    }
  } else if (type.includes('মুরগি') || type.includes('chicken') || type.includes('poultry')) {
    if (ageMonths < 2) {
      ageGroupLabel = 'মুরগির ছানা (Chick Starter Stage)';
      multiplier = 0.45;
      rationGuidelines = 'চিক স্টার্টার ক্রাম্বল ফিড ও ভিটামিন সমৃদ্ধ পানি।';
    } else if (ageMonths <= 5) {
      ageGroupLabel = 'বাড়ন্ত ককরেল/সোনালী (Grower Stage)';
      multiplier = 0.85;
      rationGuidelines = 'গ্রোয়ার ফিড ও গম ভাঙা।';
    } else {
      ageGroupLabel = 'লেয়ার/প্রজনন মুরগি (Adult Layer Stage)';
      multiplier = 1.1;
      rationGuidelines = 'সোনালী লেয়ার কমপ্লিট ফিড ও ক্যালসিয়াম।';
    }
  } else if (type.includes('পাখি') || type.includes('birds')) {
    if (ageMonths < 1) {
      ageGroupLabel = 'পাখির ছানা (Chick Stage)';
      multiplier = 0.55;
      rationGuidelines = '২৪% প্রোটিন সমৃদ্ধ ম্যাস ফিড ও ভিটামিন মিক্স।';
    } else {
      ageGroupLabel = 'পূর্ণাঙ্গ প্রজননক্ষম পাখি (Adult Stage)';
      multiplier = 1.1;
      rationGuidelines = 'পাখির ফিড ৪০ গ্রাম/দিন ও সুক্ষ্ম ভুট্টা গুড়া।';
    }
  } else if (type.includes('মাছ') || type.includes('fish')) {
    if (ageMonths < 3) {
      ageGroupLabel = 'পোনা/ফিঙ্গারলিং (Spawn/Fingerling Stage)';
      multiplier = 0.6;
      rationGuidelines = 'মিহি ডাস্ট ফিড ও প্রাকৃতিক জুপ্ল্যাঙ্কটন বৃদ্ধি নিশ্চিত করুন।';
    } else {
      ageGroupLabel = 'বাড়ন্ত/পূর্ণাঙ্গ মাছ (Grower/Table-size Stage)';
      multiplier = 1.2;
      rationGuidelines = 'ভাসমান প্রোটিন সমৃদ্ধ পেলেট ফিড ও সম্পূরক খাদ্য।';
    }
  }


  const baseItems = animal.structuredFeedPlan && animal.structuredFeedPlan.length > 0 
    ? animal.structuredFeedPlan 
    : getDefaultStructuredFeedPlan(animal.type).items;

  const adjustedItems = baseItems.map(item => ({
    name: item.name,
    targetAmount: parseFloat((item.targetAmountKg * multiplier).toFixed(2)),
    unit: item.unit || 'কেজি',
    costTaka: Math.round(item.estimatedCostTaka * multiplier) || 10,
  }));

  const totalDailyKg = adjustedItems.reduce((s, i) => s + i.targetAmount, 0);
  const recommendedDailyBudgetTaka = adjustedItems.reduce((s, i) => s + i.costTaka, 0);

  const timeSlots: FeedingTimeSlot[] = [
    {
      slot: 'সকাল',
      timeLabel: '০৭:৩০ AM (সকালের প্রধান আহার)',
      portionPercentage: 50,
      items: adjustedItems.map(i => ({
        name: i.name,
        targetAmount: parseFloat((i.targetAmount * 0.5).toFixed(2)),
        unit: i.unit,
        costTaka: Math.round(i.costTaka * 0.5),
      }))
    },
    {
      slot: 'দুপুর',
      timeLabel: '০১:০০ PM (দুপুরের রিফ্রেশমেন্ট ও পানি)',
      portionPercentage: 15,
      items: adjustedItems.map(i => ({
        name: i.name,
        targetAmount: parseFloat((i.targetAmount * 0.15).toFixed(2)),
        unit: i.unit,
        costTaka: Math.round(i.costTaka * 0.15),
      }))
    },
    {
      slot: 'বিকাল/রাত',
      timeLabel: '০৬:৩০ PM (বিকাল/রাতের খাবার)',
      portionPercentage: 35,
      items: adjustedItems.map(i => ({
        name: i.name,
        targetAmount: parseFloat((i.targetAmount * 0.35).toFixed(2)),
        unit: i.unit,
        costTaka: Math.round(i.costTaka * 0.35),
      }))
    }
  ];

  return {
    animalId: animal.id,
    animalName: animal.name,
    speciesType: animal.type,
    ageString: ageStr,
    ageInMonths: ageMonths,
    ageGroupLabel,
    portionMultiplier: multiplier,
    totalDailyKg: parseFloat(totalDailyKg.toFixed(2)),
    recommendedDailyBudgetTaka,
    timeSlots,
    rationGuidelines,
  };
}

export const INITIAL_INSTITUTION_PROFILE: InstitutionProfile = {
  name: 'আর এস সৌখিন খামার',
  tagline: 'জাতীয় মানসম্মত আধুনিক দেশীয় খামার, লাইভস্টক ও কারিগরি কৃষি কমপ্লেক্স',
  proprietor: 'মোঃ আব্দুর রহিম / মোঃ শাহিন আলম',
  registrationNumber: 'DLS-REG-2024/8892',
  licenseNumber: 'AGRO-GOVT-LIC-4412',
  phone: '+880 1712-345678, +880 1819-876543',
  email: 'contact@rskhamar.com.bd',
  location: 'গ্রাম: সবুজপুর, ডাকঘর: আনন্দনগর',
  district: 'রংপুর / বগুড়া, বাংলাদেশ',
  establishedYear: '২০২০',
  bioSecurityTier: 'লেভেল ৩ (উচ্চ জীবনিরাপত্তা ও প্রাণিসম্পদ অধিদপ্তর স্বীকৃত)',
  totalLandArea: '১২ বিঘা (খামার, গোশালা, হাঁসের জলাশয় ও চারণভূমি)',
  description: 'প্রাকৃতিক ও স্বাস্থ্যকর পরিবেশে উন্নত জাতের গাভী, বলদ, খাঁটি যমুনাপারি ও ব্ল্যাক বেঙ্গল ছাগল, খাকি ক্যাম্পবেল হাঁস, সোনালী মুরগি ও সৌখিন পাখি প্রতিপালন। আধুনিক পুষ্টিবিজ্ঞান অনুযায়ী নিজস্ব সুষম ঘাস ও খাদ্যের জোগান এবং এতিম ও তরুণদের কর্মসংস্থানমুখী প্রাতিষ্ঠানিক কৃষি প্রকল্প।',
  coreActivities: 'খাঁটি তরল দুধ ও প্রাকৃতিক মাংস উৎপাদন, উন্নত প্রজনন জাত উন্নয়ন, হাঁস-মুরগি বাচ্চা উৎপাদন ও হ্যাচারি, জীবাণুমুক্ত বায়োসিকিউরিটি নিশ্চিতকরণ, এতিম ও দরিদ্র শিক্ষার্থীদের বৃত্তিমূলক কারিগরি প্রশিক্ষণ।',
  logo: '🌾',
  adminEmail: 'hmshihabbinshams@gmail.com',
  adminPassword: '558858@Shihab',
  // Landing Page Customization Defaults
  heroTitle: 'প্রাকৃতিক ও আধুনিক স্মার্ট এগ্রো ফার্মিং',
  heroSubtitle: 'উন্নত প্রযুক্তির সমন্বয়ে গুণগত মানসম্পন্ন ও স্বাস্থ্যকর পশুপালন নিশ্চিত করছি আমরা।',
  missionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
  missionText: 'উন্নত জাতের পশুপালন এবং আধুনিক প্রযুক্তির ব্যবহারের মাধ্যমে কৃষি খাতে বিপ্লব ঘটানোই আমাদের প্রধান লক্ষ্য।',
  featuresTitle: 'কেন আমাদের নির্বাচন করবেন?',
  feature1Title: 'প্রাকৃতিক খাবার',
  feature1Text: 'সম্পূর্ণ প্রাকৃতিক ও রাসায়নিকমুক্ত খাদ্য সরবরাহ।',
  feature2Title: 'স্মার্ট মনিটরিং',
  feature2Text: '২৪/৭ প্রযুক্তিনির্ভর স্বাস্থ্য ও পরিবেশ পর্যবেক্ষণ।',
  feature3Title: 'উন্নত ব্রিড',
  feature3Text: 'দেশি ও বিদেশি উন্নত জাতের পশুর সমাহার।',
  footerText: 'আর এস সৌখিন খামার - ২০২৬ । সর্বস্বত্ব সংরক্ষিত।',
  galleryItems: [
    { id: 'g-1', img: '/src/assets/images/farm_hero_pasture_1794403820758.jpg', title: 'সবুজ তৃণভূমি ও চারণভূমি', subtitle: 'প্রাকৃতিক চারণ ক্ষেত্র', category: 'Pasture' },
    { id: 'g-2', img: '/src/assets/images/farm_cattle_dairy_1794403820406.jpg', title: 'ডেইরি ক্যাটল শেড', subtitle: 'পরিচ্ছন্ন ও আলো-বাতাসপূর্ণ ডেইরি শেড', category: 'Barn' },
    { id: 'g-3', img: '/src/assets/images/farm_duck_pond_1794403821196.jpg', title: 'প্রাকৃতিক হাঁসের পুকুর', subtitle: 'স্বচ্ছ পানির মুক্ত পুকুর', category: 'Pond' },
    { id: 'g-4', img: '/src/assets/images/farm_fresh_milk_1794403821264.jpg', title: 'খাঁটি তরল দুধ সংগ্রহ', subtitle: 'প্রতিদিনের তাজা দুধ সংগ্রহ', category: 'Dairy' },
  ],
  servicesList: [
    { id: 's-1', title: '🐄 উন্নত জাতের ডেইরি গাভী ও ষাঁড়', desc: 'সাহীওয়াল, ফ্রিজিয়ান ও উন্নত জাতের ডেইরি গাভী এবং চমৎকার স্বাস্থ্যবান কোরবানির ষাঁড়।', icon: '🐄' },
    { id: 's-2', title: '🐐 ব্ল্যাক বেঙ্গল ও খাসি', desc: 'প্রাকৃতিক কাঁচা ঘাস-পাতায় লালিত সুস্থ খাসি ও প্রজনন উপযোগী ছাগল।', icon: '🐐' },
    { id: 's-3', title: '🥛 প্রতিদিনের তাজা তরল দুধ', desc: 'প্রতিদিন সকালের সংগৃহীত খাঁটি তরল দুধ। বাসা-বাড়ি ও মিষ্টির দোকানের জন্য নিয়মিত হোম ডেলিভারি।', icon: '🥛' },
    { id: 's-4', title: '🦆 খাকি ক্যাম্পবেল হাঁসের ডিম', desc: 'প্রাকৃতিক জলাশয়ে উন্মুক্তভাবে সাঁতার কাটা লেয়ার হাঁসের পুষ্টিকর ডিম।', icon: '🦆' },
    { id: 's-5', title: '🐓 সোনালী ও দেশি হাঁস-মুরগি', desc: 'প্রাকৃতিক খাবার ও মুক্ত চারণে বেড়ে ওঠা সুস্থ সোনালী ও দেশি মুরগির সরবরাহ।', icon: '🐓' },
    { id: 's-6', title: '🐟 প্রাকৃতিক পুকুরের তাজা মাছ', desc: 'ফরমালিনমুক্ত তাজা রুই, কাতলা, তেলাপিয়া ও কার্প জাতীয় পুকুরের মাছ।', icon: '🐟' },
  ]
};

const INITIAL_FEED_INVENTORY: FeedInventoryItem[] = [
  { id: 'FI-1', name: 'নেপিয়ার ঘাস', category: 'খাদ্য (Feed)', currentStockKg: 500, minThresholdKg: 100, unitPrice: 5, unit: 'কেজি', lastUpdated: '2026-05-01' },
  { id: 'FI-2', name: 'গমের ভুসি', category: 'খাদ্য (Feed)', currentStockKg: 200, minThresholdKg: 50, unitPrice: 45, unit: 'কেজি', lastUpdated: '2026-05-01' },
  { id: 'FI-3', name: 'সরিষার খৈল', category: 'খাদ্য (Feed)', currentStockKg: 18, minThresholdKg: 25, unitPrice: 65, unit: 'কেজি', lastUpdated: '2026-05-01' },
  { id: 'FI-4', name: 'দানাদার মিশ্রিত ফিড', category: 'খাদ্য (Feed)', currentStockKg: 300, minThresholdKg: 75, unitPrice: 55, unit: 'কেজি', lastUpdated: '2026-05-01' },
  { id: 'FI-5', name: 'এফএমডি (FMD) ভ্যাকসিন', category: 'ঔষধ ও ভ্যাকসিন (Medicine)', currentStockKg: 4, minThresholdKg: 10, unitPrice: 450, unit: 'ভায়াল', lastUpdated: '2026-05-01' },
  { id: 'FI-6', name: 'পিপিআর (PPR) ভ্যাকসিন', category: 'ঔষধ ও ভ্যাকসিন (Medicine)', currentStockKg: 8, minThresholdKg: 15, unitPrice: 320, unit: 'ডোজ', lastUpdated: '2026-05-01' },
  { id: 'FI-7', name: 'কৃমিনাশক সিরাপ (Albendazole)', category: 'ঔষধ ও ভ্যাকসিন (Medicine)', currentStockKg: 14, minThresholdKg: 5, unitPrice: 280, unit: 'বোতল', lastUpdated: '2026-05-01' },
  { id: 'FI-8', name: 'ভিটামিন ও মিনারেল প্রিমিক্স', category: 'ঔষধ ও ভ্যাকসিন (Medicine)', currentStockKg: 3, minThresholdKg: 10, unitPrice: 600, unit: 'কেজি', lastUpdated: '2026-05-01' },
];

const INITIAL_OWNER_TRANSACTIONS: OwnerTransaction[] = [
  { id: 'OT-1', date: '2026-01-01', type: 'Investment', amount: 500000, description: 'প্রাথমিক মূলধন' },
];

const INITIAL_LIVESTOCK: LivestockItem[] = [
  {
    id: 'C-101',
    name: 'সাহীওয়াল প্রিন্সেস (Sahiwal Princess)',
    type: 'গরু (Cattle)',
    breed: 'সাহীওয়াল প্রিমিয়াম জাত',
    batchOrFlock: 'একক গাভী',
    quantity: 1,
    purchaseDate: '2026-01-10',
    purchasePrice: 180000,
    initialWeight: 380,
    currentWeight: 450,
    targetWeight: 520,
    age: '৩ বছর',
    healthStatus: 'সুস্থ ও সবল (টিকা সম্পন্ন)',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: 'কাঁচা ঘাস ১৫ কেজি, ভুসি ৩ কেজি, খৈল ৫০০ গ্রাম, মিনারেল মিক্স ৫০ গ্রাম',
    dailyFeedBudget: 220,
    structuredFeedPlan: [
      { id: 'sf-c1', name: 'দানাদার মিশ্রণ (ভুসি + খৈল + ভুট্টা)', targetAmountKg: 3.5, unit: 'কেজি', estimatedCostTaka: 140 },
      { id: 'sf-c2', name: 'কাঁচা নেপিয়ার ঘাস', targetAmountKg: 15.0, unit: 'কেজি', estimatedCostTaka: 50 },
      { id: 'sf-c3', name: 'শুষ্ক খড়', targetAmountKg: 3.0, unit: 'কেজি', estimatedCostTaka: 20 },
      { id: 'sf-c4', name: 'মিনারেল ব্লক ও লবণ', targetAmountKg: 0.1, unit: 'কেজি', estimatedCostTaka: 10 },
    ],
    isForSale: false,
    sellingPrice: 285000,
    saleDescription: 'উচ্চমানের সাহীওয়াল গাভী। প্রতিদিন গড়ে ১৪ লিটার খাঁটি উচ্চ ফ্যাটযুক্ত দুধ দেয়।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 12,
    targetSellingPrice: 285000,
    dailyProduction: { type: 'দুধ উৎপাদন', amount: '১৪ লিটার/দিন', qualityGrade: 'A+ (৪.৮% ফ্যাট)' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-01-10', weightKg: 380, targetExpectedKg: 380, notes: 'ক্রয়কালীন প্রারম্ভিক ওজন' },
      { month: 1, days: 30, date: '2026-02-10', weightKg: 398, targetExpectedKg: 392, notes: 'সুষম ঘাস ও সাইলেজে চমৎকার প্রতিক্রিয়া' },
      { month: 2, days: 60, date: '2026-03-10', weightKg: 418, targetExpectedKg: 405, notes: 'নিয়মিত কৃমিনাশক ও মিনারেল' },
      { month: 3, days: 90, date: '2026-04-10', weightKg: 435, targetExpectedKg: 420, notes: 'এফএমডি বুস্টার টিকা প্রদান' },
      { month: 4, days: 120, date: '2026-05-10', weightKg: 450, targetExpectedKg: 440, notes: 'বর্তমান রেকর্ডকৃত ওজন' }
    ]
  },
  {
    id: 'G-201',
    name: 'যমুনাপারি সর্দার (Jamunapari Sardar)',
    type: 'ছাগল (Goat)',
    breed: 'খাঁটি যমুনাপারি খাসি',
    batchOrFlock: 'একক প্রজনন ও পালন',
    quantity: 1,
    purchaseDate: '2026-01-15',
    purchasePrice: 24000,
    initialWeight: 22,
    currentWeight: 46,
    targetWeight: 55,
    age: '১.৫ বছর',
    healthStatus: 'সুস্থ ও শক্তিশালী (পিপিআর টিকা সম্পন্ন)',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: 'কাঁঠাল পাতা ৩ কেজি, ইপিল ইপিল, দানাদার খাদ্য ৬০০ গ্রাম',
    dailyFeedBudget: 85,
    isForSale: true,
    sellingPrice: 55000,
    saleDescription: 'লম্বা ঝুলন্ত কান ও রাজকীয় চেহারার উন্নত যমুনাপারি খাসি।',
    status: 'বিক্রির জন্য প্রস্তুত',
    targetRearingMonths: 8,
    targetSellingPrice: 55000,
    dailyProduction: { type: 'দৈনিক শারীরিক বৃদ্ধি', amount: '২৫০ গ্রাম/দিন', qualityGrade: 'উন্নত ব্রিড' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-01-15', weightKg: 22, targetExpectedKg: 22, notes: 'সংগ্রহ ওজন' },
      { month: 1, days: 30, date: '2026-02-15', weightKg: 28, targetExpectedKg: 27, notes: 'সুষম দানাদার খাদ্য শুরু' },
      { month: 2, days: 60, date: '2026-03-15', weightKg: 35, targetExpectedKg: 33, notes: 'পিপিআর বুস্টার' },
      { month: 3, days: 90, date: '2026-04-15', weightKg: 41, targetExpectedKg: 40, notes: 'উচ্চ পুষ্টি মাত্রা' },
      { month: 4, days: 120, date: '2026-05-15', weightKg: 46, targetExpectedKg: 45, notes: 'বর্তমান ওজন' }
    ]
  },
  {
    id: 'D-301',
    name: 'খাকি ক্যাম্পবেল ও পেকিন হাঁস পাল',
    type: 'হাঁস (Duck)',
    breed: 'উন্নত খাকি ক্যাম্পবেল লেয়ার',
    batchOrFlock: 'ফ্লক-১ (৫০ টি হাঁস)',
    quantity: 50,
    purchaseDate: '2026-02-01',
    purchasePrice: 20000,
    initialWeight: 1.2,
    currentWeight: 1.9,
    targetWeight: 2.2,
    age: '৮ মাস',
    healthStatus: 'ডাক প্লেগ ও কলেরা ভ্যাকসিনেটেড',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: 'লেয়ার পেলেট ফিড, সেদ্ধ ধান ও কুঁড়া মিশ্রণ',
    dailyFeedBudget: 45,
    isForSale: true,
    sellingPrice: 48000,
    saleDescription: 'উচ্চ ডিম উৎপাদনশীল খাকি ক্যাম্পবেল হাঁস। জলাশয়ে মুক্তচারণ করা।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 6,
    targetSellingPrice: 48000,
    dailyProduction: { type: 'ডিম উৎপাদন', amount: '৪২ টি/দিন', qualityGrade: 'গ্রেড-এ ডিম' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-02-01', weightKg: 1.2, targetExpectedKg: 1.2, notes: 'সংগ্রহ ওজন' },
      { month: 1, days: 30, date: '2026-03-01', weightKg: 1.5, targetExpectedKg: 1.4, notes: 'ডিম পাড়া শুরু' },
      { month: 2, days: 60, date: '2026-04-01', weightKg: 1.7, targetExpectedKg: 1.6, notes: 'লেয়ার ফিড রেশিও' },
      { month: 3, days: 90, date: '2026-05-01', weightKg: 1.9, targetExpectedKg: 1.8, notes: 'বর্তমান গড় ওজন' }
    ]
  },
  {
    id: 'P-401',
    name: 'সোনালী প্যারেন্ট স্টক ফ্লক',
    type: 'মুরগি (Chicken)',
    breed: 'উন্নত দেশীয় সোনালী মুরগি',
    batchOrFlock: 'ব্যাচ-১ (১২০ টি মুরগি)',
    quantity: 120,
    purchaseDate: '2026-02-15',
    purchasePrice: 35000,
    initialWeight: 0.8,
    currentWeight: 1.5,
    targetWeight: 1.8,
    age: '৬ মাস',
    healthStatus: 'রানীক্ষেত ও গামবোরো টিকা সম্পন্ন',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: 'সোনালী লেয়ার ফিড, গম ভাঙা ও ভিটামিন প্রিমিক্স',
    dailyFeedBudget: 35,
    isForSale: false,
    sellingPrice: 78000,
    saleDescription: 'রোগপ্রতিরোধক্ষম স্বাস্থ্যকর সোনালী মুরগির ডিম ও মাংসের জাত।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 8,
    targetSellingPrice: 78000,
    dailyProduction: { type: 'ডিম ও বৃদ্ধি', amount: '৯৬ টি/দিন', qualityGrade: 'অরগানিক সোনালী' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-02-15', weightKg: 0.8, targetExpectedKg: 0.8, notes: 'সংগ্রহ ওজন' },
      { month: 1, days: 30, date: '2026-03-15', weightKg: 1.1, targetExpectedKg: 1.0, notes: 'ব্রুডার শেষ' },
      { month: 2, days: 60, date: '2026-04-15', weightKg: 1.3, targetExpectedKg: 1.2, notes: 'গ্রোয়ার ফিড' },
      { month: 3, days: 90, date: '2026-05-15', weightKg: 1.5, targetExpectedKg: 1.4, notes: 'বর্তমান গড় ওজন' }
    ]
  },
  {
    id: 'B-501',
    name: 'উন্নত সৌখিন পাখি ব্যাচ (Birds Batch)',
    type: 'পাখি (Birds)',
    breed: 'জাপানিজ ব্রাউন পাখি (Birds)',
    batchOrFlock: 'খাঁচা-৩ (২৫০ টি পাখি)',
    quantity: 250,
    purchaseDate: '2026-03-01',
    purchasePrice: 15000,
    initialWeight: 0.12,
    currentWeight: 0.22,
    targetWeight: 0.25,
    age: '২.৫ মাস',
    healthStatus: 'সুস্থ ও নিয়মিত ভিটামিন দেওয়া হচ্ছে',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: '২৪% প্রোটিন বার্ড ম্যাস ফিড ও সূক্ষ্ম ভুট্টা গুড়া',
    dailyFeedBudget: 15,
    isForSale: true,
    sellingPrice: 28000,
    saleDescription: 'উচ্চ পুষ্টিমানের ছোট আকারের পাখির ডিম ও মাংস।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 4,
    targetSellingPrice: 28000,
    dailyProduction: { type: 'পাখির ডিম', amount: '২১০ টি/দিন', qualityGrade: 'হাই প্রোটিন' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-03-01', weightKg: 0.12, targetExpectedKg: 0.12, notes: 'সংগ্রহ' },
      { month: 1, days: 30, date: '2026-04-01', weightKg: 0.18, targetExpectedKg: 0.17, notes: 'পূর্ণাঙ্গ রূপ' },
      { month: 2, days: 60, date: '2026-05-01', weightKg: 0.22, targetExpectedKg: 0.21, notes: 'বর্তমান ডিম সংগ্রহ' }
    ]
  },
  {
    id: 'F-601',
    name: 'থাই তেলাপিয়া ও মনোসেক্স পুকুর প্রজেক্ট',
    type: 'মাছ (Fish)',
    breed: 'উন্নত থাই তেলাপিয়া হাইব্রিড',
    batchOrFlock: 'পুকুর-১ (উত্তর পাড়)',
    quantity: 1200,
    purchaseDate: '2026-02-10',
    purchasePrice: 25000,
    initialWeight: 0.05,
    currentWeight: 0.38,
    targetWeight: 0.65,
    age: '৩.৫ মাস',
    healthStatus: 'স্বাভাবিক বৃদ্ধি ও সক্রিয় সাঁতার',
    healthCondition: 'চমৎকার ও সুস্থ',
    dailyDietPlan: 'ভাসমান প্রোটিন ফিশ পেলেট ফিড (২৮% প্রোটিন)',
    dailyFeedBudget: 35,
    waterPH: 7.4,
    waterTemperature: 28.5,
    pondMaintenanceLogs: [
      { id: 'pml-1', date: '2026-05-02', action: 'কৃষি চুন ও লবণ প্রয়োগ', notes: 'পানির অম্লত্ব নিয়ন্ত্রণে ২৫০ গ্রাম চুন ও ৫০ গ্রাম লবণ' },
      { id: 'pml-2', date: '2026-05-08', action: 'প্লাঙ্কটন ঘনত্ব ও সেকচি ডিস্ক চেক', notes: 'স্বচ্ছতা ২৮ সেমি, পর্যাপ্ত প্রাকৃতিক জুপ্ল্যাঙ্কটন স্তর বিদ্যমান' }
    ],
    isForSale: false,
    sellingPrice: 165000,
    saleDescription: 'বৈজ্ঞানিক পদ্ধতিতে চাষকৃত রাসায়নিকমুক্ত সুস্বাদু থাই তেলাপিয়া।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 6,
    targetSellingPrice: 165000,
    dailyProduction: { type: 'দৈনিক মাছের ওজন বৃদ্ধি', amount: '৩.২ কেজি/দিন', qualityGrade: 'ফ্রেশ একুয়াকালচার' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-02-10', weightKg: 0.05, targetExpectedKg: 0.05, notes: 'পোনা অবমুক্তকরণ' },
      { month: 1, days: 30, date: '2026-03-10', weightKg: 0.15, targetExpectedKg: 0.14, notes: 'স্টার্টার ফিড' },
      { month: 2, days: 60, date: '2026-04-10', weightKg: 0.28, targetExpectedKg: 0.26, notes: 'গ্রোয়ার ফিড' },
      { month: 3, days: 90, date: '2026-05-10', weightKg: 0.38, targetExpectedKg: 0.35, notes: 'বর্তমান গড় ওজন' }
    ]
  },
  {
    id: 'F-602',
    name: 'কার্প মিশ্র হ্যাচারি (রুই, কাতলা, মৃগেল)',
    type: 'মাছ (Fish)',
    breed: 'কার্প মিশ্র চাষ (রুই ও কাতলা)',
    batchOrFlock: 'পুকুর-২ (দক্ষিণ পাড়)',
    quantity: 600,
    purchaseDate: '2026-01-20',
    purchasePrice: 38000,
    initialWeight: 0.3,
    currentWeight: 1.25,
    targetWeight: 2.5,
    age: '৫ মাস',
    healthStatus: 'তাপমাত্রা বৃদ্ধির কারণে সতর্ক নজরদারিতে',
    healthCondition: 'নিয়মিত পর্যবেক্ষণে',
    dailyDietPlan: 'সরিষার খৈল, ধানের কুঁড়া ও ভাসমান গ্রোয়ার পেলেট',
    dailyFeedBudget: 50,
    waterPH: 8.7,
    waterTemperature: 33.6,
    pondMaintenanceLogs: [
      { id: 'pml-3', date: '2026-05-05', action: 'এয়ারেশন ও জরুরি গভীর নলকূপ পানি সেচ', notes: 'তাপমাত্রা ৩৩.৬°সে স্পর্শ করেছে এবং pH ৮.৭ (উচ্চ ক্ষারীয়)। তাৎক্ষণিক ঠান্ডা পানি চালনা করা হয়েছে।' }
    ],
    isForSale: true,
    sellingPrice: 220000,
    saleDescription: 'বড় আকারের রুই ও কাতলা মাছ। কোরবানির পরবর্তী পারিবারিক অনুষ্ঠান ও বাজারের জন্য উপযুক্ত।',
    status: 'খামারে পালনরত',
    targetRearingMonths: 9,
    targetSellingPrice: 220000,
    dailyProduction: { type: 'দৈনিক বায়োমাস বৃদ্ধি', amount: '৪.৫ কেজি/দিন', qualityGrade: 'প্রিমিয়াম রিভার কার্প' },
    growthHistory: [
      { month: 0, days: 0, date: '2026-01-20', weightKg: 0.3, targetExpectedKg: 0.3, notes: 'আঙ্গুলিপোনা অবমুক্ত' },
      { month: 1, days: 30, date: '2026-02-20', weightKg: 0.55, targetExpectedKg: 0.5, notes: 'প্রাকৃতিক খাদ্য' },
      { month: 2, days: 60, date: '2026-03-20', weightKg: 0.8, targetExpectedKg: 0.75, notes: 'সম্পূরক খাবার' },
      { month: 3, days: 90, date: '2026-04-20', weightKg: 1.05, targetExpectedKg: 1.0, notes: 'এয়ারেশন' },
      { month: 4, days: 120, date: '2026-05-20', weightKg: 1.25, targetExpectedKg: 1.2, notes: 'বর্তমান ওজন' }
    ]
  }
];

const INITIAL_FEED_LOGS: FeedLog[] = [
  { id: 'FL-1', animalId: 'C-101', animalName: 'সাহীওয়াল প্রিন্সেস', date: '2026-05-01', timeSlot: 'সকাল', feedType: 'কাঁচা ঘাস ও ভুসি', amountKg: 8, costTaka: 240, employeeName: 'রহিম মিয়া', notes: 'খাবার সম্পূর্ণ খেয়েছে' },
];

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-901',
    animalId: 'G-201',
    animalName: 'যমুনাপারি সর্দার',
    animalType: 'ছাগল (Goat)',
    customerName: 'মোঃ আব্দুল মতিন',
    customerPhone: '01712-345678',
    customerAddress: 'উত্তরা সেক্টর ৭, ঢাকা',
    agreedPrice: 55000,
    orderDate: '2026-05-04',
    status: 'Delivered',
    note: 'কোরবানির জন্য বুকিং দেওয়া হয়েছে। খামারে আরও ১৫ দিন লালন পালন করা হবে।',
  },
];

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
    { id: 'EMP-001', name: 'রহিম মিয়া', role: 'খামার সহকারী', salary: 12000, phone: '01700-000001', status: 'Active' },
];

const INITIAL_HEALTH_LOGS: HealthLog[] = [
  {
    id: 'HL-101',
    animalId: 'C-101',
    animalName: 'সাহীওয়াল প্রিন্সেস',
    date: '2026-05-05',
    temperature: '101.8 °F',
    weightKg: 450,
    appetite: 'স্বাভাবিক',
    vaccinationName: 'তড়কা (Anthrax) ও খুরারোগ (FMD)',
    vaccinationStatus: 'সম্পন্ন',
    nextVaccineDate: '2026-11-05',
    inspectionNotes: 'চোখ ও চামড়া উজ্জ্বল, পর্যাপ্ত জাবর কাটছে। সম্পূর্ণ সুস্থ।',
    status: 'Checked',
    inspectorName: 'ডাক্তার সামাদ (ভেটেরিনারি সার্জন)',
  },
];

const INITIAL_PRODUCTION_RECORDS: DailyProductionRecord[] = [
  { id: 'PR-1', date: new Date().toISOString().split('T')[0], type: 'milk', title: 'সকালের গাভী দুধ সংগ্রহ', amount: 16, unit: 'লিটার', takaAmount: 1280, recordedBy: 'রহিম মিয়া', notes: 'সাহীওয়াল প্রিন্সেস' },
  { id: 'PR-2', date: new Date().toISOString().split('T')[0], type: 'eggs', title: 'হাঁস ও মুরগির ডিম সংগ্রহ', amount: 85, unit: 'টি', takaAmount: 1105, recordedBy: 'করিম শেখ', notes: 'খাকি ক্যাম্পবেল ও সোনালী' },
  { id: 'PR-3', date: new Date().toISOString().split('T')[0], type: 'cash_in', title: 'খাঁটি তরল দুধ বিক্রয়', amount: 30, unit: 'লিটার', takaAmount: 2400, recordedBy: 'খামার বিক্রয় কেন্দ্র' },
  { id: 'PR-4', date: new Date().toISOString().split('T')[0], type: 'cash_out', title: 'কাঁচা ঘাস ও ভুষি ক্রয়', amount: 50, unit: 'কেজি', takaAmount: 1500, recordedBy: 'স্টোর সহকারী' },
];

const STORE_VERSION_KEY = 'rs_store_version';
const CURRENT_VERSION = 'v15_ultra_easy_mode_simple_input';

class FarmStore {
  private livestock: LivestockItem[] = [];
  private feedLogs: FeedLog[] = [];
  private healthLogs: HealthLog[] = [];
  private orders: CustomerOrder[] = [];
  private employees: EmployeeRecord[] = [];
  private feedInventory: FeedInventoryItem[] = [];
  private ownerTransactions: OwnerTransaction[] = [];
  private farmObjects: FarmObject[] = [];
  private dailyProductionRecords: DailyProductionRecord[] = [];
  private voicePhrases: VoicePhraseMapping[] = INITIAL_VOICE_PHRASES;
  private institutionProfile: InstitutionProfile = INITIAL_INSTITUTION_PROFILE;
  private purchaseOrders: PurchaseOrder[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      await enableIndexedDbPersistence(db);
    } catch (err) {
      if ((err as any).code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
      } else if ((err as any).code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
      }
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.syncWithFirestore();
      } else {
        // Clear listeners or handle logout
      }
    });
  }

  private async syncWithFirestore() {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Initial push of local data to Firestore if it's the first time
    // We can detect this by checking if we have a flag or just do a merge
    this.pushLocalToFirestore();

    // 2. Setup real-time listeners for each collection
    this.setupListeners();
  }

  private async pushLocalToFirestore() {
    const user = auth.currentUser;
    if (!user) return;

    const collections = {
      'livestock': this.livestock,
      'feed_logs': this.feedLogs,
      'health_logs': this.healthLogs,
      'orders': this.orders,
      'employees': this.employees,
      'feed_inventory': this.feedInventory,
      'owner_transactions': this.ownerTransactions,
      'farm_objects': this.farmObjects,
      'production_records': this.dailyProductionRecords,
      'voice_phrases': this.voicePhrases,
      'purchase_orders': this.purchaseOrders
    };

    for (const [colName, data] of Object.entries(collections)) {
      if (Array.isArray(data)) {
        for (const item of data) {
          try {
            await setDoc(doc(db, colName, item.id), { ...item, ownerId: user.uid }, { merge: true });
          } catch (e) {
            console.error(`Sync error for ${colName}:`, e);
          }
        }
      }
    }

    // Profile
    try {
      await setDoc(doc(db, 'institution_profiles', user.uid), { ...this.institutionProfile, ownerId: user.uid }, { merge: true });
    } catch (e) {
      console.error('Sync error for profile:', e);
    }
  }

  private setupListeners() {
    const user = auth.currentUser;
    if (!user) return;

    const collections = [
      'livestock', 'feed_logs', 'health_logs', 'orders', 'employees', 
      'feed_inventory', 'owner_transactions', 'farm_objects', 
      'production_records', 'voice_phrases', 'purchase_orders'
    ];

    collections.forEach(colName => {
      const q = query(collection(db, colName), where('ownerId', '==', user.uid));
      onSnapshot(q, (snapshot) => {
        const newData = snapshot.docs.map(d => d.data());
        this.updateLocalFromFirestore(colName, newData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, colName);
      });
    });

    // Profile listener
    onSnapshot(doc(db, 'institution_profiles', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        this.institutionProfile = snapshot.data() as InstitutionProfile;
        this.notifyListeners();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'institution_profiles');
    });
  }

  private updateLocalFromFirestore(colName: string, data: any[]) {
    let changed = false;
    switch (colName) {
      case 'livestock': this.livestock = data as any; changed = true; break;
      case 'feed_logs': this.feedLogs = data as any; changed = true; break;
      case 'health_logs': this.healthLogs = data as any; changed = true; break;
      case 'orders': this.orders = data as any; changed = true; break;
      case 'employees': this.employees = data as any; changed = true; break;
      case 'feed_inventory': this.feedInventory = data as any; changed = true; break;
      case 'owner_transactions': this.ownerTransactions = data as any; changed = true; break;
      case 'farm_objects': this.farmObjects = data as any; changed = true; break;
      case 'production_records': this.dailyProductionRecords = data as any; changed = true; break;
      case 'voice_phrases': this.voicePhrases = data as any; changed = true; break;
      case 'purchase_orders': this.purchaseOrders = data as any; changed = true; break;
    }
    if (changed) {
      this.saveLocalOnly();
      this.notifyListeners();
    }
  }

  private saveLocalOnly() {
    try {
      localStorage.setItem('rs_livestock', JSON.stringify(this.livestock));
      localStorage.setItem('rs_feed_logs', JSON.stringify(this.feedLogs));
      localStorage.setItem('rs_health_logs', JSON.stringify(this.healthLogs));
      localStorage.setItem('rs_orders', JSON.stringify(this.orders));
      localStorage.setItem('rs_employees', JSON.stringify(this.employees));
      localStorage.setItem('rs_feed_inventory', JSON.stringify(this.feedInventory));
      localStorage.setItem('rs_owner_transactions', JSON.stringify(this.ownerTransactions));
      localStorage.setItem('rs_institution_profile', JSON.stringify(this.institutionProfile));
      localStorage.setItem('rs_farm_objects', JSON.stringify(this.farmObjects));
      localStorage.setItem('rs_daily_production', JSON.stringify(this.dailyProductionRecords));
      localStorage.setItem('rs_voice_phrases', JSON.stringify(this.voicePhrases));
      localStorage.setItem('rs_purchase_orders', JSON.stringify(this.purchaseOrders));
      localStorage.setItem(STORE_VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }

  private loadFromStorage() {
    try {
      const storedVersion = localStorage.getItem(STORE_VERSION_KEY);
      const storedLive = localStorage.getItem('rs_livestock');
      const storedFeed = localStorage.getItem('rs_feed_logs');
      const storedHealth = localStorage.getItem('rs_health_logs');
      const storedOrders = localStorage.getItem('rs_orders');
      const storedEmployees = localStorage.getItem('rs_employees');
      const storedInv = localStorage.getItem('rs_feed_inventory');
      const storedTx = localStorage.getItem('rs_owner_transactions');
      const storedProfile = localStorage.getItem('rs_institution_profile');
      const storedFarmObjects = localStorage.getItem('rs_farm_objects');
      const storedProduction = localStorage.getItem('rs_daily_production');
      const storedVoicePhrases = localStorage.getItem('rs_voice_phrases');
      const storedPO = localStorage.getItem('rs_purchase_orders');

      if (storedVersion !== CURRENT_VERSION || !storedLive) {
        this.livestock = INITIAL_LIVESTOCK.map(item => {
          if (!item.structuredFeedPlan || item.structuredFeedPlan.length === 0) {
            const def = getDefaultStructuredFeedPlan(item.type);
            return {
              ...item,
              dailyFeedBudget: item.dailyFeedBudget || def.dailyBudgetTaka,
              structuredFeedPlan: def.items,
            };
          }
          return item;
        });
      } else {
        this.livestock = JSON.parse(storedLive);
      }

      this.feedLogs = storedFeed ? JSON.parse(storedFeed) : INITIAL_FEED_LOGS;
      this.healthLogs = storedHealth ? JSON.parse(storedHealth) : INITIAL_HEALTH_LOGS;
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
      this.employees = storedEmployees ? JSON.parse(storedEmployees) : INITIAL_EMPLOYEES;
      this.feedInventory = storedInv ? JSON.parse(storedInv) : INITIAL_FEED_INVENTORY;
      this.ownerTransactions = storedTx ? JSON.parse(storedTx) : INITIAL_OWNER_TRANSACTIONS;
      this.institutionProfile = storedProfile ? JSON.parse(storedProfile) : INITIAL_INSTITUTION_PROFILE;
      this.farmObjects = storedFarmObjects ? JSON.parse(storedFarmObjects) : [];
      this.dailyProductionRecords = storedProduction ? JSON.parse(storedProduction) : INITIAL_PRODUCTION_RECORDS;
      this.voicePhrases = storedVoicePhrases ? JSON.parse(storedVoicePhrases) : INITIAL_VOICE_PHRASES;
      this.purchaseOrders = storedPO ? JSON.parse(storedPO) : [];

      localStorage.setItem(STORE_VERSION_KEY, CURRENT_VERSION);
    } catch {
      this.livestock = INITIAL_LIVESTOCK;
      this.feedLogs = INITIAL_FEED_LOGS;
      this.healthLogs = INITIAL_HEALTH_LOGS;
      this.orders = INITIAL_ORDERS;
      this.employees = INITIAL_EMPLOYEES;
      this.feedInventory = INITIAL_FEED_INVENTORY;
      this.ownerTransactions = INITIAL_OWNER_TRANSACTIONS;
      this.institutionProfile = INITIAL_INSTITUTION_PROFILE;
      this.dailyProductionRecords = INITIAL_PRODUCTION_RECORDS;
      this.voicePhrases = INITIAL_VOICE_PHRASES;
      this.purchaseOrders = [];
    }
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  private async save() {
    this.saveLocalOnly();
    const user = auth.currentUser;
    if (user) {
      // For simplicity in this architecture, we do a full push or a selective push
      // Since we want "Cloud Backup", we ensure Firestore is updated.
      // In a real app we'd only push the delta.
      this.pushLocalToFirestore();
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Livestock Methods
  public getLivestock(): LivestockItem[] { return [...this.livestock]; }
  public getForSaleLivestock(): LivestockItem[] {
    return this.livestock.filter(item => Boolean(item.isForSale) && item.status !== 'বিক্রিত (Sold)');
  }
  public getInFarmLivestock(): LivestockItem[] {
    return this.livestock.filter(item => !item.isForSale && item.status !== 'বিক্রিত (Sold)');
  }
  public getLivestockById(id: string): LivestockItem | undefined {
    return this.livestock.find(item => item.id === id);
  }
  public getLivestockByCategory(categoryKey: string): LivestockItem[] {
    const map: Record<string, string> = {
      cattle: 'গরু (Cattle)',
      goat: 'ছাগল (Goat)',
      duck: 'হাঁস (Duck)',
      chicken: 'মুরগি (Chicken)',
      birds: 'পাখি (Birds)',
      fish: 'মাছ (Fish)'
    };
    const type = map[categoryKey];
    return this.livestock.filter(item => item.type === type);
  }

  public getLivestockStats() {
    const categories = [
      { key: 'cattle', name: 'গরু (Cattle)', icon: '🐄', unit: 'টি' },
      { key: 'goat', name: 'ছাগল (Goat)', icon: '🐐', unit: 'টি' },
      { key: 'duck', name: 'হাঁস (Duck)', icon: '🦆', unit: 'টি' },
      { key: 'chicken', name: 'মুরগি (Chicken)', icon: '🐓', unit: 'টি' },
      { key: 'birds', name: 'পাখি (Birds)', icon: '🕊️', unit: 'টি' },
      { key: 'fish', name: 'মাছ (Fish)', icon: '🐟', unit: 'টি' },
    ];

    return categories.map(cat => {
      const items = this.getLivestockByCategory(cat.key);
      const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const healthyCount = items.filter(i => (i.healthCondition || 'চমৎকার ও সুস্থ') === 'চমৎকার ও সুস্থ').reduce((s, i) => s + (i.quantity || 1), 0);
      const healthRate = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100;
      const totalCurrentValuation = items.reduce((s, i) => s + (i.sellingPrice || (i.purchasePrice * 1.3)), 0);
      const totalTargetValuation = items.reduce((s, i) => s + (i.targetSellingPrice || i.sellingPrice), 0);
      const productions = items.map(i => i.dailyProduction?.amount).filter(Boolean).join(' + ');

      return {
        ...cat,
        items,
        totalCount,
        healthyCount,
        healthRate,
        totalCurrentValuation,
        totalTargetValuation,
        productionSummary: productions || 'মাংস বৃদ্ধি স্বাভাবিক'
      };
    });
  }

  public getSpeciesSummaryMetrics() {
    return this.getLivestockStats();
  }

  public addLivestock(item: LivestockItem) {
    const defaultFeed = getDefaultStructuredFeedPlan(item.type);
    const safeItem: LivestockItem = {
      ...item,
      dailyFeedBudget: item.dailyFeedBudget || defaultFeed.dailyBudgetTaka,
      structuredFeedPlan: item.structuredFeedPlan && item.structuredFeedPlan.length > 0 ? item.structuredFeedPlan : defaultFeed.items,
      isForSale: Boolean(item.isForSale),
      status: item.isForSale ? 'বিক্রির জন্য প্রস্তুত' : 'খামারে পালনরত',
    };
    this.livestock.unshift(safeItem);
    this.save();
  }

  public updateLivestock(updated: LivestockItem) {
    this.livestock = this.livestock.map(item => (item.id === updated.id ? updated : item));
    this.save();
  }

  public toggleQuickFeedStatus(animalId: string, isFed: boolean, fedBy: string = 'খামার সহকারী') {
    const today = new Date().toISOString().split('T')[0];
    const animal = this.getLivestockById(animalId);
    if (!animal) return;

    const existingLogs = animal.feedingLogs || [];
    const todayIndex = existingLogs.findIndex(l => l.date === today);

    let updatedLogs: DailyFeedingRecord[] = [...existingLogs];

    if (todayIndex >= 0) {
      updatedLogs[todayIndex] = {
        ...updatedLogs[todayIndex],
        isFed,
        fedBy,
      };
    } else {
      const budget = animal.dailyFeedBudget || 100;
      const feedItems = (animal.structuredFeedPlan || []).map(item => ({
        name: item.name,
        targetAmountKg: item.targetAmountKg,
        servedAmountKg: item.targetAmountKg,
        eatenAmountKg: item.targetAmountKg,
        leftoverAmountKg: 0,
        unit: item.unit,
        costTaka: item.estimatedCostTaka,
      }));

      const newRecord: DailyFeedingRecord = {
        id: `DFR-${Date.now()}`,
        animalId,
        animalName: animal.name,
        date: today,
        timeSlot: 'সকাল',
        isFed,
        fedBy,
        feedItemsServed: feedItems,
        totalCostTaka: budget,
        dailyBudgetTaka: budget,
        budgetStatus: 'বাজেটের মধ্যে (Within Budget)',
        notes: isFed ? 'স্বাভাবিক খাদ্য সরবরাহ ও ১০০% সম্পন্ন' : 'আজকের খাদ্য প্রক্রিয়া বাকি',
      };
      updatedLogs.unshift(newRecord);
    }

    this.livestock = this.livestock.map(item => item.id === animalId ? { ...item, feedingLogs: updatedLogs } : item);

    if (isFed) {
      this.addFeedLog({
        animalId,
        animalName: animal.name,
        date: today,
        timeSlot: 'সকাল',
        feedType: (animal.structuredFeedPlan || []).map(i => i.name).join(', ') || animal.dailyDietPlan,
        amountKg: (animal.structuredFeedPlan || []).reduce((s, i) => s + i.targetAmountKg, 0) || 5,
        costTaka: animal.dailyFeedBudget || 100,
        employeeName: fedBy,
        notes: 'দৈনিক শিডিউল অনুযায়ী খাওয়ানো হয়েছে',
      });
    }

    this.save();
  }

  public recordDailyFeedingRecord(record: Omit<DailyFeedingRecord, 'id'>) {
    const animal = this.getLivestockById(record.animalId);
    if (!animal) return;

    const newRecord: DailyFeedingRecord = {
      ...record,
      id: `DFR-${Date.now()}`,
    };

    const existingLogs = animal.feedingLogs || [];
    const updatedLogs = [newRecord, ...existingLogs.filter(l => l.date !== record.date)];

    this.livestock = this.livestock.map(item => item.id === record.animalId ? { ...item, feedingLogs: updatedLogs } : item);

    if (record.isFed) {
      this.addFeedLog({
        animalId: record.animalId,
        animalName: record.animalName,
        date: record.date,
        timeSlot: record.timeSlot,
        feedType: record.feedItemsServed.map(i => i.name).join(', '),
        amountKg: record.feedItemsServed.reduce((s, i) => s + i.eatenAmountKg, 0),
        costTaka: record.totalCostTaka,
        employeeName: record.fedBy || 'খামার কর্মী',
        notes: `তদারকি: ${record.budgetStatus}. ${record.notes || ''}`,
      });
    }

    this.save();
  }

  public isAnimalFedToday(animalId: string): { isFed: boolean; fedAtTime?: string; record?: DailyFeedingRecord } {
    const today = new Date().toISOString().split('T')[0];
    const animal = this.getLivestockById(animalId);
    if (!animal || !animal.feedingLogs) return { isFed: false };

    const todayRecord = animal.feedingLogs.find(l => l.date === today && l.isFed);
    if (todayRecord) {
      return {
        isFed: true,
        fedAtTime: todayRecord.notes?.match(/\d{2}:\d{2}/)?.[0] || 'সকাল',
        record: todayRecord,
      };
    }
    return { isFed: false };
  }

  public confirmFeedingForAnimal(animalId: string, timeSlot: 'সকাল' | 'দুপুর' | 'বিকাল/রাত' = 'সকাল', fedBy: string = 'খামার সুপারভাইজার'): DailyFeedingRecord | undefined {
    const animal = this.getLivestockById(animalId);
    if (!animal) return undefined;

    const today = new Date().toISOString().split('T')[0];
    const schedule = getAutomatedFeedingSchedule(animal);
    const slotData = schedule.timeSlots.find(s => s.slot === timeSlot) || schedule.timeSlots[0];
    
    const feedItems = slotData.items.map(item => ({
      name: item.name,
      targetAmountKg: item.targetAmount,
      servedAmountKg: item.targetAmount,
      eatenAmountKg: item.targetAmount,
      leftoverAmountKg: 0,
      unit: item.unit,
      costTaka: item.costTaka,
    }));

    const nowTimeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const newRecord: DailyFeedingRecord = {
      id: `DFR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      animalId,
      animalName: animal.name,
      date: today,
      timeSlot,
      isFed: true,
      fedBy,
      feedItemsServed: feedItems,
      totalCostTaka: schedule.recommendedDailyBudgetTaka,
      dailyBudgetTaka: animal.dailyFeedBudget || schedule.recommendedDailyBudgetTaka,
      budgetStatus: 'বাজেটের মধ্যে (Within Budget)',
      notes: `অটো শিডিউল অনুযায়ী বয়স (${animal.age}) ও প্রজাতির হিসাবকৃত খাদ্য সফলভাবে প্রদান করা হয়েছে। সময়: ${nowTimeStr} (${schedule.ageGroupLabel})`,
    };

    const existingLogs = animal.feedingLogs || [];
    const updatedLogs = [newRecord, ...existingLogs.filter(l => l.date !== today)];

    this.livestock = this.livestock.map(item => item.id === animalId ? { ...item, feedingLogs: updatedLogs } : item);

    this.addFeedLog({
      animalId,
      animalName: animal.name,
      date: today,
      timeSlot,
      feedType: feedItems.map(i => `${i.name} (${i.targetAmountKg} ${i.unit})`).join(', '),
      amountKg: feedItems.reduce((s, i) => s + i.servedAmountKg, 0),
      costTaka: schedule.recommendedDailyBudgetTaka,
      employeeName: fedBy,
      notes: `অটোমেটেড খাদ্য শিডিউল কনফার্মড: ${schedule.ageGroupLabel}`,
    });

    this.save();
    return newRecord;
  }

  public deleteLivestock(id: string) {
    this.livestock = this.livestock.filter(item => item.id !== id);
    this.feedLogs = this.feedLogs.filter(log => log.animalId !== id);
    this.save();
  }

  public toggleForSale(id: string, isForSale: boolean, customPrice?: number, description?: string) {
    this.livestock = this.livestock.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isForSale,
          status: isForSale ? 'বিক্রির জন্য প্রস্তুত' : 'খামারে পালনরত',
          sellingPrice: customPrice !== undefined ? customPrice : item.sellingPrice,
          saleDescription: description !== undefined ? description : item.saleDescription,
        };
      }
      return item;
    });
    this.save();
  }

  // Feed Logs Methods
  public getFeedLogs(): FeedLog[] { return [...this.feedLogs]; }
  public addFeedLog(log: Omit<FeedLog, 'id'>) {
    const newLog: FeedLog = { ...log, id: `FL-${Date.now()}` };
    this.feedLogs.unshift(newLog);
    this.feedInventory = this.feedInventory.map(item => {
      if (log.feedType.includes(item.name)) {
        return { ...item, currentStockKg: Math.max(0, item.currentStockKg - log.amountKg) };
      }
      return item;
    });
    this.save();
  }

  // Feed Inventory Methods
  public getFeedInventory(): FeedInventoryItem[] { return [...this.feedInventory]; }
  public purchaseFeed(itemId: string, amountKg: number, totalCost: number) {
    this.feedInventory = this.feedInventory.map(item => {
      if (item.id === itemId) {
        const newStock = item.currentStockKg + amountKg;
        const newUnitPrice = ((item.currentStockKg * item.unitPrice) + totalCost) / newStock;
        return { 
          ...item, 
          currentStockKg: newStock, 
          unitPrice: Number(newUnitPrice.toFixed(2)),
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    this.save();
  }

  // Health Logs Methods
  public getHealthLogs(): HealthLog[] { return [...this.healthLogs]; }
  public addHealthLog(log: Omit<HealthLog, 'id'>) {
    this.healthLogs.unshift({ ...log, id: `HL-${Date.now()}` });
    this.save();
  }
  public toggleHealthStatus(id: string) {
    this.healthLogs = this.healthLogs.map(log => log.id === id ? { ...log, status: log.status === 'Checked' ? 'Action Required' : 'Checked' } : log);
    this.save();
  }

  // Financial Methods
  public getOwnerTransactions(): OwnerTransaction[] { return [...this.ownerTransactions]; }
  public addOwnerTransaction(tx: Omit<OwnerTransaction, 'id'>) {
    this.ownerTransactions.unshift({ ...tx, id: `OT-${Date.now()}` });
    this.save();
  }

  public getFinancialReport() {
    const activeLivestock = this.livestock.filter(l => l.status !== 'বিক্রিত (Sold)');
    const capitalInStock = activeLivestock.reduce((sum, item) => sum + item.purchasePrice, 0);
    const soldLivestock = this.livestock.filter(l => l.status === 'বিক্রিত (Sold)');
    
    let totalProfitEarned = 0;
    let totalCapitalRecovered = 0;

    soldLivestock.forEach(animal => {
      const stats = this.getAnimalCostStats(animal.id);
      const order = this.orders.find(o => o.animalId === animal.id && o.status === 'Delivered');
      const sellingPrice = order ? order.agreedPrice : (animal.sellingPrice || 0);
      totalProfitEarned += (sellingPrice - stats.totalExpense);
      totalCapitalRecovered += stats.totalExpense;
    });

    const totalSalaryExpense = this.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalFeedCostAll = this.feedLogs.reduce((sum, l) => sum + (Number(l.costTaka) || 0), 0);
    const totalOwnerInvestment = this.ownerTransactions.filter(t => t.type === 'Investment').reduce((sum, t) => sum + t.amount, 0);
    const totalOwnerWithdrawal = this.ownerTransactions.filter(t => t.type === 'ProfitWithdrawal' || t.type === 'Dividend').reduce((sum, t) => sum + t.amount, 0);
    const totalRevenue = this.orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.agreedPrice, 0);
    
    const totalSpentOnPurchase = this.livestock.reduce((sum, l) => sum + l.purchasePrice, 0);
    const businessCash = (totalOwnerInvestment + totalRevenue) - (totalSpentOnPurchase + totalFeedCostAll + totalSalaryExpense + totalOwnerWithdrawal);

    return {
      totalInvestment: totalOwnerInvestment,
      totalRevenue,
      capitalInStock,
      totalProfitEarned,
      totalSalaryExpense,
      totalFeedCost: totalFeedCostAll,
      withdrawableProfit: Math.max(0, totalProfitEarned - totalSalaryExpense - totalOwnerWithdrawal),
      totalOwnerWithdrawal,
      recoveredCapital: totalCapitalRecovered,
      businessCash: Math.max(0, businessCash),
      netProfit: totalProfitEarned - totalSalaryExpense,
    };
  }

  public getFinancialOverview() {
    return this.getFinancialReport();
  }

  public canAffordPurchase(amount: number): boolean {
    return this.getFinancialReport().businessCash >= amount;
  }

  public distributeDividends(distributions: { ownerName: string, amount: number }[]) {
    distributions.forEach(dist => {
      this.addOwnerTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'Dividend',
        amount: dist.amount,
        description: `লভ্যাংশ বন্টন - ${dist.ownerName}`,
      });
    });
  }

  public getAnimalCostStats(animalId: string) {
    const animal = this.getLivestockById(animalId);
    if (!animal) return { 
      purchasePrice: 0, 
      totalFeedCost: 0, 
      totalHealthCost: 0, 
      totalExpense: 0, 
      suggestedPrice: 0, 
      currentSellingPrice: 0, 
      estimatedProfit: 0,
      daysElapsed: 0,
      targetDays: 180,
      projectedMarketPrice: 0,
      feedLogs: [],
      healthLogs: []
    };

    const feedLogs = this.feedLogs.filter(log => log.animalId === animalId);
    const totalFeedCost = feedLogs.reduce((sum, l) => sum + (Number(l.costTaka) || 0), 0);

    const healthLogs = this.healthLogs.filter(log => log.animalId === animalId);
    const totalHealthCost = healthLogs.length * 150;

    const purchasePrice = animal.purchasePrice || 0;
    const totalExpense = purchasePrice + totalFeedCost + totalHealthCost;

    const now = new Date().getTime();
    const purchaseTime = new Date(animal.purchaseDate || '2026-01-01').getTime();
    const daysElapsed = Math.max(1, Math.floor((now - purchaseTime) / (1000 * 60 * 60 * 24)));
    const targetDays = (animal.targetRearingMonths || 6) * 30;

    const targetSellingPrice = animal.targetSellingPrice || animal.sellingPrice || Math.round(purchasePrice * 1.35);
    const expectedTotalProfit = Math.max(0, targetSellingPrice - purchasePrice);
    const dailyProfitRate = expectedTotalProfit / Math.max(1, targetDays);
    const projectedMarketPrice = Math.round(purchasePrice + totalFeedCost + totalHealthCost + (dailyProfitRate * daysElapsed));

    const suggestedPrice = Math.round((totalExpense * 1.25) / 100) * 100;
    const currentSellingPrice = animal.sellingPrice || projectedMarketPrice;

    return { 
      purchasePrice, 
      totalFeedCost, 
      totalHealthCost, 
      totalExpense, 
      suggestedPrice, 
      currentSellingPrice, 
      estimatedProfit: currentSellingPrice - totalExpense,
      daysElapsed,
      targetDays,
      projectedMarketPrice,
      feedLogs,
      healthLogs
    };
  }

  public getCategoryBudgetPerformanceSummary() {
    const categories = [
      { key: 'cattle', name: 'গরু (Cattle)', icon: '🐄' },
      { key: 'goat', name: 'ছাগল (Goat)', icon: '🐐' },
      { key: 'duck', name: 'হাঁস (Duck)', icon: '🦆' },
      { key: 'chicken', name: 'মুরগি (Chicken)', icon: '🐓' },
      { key: 'birds', name: 'পাখি (Birds)', icon: '🕊️' },
      { key: 'fish', name: 'মাছ (Fish)', icon: '🐟' },
    ];

    return categories.map(cat => {
      const items = this.getLivestockByCategory(cat.key);
      const totalCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
      const targetDailyBudget = items.reduce((s, i) => s + ((i.dailyFeedBudget || 100) * (i.quantity || 1)), 0);

      let actualDailyExpense = 0;
      const catAnimalIds = new Set(items.map(i => i.id));
      const recentLogs = this.feedLogs.filter(l => catAnimalIds.has(l.animalId));

      if (recentLogs.length > 0) {
        const dates = new Set(recentLogs.map(l => l.date));
        const totalCost = recentLogs.reduce((s, l) => s + (Number(l.costTaka) || 0), 0);
        actualDailyExpense = Math.round(totalCost / Math.max(1, dates.size));
      } else {
        actualDailyExpense = items.reduce((s, i) => {
          if (i.structuredFeedPlan && i.structuredFeedPlan.length > 0) {
            const planSum = i.structuredFeedPlan.reduce((ps, item) => ps + (Number(item.estimatedCostTaka) || 0), 0);
            return s + (planSum * (i.quantity || 1));
          }
          return s + ((i.dailyFeedBudget || 100) * 0.95 * (i.quantity || 1));
        }, 0);
      }
      actualDailyExpense = Math.round(actualDailyExpense);

      const variance = targetDailyBudget - actualDailyExpense;
      const isWithinBudget = actualDailyExpense <= targetDailyBudget;

      return {
        categoryKey: cat.key,
        categoryName: cat.name,
        icon: cat.icon,
        totalHeadcount: totalCount,
        targetDailyBudget,
        actualDailyExpense,
        variance,
        variancePercent: targetDailyBudget > 0 ? Math.round((Math.abs(variance) / targetDailyBudget) * 100) : 0,
        isWithinBudget,
        statusLabel: isWithinBudget ? 'বাজেট সাশ্রয়ী (Saved)' : 'বাজেট অতিক্রম (Over Budget)',
        statusColor: isWithinBudget ? 'emerald' : 'rose'
      };
    });
  }

  public getOrders(): CustomerOrder[] { return [...this.orders]; }
  public createCustomerOrder(order: Omit<CustomerOrder, 'id' | 'orderDate' | 'status'>): CustomerOrder {
    const newOrder: CustomerOrder = { ...order, id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, orderDate: new Date().toISOString().split('T')[0], status: 'Pending' };
    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }
  public updateOrderStatus(orderId: string, status: CustomerOrder['status']) {
    this.orders = this.orders.map(o => (o.id === orderId ? { ...o, status } : o));
    this.save();
  }
  public deleteOrder(orderId: string) {
    this.orders = this.orders.filter(o => o.id !== orderId);
    this.save();
  }
  public markAsSold(animalId: string, orderId?: string) {
    this.livestock = this.livestock.map(item => item.id === animalId ? { ...item, isForSale: false, status: 'বিক্রিত (Sold)' } : item);
    if (orderId) this.orders = this.orders.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o);
    this.save();
  }

  public getEmployees(): EmployeeRecord[] { return [...this.employees]; }
  public addEmployee(emp: EmployeeRecord) { this.employees.unshift(emp); this.save(); }
  public updateEmployee(emp: EmployeeRecord) { this.employees = this.employees.map(e => e.id === emp.id ? emp : e); this.save(); }
  public deleteEmployee(id: string) { this.employees = this.employees.filter(e => e.id !== id); this.save(); }

  public getSoldLivestockStats() {
    return this.livestock.filter(l => l.status === 'বিক্রিত (Sold)').map(animal => {
      const stats = this.getAnimalCostStats(animal.id);
      const order = this.orders.find(o => o.animalId === animal.id && o.status === 'Delivered');
      const salePrice = order ? order.agreedPrice : (animal.sellingPrice || 0);
      return { ...animal, totalCost: stats.totalExpense, salePrice, profit: salePrice - stats.totalExpense, feedCost: stats.totalFeedCost, saleDate: order ? order.orderDate : animal.purchaseDate };
    });
  }

  public getInvestmentRecoveryStats() {
    const sold = this.getSoldLivestockStats();
    const categories: Record<string, { totalDays: number, count: number }> = {};
    sold.forEach(item => {
      const pDate = new Date(item.purchaseDate);
      const sDate = new Date(item.saleDate);
      const diffDays = Math.ceil(Math.abs(sDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
      if (!categories[item.type]) categories[item.type] = { totalDays: 0, count: 0 };
      categories[item.type].totalDays += diffDays;
      categories[item.type].count += 1;
    });
    return Object.entries(categories).map(([category, stats]) => ({ category, avgDaysToSell: Math.round(stats.totalDays / stats.count), count: stats.count }));
  }

  public getFinancialForecasting() {
    const sold = this.getSoldLivestockStats();
    const monthlyData: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }
    sold.forEach(item => {
      const date = new Date(item.saleDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) monthlyData[key] += item.profit;
    });
    const historical = Object.entries(monthlyData).map(([month, profit]) => ({ month, profit }));
    const last3Months = historical.slice(-3);
    const avgMonthlyProfit = last3Months.reduce((sum, m) => sum + m.profit, 0) / 3;
    return { historicalMonthlyProfit: historical, nextQuarterPredictedProfit: Math.round(avgMonthlyProfit * 3) };
  }

  public getDetailedFinancialLedger() {
    const sales = this.getSoldLivestockStats().map(item => {
      const pDate = new Date(item.purchaseDate);
      const sDate = new Date(item.saleDate);
      const diffDays = Math.ceil(Math.abs(sDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
      return { id: `SALE-${item.id}`, date: item.saleDate, item: `${item.name} (${item.breed})`, type: 'Sale' as const, purchasePrice: item.purchasePrice, salePrice: item.salePrice, profit: item.profit, daysToSell: diffDays };
    });
    const transactions = this.ownerTransactions.map(tx => ({ id: tx.id, date: tx.date, item: tx.description, type: tx.type, amount: tx.amount, profit: 0, daysToSell: 0 }));
    return [...transactions, ...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getPredictiveGrowthValuation(growthHorizonMonths: number = 3) {
    const active = this.livestock.filter(item => item.status !== 'বিক্রিত (Sold)');
    let currentCapital = 0, currentEstimatedValue = 0, projectedTotalRevenue = 0, projectedFeedCost = 0;

    const projections = active.map(animal => {
      const stats = this.getAnimalCostStats(animal.id);
      currentCapital += animal.purchasePrice;
      currentEstimatedValue += (animal.sellingPrice || stats.suggestedPrice);

      let monthlyWeightGain = 0, marketRatePerKg = 0, monthlyFeedEstimate = 0;
      if (animal.type.includes('গরু')) { monthlyWeightGain = 22; marketRatePerKg = 540; monthlyFeedEstimate = 1800; }
      else if (animal.type.includes('ছাগল')) { monthlyWeightGain = 3.5; marketRatePerKg = 880; monthlyFeedEstimate = 550; }
      else if (animal.type.includes('হাঁস')) { monthlyWeightGain = 0.35; marketRatePerKg = 380; monthlyFeedEstimate = 140; }
      else if (animal.type.includes('মুরগি')) { monthlyWeightGain = 0.4; marketRatePerKg = 270; monthlyFeedEstimate = 120; }
      else if (animal.type.includes('পাখি')) { monthlyWeightGain = 0.05; marketRatePerKg = 450; monthlyFeedEstimate = 20; }
      else if (animal.type.includes('মাছ')) { 
        monthlyWeightGain = 0.5; // ~500g gain for tilapia/carp in good pond
        marketRatePerKg = 320; // 320 ৳/kg average local market
        monthlyFeedEstimate = 150;
      }
      else { monthlyWeightGain = 0.1; marketRatePerKg = 500; monthlyFeedEstimate = 100; }

      const projectedWeight = animal.currentWeight + (monthlyWeightGain * growthHorizonMonths);
      const baselinePrice = animal.sellingPrice || stats.suggestedPrice;
      const expectedProjectedPrice = Math.max(Math.round((projectedWeight * marketRatePerKg) / 100) * 100, Math.round(baselinePrice * (1 + (0.07 * growthHorizonMonths))));
      const futureFeedCost = monthlyFeedEstimate * growthHorizonMonths;
      
      projectedTotalRevenue += expectedProjectedPrice;
      projectedFeedCost += futureFeedCost;

      return { id: animal.id, name: animal.name, type: animal.type, breed: animal.breed, age: animal.age, currentWeight: animal.currentWeight, projectedWeight: Number(projectedWeight.toFixed(1)), currentSellingPrice: baselinePrice, projectedSellingPrice: expectedProjectedPrice, projectedGrowthPercentage: Math.round(((expectedProjectedPrice - baselinePrice) / baselinePrice) * 100), futureFeedCost, projectedProfit: expectedProjectedPrice - (stats.totalExpense + futureFeedCost) };
    });

    return { growthHorizonMonths, activeAnimalCount: active.length, currentCapital, currentEstimatedValue, projectedTotalRevenue, projectedFeedCost, projectedAdditionalProfit: Math.max(0, projectedTotalRevenue - currentEstimatedValue - projectedFeedCost), projectedRoi: currentCapital > 0 ? Number((((projectedTotalRevenue - currentCapital - projectedFeedCost) / currentCapital) * 100).toFixed(1)) : 0, projections };
  }

  public getSeasonalFeedGuidelines(): SeasonalFeedGuideline[] {
    return [
      {
        season: 'গ্রীষ্মকাল (Summer)',
        temperatureRange: '৩২°সে - ৪০°সে (উচ্চ তাপমাত্রা ও আর্দ্রতা)',
        weatherNotice: 'প্রচণ্ড গরমে হিট-স্ট্রোক ও ডিহাইড্রেশন প্রতিরোধে বিশেষ তরল ও খনিজ খাদ্য জরুরি।',
        dietAdvice: [
          { animalType: 'গরু ও বলদ', morningDiet: 'ভোরের ঠান্ডা আবহাওয়ায় তাজা নেপিয়ার ঘাস ১৫ কেজি, ভেজা গমের ভুসি ৩ কেজি ও পর্যাপ্ত সাধারণ পানি।', eveningDiet: 'সাইলেজ বা কাঁচা ঘাস ১০ কেজি, খৈল ৫০০ গ্রাম, লবণ ও চিটাগুড়ের শরবত।', supplements: 'প্রতিদিন পানিতে ভিটামিন সি ও ইলেক্ট্রোলাইট স্যালাইন (১০০ গ্রাম প্রতি ১০০ লিটার পানিতে)।', precautions: 'দুপুরে ভারী দানাদার খাবার এড়িয়ে চলুন। ছায়াযুক্ত স্থানে পর্যাপ্ত বাতাস ও ঠান্ডা পানির চৌবাচ্চা রাখুন।' },
          { animalType: 'ছাগল ও খাসি', morningDiet: 'কাঁঠাল পাতা ও কাঁচা ঘাস ৩ কেজি, দানাদার ফিড ৩০০ গ্রাম।', eveningDiet: 'শুকনো খড় ৫০০ গ্রাম, ভুসি ২০০ গ্রাম, পরিষ্কার পানীয় জল।', supplements: 'পানিতে জিংক ও ভিটামিন এডি৩ই সলিউশন।', precautions: 'স্যাঁতসেঁতে বা ভেজা মেঝে পরিহার করুন, যাতে নিউমোনিয়া ও খুরা সমস্যা না হয়।' }
        ]
      }
    ];
  }

  // Farm Objects Methods
  public getFarmObjects(): FarmObject[] { return [...this.farmObjects]; }
  public setFarmObjects(objects: FarmObject[]) { this.farmObjects = objects; this.save(); }
  public addFarmObject(obj: FarmObject) { this.farmObjects.push(obj); this.save(); }
  public removeFarmObject(id: string) { this.farmObjects = this.farmObjects.filter(o => o.id !== id); this.save(); }
  public updateFarmObject(id: string, updates: Partial<FarmObject>) {
    this.farmObjects = this.farmObjects.map(o => o.id === id ? { ...o, ...updates } : o);
    this.save();
  }

  // Ultra-Easy Input Methods (খামারি ও সহকারীদের জন্য অতি সহজ এন্ট্রি)
  public getDailyProductionRecords(): DailyProductionRecord[] {
    return [...this.dailyProductionRecords];
  }

  public addDailyProductionRecord(record: Omit<DailyProductionRecord, 'id'>) {
    const newRecord: DailyProductionRecord = {
      ...record,
      id: `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    this.dailyProductionRecords.unshift(newRecord);
    this.save();
    return newRecord;
  }

  // এক ক্লিকে সকল পশুকে খাবার দেওয়া (Feed all in 1 click)
  public quickFeedAllAnimals(fedBy: string = 'খামার সহকারী'): number {
    const today = new Date().toISOString().split('T')[0];
    let fedCount = 0;

    this.livestock = this.livestock.map(animal => {
      if (animal.status === 'বিক্রিত (Sold)') return animal;
      fedCount++;
      const plan = animal.structuredFeedPlan || getDefaultStructuredFeedPlan(animal.type).items;
      const totalCost = plan.reduce((s, i) => s + (i.estimatedCostTaka || 20), 0);
      const totalKg = plan.reduce((s, i) => s + (i.targetAmountKg || 1), 0);

      // Record detailed feeding entry
      const existingLogs = animal.feedingLogs || [];
      const newRecord: DailyFeedingRecord = {
        id: `DFR-${Date.now()}-${animal.id}`,
        animalId: animal.id,
        animalName: animal.name,
        date: today,
        timeSlot: 'সকাল',
        isFed: true,
        fedBy,
        feedItemsServed: plan.map(item => ({
          name: item.name,
          targetAmountKg: item.targetAmountKg,
          servedAmountKg: item.targetAmountKg,
          eatenAmountKg: item.targetAmountKg,
          leftoverAmountKg: 0,
          unit: item.unit,
          costTaka: item.estimatedCostTaka,
        })),
        totalCostTaka: totalCost,
        dailyBudgetTaka: animal.dailyFeedBudget || totalCost,
        budgetStatus: 'বাজেটের মধ্যে (Within Budget)',
        notes: 'এক ক্লিকে সহজ ইনপুট মাধ্যমে খাবার নিশ্চিত করা হয়েছে',
      };

      return {
        ...animal,
        feedingLogs: [newRecord, ...existingLogs.filter(l => l.date !== today)],
      };
    });

    // Add aggregate feed production record
    this.addDailyProductionRecord({
      date: today,
      type: 'feed',
      title: `খামারের ${fedCount}টি পশুকে খাবার প্রদান সম্পন্ন`,
      amount: fedCount,
      unit: 'টি প্রাণী',
      recordedBy: fedBy,
      notes: 'সকালের খাবার সম্পূর্ণ প্রদান করা হয়েছে',
    });

    this.save();
    return fedCount;
  }

  // দ্রুত দুধের হিসাব রাখা (Milk Entry)
  public quickRecordMilk(liters: number, cowName: string = 'খামারের গাভী', isSold: boolean = false, ratePerLiter: number = 80) {
    const today = new Date().toISOString().split('T')[0];
    const totalTaka = isSold ? liters * ratePerLiter : 0;

    const record = this.addDailyProductionRecord({
      date: today,
      type: 'milk',
      title: `${cowName} থেকে দুধ সংগ্রহ`,
      amount: liters,
      unit: 'লিটার',
      takaAmount: totalTaka,
      recordedBy: 'দুধ সংগ্রহকারী',
      notes: isSold ? `বিক্রয়মূল্য: ${totalTaka} ৳ (প্রতি লিটার ${ratePerLiter} ৳)` : 'খামারে সংরক্ষিত / প্রক্রিয়াজাত',
    });

    if (isSold && totalTaka > 0) {
      this.addOwnerTransaction({
        date: today,
        type: 'Investment', // Cash inflow
        amount: totalTaka,
        description: `খাঁটি দুধ বিক্রয় - ${liters} লিটার (${cowName})`,
      });
    }

    return record;
  }

  // দ্রুত ডিমের হিসাব রাখা (Egg Entry)
  public quickRecordEggs(count: number, birdType: string = 'সোনালী ও দেশি মুরগি', isSold: boolean = false, ratePerPiece: number = 13) {
    const today = new Date().toISOString().split('T')[0];
    const totalTaka = isSold ? count * ratePerPiece : 0;

    const record = this.addDailyProductionRecord({
      date: today,
      type: 'eggs',
      title: `${birdType} থেকে ডিম সংগ্রহ`,
      amount: count,
      unit: 'টি',
      takaAmount: totalTaka,
      recordedBy: 'ডিম সংগ্রহকারী',
      notes: isSold ? `ডিম বিক্রয়: ${totalTaka} ৳ (প্রতি পিস ${ratePerPiece} ৳)` : 'হ্যাচারি / সংরক্ষণাগারে রাখা',
    });

    if (isSold && totalTaka > 0) {
      this.addOwnerTransaction({
        date: today,
        type: 'Investment', // Inflow
        amount: totalTaka,
        description: `ডিম বিক্রয় - ${count}টি (${birdType})`,
      });
    }

    return record;
  }

  // দ্রুত টাকা আয় বা ব্যয়ের হিসাব রাখা (Cash In / Out)
  public quickRecordCash(type: 'cash_in' | 'cash_out', amount: number, title: string, notes?: string) {
    const today = new Date().toISOString().split('T')[0];
    
    this.addDailyProductionRecord({
      date: today,
      type,
      title,
      amount: 1,
      unit: 'বার',
      takaAmount: amount,
      recordedBy: 'ক্যাশিয়ার / খামারি',
      notes,
    });

    this.addOwnerTransaction({
      date: today,
      type: type === 'cash_in' ? 'Investment' : 'ProfitWithdrawal',
      amount,
      description: `${type === 'cash_in' ? 'আয় (ইনকাম)' : 'খরচ (ব্যয়)'}: ${title}${notes ? ` - ${notes}` : ''}`,
    });
  }

  // একদম সহজ উপায়ে নতুন পশু/পাখি যোগ করা (Ultra-Simple Animal Add)
  public quickAddAnimalSimple(params: {
    type: string; // 'গরু', 'ছাগল', 'হাঁস', 'মুরগি', 'পাখি', 'মাছ'
    name: string;
    purchasePrice: number;
    weightKg?: number;
    photo?: string;
  }): LivestockItem {
    const today = new Date().toISOString().split('T')[0];
    const typeLower = params.type.toLowerCase();

    let fullType: LivestockItem['type'] = 'ছাগল (Goat)';
    let prefix = 'G';
    let defaultWeight = 25;
    let targetSellingPrice = params.purchasePrice * 1.35;
    let breed = 'উন্নত জাত';

    if (typeLower.includes('গরু') || typeLower.includes('cow') || typeLower.includes('cattle')) {
      fullType = 'গরু (Cattle)';
      prefix = 'C';
      defaultWeight = params.weightKg || 120;
      breed = 'দেশি সংকর / ফিজিয়ান ক্রস';
      targetSellingPrice = params.purchasePrice * 1.3;
    } else if (typeLower.includes('ছাগল') || typeLower.includes('goat')) {
      fullType = 'ছাগল (Goat)';
      prefix = 'G';
      defaultWeight = params.weightKg || 25;
      breed = 'ব্ল্যাক বেঙ্গল / যমুনাপারি ক্রস';
    } else if (typeLower.includes('হাঁস') || typeLower.includes('duck')) {
      fullType = 'হাঁস (Duck)';
      prefix = 'D';
      defaultWeight = params.weightKg || 1.8;
      breed = 'খাকি ক্যাম্পবেল ও পেকিন';
    } else if (typeLower.includes('মুরগি') || typeLower.includes('chicken')) {
      fullType = 'মুরগি (Chicken)';
      prefix = 'P';
      defaultWeight = params.weightKg || 1.2;
      breed = 'সোনালী ক্লাসিক জাত';
    } else if (typeLower.includes('পাখি') || typeLower.includes('birds')) {
      fullType = 'পাখি (Birds)';
      prefix = 'B';
      defaultWeight = params.weightKg || 0.25;
      breed = 'উন্নত জাতের পাখি';
    } else if (typeLower.includes('মাছ') || typeLower.includes('fish')) {
      fullType = 'মাছ (Fish)';
      prefix = 'F';
      defaultWeight = params.weightKg || 0.8;
      breed = 'রুই, কাতলা ও মনোসেক্স তেলাপিয়া';
    }

    const newId = `${prefix}-${Date.now().toString().slice(-4)}`;
    const feedPlan = getDefaultStructuredFeedPlan(fullType);

    const newAnimal: LivestockItem = {
      id: newId,
      name: params.name || `${params.type} #${newId}`,
      type: fullType,
      breed,
      batchOrFlock: 'সাধারণ পালন ব্যাচ',
      quantity: 1,
      purchasePrice: params.purchasePrice,
      purchaseDate: today,
      targetRearingMonths: 6,
      targetSellingPrice: Math.round(targetSellingPrice / 100) * 100,
      initialWeight: defaultWeight,
      currentWeight: params.weightKg || defaultWeight,
      targetWeight: Math.round(defaultWeight * 1.35),
      age: '৬ মাস',
      healthStatus: 'সুস্থ ও সবল',
      sellingPrice: Math.round(targetSellingPrice / 100) * 100,
      healthCondition: 'চমৎকার ও সুস্থ',
      dailyDietPlan: 'স্বাভাবিক পুষ্টিকর খাবার ও তাজা পানি',
      dailyFeedBudget: feedPlan.dailyBudgetTaka,
      structuredFeedPlan: feedPlan.items,
      status: 'খামারে পালনরত',
      isForSale: false,
      feedingLogs: [],
      growthHistory: [
        { month: 0, days: 0, date: today, weightKg: defaultWeight, targetExpectedKg: defaultWeight, notes: 'প্রাথমিক এন্ট্রি' }
      ]
    };

    this.addLivestock(newAnimal);
    return newAnimal;
  }

  // Voice Phrase Management Methods
  public getVoicePhrases(): VoicePhraseMapping[] {
    return [...this.voicePhrases];
  }

  public addVoicePhrase(phrase: Omit<VoicePhraseMapping, 'id' | 'createdAt'>): VoicePhraseMapping {
    const newPhrase: VoicePhraseMapping = {
      ...phrase,
      id: `vp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.voicePhrases.unshift(newPhrase);
    this.save();
    return newPhrase;
  }

  public updateVoicePhrase(id: string, updates: Partial<VoicePhraseMapping>) {
    this.voicePhrases = this.voicePhrases.map(p => p.id === id ? { ...p, ...updates } : p);
    this.save();
  }

  public deleteVoicePhrase(id: string) {
    this.voicePhrases = this.voicePhrases.filter(p => p.id !== id);
    this.save();
  }

  public resetVoicePhrases() {
    this.voicePhrases = [...INITIAL_VOICE_PHRASES];
    this.save();
  }

  public getInstitutionProfile(): InstitutionProfile { return { ...this.institutionProfile }; }
  public updateInstitutionProfile(updated: Partial<InstitutionProfile>) { this.institutionProfile = { ...this.institutionProfile, ...updated }; this.save(); }
  public resetInstitutionProfile() { this.institutionProfile = { ...INITIAL_INSTITUTION_PROFILE }; this.save(); }

  // Purchase Order Methods
  public getPurchaseOrders(): PurchaseOrder[] { return [...this.purchaseOrders]; }
  
  public createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'status'>): PurchaseOrder {
    const newPO: PurchaseOrder = {
      ...po,
      id: `PO-${Date.now()}`,
      status: 'Pending'
    };
    this.purchaseOrders.unshift(newPO);
    this.save();
    return newPO;
  }

  public updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']) {
    this.purchaseOrders = this.purchaseOrders.map(po => 
      po.id === id ? { ...po, status } : po
    );
    this.save();
  }
}

export const farmStore = new FarmStore();
