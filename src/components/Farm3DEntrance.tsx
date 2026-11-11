import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, Compass, Eye, RotateCcw, Volume2, 
  VolumeX, ArrowRight, ShieldCheck, Sun
} from 'lucide-react';

export const Farm3DEntrance: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Pure crisp white background as requested
    scene.fog = new THREE.FogExp2(0xffffff, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Soft colored accent lights (terracotta warm & emerald)
    const warmLight = new THREE.PointLight(0xf97316, 2.5, 12);
    warmLight.position.set(-2.5, 3.5, 1);
    scene.add(warmLight);

    const greenAccent = new THREE.PointLight(0x10b981, 2.5, 12);
    greenAccent.position.set(2.5, 3.5, 1);
    scene.add(greenAccent);

    // 3. Ground / Pathway
    const groundGeo = new THREE.PlaneGeometry(30, 20);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0xf8fafc, 
      roughness: 0.9, 
      metalness: 0.05 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Red Terracotta Brick Pathway
    const pathGeo = new THREE.PlaneGeometry(3.6, 20);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Terracotta red
      roughness: 0.8,
    });
    const pathway = new THREE.Mesh(pathGeo, pathMat);
    pathway.rotation.x = -Math.PI / 2;
    pathway.position.y = 0.01;
    pathway.receiveShadow = true;
    scene.add(pathway);

    // 4. Traditional Bengali Terracotta Gate Arch (তোরণ)
    const gateGroup = new THREE.Group();

    // Terracotta Pillars (Left and Right)
    const pillarGeo = new THREE.BoxGeometry(0.8, 5, 0.8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Rich terracotta
      roughness: 0.7,
      metalness: 0.1
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-2.2, 2.5, 0);
    leftPillar.castShadow = true;
    gateGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(2.2, 2.5, 0);
    rightPillar.castShadow = true;
    gateGroup.add(rightPillar);

    // Pillar caps (Traditional decorative motifs)
    const capGeo = new THREE.BoxGeometry(1.1, 0.3, 1.1);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12 });
    
    const leftCap = new THREE.Mesh(capGeo, capMat);
    leftCap.position.set(-2.2, 5.15, 0);
    gateGroup.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, capMat);
    rightCap.position.set(2.2, 5.15, 0);
    gateGroup.add(rightCap);

    // Arch Crossbeam (Traditional wooden carved beam)
    const beamGeo = new THREE.BoxGeometry(5.8, 0.45, 0.9);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Teak wood
      roughness: 0.6
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 5, 0);
    beam.castShadow = true;
    gateGroup.add(beam);

    // Traditional Curved Bengali Roof (দোচালা / চারচালা ছাদ শৈলী)
    const roofCurve = new THREE.CylinderGeometry(0.2, 0.6, 5.6, 4);
    roofCurve.rotateZ(Math.PI / 2);
    roofCurve.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Forest green tile
      roughness: 0.4
    });
    const roof = new THREE.Mesh(roofCurve, roofMat);
    roof.position.set(0, 5.6, 0);
    roof.castShadow = true;
    gateGroup.add(roof);

    // Modern Glowing Solar Panel on top of roof
    const solarGeo = new THREE.BoxGeometry(4.2, 0.08, 1.2);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Solar deep blue
      metalness: 0.8,
      roughness: 0.2
    });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.set(0, 5.9, 0);
    gateGroup.add(solar);

    // Welcome Signboard (RS KHAMAR - আর এস খামার)
    const signGeo = new THREE.BoxGeometry(3.6, 0.7, 0.15);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep emerald
      roughness: 0.3
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4.3, 0);
    gateGroup.add(sign);

    // Colorful Hanging Festoon Flags (রঙিন তোরণ ও মঙ্গল পতাকা)
    const flagColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0x8b5cf6];
    const flagsGroup = new THREE.Group();
    for (let i = -5; i <= 5; i++) {
      const flagGeo = new THREE.ConeGeometry(0.12, 0.3, 3);
      flagGeo.rotateX(Math.PI);
      const flagMat = new THREE.MeshStandardMaterial({
        color: flagColors[Math.abs(i) % flagColors.length],
        roughness: 0.5
      });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(i * 0.45, 3.8 - Math.abs(i) * 0.04, 0.1);
      flagsGroup.add(flag);
    }
    gateGroup.add(flagsGroup);

    // Traditional Bengali Brass Lanterns (লণ্ঠন)
    const lanternGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 8);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.4
    });

    const leftLantern = new THREE.Mesh(lanternGeo, lanternMat);
    leftLantern.position.set(-2.2, 3.6, 0.5);
    gateGroup.add(leftLantern);

    const rightLantern = new THREE.Mesh(lanternGeo, lanternMat);
    rightLantern.position.set(2.2, 3.6, 0.5);
    gateGroup.add(rightLantern);

    // Green Bush / Flower Beds on sides
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 }); // Pink flowers
    
    for (let j = 0; j < 6; j++) {
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + (j % 2) * 0.1), bushMat);
      bush.position.set(-2.8 - (j % 2) * 0.4, 0.4, j * 1.5 - 2);
      bush.castShadow = true;
      gateGroup.add(bush);

      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
      flower.position.set(-2.8 - (j % 2) * 0.4, 0.85, j * 1.5 - 2);
      gateGroup.add(flower);

      const rightBush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + (j % 2) * 0.1), bushMat);
      rightBush.position.set(2.8 + (j % 2) * 0.4, 0.4, j * 1.5 - 2);
      rightBush.castShadow = true;
      gateGroup.add(rightBush);

      const rightFlower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
      rightFlower.position.set(2.8 + (j % 2) * 0.4, 0.85, j * 1.5 - 2);
      gateGroup.add(rightFlower);
    }

    scene.add(gateGroup);

    // 5. Floating Prosperity Particles (সোনালী ও সবুজ কণা)
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = Math.random() * 5 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle wind sway on flags
      flagsGroup.children.forEach((flag, idx) => {
        flag.rotation.x = Math.sin(elapsed * 3 + idx * 0.5) * 0.18;
      });

      // Floating lantern flicker
      warmLight.intensity = 2.2 + Math.sin(elapsed * 4) * 0.4;
      greenAccent.intensity = 2.2 + Math.cos(elapsed * 3.5) * 0.4;

      // Slow particle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.006;
        if (positions[i] > 6) positions[i] = 0.5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smooth camera sway
      const targetX = Math.sin(elapsed * 0.4) * 0.8;
      const targetY = 3.6 + Math.cos(elapsed * 0.3) * 0.2;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 3.2, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 340;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      className="relative rounded-[2.5rem] bg-white border border-slate-200/90 shadow-xl overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onExplore}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-72 sm:h-84 relative z-0" />

      {/* Floating Traditional + Modern Welcome Banner Overlay */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ঐতিহ্য ও প্রযুক্তির প্রবেশদ্বার
          </span>
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold border border-slate-200 shadow-sm hidden sm:inline">
            ৩ডি থ্রি-ডাইমেনশনাল ভিউ
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2 drop-shadow-sm">
          স্বাগতম আর এস সৌখিন খামারে
        </h3>
        <p className="text-xs text-slate-600 font-medium max-w-sm mt-0.5 hidden sm:block">
          টেরাকোটা ও কাঠের আবহমান বাংলার শৈল্পিক স্থাপত্য এবং পরিবেশবান্ধব সৌরবিদ্যুৎ পরিচালিত স্মার্ট খামার প্রাঙ্গণ
        </p>
      </div>

      {/* Bottom CTA Bar */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-bold text-slate-700 bg-white/95 px-3 py-1 rounded-full shadow-sm border border-slate-200">
            গেটে ক্লিক করে পুরো খামার পরিদর্শন করুন
          </span>
        </div>

        <button 
          onClick={onExplore}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 pointer-events-auto cursor-pointer transition-all transform hover:scale-105"
        >
          <span>খামারে প্রবেশ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
