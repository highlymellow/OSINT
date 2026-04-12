import React from 'react';

export interface GradientBarsProps {
  numBars?: number;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  className?: string;
}

export const GradientBars: React.FC<GradientBarsProps> = ({
  numBars = 11,
  gradientFrom = 'rgba(201, 168, 76, 0.15)', // Meridian Gold base
  gradientTo = 'transparent',
  animationDuration = 2,
  className = '',
}) => {
  const calculateHeight = (index: number, total: number) => {
    // Distribute bars in a smooth curved wave
    const position = index / (total - 1);
    const maxHeight = 100;
    const minHeight = 20;
    
    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.3); // Curve exponent
    
    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <>
      <style>{`
        @keyframes pulseBar {
          0% { transform: scaleY(var(--initial-scale)); }
          100% { transform: scaleY(calc(var(--initial-scale) * 0.6)); }
        }
      `}</style>
      
      <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
        <div 
          className="flex h-full w-full justify-between items-end gap-1 opacity-60"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {Array.from({ length: numBars }).map((_, index) => {
            const height = calculateHeight(index, numBars);
            return (
              <div
                key={index}
                style={{
                  flex: `1 1 0`,
                  height: '100%',
                  background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
                  transform: `scaleY(${height / 100})`,
                  transformOrigin: 'bottom',
                  animation: `pulseBar ${animationDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${index * 0.15}s`,
                  // @ts-ignore
                  '--initial-scale': height / 100,
                  borderRadius: '4px 4px 0 0',
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
