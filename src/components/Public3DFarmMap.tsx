import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  Eye, Compass, Info, ShoppingBag, MapPin, 
  Sun, Moon, Sunset, Sparkles, ChevronRight, CheckCircle2, Navigation, Layers
} from 'lucide-react';

export interface FarmZoneInfo {
  id: string;
  name: string;
  englishName: string;
  category: string;
  position: [number, number, number];
  color: string;
  accentColor: string;
  icon: string;
  description: string;
  highlights: string[];
  publicOffering: string;
}

export const FARM_ZONES: FarmZoneInfo[] = [
  {
    id: 'dairy_barn',
    name: 'ডেইরি গাভী ও বলদ শেড',
    englishName: 'Dairy Cattle & Bull Shed',
    category: 'গরু ও বাছুর বিভাগ',
    position: [8, 0, -5],
    color: '#059669', // Emerald
    accentColor: 'emerald',
    icon: '🐄',
    description: 'সাহীওয়াল, অস্ট্রেলিয়ান ফ্রিজিয়ান ও সিন্ধি জাতের উন্নত ডেইরি গাভী ও ষাঁড়ের আধুনিক বায়ো-সিকিউরড শেড।',
    highlights: ['অটোমেটেড ম্যাকিং ও ড্রেনেজ ব্যবস্থা', 'ভেন্টিলেটেড ফ্যান ও আরামদায়ক ম্যাট', 'প্রতিদিন ডাক্তার কর্তৃক স্বাস্থ্য পরীক্ষা'],
    publicOffering: 'প্রতিদিন সকালে সংগৃহীত খাঁটি তরল দুধ এবং সুস্থ কোরবানির ষাঁড়।'
  },
  {
    id: 'goat_pen',
    name: 'ব্ল্যাক বেঙ্গল ও খাসি জোন',
    englishName: 'Black Bengal & Goat Pen',
    category: 'ছাগল ও ভেড়া বিভাগ',
    position: [-8, 0, 5],
    color: '#d97706', // Amber
    accentColor: 'amber',
    icon: '🐐',
    description: 'উঁচু কাঠের মাচায় লালিত বিশুদ্ধ ব্ল্যাক বেঙ্গল ছাগল ও প্রজনন উপযোগী খাসির শেড।',
    highlights: ['ড্রাই কাঠের মেঝে ও রোগমুক্ত পরিবেশ', 'প্রাকৃতিক ঘাস ও কাঁঠাল পাতা সোর্সিং', 'সম্পূর্ণ হরমোন ও স্টেরয়েডমুক্ত'],
    publicOffering: 'কোরবানি ও আকীকার জন্য সুস্থ অর্গানিক খাসি ও প্রজনন ছাগল।'
  },
  {
    id: 'poultry_pond',
    name: 'পোল্ট্রি ও হাঁসের চারণ পুকুর',
    englishName: 'Poultry & Duck Pond',
    category: 'হাঁস-মুরগি বিভাগ',
    position: [-10, 0, -8],
    color: '#0284c7', // Sky
    accentColor: 'sky',
    icon: '🦆',
    description: 'খাকি ক্যাম্পবেল লেয়ার হাঁস ও সোনালী মুরগির জন্য উন্মুক্ত সবুজ প্রাঙ্গণ ও সুইমিং পুকুর।',
    highlights: ['প্রাকৃতিক পুকুরে সাঁতার কাটার সুবিধা', 'মুক্ত বাতাসে চরে বেড়ানোর বায়ো-জোন', 'প্রাকৃতিক কেমিক্যালমুক্ত লাল ডিম'],
    publicOffering: 'প্রতিদিনের টাটকা অর্গানিক হাঁস-মুরগির লাল ডিম ও তাজা পাখি।'
  },
  {
    id: 'fishery_pond',
    name: 'মৎস্য হ্যাচারি ও দীর্ঘ পুকুর',
    englishName: 'Aquaculture & Fisheries',
    category: 'মৎস্য খাত',
    position: [6, 0, 10],
    color: '#2563eb', // Blue
    accentColor: 'blue',
    icon: '🐟',
    description: 'বিজ্ঞানসম্মত উপায়ে রুই, কার্প, কাতলা ও তেলাপিয়া মাছের ফরমালিনমুক্ত প্রাকৃতিক জলাশয়।',
    highlights: ['সোলার চালিত ওয়াটার এরেটর', 'প্রাকৃতিক ফাইটোপ্ল্যাঙ্কটন ও খৈল খাদ্য', 'পরীক্ষিত পরিষ্কার জলাধার'],
    publicOffering: 'পুকুর থেকে সদ্য ধরা ফরমালিনমুক্ত তাজা সুস্বাদু মাছ।'
  },
  {
    id: 'fodder_field',
    name: 'সবুজ ঘাস ও সায়লেজ খেত',
    englishName: 'Organic Fodder Pasture',
    category: 'খাদ্য উৎপাদন প্ল্যান্ট',
    position: [12, 0, 6],
    color: '#65a30d', // Lime
    accentColor: 'lime',
    icon: '🌾',
    description: 'খামারের নিজস্ব ৭ একর জমিতে নেপিয়ার, জাম্বু ও পাফা ঘাস এবং ভুট্টা সাইলেজ প্রসেসিং সুবিধা।',
    highlights: ['১০০% কেমিক্যালমুক্ত অর্গানিক সার', 'ভুট্টা ও দানাদার খাদ্যের সায়লেজ ব্যাংকিং', 'পশুদের পুষ্টিকর সবুজ সুষম খাদ্য'],
    publicOffering: 'গবাদিপশুর জন্য পুষ্টিকর অর্গানিক সবুজ ঘাস ও প্রস্তুতকৃত সায়লেজ।'
  },
  {
    id: 'visitor_center',
    name: 'স্বাগতম কেন্দ্র ও অর্গানিক শপ',
    englishName: 'Visitor Center & Farm Store',
    category: 'অভ্যর্থনা ও আউটলেট',
    position: [0, 0, 12],
    color: '#4f46e5', // Indigo
    accentColor: 'indigo',
    icon: '🏡',
    description: 'দর্শনার্থীদের অভ্যর্থনা লাউঞ্জ, গাড়ি পার্কিং ও সরাসরি খাঁটি দুধ-ডিম ক্রয়ের কাউন্টার।',
    highlights: ['পরিবারসহ দর্শনার্থীদের জন্য বসার স্থান', 'লাইভ মিল্কিং স্পট পরিদর্শন', 'পাবলিক অর্ডার বুকিং কাউন্টার'],
    publicOffering: 'খামার পরিদর্শন বুকিং ও সরাসরি খামারি মূল্যে খাঁটি পণ্য ক্রয়।'
  }
];

