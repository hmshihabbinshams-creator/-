import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIVESTOCK_DISEASES } from './src/data/livestockDiseases';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // In-memory data store for backend
  let livestockData = [
    {
      id: 'C-101',
      name: 'সাহীওয়াল প্রিন্সেস',
      type: 'গরু (Cow)',
      breed: 'সাহীওয়াল',
      batchOrFlock: 'একক পালন',
      quantity: 1,
      purchaseDate: '2026-01-10',
      purchasePrice: 180000,
      initialWeight: 380,
      currentWeight: 450,
      age: '৩ বছর',
      healthStatus: 'সুস্থ ও সবল (টিকা সম্পন্ন)',
      dailyDietPlan: 'কাঁচা ঘাস ১৫ কেজি, ভুসি ৩ কেজি, খৈল ৫০০ গ্রাম, মিনারেল মিক্স ৫০ গ্রাম',
      isForSale: false,
      sellingPrice: 285000,
      saleDescription: 'উচ্চমানের সাহীওয়াল গাভী। প্রতিদিন গড়ে ১২ লিটার খাঁটি দুধ দেয়।',
      status: 'খামারে পালনরত',
    },
    {
      id: 'C-102',
      name: 'দেশি লাল বাহাদুর',
      type: 'গরু (Cow)',
      breed: 'পাবনা দেশি সংকর',
      batchOrFlock: 'একক পালন',
      quantity: 1,
      purchaseDate: '2026-02-05',
      purchasePrice: 130000,
      initialWeight: 290,
      currentWeight: 375,
      age: '২.৫ বছর',
      healthStatus: 'সম্পূর্ণ সুস্থ ও সতেজ',
      dailyDietPlan: 'কাঁচা ঘাস ১২ কেজি, খড় ৩ কেজি, গমের ভুসি ২ কেজি',
      isForSale: false,
      sellingPrice: 210000,
      saleDescription: 'কোরবানি ও লালন-পালনের জন্য আকর্ষণীয় সুস্থ লাল বলদ।',
      status: 'খামারে পালনরত',
    },
    {
      id: 'G-201',
      name: 'যমুনাপারি সর্দার',
      type: 'ছাগল (Goat)',
      breed: 'যমুনাপারি',
      batchOrFlock: 'প্রজনন ও পালন',
      quantity: 1,
      purchaseDate: '2026-02-15',
      purchasePrice: 28000,
      initialWeight: 42,
      currentWeight: 65,
      age: '১.৫ বছর',
      healthStatus: 'চমৎকার ও অ্যাক্টিভ',
      dailyDietPlan: 'ঘাস ও পাতা ৪ কেজি, দানাদার ফিড ৫০০ গ্রাম, ভুষি ৩০০ গ্রাম',
      isForSale: true,
      sellingPrice: 55000,
      saleDescription: 'উন্নত লম্বা কানের খাঁটি যমুনাপারি খাসি। নিখুঁত স্বাস্থ্য ও মাংসল গঠন।',
      status: 'বিক্রির জন্য প্রস্তুত',
    },
    {
      id: 'G-202',
      name: 'ব্ল্যাক বেঙ্গল পাল (১০ টি)',
      type: 'ছাগল (Goat)',
      breed: 'ব্ল্যাক বেঙ্গল',
      batchOrFlock: 'ছাগলের পাল-১',
      quantity: 10,
      purchaseDate: '2026-03-01',
      purchasePrice: 75000,
      initialWeight: 140,
      currentWeight: 220,
      age: '১ বছর',
      healthStatus: 'পিপিআর টিকা সম্পন্ন',
      dailyDietPlan: 'নেপিয়ার ঘাস ও কাঁঠাল পাতা ২০ কেজি, দানাদার খাদ্য ৩ কেজি',
      isForSale: false,
      sellingPrice: 125000,
      saleDescription: 'দেশি খাঁটি ব্ল্যাক বেঙ্গল জাতের ছাগলের সমৃদ্ধ পাল। বাচ্চা উৎপাদনের জন্য চমৎকার।',
      status: 'খামারে পালনরত',
    },
    {
      id: 'P-301',
      name: 'সোনালী মুরগির ফ্লক (১০০ টি)',
      type: 'মুরগি (Poultry)',
      breed: 'সোনালী',
      batchOrFlock: 'পোল্ট্রি ব্যাচ-১',
      quantity: 100,
      purchaseDate: '2026-03-10',
      purchasePrice: 22000,
      initialWeight: 25,
      currentWeight: 180,
      age: '৫ মাস',
      healthStatus: 'রানীক্ষেত ও গামবোরো টিকা প্রাপ্ত',
      dailyDietPlan: 'লেয়ার ও গ্রোয়ার ফিড ১২ কেজি, পরিষ্কার পানি ও ভিটামিন',
      isForSale: false,
      sellingPrice: 48000,
      saleDescription: 'শতভাগ সুস্থ সোনালী মুরগির ঝাঁক। প্রতিদিন গড়ে ৭০-৮০টি পুষ্টিকর ডিম উৎপাদন হয়।',
      status: 'খামারে পালনরত',
    },
    {
      id: 'D-302',
      name: 'খাকি ক্যাম্পবেল হাঁসের ঝাঁক (৫০ টি)',
      type: 'হাঁস (Duck)',
      breed: 'খাকি ক্যাম্পবেল',
      batchOrFlock: 'হাঁস পাল-ক',
      quantity: 50,
      purchaseDate: '2026-02-20',
      purchasePrice: 18000,
      initialWeight: 30,
      currentWeight: 110,
      age: '৬ মাস',
      healthStatus: 'সুস্থ ও সক্রিয় (নিয়মিত ডিম পাড়া)',
      dailyDietPlan: 'ধান, কুঁড়া, শামুক ও ভাসমান ফিড ৮ কেজি',
      isForSale: true,
      sellingPrice: 38000,
      saleDescription: 'প্রাকৃতিক জলাশয়ে চড়ে বেড়ানো উচ্চ উৎপাদনশীল খাকি ক্যাম্পবেল হাঁসের সুস্থ ঝাঁক। নিয়মিত বড় আকারের পুষ্টিকর ডিম পাড়া হাঁস।',
      status: 'বিক্রির জন্য প্রস্তুত',
    },
    {
      id: 'D-303',
      name: 'পদ্মপুকুরের দেশি ও পিকিন হাঁস (জোড়া)',
      type: 'হাঁস (Duck)',
      breed: 'পেকিন ও দেশি পাতিহাঁস',
      batchOrFlock: 'হাঁস জোড়া-১',
      quantity: 2,
      purchaseDate: '2026-03-05',
      purchasePrice: 1300,
      initialWeight: 4,
      currentWeight: 5.5,
      age: '৭ মাস',
      healthStatus: 'শতভাগ সুস্থ, চঞ্চল ও সতেজ',
      dailyDietPlan: 'ধান, কুঁড়া ও পুকুরের জলজ খাবার',
      isForSale: true,
      sellingPrice: 2200,
      saleDescription: 'খামারের পদ্মপুকুরে সাঁতার কেটে বড় হওয়া স্বাস্থ্যবান হাঁসের জোড়া (একটি পুরুষ ও একটি মাদি)। মাংস ও ডিম উভয়ের জন্য অত্যন্ত আকর্ষণীয়।',
      status: 'বিক্রির জন্য প্রস্তুত',
    },
  ];

  let feedLogs = [
    { id: 'FL-1', animalId: 'C-101', animalName: 'সাহীওয়াল প্রিন্সেস', date: '2026-05-01', timeSlot: 'সকাল', feedType: 'কাঁচা ঘাস ও ভুসি', amountKg: 8, costTaka: 240, employeeName: 'রহিম মিয়া', notes: 'খাবার সম্পূর্ণ খেয়েছে' },
    { id: 'FL-2', animalId: 'C-101', animalName: 'সাহীওয়াল প্রিন্সেস', date: '2026-05-01', timeSlot: 'বিকাল/রাত', feedType: 'খৈল ও দানাদার খাদ্য', amountKg: 3, costTaka: 180, employeeName: 'করিম হোসেন', notes: 'পানি ও লবণ দেওয়া হয়েছে' },
    { id: 'FL-3', animalId: 'G-201', animalName: 'যমুনাপারি সর্দার', date: '2026-05-01', timeSlot: 'সকাল', feedType: 'নেপিয়ার ঘাস ও পাতা', amountKg: 3, costTaka: 80, employeeName: 'রহিম মিয়া' },
  ];

  let orders = [
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
      status: 'Confirmed',
      note: 'কোরবানির জন্য বুকিং দেওয়া হয়েছে। খামারে আরও ১৫ দিন লালন পালন করা হবে।',
    },
  ];

  let institutionProfile = {
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
  };


  // Livestock API Routes
  app.get('/api/livestock', (req, res) => {
    res.json(livestockData);
  });

  app.post('/api/livestock', (req, res) => {
    const newItem = req.body;
    livestockData.unshift(newItem);
    res.json({ success: true, item: newItem });
  });

  app.put('/api/livestock/:id', (req, res) => {
    const { id } = req.params;
    livestockData = livestockData.map(item => item.id === id ? { ...item, ...req.body } : item);
    res.json({ success: true, updated: livestockData.find(i => i.id === id) });
  });

  app.delete('/api/livestock/:id', (req, res) => {
    const { id } = req.params;
    livestockData = livestockData.filter(item => item.id !== id);
    feedLogs = feedLogs.filter(log => log.animalId !== id);
    res.json({ success: true, deletedId: id });
  });

  app.patch('/api/livestock/:id/toggle-sale', (req, res) => {
    const { id } = req.params;
    const { isForSale, sellingPrice, saleDescription } = req.body;
    livestockData = livestockData.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isForSale: Boolean(isForSale),
          status: isForSale ? 'বিক্রির জন্য প্রস্তুত' : 'খামারে পালনরত',
          sellingPrice: sellingPrice !== undefined ? sellingPrice : item.sellingPrice,
          saleDescription: saleDescription !== undefined ? saleDescription : item.saleDescription,
        };
      }
      return item;
    });
    res.json({ success: true, updated: livestockData.find(i => i.id === id) });
  });

  app.patch('/api/livestock/:id/mark-sold', (req, res) => {
    const { id } = req.params;
    livestockData = livestockData.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isForSale: false,
          status: 'বিক্রিত (Sold)',
        };
      }
      return item;
    });
    res.json({ success: true, updated: livestockData.find(i => i.id === id) });
  });

  app.delete('/api/feed-logs/:id', (req, res) => {
    const { id } = req.params;
    feedLogs = feedLogs.filter(log => log.id !== id);
    res.json({ success: true, deletedId: id });
  });

  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    orders = orders.filter(o => o.id !== id);
    res.json({ success: true, deletedId: id });
  });

  app.get('/api/feed-logs', (req, res) => {
    res.json(feedLogs);
  });

  app.post('/api/feed-logs', (req, res) => {
    const newLog = {
      ...req.body,
      id: `FL-${Date.now()}`,
    };
    feedLogs.unshift(newLog);
    res.json({ success: true, log: newLog });
  });

  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const newOrder = {
      ...req.body,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    orders.unshift(newOrder);
    res.json({ success: true, order: newOrder });
  });

  // Gemini AI Veterinary Doctor endpoint (Conversational)
  app.post('/api/ai/veterinary-advice', async (req, res) => {
    try {
      const { prompt, animalType, image } = req.body;
      
      const relevantDiseases = LIVESTOCK_DISEASES[animalType] || [];
      const diseaseContext = relevantDiseases.map(d => 
        `রোগের নাম: ${d.name} (${d.nameEn})\nলক্ষণ: ${d.symptoms.join(', ')}\nপ্রাথমিক চিকিৎসা: ${d.firstAid}\nপ্রতিরোধ: ${d.preventiveMeasures}`
      ).join('\n\n');

      const systemInstruction = `আপনি 'আর এস খামার' (RS Khamar)-এর প্রধান এআই ভেটেরিনারি ডাক্তার এবং বিশেষজ্ঞ। আপনি বাংলাদেশের দেশীয় পশু ও পাখির রোগবালাই শনাক্তকরণ এবং প্রাথমিক চিকিৎসায় পারদর্শী। আপনার কাছে নিচে ${animalType}-এর কিছু প্রচলিত রোগের তথ্য দেওয়া হলো। ব্যবহারকারীর প্রশ্নের লক্ষণগুলো এবং প্রদানকৃত ছবি (যদি থাকে) গুরুত্ব সহকারে বিশ্লেষণ করুন। যদি কোনো ছবি দেওয়া হয়, তবে সেটিতে দৃশ্যমান লক্ষণ যেমন চামড়ায় গুটি, ফোলা অংশ, বা অস্বাভাবিকতা শনাক্ত করুন এবং সে অনুযায়ী পরামর্শ দিন। 

আপনার উত্তরে অবশ্যই নিম্নলিখিত বিষয়গুলো থাকতে হবে:
১. সম্ভাব্য রোগ শনাক্তকরণ (বিশ্লেষণ ও ছবির ওপর ভিত্তি করে)।
২. তাৎক্ষণিক প্রাথমিক চিকিৎসার ধাপসমূহ (First Aid)।
৩. রোগ প্রতিরোধের উপায় এবং টিকা সংক্রান্ত পরামর্শ।
৪. জরুরি অবস্থায় দ্রুত ভেটেরিনারি সার্জন বা নিকটস্থ প্রাণিসম্পদ অফিসে যোগাযোগের বিশেষ নির্দেশ।

প্রচলিত রোগের ডাটাবেস:
${diseaseContext}

নিয়মাবলী:
- সম্পূর্ণ উত্তর শুধুমাত্র বাংলায় হতে হবে (Strictly Bengali).
- উত্তরটি পয়েন্ট আকারে এবং সহজবোধ্য ভাষায় লিখুন।
- ছবির বিশ্লেষণকে গুরুত্ব দিন।`;

      const contents: any[] = [];
      const parts: any[] = [{ text: `পশু/পাখির ধরন: ${animalType}\nব্যবহারকারীর প্রশ্ন/লক্ষণ: ${prompt || 'ছবিতে দৃশ্যমান সমস্যা বিশ্লেষণ করুন'}` }];
      
      if (image) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: image
          }
        });
      }
      
      contents.push({ parts });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({ success: true, advice: response.text || 'কোনো উত্তর পাওয়া যায়নি।', timestamp: Date.now() });
    } catch (error: any) {
      console.error('Gemini AI error:', error);
      res.status(500).json({ success: false, error: error.message || 'AI সেবা প্রস্তুত করতে সমস্যা হয়েছে।' });
    }
  });

  // Specialized Diagnostic Module endpoint (Structured JSON)
  app.post('/api/ai/diagnose', async (req, res) => {
    try {
      const { symptoms, animalType, image } = req.body;
      const relevantDiseases = LIVESTOCK_DISEASES[animalType] || [];
      const diseaseContext = relevantDiseases.map(d => 
        `Disease: ${d.nameEn} (${d.name})\nSymptoms: ${d.symptoms.join(', ')}\nFirst Aid: ${d.firstAid}`
      ).join('\n\n');

      const systemInstruction = `You are a Veterinary Diagnostic Expert. Analyze the provided symptoms and image (if provided) for ${animalType}.
If an image is provided, identify visual signs like lesions, rashes, swelling, or skin abnormalities.
Use the following database of regional diseases:
${diseaseContext}

Return a structured diagnosis in Bengali.
- possibleDisease: Name of the most likely disease in Bengali.
- confidence: 'high', 'medium', or 'low'.
- symptomsAnalyzed: List of symptoms provided by the user and symptoms identified from the image in Bengali.
- firstAidSteps: A list of immediate actions in Bengali.
- preventionAdvice: How to avoid this in the future in Bengali.
- requiresUrgentVet: Boolean, true if life-threatening or highly contagious.

CRITICAL: All textual content must be in BENGALI language.`;

      const parts: any[] = [{ text: `Animal: ${animalType}\nUser Described Symptoms: ${symptoms || 'Analyze image'}` }];
      if (image) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: image
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ parts }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              possibleDisease: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
              symptomsAnalyzed: { type: Type.ARRAY, items: { type: Type.STRING } },
              firstAidSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              preventionAdvice: { type: Type.STRING },
              requiresUrgentVet: { type: Type.BOOLEAN }
            },
            required: ['possibleDisease', 'confidence', 'symptomsAnalyzed', 'firstAidSteps', 'preventionAdvice', 'requiresUrgentVet']
          }
        }
      });

      const report = JSON.parse(response.text || '{}');
      res.json({ success: true, report });
    } catch (error: any) {
      console.error('Diagnostic AI error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Smart Farm Advisor endpoint
  app.post('/api/ai/farm-advisor', async (req, res) => {
    try {
      const { productionHistory, healthTrends, weatherForecast, livestockSummary } = req.body;

      const systemInstruction = `আপনি 'আর এস খামার' (RS Khamar)-এর প্রধান এআই স্মার্ট খামার উপদেষ্টা। 
আপনার কাজ হলো খামারের উৎপাদন ডাটা, পশুর স্বাস্থ্য এবং আবহাওয়ার পূর্বাভাস বিশ্লেষণ করে প্রতিদিনের অপারেশনে উন্নতির জন্য ৩-৫টি কার্যকর (Actionable) পরামর্শ প্রদান করা।

আপনার উত্তরে অবশ্যই নিম্নলিখিত বিষয়গুলো থাকতে হবে:
১. উৎপাদন বৃদ্ধির জন্য পরামর্শ (দুধ/ডিম/মাংস)।
২. স্বাস্থ্যের ঝুঁকি মোকাবিলায় সতর্কবার্তা (আবহাওয়ার ওপর ভিত্তি করে)।
৩. খাদ্য সাশ্রয় বা দক্ষতা বৃদ্ধির উপায়।
৪. বায়োসিকিউরিটি বা খামার ব্যবস্থাপনায় প্রয়োজনীয় পরিবর্তন।

নিয়মাবলী:
- সম্পূর্ণ উত্তর শুধুমাত্র বাংলায় হতে হবে (Strictly Bengali).
- উত্তরটি পয়েন্ট আকারে এবং খামারিদের জন্য সহজবোধ্য হতে হবে।
- প্রতিটি পরামর্শের সাথে একটি 'কেন' (Rationale) যুক্ত করুন।`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `উৎপাদন রেকর্ড: ${JSON.stringify(productionHistory)}\nস্বাস্থ্য রিপোর্ট: ${JSON.stringify(healthTrends)}\nআবহাওয়ার পূর্বাভাস: ${JSON.stringify(weatherForecast)}\nলাইভস্টক সারাংশ: ${livestockSummary}`,
        config: {
          systemInstruction,
        },
      });

      res.json({ success: true, suggestions: response.text || 'কোনো পরামর্শ পাওয়া যায়নি।' });
    } catch (error: any) {
      console.error('Farm Advisor AI error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Dedicated Gemini Chatbot endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;
      
      const systemInstruction = `আপনি 'আর এস খামার' (RS Khamar)-এর অফিশিয়াল 'Gemini AI Assistant' (জেমিনাই এআই স্মার্ট সহকারী)। 
আপনার কাজ হলো খামারের দর্শনার্থী, ক্রেতা এবং খামারিদের যেকোনো প্রশ্নের আন্তরিক, নির্ভুল এবং পেশাদার উত্তর দেওয়া।

খামারের মূল তথ্য:
- প্রতিষ্ঠানের নাম: আর এস খামার (RS Khamar)
- প্রধান কার্যক্রম: দেশি ও সংকর জাতের গরু (সাহীওয়াল, পাবনা), উন্নত ছাগল (যমুনাপারি, খাঁটি ব্ল্যাক বেঙ্গল), উন্নত হাঁস (খাকি ক্যাম্পবেল, পেকিন), দেশি ও সোনালী মুরগি, সৌখিন পাখি/কোয়েল এবং বৈজ্ঞানিক পদ্ধতিতে তেলাপিয়া ও কার্প মাছের চাষ।
- বৈশিষ্ট্য: শতভাগ স্বাস্থ্যসম্মত প্রাকৃতিক খাদ্য (নেপিয়ার ঘাস, ভুট্টা সাইলেজ), সরকারি প্রাণিসম্পদ অধিদপ্তর (DLS) অনুমোদিত লেভেল-৩ বায়োসিকিউরিটি, ভেটেরিনারি সার্টিফাইড স্বাস্থ্য সুরক্ষা ও স্বচ্ছ মূল্যতালিকা।
- পরিষেবা: খাঁটি দুধ ও ডিম সরবরাহ, কোরবানি ও লালনপালনের জন্য সুস্থ পশু বিক্রয়, পরামর্শ ও ভেটেরিনারি সেবা।

নির্দেশনা:
১. ব্যবহারকারী বাংলায় প্রশ্ন করলে বাংলায় সাবলীল, মার্জিত ও সুন্দর উত্তর দিন। ইংরেজিতে প্রশ্ন করলে ইংরেজিতে উত্তর দিন।
২. খামারের পশু-পাখি, লালন-পালন পদ্ধতি, খাদ্য তালিকা, টিকা ও রোগবালাই প্রতিরোধ সংক্রান্ত প্রশ্নের বিজ্ঞানসম্মত বাস্তবসম্মত পরামর্শ দিন।
৩. যদি কোনো প্রাণী কেনার বিষয়ে জানতে চায়, তবে তাদের আমাদের শপ সেকশন দেখতে বা খামার কর্তৃপক্ষের সাথে যোগাযোগের পরামর্শ দিন।
৪. উত্তর সবসময় তথ্যবহুল, পয়েন্ট আকারে এবং পড়ার উপযোগী সুন্দর ফরম্যাটে দিন।`;

      // Build contents for multi-turn chat
      const contents: any[] = [];
      
      // Include past history
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) { // keep last 8 turns
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text || item.content || '' }]
          });
        }
      }

      // Add current message
      let currentText = message || '';
      if (context && Object.keys(context).length > 0) {
        currentText += `\n\n[অতিরিক্ত খামার কনটেক্সট: ${JSON.stringify(context)}]`;
      }
      contents.push({
        role: 'user',
        parts: [{ text: currentText }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text || 'দুঃখিত, এই মুহূর্তে উত্তর প্রস্তুত করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
      res.json({ success: true, reply: replyText });
    } catch (error: any) {
      console.error('Gemini chatbot error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Gemini সেবা সাময়িকভাবে অনুপলব্ধ।' 
      });
    }
  });

  // Setup Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RS Khamar server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
