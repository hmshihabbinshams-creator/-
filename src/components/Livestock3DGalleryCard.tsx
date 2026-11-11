import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  Box, RotateCcw, ZoomIn, ZoomOut, Sparkles, 
  ChevronRight, ArrowRight, ShieldCheck, Scale, Award 
} from 'lucide-react';
import { farmStore } from '../services/farmStore';

interface Livestock3DGalleryCardProps {
  onExploreStore?: () => void;
}

type AnimalSpeciesKey = 'cow' | 'goat' | 'duck' | 'chicken' | 'fish';

interface AnimalSpec {
  id: AnimalSpeciesKey;
  name: string;
  banglaName: string;
  breed: string;
  weight: string;
  age: string;
  diet: string;
  price: string;
  yieldInfo: string;
  colorHex: string;
}

const ANIMALS: AnimalSpec[] = [
  {
    id: 'cow',
    name: 'Dairy Cattle',
    banglaName: 'উন্নত জাতের ডেইরি গাভী',
    breed: 'সাহীওয়াল ও ফ্রিজিয়ান ক্রস',
    weight: '৪৫০ কেজি',
    age: '৩.৫ দাঁত / ৩.৫ বছর',
    diet: 'ভুট্টা সাইলেজ, দানাদার ভুসি ও নেপিয়ার ঘাস',
    price: '১,৪৫,০০০ ৳',
    yieldInfo: 'দৈনিক ১৫-১৮ লিটার খাঁটি দুধ',
    colorHex: '#d97706'
  },
  {
    id: 'goat',
    name: 'Jamunapari Goat',
    banglaName: 'খাঁটি যমুনাপারি খাসি',
    breed: 'রাজশাহী জাতের যমুনাপারি',
    weight: '৫৮ কেজি',
    age: '২ বছর',
    diet: 'কাঁঠাল পাতা, ডাল চূর্ণ ও দানাদার ফিড',
    price: '২৮,০০০ ৳',
    yieldInfo: 'উচ্চ মাংসের ফলন ও সুস্বাদু',
    colorHex: '#059669'
  },
  {
    id: 'duck',
    name: 'Khaki Campbell Duck',
    banglaName: 'খাকি ক্যাম্পবেল হাঁস (জোড়া)',
    breed: 'উন্নত ইংল্যান্ড জাত',
    weight: '৩.২ কেজি (জোড়া)',
    age: '৮ মাস',
    diet: 'ধানের কুঁড়া, শামুক ও ভাসমান ডাক ফিড',
    price: '২,৪০০ ৳',
    yieldInfo: 'বার্ষিক ২৮০+ ডিম উৎপাদনক্ষম',
    colorHex: '#0d9488'
  },
  {
    id: 'chicken',
    name: 'Sonali Chicken',
    banglaName: 'সোনালী মুরগি ফ্লক (জোড়া)',
    breed: 'বাণিজ্যিক সোনালী লেয়ার',
    weight: '৪.০ কেজি (৪টি)',
    age: '৫ মাস',
    diet: 'হাই-প্রোটিন স্টার্টার ও শাকসবজি',
    price: '১,৮৫০ ৳',
    yieldInfo: 'অর্গানিক মাংস ও তাজা ডিম',
    colorHex: '#f59e0b'
  },
  {
    id: 'fish',
    name: 'Tilapia & Carp Fish',
    banglaName: 'তেলাপিয়া ও কার্প পোনা লট',
    breed: 'মনোসেক্স তেলাপিয়া (১০০ পিস)',
    weight: '২৫ কেজি (লট)',
    age: '৪ মাস',
    diet: '২৮% প্রোটিন ভাসমান পেলেট ফিড',
    price: '৪,৫০০ ৳',
    yieldInfo: 'ফরমালিনমুক্ত ও দ্রুত বর্ধনশীল',
    colorHex: '#3b82f6'
  }
];

