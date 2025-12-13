'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


interface ComponentModel {
  id: string;
  code: string;
  label: string;
}

interface MultiComponentViewer3DProps {
  models: ComponentModel[];
  className?: string;
}

export function MultiComponentViewer3D({ models, className }: MultiComponentViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || models.length === 0) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const canvas = renderer.domElement;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(canvas);

    // Grid and Helpers
    const gridHelper = new THREE.GridHelper(20, 20, 0xdddddd, 0xe0e0e0);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // Group to hold all components for centering
    const modelsGroup = new THREE.Group();
    scene.add(modelsGroup);

    // Generate meshes and position them
    let currentX = 0;
    const GAP = 2; // Minimum gap between components

    models.forEach((model, index) => {
      try {
        // Execute code to generate mesh
        const functionBody = `
          ${model.code}
          if (typeof mesh !== 'undefined') return mesh;
          return null;
        `;
        const createMesh = new Function('THREE', functionBody);
        const mesh = createMesh(THREE);

        if (mesh && mesh instanceof THREE.Object3D) {
          // Compute bounding box to handle spacing
          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = new THREE.Vector3();
          bbox.getSize(size);
          
          // Center the mesh vertically on the grid (assuming Y is up and origin is bottom or center)
          // Adjust so it sits ON the grid if possible, or just gather them.
          // Usually generated meshes might be centered on (0,0,0).
          
          // Position usage: 
          // 1. Center the mesh component itself locally if needed (complex without modifying geometry)
          // 2. Wrap in a group to offset
          
          const wrapper = new THREE.Group();
          wrapper.add(mesh);
          
          // Position wrapper
          // We place them along the X axis.
          // Calculate shift based on previous position + half of previous width + half of current width + gap
          // For simplicity, we just accumulate X.
          
          // Let's optimize: Start from 0, accumulate Width + Gap.
          // But we need to center the mesh in its slot.
          // Bbox center offset:
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          
          // Shift mesh inside wrapper to rectify its local origin to its visual center (optional but good)
          mesh.position.sub(center); 
          // Now mesh is centered at wrapper's origin (0,0,0).
          // Lift it up so bottom is at y=0?
          mesh.position.y += size.y / 2;

          wrapper.position.x = currentX;
          modelsGroup.add(wrapper);
          
          // Add Text Label (simple sprite or just rely on UI? User said "put 3D model in the same frame")
          // 3D text is heavy. Let's skip text inside 3D for now, relying on order.
          // OR use a simple sprite.
          
          currentX += Math.max(size.x, size.z, 2) + GAP; // Move X cursor
        }
      } catch (err) {
        console.error(`Error generating mesh for ${model.id}:`, err);
      }
    });

    // Center the whole group
    const groupBbox = new THREE.Box3().setFromObject(modelsGroup);
    const groupCenter = new THREE.Vector3();
    groupBbox.getCenter(groupCenter);
    modelsGroup.position.x = -groupCenter.x;
    modelsGroup.position.z = -groupCenter.z; // Center depth as well

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    
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
    };
  }, [models]);

  return <div ref={containerRef} className={`rounded-lg border bg-muted/10 overflow-hidden ${className}`} />;
}
