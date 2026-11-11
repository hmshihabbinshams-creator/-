import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  ZoomIn, ZoomOut, Sun, Moon, Sunrise, Sunset, Volume2, VolumeX, 
  RotateCcw, Compass, Eye, CheckCircle2, ShoppingBag, Info,
  Edit3, MousePointer2, Trash2, Plus, Save, X, Box, Trees, Map as MapIcon, Activity
} from 'lucide-react';
import { farmStore } from '../services/farmStore';
import { FarmObject } from '../types';

type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';
type CameraView = 'overview' | 'cows' | 'goats' | 'pond' | 'haystack' | 'birds';

interface SelectedTarget {
  name: string;
  category: string;
  breed: string;
  yieldInfo: string;
  diet: string;
  health: string;
  approxValue: string;
}

export const Farm3DViewer: React.FC<{ 
  onExploreShop?: () => void,
  onSelectAnimal?: (id: string) => void
}> = ({ onExploreShop, onSelectAnimal }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [activeView, setActiveView] = useState<CameraView>('overview');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedObjectType, setSelectedObjectType] = useState<FarmObject['type']>('barn');
  const [farmObjects, setFarmObjects] = useState<FarmObject[]>(farmStore.getFarmObjects());

  const [selectedItem, setSelectedItem] = useState<SelectedTarget>({
    name: 'আর এস কেন্দ্রীয় গোশালা ও প্যাস্টোর',
    category: 'কেন্দ্রীয় খামার চত্বর',
    breed: 'উচ্চ উৎপাদনশীল সংকর ও দেশি প্রজাতি',
    yieldInfo: 'দৈনিক ১৩০+ লিটার দুধ ও ৪৫০+ ডিম',
    diet: 'নেপিয়ার ঘাস, ভুট্টা সাইলেজ ও খড়',
    health: '১০০% ভেটেরিনারি সার্টিফাইড',
    approxValue: 'প্রাকৃতিক ও সম্পূর্ণ স্বাস্থ্যকর'
  });

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Camera presets
  const cameraPresets: Record<CameraView, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
    overview: { pos: new THREE.Vector3(0, 16, 26), target: new THREE.Vector3(0, 2, 0) },
    cows: { pos: new THREE.Vector3(8, 5, 4), target: new THREE.Vector3(6, 2, -2) },
    goats: { pos: new THREE.Vector3(-6, 4, 10), target: new THREE.Vector3(-3, 1.5, 6) },
    pond: { pos: new THREE.Vector3(-14, 4, -4), target: new THREE.Vector3(-10, 0.5, -8) },
    haystack: { pos: new THREE.Vector3(12, 5, 12), target: new THREE.Vector3(8, 2, 8) },
    birds: { pos: new THREE.Vector3(-12, 4, 4), target: new THREE.Vector3(-9, 2, 2) },
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      setIsAudioPlaying(false);
    } else {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
        // (Simplified audio logic for space)
      } else {
        audioCtxRef.current.resume();
      }
      setIsAudioPlaying(true);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const timeConfigs = {
      dawn: { bg: 0xffedd5, fog: 0xfed7aa, hemiSky: 0xfde68a, hemiGround: 0x166534, dirLight: 0xfb923c, dirInt: 2.8, rotY: 0.8 },
      day: { bg: 0xe0f2fe, fog: 0xbae6fd, hemiSky: 0xffffff, hemiGround: 0x14532d, dirLight: 0xffedd5, dirInt: 3.8, rotY: 1.2 },
      sunset: { bg: 0x451a03, fog: 0x7c2d12, hemiSky: 0xf97316, hemiGround: 0x1e293b, dirLight: 0xea580c, dirInt: 3.2, rotY: 0.3 },
      night: { bg: 0x050c18, fog: 0x0a192f, hemiSky: 0x38bdf8, hemiGround: 0x022c22, dirLight: 0x60a5fa, dirInt: 1.4, rotY: 2.4 },
    };
    const currentCfg = timeConfigs[timeOfDay];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(currentCfg.bg);
    scene.fog = new THREE.FogExp2(currentCfg.fog, 0.012);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.copy(cameraPresets[activeView].pos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.copy(cameraPresets[activeView].target);
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.HemisphereLight(currentCfg.hemiSky, currentCfg.hemiGround, timeOfDay === 'night' ? 1.2 : 2.5));
    const sunLight = new THREE.DirectionalLight(currentCfg.dirLight, currentCfg.dirInt);
    sunLight.position.set(24, 32, 24);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: timeOfDay === 'night' ? 0x063828 : 0x15803d })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Grid Helper for Edit Mode
    if (isEditMode) {
      const grid = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
      grid.position.y = 0.01;
      (grid.material as any).opacity = 0.2;
      (grid.material as any).transparent = true;
      scene.add(grid);
    }

    // Helper to create object meshes based on type
    const createObjectMesh = (obj: FarmObject) => {
      let mesh: THREE.Group | THREE.Mesh;
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.7 });

      switch (obj.type) {
        case 'barn':
          mesh = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 8), mat);
          body.position.y = 2;
          body.castShadow = true;
          mesh.add(body);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 3, 4), new THREE.MeshStandardMaterial({ color: 0x7c2d12 }));
          roof.position.y = 5.5;
          roof.rotation.y = Math.PI / 4;
          mesh.add(roof);
          break;
        case 'cow':
          mesh = new THREE.Group();
          const cowBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 2), new THREE.MeshStandardMaterial({ color: 0xf5ebe0 }));
          cowBody.position.y = 1;
          mesh.add(cowBody);
          const cowHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xf5ebe0 }));
          cowHead.position.set(0, 1.4, 1.2);
          mesh.add(cowHead);
          break;
        case 'goat':
          mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.4), new THREE.MeshStandardMaterial({ color: 0x18181b }));
          mesh.position.y = 0.35;
          break;
        case 'hay':
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
          mesh.position.y = 1.25;
          break;
        case 'tree':
          mesh = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
          trunk.position.y = 2;
          mesh.add(trunk);
          const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshStandardMaterial({ color: 0x166534 }));
          leaves.position.y = 4.5;
          mesh.add(leaves);
          break;
        case 'fish':
          mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
          mesh.scale.set(1.5, 0.6, 1);
          mesh.position.y = 0.15;
          break;
        case 'pond':
          mesh = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.8 }));
          mesh.position.y = 0.05;
          break;
        default:
          mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
          mesh.position.y = 0.5;
      }
      
      mesh.position.set(obj.position.x, mesh.position.y + obj.position.y, obj.position.z);
      mesh.rotation.y = obj.rotation;
      mesh.scale.set(obj.scale, obj.scale, obj.scale);
      mesh.userData = { id: obj.id, type: obj.type };
      return mesh;
    };

    // Render Saved Farm Objects
    farmObjects.forEach(obj => {
      scene.add(createObjectMesh(obj));
    });

    // Interaction logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (isEditMode) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
          const pt = intersects[0].point;
          const newObj: FarmObject = {
            id: `obj-${Date.now()}`,
            type: selectedObjectType,
            position: { x: Math.round(pt.x), y: 0, z: Math.round(pt.z) },
            rotation: 0,
            scale: 1
          };
          const updated = [...farmObjects, newObj];
          setFarmObjects(updated);
          farmStore.addFarmObject(newObj);
        }
      } else {
        const intersects = raycaster.intersectObjects(scene.children, true);
        for (const hit of intersects) {
          if (hit.object.name === 'ground') continue;
          let cur: any = hit.object;
          while (cur && !cur.userData?.id && cur.parent) cur = cur.parent;
          if (cur && cur.userData?.id) {
             const isAnimal = ['cow', 'goat', 'duck', 'chicken', 'quail', 'fish'].includes(cur.userData.type);
             if (isAnimal && onSelectAnimal) {
               onSelectAnimal(cur.userData.id);
             } else {
               setSelectedItem({
                 name: `খামার উপাদান: ${cur.userData.type}`,
                 category: 'ভার্চুয়াল মডেল',
                 breed: 'কাস্টম প্লেসমেন্ট',
                 yieldInfo: 'সক্রিয় উপাদান',
                 diet: 'N/A',
                 health: 'চমৎকার',
                 approxValue: 'প্রাইসলেস'
               });
             }
             break;
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('click', handleMouseClick);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [timeOfDay, activeView, isEditMode, selectedObjectType, farmObjects]);

  const handleClearFarm = () => {
    if (confirm('আপনি কি নিশ্চিত যে পুরো খামারLayout মুছে ফেলবেন?')) {
      setFarmObjects([]);
      farmStore.setFarmObjects([]);
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-[3rem] overflow-hidden border border-emerald-200 dark:border-emerald-900 shadow-2xl bg-slate-100 dark:bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Control Overlays */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border border-emerald-100 dark:border-slate-800">
           <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
             <MapIcon className="w-4 h-4 text-emerald-500" />
             আর এস ভার্চুয়াল খামার এডিটর
           </h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">৩ডি এনভায়রনমেন্ট কাস্টমাইজ করুন</p>
        </div>

        {isEditMode && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-emerald-100 dark:border-slate-800 space-y-4 animate-in slide-in-from-left-4 duration-300">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">উপাদান নির্বাচন</p>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'barn', label: 'গোশালা', icon: Box },
                  { id: 'cow', label: 'গরু', icon: ShoppingBag },
                  { id: 'goat', label: 'ছাগল', icon: Activity },
                  { id: 'fish', label: 'মাছ', icon: MapIcon },
                  { id: 'pond', label: 'পুকুর', icon: Trees },
                  { id: 'hay', label: 'খড়ের গাদা', icon: Box },
                  { id: 'tree', label: 'গাছ', icon: Trees },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedObjectType(item.id as any)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all border ${
                      selectedObjectType === item.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[9px] font-black">{item.label}</span>
                  </button>
                ))}
             </div>
             <button 
              onClick={handleClearFarm}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
             >
               <Trash2 className="w-3.5 h-3.5" />
               ক্লিয়ার অল
             </button>
          </div>
        )}
      </div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
         <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button onClick={() => setTimeOfDay('day')} className={`p-2 rounded-xl ${timeOfDay === 'day' ? 'bg-amber-100 text-amber-600' : 'text-slate-400'}`}><Sun className="w-4 h-4" /></button>
            <button onClick={() => setTimeOfDay('night')} className={`p-2 rounded-xl ${timeOfDay === 'night' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><Moon className="w-4 h-4" /></button>
         </div>

         <button 
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-xl ${
            isEditMode 
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' 
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800'
          }`}
         >
           {isEditMode ? <><Save className="w-4 h-4" /> এডিট সেভ করুন</> : <><Edit3 className="w-4 h-4" /> খামার এডিট করুন</>}
         </button>
      </div>

      {!isEditMode && (
        <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
           <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-emerald-100 dark:border-slate-800 w-80">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedItem.category}</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedItem.name}</h4>
              <div className="mt-4 grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                    <p className="text-[8px] text-slate-400 uppercase font-black">ওজন/ফলন</p>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{selectedItem.yieldInfo}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                    <p className="text-[8px] text-slate-400 uppercase font-black">স্বাস্থ্য</p>
                    <p className="text-[10px] font-bold text-emerald-600">{selectedItem.health}</p>
                 </div>
              </div>
           </div>
           
           <div className="pointer-events-auto flex flex-col gap-2">
              <button 
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.set(0, 16, 26);
                    controlsRef.current.target.set(0, 2, 0);
                    controlsRef.current.update();
                  }
                  setActiveView('overview');
                }} 
                className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-white transition-all cursor-pointer"
                title="ক্যামেরা রিসেট"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.multiplyScalar(0.85);
                    controlsRef.current.update();
                  }
                }} 
                className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-white transition-all cursor-pointer"
                title="জুম ইন"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (cameraRef.current && controlsRef.current) {
                    cameraRef.current.position.multiplyScalar(1.15);
                    controlsRef.current.update();
                  }
                }} 
                className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-white transition-all cursor-pointer"
                title="জুম আউট"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
