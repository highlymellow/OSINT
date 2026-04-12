import React, { useEffect, useRef } from 'react';

export const GlitchOrb = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !grainCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const grainCanvas = grainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const grainCtx = grainCanvas.getContext('2d');
    
    if (!ctx || !grainCtx) return;
    
    const density = ' .:-=+*#%@';
    
    const params = {
      rotation: 0,
      atmosphereShift: 0,
      glitchIntensity: 0,
      glitchFrequency: 0
    };

    // Native Scroll Tracker Replacement for GSAP ScrollTrigger
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, window.scrollY / (scrollHeight || 1)));
        scrollProgressRef.current = progress;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Film grain generation
    const generateFilmGrain = (width: number, height: number, intensity = 0.15) => {
      if (!grainCtx) return null;
      const imageData = grainCtx.createImageData(width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 1] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 2] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 3] = Math.abs(grain) * 3;
      }
      
      return imageData;
    };

    // Glitch effect functions
    const drawGlitchedOrb = (centerX: number, centerY: number, radius: number, hue: number, time: number, glitchIntensity: number) => {
      if (!ctx) return;
      ctx.save();
      
      const shouldGlitch = Math.random() < 0.1 && glitchIntensity > 0.5;
      const glitchOffset = shouldGlitch ? (Math.random() - 0.5) * 20 * glitchIntensity : 0;
      const glitchScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.3 * glitchIntensity : 1;
      
      if (shouldGlitch) {
        ctx.translate(glitchOffset, glitchOffset * 0.8);
        ctx.scale(glitchScale, 1 / glitchScale);
      }
      
      // Transparent Radial so it blends with GLSLHills underneath
      const orbGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 1.5
      );
      
      orbGradient.addColorStop(0, `hsla(${hue + 10}, 100%, 95%, 0.8)`);
      orbGradient.addColorStop(0.2, `hsla(${hue + 20}, 90%, 80%, 0.5)`);
      orbGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.2)`);
      orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = orbGradient;
      ctx.fillRect(centerX - radius*2, centerY - radius*2, radius*4, radius*4);
      
      // Bright center circle with glitch
      const centerRadius = radius * 0.3;
      ctx.fillStyle = `hsla(${hue + 20}, 100%, 95%, 0.8)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Glitch effects on the orb
      if (shouldGlitch) {
        ctx.globalCompositeOperation = 'screen';
        
        ctx.fillStyle = `hsla(100, 100%, 50%, ${0.6 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(centerX + glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `hsla(240, 100%, 50%, ${0.5 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(centerX - glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * glitchIntensity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = centerY - radius + (Math.random() * radius * 2);
          const startX = centerX - radius + Math.random() * 20;
          const endX = centerX + radius - Math.random() * 20;
          
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
          ctx.stroke();
        }
        
        ctx.fillStyle = `rgba(255, 0, 255, ${0.4 * glitchIntensity})`;
        for (let i = 0; i < 3; i++) {
          const blockX = centerX - radius + Math.random() * radius * 2;
          const blockY = centerY - radius + Math.random() * radius * 2;
          const blockSize = Math.random() * 10 + 2;
          ctx.fillRect(blockX, blockY, blockSize, blockSize);
        }
      }
      
      ctx.strokeStyle = `hsla(${hue + 20}, 80%, 70%, 0.6)`;
      ctx.lineWidth = 2;
      
      if (shouldGlitch) {
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          const startAngle = (i / segments) * Math.PI * 2;
          const endAngle = ((i + 1) / segments) * Math.PI * 2;
          const ringRadius = radius * 1.2 + (Math.random() - 0.5) * 10 * glitchIntensity;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      if (shouldGlitch && Math.random() < 0.3) {
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * glitchIntensity})`;
        
        for (let i = 0; i < 3; i++) {
          const barY = centerY - radius + Math.random() * radius * 2;
          const barHeight = Math.random() * 5 + 1;
          ctx.fillRect(centerX - radius, barY, radius * 2, barHeight);
        }
        
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.restore();
    };

    function render() {
      // Simulate GSAP parametric tweens with native math
      timeRef.current += 0.016;
      const time = timeRef.current;
      
      params.rotation = (time / 20) * Math.PI * 2;
      params.atmosphereShift = Math.sin(time / 2);
      params.glitchIntensity = Math.random() > 0.95 ? Math.random() * 1.5 : 0.2;
      
      if (!ctx || !grainCtx) return;
      
      const width = canvas.width = grainCanvas.width = window.innerWidth;
      const height = canvas.height = grainCanvas.height = window.innerHeight;
      
      // CLEAR RECT instead of fill rect so the GLSLHills background underneath shows through perfectly
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const scrollOffset = scrollProgressRef.current * 300;
      const centerY = (height / 2) - scrollOffset * 0.5; 
      const radius = Math.min(width, height) * 0.2;
      
      // We use base hue 40 (Gold/Amber) to match the MERIDIAN theme
      // Atmospheric shift creates subtle pulsing between deep amber and bright gold
      const hue = 40 + params.atmosphereShift * 10 - (scrollProgressRef.current * 15);
      
      // Draw glitched orb
      drawGlitchedOrb(centerX, centerY, radius, hue, time, params.glitchIntensity);
      
      // ASCII sphere particles
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const spacing = 9;
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      
      for (let i = 0; i < cols && i < 150; i++) {
        for (let j = 0; j < rows && j < 100; j++) {
          const x = (i - cols / 2) * spacing + centerX;
          const y = (j - rows / 2) * spacing + centerY;
          
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < radius && Math.random() > 0.4) {
            const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy));
            const rotZ = dx * Math.sin(params.rotation) + z * Math.cos(params.rotation);
            const brightness = (rotZ + radius) / (radius * 2);
            
            if (rotZ > -radius * 0.3) {
              const charIndex = Math.floor(brightness * (density.length - 1));
              let char = density[charIndex];
              
              if (dist < radius * 0.8 && params.glitchIntensity > 0.8 && Math.random() < 0.3) {
                const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '■', '□'];
                char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }
              
              const alpha = Math.max(0.1, brightness);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.fillText(char, x, y);
            }
          }
        }
      }
      
      // Grain Overlay rendering
      grainCtx.clearRect(0, 0, width, height);
      const grainIntensity = 0.15 + Math.sin(time * 10) * 0.03;
      const grainImageData = generateFilmGrain(width, height, grainIntensity);
      if (grainImageData) grainCtx.putImageData(grainImageData, 0, 0);
      
      // Enhanced grain during glitch
      if (params.glitchIntensity > 0.5) {
        grainCtx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 3 + 0.5;
          const opacity = Math.random() * 0.5 * params.glitchIntensity;
          
          grainCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          grainCtx.beginPath();
          grainCtx.arc(x, y, size, 0, Math.PI * 2);
          grainCtx.fill();
        }
      }
      
      frameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={grainCanvasRef}
        className="absolute inset-0 w-full h-full mix-blend-overlay opacity-60"
      />
    </div>
  );
};
