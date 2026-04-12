import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app';

interface DottedSurfaceProps extends React.ComponentProps<'canvas'> {}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let count = 0;

    const AMOUNTX = 40;
    const AMOUNTY = 60;
    const SEPARATION = 150;

    // Camera settings roughly matching the provided ThreeJS perspective
    const cameraY = 355;
    const cameraZ = 1220;
    const focalLength = 1000;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw all points
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
          const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

          // Only draw points in front of the camera
          const depth = cameraZ - z;
          if (depth <= 0) continue;

          // Animate Y position with sine waves
          const y = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;

          // 3D Perspective Projection
          const scale = focalLength / depth;

          const projectedX = centerX + x * scale;
          // In screen coordinates, positive Y is down. 
          // Camera is at +355 relative to the point.
          // Point is at y relative to 0. Real height difference is (y - cameraY).
          const projectedY = centerY - (y - cameraY) * scale;

          const size = Math.max(0.5, 3 * scale);

          // Calculate fog/opacity based on depth
          // Fog ranges from 2000 to 10000 in threejs.
          const depthDist = Math.sqrt(x*x + Math.pow(cameraY-y, 2) + depth*depth);
          let fogFactor = 1 - (depthDist - 1000) / 4000;
          fogFactor = Math.max(0, Math.min(0.8, fogFactor));

          if (fogFactor <= 0) continue;

          ctx.beginPath();
          ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
          // Assuming Dark Theme as platform default
          ctx.fillStyle = `rgba(201, 168, 76, ${fogFactor * 0.5})`; // Gold tinted
          ctx.fill();
        }
      }

      count += 0.1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none fixed inset-0 z-0 mix-blend-screen opacity-40', className)}
      {...props}
    />
  );
}