interface Public3DFarmMapProps {
  onSelectZoneForShop?: (zoneId: string) => void;
  onBookVisit?: () => void;
}

export const Public3DFarmMap: React.FC<Public3DFarmMapProps> = ({ onSelectZoneForShop, onBookVisit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<FarmZoneInfo | null>(FARM_ZONES[0]);
  const [hoveredZone, setHoveredZone] = useState<FarmZoneInfo | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [viewMode, setViewMode] = useState<'isometric' | 'topdown'>('isometric');

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const zoneMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // 3D Scene Initialization
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(timeOfDay === 'night' ? 0x090d16 : timeOfDay === 'sunset' ? 0x1e1b2e : 0xf0fdf4);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.018);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    cameraRef.current = camera;
    camera.position.set(0, 22, 32);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't clip below ground
    controls.minDistance = 10;
    controls.maxDistance = 55;
    controls.target.set(0, 1, 2);

    // Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(
      timeOfDay === 'sunset' ? 0xfb923c : timeOfDay === 'night' ? 0x818cf8 : 0xfffbeb,
      timeOfDay === 'night' ? 0.3 : 1.2
    );
    sunLight.position.set(20, 35, 15);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 80;
      sunLight.shadow.camera.left = -25;
      sunLight.shadow.camera.right = 25;
      sunLight.shadow.camera.top = 25;
      sunLight.shadow.camera.bottom = -25;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x15803d, 0.5);
    scene.add(hemiLight);

    // Build 3D Terrain & Zone Models
    build3DFarmScene(scene, zoneMeshesRef);

    // Animation Loop
    let animId: number;
    let isMounted = true;

    function animate() {
      if (!isMounted) return;
      controls.update();

      // Slow idle rotation when overview
      if (controls.autoRotate) {
        scene.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }
    animate();

    // Raycasting for interactive hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const zoneGroupMeshes = Array.from(zoneMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(zoneGroupMeshes, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.zoneId) {
          current = current.parent;
        }
        if (current && current.userData.zoneId) {
          const zone = FARM_ZONES.find(z => z.id === current?.userData.zoneId);
          if (zone) {
            setHoveredZone(zone);
            setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            mountRef.current.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredZone(null);
      setHoverPos(null);
      mountRef.current.style.cursor = 'default';
    };

    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const zoneGroupMeshes = Array.from(zoneMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(zoneGroupMeshes, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.zoneId) {
          current = current.parent;
        }
        if (current && current.userData.zoneId) {
          const zone = FARM_ZONES.find(z => z.id === current?.userData.zoneId);
          if (zone) {
            focusOnZone(zone);
          }
        }
      }
    };

    const domEl = mountRef.current;
    domEl.addEventListener('pointermove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointermove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      renderer.dispose();
      if (domEl.contains(renderer.domElement)) {
        domEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update background color on timeOfDay change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const bgHex = timeOfDay === 'night' ? 0x090d16 : timeOfDay === 'sunset' ? 0x1e1b2e : 0xf0fdf4;
    scene.background = new THREE.Color(bgHex);
    if (scene.fog) scene.fog.color = new THREE.Color(bgHex);
  }, [timeOfDay]);

  // Focus Camera on Zone
  const focusOnZone = (zone: FarmZoneInfo) => {
    setSelectedZone(zone);
    if (!cameraRef.current || !controlsRef.current) return;

    const [zx, zy, zz] = zone.position;
    const targetPos = new THREE.Vector3(zx, zy + 1, zz);

    let cameraOffset = new THREE.Vector3(zx, zy + 10, zz + 14);
    if (viewMode === 'topdown') {
      cameraOffset = new THREE.Vector3(zx, zy + 25, zz + 0.1);
    }

    // Animate camera and controls target
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    const startCamPos = camera.position.clone();
    const startTarget = controls.target.clone();
    let duration = 600; // ms
    let startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      camera.position.lerpVectors(startCamPos, cameraOffset, ease);
      controls.target.lerpVectors(startTarget, targetPos, ease);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  };

  // Toggle View Mode (Isometric vs Topdown)
  const toggleViewMode = (mode: 'isometric' | 'topdown') => {
    setViewMode(mode);
    if (!cameraRef.current || !controlsRef.current) return;
    if (mode === 'topdown') {
      cameraRef.current.position.set(0, 36, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else {
      cameraRef.current.position.set(0, 22, 32);
      controlsRef.current.target.set(0, 1, 2);
    }
    controlsRef.current.update();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ইন্টারঅ্যাক্টিভ থ্রিডি ভিজ্যুয়াল ম্যাপ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            আর এস খামারের বিভিন্ন শেড ও এলাকা থ্রিডিতে ঘুরে দেখুন
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            নিচের যেকোনো জোন নির্বাচন করুন বা ম্যাপের ওপর মাউস ঘুরিয়ে বিস্তারিত জানুন।
          </p>
        </div>

        {/* Lighting & View Mode Switches */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => toggleViewMode('isometric')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'isometric' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3D isometric
            </button>
            <button
              onClick={() => toggleViewMode('topdown')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'topdown' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              টপ-ডাউন ম্যাপ
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${timeOfDay === 'day' ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}
              title="দিন (Day Light)"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${timeOfDay === 'sunset' ? 'bg-orange-100 text-orange-800' : 'text-slate-400'}`}
              title="সূর্যাস্ত (Sunset)"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${timeOfDay === 'night' ? 'bg-indigo-900 text-indigo-200' : 'text-slate-400'}`}
              title="রাত (Night)"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => {
            setSelectedZone(null);
            if (cameraRef.current && controlsRef.current) {
              cameraRef.current.position.set(0, 22, 32);
              controlsRef.current.target.set(0, 1, 2);
              controlsRef.current.update();
            }
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${
            !selectedZone 
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          🌐 সকল জোন (Overview)
        </button>

        {FARM_ZONES.map(z => {
          const isSelected = selectedZone?.id === z.id;
          return (
            <button
              key={z.id}
              onClick={() => focusOnZone(z)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{z.icon}</span>
              <span>{z.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Map Canvas Viewport */}
      <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950 h-[480px] sm:h-[540px]">
        
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating Hover Tooltip Card */}
        {hoveredZone && hoverPos && (
          <div 
            className="pointer-events-none absolute z-30 p-4 rounded-2xl bg-slate-900/90 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md max-w-xs space-y-1.5 animate-in fade-in duration-200"
            style={{ 
              left: Math.min(hoverPos.x + 15, (mountRef.current?.clientWidth || 600) - 260), 
              top: Math.max(hoverPos.y - 80, 20) 
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{hoveredZone.icon}</span>
              <div>
                <h4 className="font-black text-xs text-white">{hoveredZone.name}</h4>
                <span className="text-[10px] text-emerald-400 font-bold block">{hoveredZone.category}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{hoveredZone.description}</p>
            <span className="text-[10px] font-bold text-amber-300 block pt-1">
              ✨ ক্লিক করে বিস্তারিত ও জোন ভিউ দেখুন
            </span>
          </div>
        )}

        {/* Selected Zone Bottom Detail Overlay Card */}
        {selectedZone && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20 p-5 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl shrink-0 font-bold">
                  {selectedZone.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">{selectedZone.category}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{selectedZone.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedZone.englishName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedZone(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedZone.description}
            </p>

            {/* Highlights */}
            <div className="space-y-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">জোন বৈশিষ্ট্য ও বায়ো-সিকিউরিটি:</span>
              {selectedZone.highlights.map((hl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Public Offering */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-0.5">পাবলিক পণ্য ও সেবা:</span>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{selectedZone.publicOffering}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectZoneForShop?.(selectedZone.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>পণ্য ও শপ দেখুন</span>
              </button>

              <button
                onClick={onBookVisit}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>পরিদর্শন বুকিং</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

// Helper: Build Procedural 3D Farm Environment
function build3DFarmScene(scene: THREE.Scene, zoneMeshesRef: React.MutableRefObject<Map<string, THREE.Object3D>>) {
  // 1. Terrain Ground
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x22c55e, 
    roughness: 0.8, 
    metalness: 0.05 
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Dirt paths connecting zones
  const pathGeo = new THREE.PlaneGeometry(3, 40);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
  const path1 = new THREE.Mesh(pathGeo, pathMat);
  path1.rotation.x = -Math.PI / 2;
  path1.position.set(0, 0.01, 0);
  scene.add(path1);

  const path2 = new THREE.Mesh(new THREE.PlaneGeometry(40, 3), pathMat);
  path2.rotation.x = -Math.PI / 2;
  path2.position.set(0, 0.01, 0);
  scene.add(path2);

  // Build Procedural 3D Models for each Zone
  FARM_ZONES.forEach(zone => {
    const group = new THREE.Group();
    group.position.set(...zone.position);
    group.userData = { zoneId: zone.id };

    if (zone.id === 'dairy_barn') {
      // 3D Dairy Barn Structure
      const barnGeo = new THREE.BoxGeometry(7, 3.5, 9);
      const barnMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
      const barn = new THREE.Mesh(barnGeo, barnMat);
      barn.position.y = 1.75;
      barn.castShadow = true;
      group.add(barn);

      // Roof
      const roofGeo = new THREE.ConeGeometry(5.5, 2, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.3 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 4.5;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      // Cows (3D Primitives)
      for (let i = 0; i < 3; i++) {
        const cow = create3DCowMesh();
        cow.position.set(-2 + i * 2, 0, 6);
        group.add(cow);
      }
    } else if (zone.id === 'goat_pen') {
      // Elevated Wooden Goat Pen
      const penGeo = new THREE.BoxGeometry(6, 2.5, 6);
      const penMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const pen = new THREE.Mesh(penGeo, penMat);
      pen.position.y = 1.75;
      group.add(pen);

      // Wooden Legs
      for (let x = -2.5; x <= 2.5; x += 5) {
        for (let z = -2.5; z <= 2.5; z += 5) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), penMat);
          leg.position.set(x, 0.5, z);
          group.add(leg);
        }
      }
    } else if (zone.id === 'poultry_pond') {
      // Poultry Shed & Duck Pond
      const pondGeo = new THREE.CylinderGeometry(4, 4, 0.2, 32);
      const pondMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.3 });
      const pond = new THREE.Mesh(pondGeo, pondMat);
      pond.position.y = 0.05;
      group.add(pond);

      const shed = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      shed.position.set(-4, 1, -2);
      group.add(shed);
    } else if (zone.id === 'fishery_pond') {
      // Large Aquaculture Pond
      const pondGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.3, 32);
      const pondMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.1, metalness: 0.5 });
      const pond = new THREE.Mesh(pondGeo, pondMat);
      pond.position.y = 0.05;
      group.add(pond);

      // Aerator
      const aerator = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      aerator.position.set(0, 0.3, 0);
      group.add(aerator);
    } else if (zone.id === 'fodder_field') {
      // Fodder Field Green Rows
      for (let i = -3; i <= 3; i += 1.5) {
        const row = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 1.2, 7),
          new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 })
        );
        row.position.set(i, 0.6, 0);
        group.add(row);
      }
    } else if (zone.id === 'visitor_center') {
      // Visitor Welcome Arch & Kiosk
      const kiosk = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3 })
      );
      kiosk.position.y = 1.5;
      group.add(kiosk);

      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.3, 8, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x6366f1 })
      );
      arch.position.set(0, 3, 2);
      group.add(arch);
    }

    // Zone Marker Beacon Light
    const beaconGeo = new THREE.CylinderGeometry(0.1, 0.8, 1, 16);
    const beaconMat = new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 0.5 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 5;
    group.add(beacon);

    scene.add(group);
    zoneMeshesRef.current.set(zone.id, group);
  });
}

function create3DCowMesh(): THREE.Group {
  const cow = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  body.position.y = 0.7;
  cow.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x854d0e }));
  head.position.set(0.8, 1, 0);
  cow.add(head);

  return cow;
}

export default Public3DFarmMap;
