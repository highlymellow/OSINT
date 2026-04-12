import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";
import React from "react";

export const Circle = ({ className, children, idx, ...rest }: any) => {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.5 }}
      style={{
        border: `1px solid rgba(201, 168, 76, ${1 - (idx + 1) * 0.1})`, // Gold base
        ...rest.style
      }}
      className={twMerge(
        "absolute inset-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const Radar = ({ className }: { className?: string }) => {
  const circles = new Array(8).fill(1);
  return (
    <div
      className={twMerge(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        className
      )}
    >
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(20deg); }
          to   { transform: rotate(380deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 8s linear infinite;
        }
      `}</style>
      
      {/* Rotating sweep line */}
      <div
        style={{ transformOrigin: "right center" }}
        className="animate-radar-spin absolute right-1/2 top-1/2 z-40 flex h-[5px] w-[500px] items-end justify-center overflow-hidden bg-transparent pointer-events-none"
      >
        {/* Sweep gradient beam customized to Meridian Gold */}
        <div className="relative z-40 h-[1.5px] w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
      </div>
      
      {/* Sweep area glow */}
      <div
        style={{ transformOrigin: "right center" }}
        className="animate-radar-spin absolute right-1/2 top-1/2 z-30 flex h-[200px] w-[500px] items-end justify-center overflow-hidden bg-transparent pointer-events-none"
      >
        <div className="relative h-full w-full bg-[conic-gradient(from_270deg_at_100%_100%,transparent_0deg,rgba(201,168,76,0.15)_30deg,transparent_60deg)] opacity-60" />
      </div>

      {/* Concentric circles */}
      {circles.map((_, idx) => (
        <Circle
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`,
          }}
          key={`circle-${idx}`}
          idx={idx}
        />
      ))}
    </div>
  );
};

export const IconContainer = ({
  icon,
  text,
  delay,
}: {
  icon?: React.ReactNode;
  text?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: delay ?? 0 }}
      className="relative z-50 flex flex-col items-center justify-center space-y-2"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-surface shadow-inner shadow-gold/10 hover:border-gold/60 transition-colors backdrop-blur-md">
        {icon}
      </div>
      <div className="hidden rounded-md px-2 py-1 md:block bg-background/50 backdrop-blur-sm border border-border/40 mt-2">
        <div className="text-center text-[10px] font-bold tracking-wider uppercase text-gold">
          {text}
        </div>
      </div>
    </motion.div>
  );
};
