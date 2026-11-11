export type NavTab = 'home' | 'dashboard' | 'store' | 'admin';

export interface GrowthCheckpoint {
  month: number;
  days: number;
  date: string;
  weightKg: number;
  targetExpectedKg: number;
  notes?: string;
}

export interface FeedingTimeSlot {
  slot: 'সকাল' | 'দুপুর' | 'বিকাল/রাত';
  timeLabel: string; // e.g., '০৭:৩০ AM (সকালের প্রধান খাবার)'
  portionPercentage: number; // e.g. 50%
  items: {
    name: string;
    targetAmount: number;
    unit: string;
    costTaka: number;
  }[];
}

export interface AutomatedFeedingSchedule {
  animalId: string;
  animalName: string;
  speciesType: string;
  ageString: string;
  ageInMonths: number;
  ageGroupLabel: string; // e.g., 'বাড়ন্ত বয়সের গবাদিপশু (৬-১২ মাস)'
  portionMultiplier: number;
  totalDailyKg: number;
  recommendedDailyBudgetTaka: number;
  timeSlots: FeedingTimeSlot[];
  rationGuidelines: string;
}

export interface StructuredFeedItem {
  id: string;
  name: string; // যেমন: 'দানাদার ভুষি মিক্স', 'সবুজ ঘাস', 'খড়', 'ফ্লোটিং ফিড'
  targetAmountKg: number; // যেমন: ২.৫ কেজি
  unit: 'কেজি' | 'গ্রাম' | 'লিটার' | 'প্যাক';
  estimatedCostTaka: number; // যেমন: ১২০ ৳
}

export interface DailyFeedingRecord {
  id: string;
  animalId: string;
  animalName: string;
  date: string; // '2026-11-08'
  timeSlot: 'সকাল' | 'দুপুর' | 'বিকাল/রাত';
  isFed: boolean; // "খাওয়ানো হয়েছে কিনা" চেক
  fedBy?: string;
  feedItemsServed: {
    name: string;
    targetAmountKg: number;
    servedAmountKg: number;
    eatenAmountKg: number; // কতটুকু খাইলো
    leftoverAmountKg: number; // কতটুকু বাঁচলো
    unit: string;
    costTaka: number;
  }[];
  totalCostTaka: number;
  dailyBudgetTaka: number;
  budgetStatus: 'বাজেটের মধ্যে (Within Budget)' | 'বাজেট সাশ্রয় (Saved)' | 'বাজেট অতিরিক্ত (Over Budget)';
  notes?: string;
}

export interface FeedLog {
  id: string;
  animalId: string;
  animalName: string;
  date: string;
  timeSlot: 'সকাল' | 'দুপুর' | 'বিকাল/রাত';
  feedType: string;
  amountKg: number;
  costTaka: number;
  employeeName: string;
  notes?: string;
}

export interface HealthLog {
  id: string;
  animalId: string;
  animalName: string;
  date: string;
  temperature: string;
  weightKg: number;
  appetite: 'স্বাভাবিক' | 'কম' | 'একেবারে নাই';
  vaccinationName: string;
  vaccinationStatus: 'সম্পন্ন' | 'প্রয়োজন';
  nextVaccineDate?: string;
  inspectionNotes: string;
  status: 'Checked' | 'Action Required';
  inspectorName: string;
}

export interface MedicalLog {
  id: string;
  animalId: string;
  date: string;
  expenseType: string;
  costTaka: number;
  notes?: string;
}

export interface LivestockItem {
  id: string;
  name: string;
  type: 'গরু (Cattle)' | 'ছাগল (Goat)' | 'হাঁস (Duck)' | 'মুরগি (Chicken)' | 'মাছ (Fish)' | 'পাখি (Birds)';
  breed: string;
  batchOrFlock: string; // e.g., 'একক প্রাণী', 'পাল-১ (৫০ টি)'
  quantity: number;
  purchaseDate: string;
  purchasePrice: number; // টাকা
  initialWeight: number; // কেজি
  currentWeight: number; // কেজি
  targetWeight?: number; // টার্গেট অর্জনযোগ্য ওজন (কেজি)
  dateOfBirth?: string; // জন্মের তারিখ (ঐচ্ছিক)
  age: string;
  healthStatus: string;
  healthCondition?: 'চমৎকার ও সুস্থ' | 'নিয়মিত পর্যবেক্ষণে' | 'চিকিৎসা বা যত্ন চলছে';
  dailyDietPlan: string;
  dailyFeedBudget?: number; // বরাদ্দকৃত প্রতিদিনের খাদ্য বাজেট (৳)
  structuredFeedPlan?: StructuredFeedItem[]; // আলাদা আলাদা খাবারের উপাদান ও পরিমাণ
  feedingLogs?: DailyFeedingRecord[]; // প্রতিদিনের তদারকি (কতটুকু খাইলো, কতটুকু বাঁচলো)
  isForSale: boolean; // বিক্রির জন্য মার্ক করা হয়েছে কিনা
  sellingPrice: number; // বিক্রয়মূল্য (টাকা)
  saleDescription?: string;
  status: 'খামারে পালনরত' | 'বিক্রির জন্য প্রস্তুত' | 'বিক্রিত (Sold)';
  photoPlaceholder?: string;
  targetRearingMonths?: number; // কত মাস পালন করার টার্গেট
  targetSellingPrice?: number; // কত টাকা টার্গেট বিক্রয়মূল্য
  growthHistory?: GrowthCheckpoint[]; // D3 গ্রাফের জন্য বৃদ্ধি হিস্ট্রি
  dailyProduction?: {
    type: string; // যেমন 'দুধ', 'ডিম', 'মাংস বৃদ্ধি'
    amount: string; // যেমন '১৪ লিটার/দিন', '২২০ টি/দিন'
    qualityGrade?: string;
  };
  // Fish specific fields
  waterPH?: number;
  waterTemperature?: number;
  pondMaintenanceLogs?: {
    id: string;
    date: string;
    action: string; // e.g., 'Lime applied', 'Water changed'
    notes?: string;
  }[];
  breedingHistory?: {
    isPregnant?: boolean;
    gestationDays?: number;
    breedingType?: 'কৃত্রিম প্রজনন (AI)' | 'প্রাকৃতিক মিলন' | 'ইনকিউবেটর ডিম ফুটানো';
    matingDate?: string;
    expectedCalvingDate?: string;
    sireBreed?: string;
    offspringCount?: number;
    notes?: string;
  };
}