export const Livestock3DGalleryCard: React.FC<Livestock3DGalleryCardProps> = ({ onExploreStore }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<AnimalSpeciesKey>('cow');

  const activeAnimal = useMemo(() => {
    return ANIMALS.find(a => a.id === selectedId) || ANIMALS[0];
  }, [selectedId]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.02);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x14532d, 2.2));
    const dirLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ground pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.4, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
    );
    pedestal.position.y = -0.15;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Build Composite 3-12 Part Procedural Model based on selected animal
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;

    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: selectedId === 'cow' ? 0xf5ebe0 : selectedId === 'goat' ? 0x18181b : selectedId === 'duck' ? 0xfef08a : selectedId === 'chicken' ? 0xd97706 : 0x3b82f6,
      roughness: 0.6 
    });

    if (selectedId === 'cow') {
      // Composite Cow Model
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.6), bodyMat);
      torso.position.y = 1;
      torso.castShadow = true;
      modelGroup.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.0), bodyMat);
      head.position.set(0, 1.5, 1.6);
      modelGroup.add(head);

      // Horns
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), hornMat);
      leftHorn.position.set(-0.4, 2.0, 1.5);
      leftHorn.rotation.z = -0.3;
      modelGroup.add(leftHorn);

      const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), hornMat);
      rightHorn.position.set(0.4, 2.0, 1.5);
      rightHorn.rotation.z = 0.3;
      modelGroup.add(rightHorn);

      // Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      for (const x of [-0.6, 0.6]) {
        for (const z of [-0.9, 0.9]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 1), legMat);
          leg.position.set(x, 0.5, z);
          modelGroup.add(leg);
        }
      }
    } else if (selectedId === 'goat') {
      // Composite Goat Model
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.8), bodyMat);
      torso.position.y = 0.8;
      modelGroup.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.7), bodyMat);
      head.position.set(0, 1.2, 1.1);
      modelGroup.add(head);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      for (const x of [-0.35, 0.35]) {
        for (const z of [-0.6, 0.6]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8), legMat);
          leg.position.set(x, 0.4, z);
          modelGroup.add(leg);
        }
      }
    } else if (selectedId === 'duck') {
      // Composite Duck Model
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), bodyMat);
      body.scale.set(1, 0.8, 1.4);
      body.position.y = 0.5;
      modelGroup.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
      head.position.set(0, 1.1, 0.7);
      modelGroup.add(head);

      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
      beak.position.set(0, 1.05, 1.0);
      modelGroup.add(beak);
    } else if (selectedId === 'chicken') {
      // Composite Chicken Model
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), bodyMat);
      body.position.y = 0.6;
      modelGroup.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bodyMat);
      head.position.set(0, 1.2, 0.5);
      modelGroup.add(head);

      const comb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.3), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      comb.position.set(0, 1.5, 0.5);
      modelGroup.add(comb);
    } else {
      // Fish
      const fishBody = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), bodyMat);
      fishBody.scale.set(1.8, 0.8, 0.6);
      fishBody.position.y = 0.8;
      modelGroup.add(fishBody);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), bodyMat);
      tail.position.set(-1.3, 0.8, 0);
      tail.rotation.z = Math.PI / 2;
      modelGroup.add(tail);
    }

    scene.add(modelGroup);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.003; // Gentle ambient rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [selectedId]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-[3rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-emerald-800/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>ইন্টারেক্টিভ থ্রিডি লাইভস্টক গ্যালারি</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">
                খামারের প্রাণীদের ৩ডি প্রিভিউ ও লাইভ স্পেসিফিকেশন
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                মাউস বা আঙুল দিয়ে ড্র্যাগ করে প্রাণিটিকে যেকোনো দিক থেকে ঘুরিয়ে দেখুন এবং পাশে গুরুত্বপূর্ণ জাত, ওজন ও বয়স যাচাই করুন।
              </p>
            </div>

            {/* Species Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700">
              {ANIMALS.map(anim => (
                <button
                  key={anim.id}
                  onClick={() => setSelectedId(anim.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedId === anim.id
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {anim.banglaName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Main 3D Canvas + Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 3D Viewport */}
            <div className="lg:col-span-7 h-[420px] rounded-[2.5rem] overflow-hidden border border-emerald-800/60 shadow-2xl relative bg-slate-900">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none text-[11px] font-bold bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300">
                <span>🖱️ মাউস দিয়ে ঘুরিয়ে এবং জুম করে দেখুন</span>
                <span className="text-emerald-400 font-mono">৩ডি মডেল রেন্ডারিং সচল</span>
              </div>
            </div>

            {/* Right Information Card */}
            <div className="lg:col-span-5 bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-md border border-emerald-800">
                  {activeAnimal.name}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  {activeAnimal.banglaName}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-1">{activeAnimal.breed}</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">শারীরিক ওজন</span>
                  <p className="text-base font-black font-mono text-emerald-400">{activeAnimal.weight}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">বয়স / দাঁত</span>
                  <p className="text-base font-black font-mono text-amber-400">{activeAnimal.age}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <div>প্রধান খাদ্য: <span className="font-semibold text-white">{activeAnimal.diet}</span></div>
                <div>উৎপাদন বৈশিষ্ট্য: <span className="font-semibold text-emerald-300">{activeAnimal.yieldInfo}</span></div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">নির্ধারিত মূল্য</span>
                  <span className="text-2xl font-black font-mono text-white">{activeAnimal.price}</span>
                </div>

                <button
                  onClick={onExploreStore}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <span>স্টোর থেকে কিনুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
