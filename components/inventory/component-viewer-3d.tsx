'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ComponentViewer3DProps {
  code?: string;
  className?: string;
}

export function ComponentViewer3D({ code, className }: ComponentViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); 

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const canvas = renderer.domElement;
    containerRef.current.innerHTML = ''; // Clear any previous canvas
    containerRef.current.appendChild(canvas);

    // Grid to give context
    const gridHelper = new THREE.GridHelper(10, 10, 0xdddddd, 0xe0e0e0);
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Safe execution of generating code
    try {
      const functionBody = `
        ${code}
        if (typeof mesh !== 'undefined') return mesh;
        return null;
      `;
      
      const createMesh = new Function('THREE', functionBody);
      const mesh = createMesh(THREE);

      if (mesh && mesh instanceof THREE.Object3D) {
        scene.add(mesh);
        
        // Optional: Auto-center or fit to view could go here
        // For now, we assume the code generates centered geometry
      }
    } catch (err) {
      console.error('Error executing 3D code:', err);
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      // Canvas is removed by innerHTML clear on next run
    };
  }, [code]);

  if (!code) {
    return (
      <div className={`flex items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground ${className}`}>
        No 3D model available
      </div>
    );
  }

  return <div ref={containerRef} className={`rounded-lg border bg-muted/10 overflow-hidden ${className}`} />;
}