export interface CustomerOrder {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  agreedPrice: number;
  orderDate: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  note?: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface GalleryItem {
  id: string;
  img: string;
  title: string;
  subtitle?: string;
  category?: string;
}

export interface FarmServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface InstitutionProfile {
  name: string;
  tagline: string;
  proprietor: string;
  registrationNumber: string;
  licenseNumber: string;
  phone: string;
  email: string;
  location: string;
  district: string;
  establishedYear: string;
  bioSecurityTier: string;
  totalLandArea: string;
  description: string;
  coreActivities: string;
  logo?: string;
  adminEmail?: string;
  adminPassword?: string;
  // Landing Page Customization
  heroTitle?: string;
  heroSubtitle?: string;
  missionTitle?: string;
  missionText?: string;
  featuresTitle?: string;
  feature1Title?: string;
  feature1Text?: string;
  feature2Title?: string;
  feature2Text?: string;
  feature3Title?: string;
  feature3Text?: string;
  footerText?: string;
  // Dynamic Gallery & Services
  galleryItems?: GalleryItem[];
  servicesList?: FarmServiceItem[];
}

export interface FeedInventoryItem {
  id: string;
  name: string;
  category?: string; // 'খাদ্য (Feed)' | 'ঔষধ ও ভ্যাকসিন (Medicine)'
  currentStockKg: number;
  minThresholdKg: number;
  unitPrice: number; // Avg cost per unit
  unit?: string; // 'কেজি', 'ভায়াল', 'ডোজ', 'লিটার'
  lastUpdated: string;
}

export interface OwnerTransaction {
  id: string;
  date: string;
  type: 'Investment' | 'ProfitWithdrawal' | 'Dividend';
  amount: number;
  description: string;
}


export interface SeasonalFeedGuideline {
  season: 'গ্রীষ্মকাল (Summer)' | 'বর্ষাকাল (Monsoon)' | 'শীতকাল (Winter)' | 'শরৎ/বসন্ত (Spring)';
  temperatureRange: string;
  weatherNotice: string;
  dietAdvice: {
    animalType: string;
    morningDiet: string;
    eveningDiet: string;
    supplements: string;
    precautions: string;
  }[];
}

export interface FarmObject {
  id: string;
  type: 'barn' | 'cow' | 'goat' | 'duck' | 'hay' | 'tree' | 'pond' | 'coop' | 'fish';
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  metadata?: any;
}

export interface MarketingAsset {
  id: string;
  animalId: string;
  title: string;
  content: string;
  type: 'SocialPost' | 'Flyer';
  createdAt: string;
}

export interface DailyProductionRecord {
  id: string;
  date: string;
  type: 'milk' | 'eggs' | 'fish' | 'meat' | 'feed' | 'cash_in' | 'cash_out';
  title: string;
  amount: number;
  unit: string;
  takaAmount?: number;
  recordedBy?: string;
  notes?: string;
  timestamp?: number;
}

export type VoiceActionType = 'tab_navigate' | 'query_milk' | 'query_eggs' | 'query_health' | 'query_feed' | 'open_modal' | 'livestock_status';

export interface VoiceAction {
  type: VoiceActionType;
  targetTab?: NavTab;
  adminTabKey?: string;
}

export interface VoicePhraseMapping {
  id: string;
  phrase: string;
  actions: VoiceAction[];
  responseText: string;
  isActive: boolean;
  createdAt: string;
}

export interface DiagnosisReport {
  possibleDisease: string;
  confidence: 'high' | 'medium' | 'low';
  symptomsAnalyzed: string[];
  firstAidSteps: string[];
  preventionAdvice: string;
  requiresUrgentVet: boolean;
}

export interface FodderCrop {
  id: string;
  name: string;
  species: string; // e.g. 'Napier', 'Maize', 'Alfalfa'
  plantingDate: string;
  expectedHarvestDate: string;
  plotSizeDecimal: number; // in decimals (shangsho)
  status: 'Planting' | 'Growing' | 'Harvesting' | 'Harvested' | 'Fallow';
  yieldKgPerDecimal: number;
}

export interface CropPlan {
  id: string;
  cropType: string;
  recommendedPlantingSeason: string;
  estimatedYieldKg: number;
  dailyConsumptionRequiredKg: number;
  surplusDeficitKg: number;
  actionRecommendation: string;
}
export interface PurchaseOrder {
  id: string;
  date: string;
  supplierName: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Sent' | 'Received' | 'Cancelled';
  predictedNeedDate: string;
  isAutoGenerated: boolean;
  notes?: string;
}

