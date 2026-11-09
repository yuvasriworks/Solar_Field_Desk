import React from 'react';
import { Sun, Zap, Cloud, Sparkles, Activity } from 'lucide-react';

export const SunGlow = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-28 h-28 bg-yellow-300/40 rounded-full blur-2xl animate-pulse-glow" />
    <div className="absolute w-20 h-20 bg-amber-400/50 rounded-full blur-md" />
    <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 rounded-full shadow-lg flex items-center justify-center animate-spin-slow">
      <Sun className="w-10 h-10 text-amber-600 drop-shadow-md" />
    </div>
  </div>
);

export const FloatingCloud = ({ className = "", speed = "slow", top = "10%", delay = "0s" }) => (
  <div
    className={`absolute pointer-events-none select-none ${className} ${
      speed === "fast" ? "animate-cloud-fast" : "animate-cloud-slow"
    }`}
    style={{ top, animationDelay: delay }}
  >
    <div className="relative flex items-center">
      <div className="w-24 h-8 bg-white/70 backdrop-blur-sm rounded-full shadow-sm" />
      <div className="absolute -top-4 left-4 w-12 h-12 bg-white/80 rounded-full shadow-sm" />
      <div className="absolute -top-6 left-10 w-14 h-14 bg-white/85 rounded-full shadow-sm" />
    </div>
  </div>
);

export const EnergyParticle = ({ style }) => (
  <div
    className="absolute pointer-events-none text-solar-yellow animate-particle-up"
    style={style}
  >
    <Zap className="w-4 h-4 fill-solar-yellow/80 drop-shadow" />
  </div>
);

export const FloatingSolarPanel = ({ className = "" }) => (
  <div className={`relative group animate-float-medium ${className}`}>
    {/* 3D Solar Panel Isometric Grid SVG */}
    <svg
      viewBox="0 0 200 150"
      className="w-48 h-36 filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="solarGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#0284C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0F2A43" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="metalFrame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Mounting Legs */}
      <polygon points="40,110 50,140 60,140 50,110" fill="#64748B" />
      <polygon points="150,110 160,140 170,140 160,110" fill="#64748B" />
      <rect x="40" y="136" width="130" height="6" rx="3" fill="#475569" />

      {/* Frame */}
      <polygon points="20,100 100,125 180,90 100,65" fill="url(#metalFrame)" stroke="#CBD5E1" strokeWidth="2" />
      {/* Blue Photovoltaic Glass Surface */}
      <polygon points="24,98 100,122 176,88 100,68" fill="url(#solarGlass)" />

      {/* Grid Lines (Solar Cells) */}
      <path d="M 43,90 L 119,73 M 62,83 L 138,66 M 81,75 L 157,58" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.4" />
      <path d="M 62,104 L 138,78 M 43,98 L 119,72" stroke="#BAE6FD" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="100" y1="68" x2="100" y2="122" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="3,2" />

      {/* Sun Glare Reflection */}
      <polygon points="35,92 70,78 60,75 25,88" fill="white" fillOpacity="0.3" />
    </svg>

    {/* Small energy badge */}
    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-solar-yellow to-amber-400 text-solar-navy text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 animate-bounce">
      <Zap className="w-3 h-3 fill-solar-navy" />
      <span>Clean PV</span>
    </div>
  </div>
);

export const SolarHeroScene = () => {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 via-cyan-300/30 to-amber-300/20 rounded-full blur-3xl" />

      {/* Floating Sun */}
      <div className="absolute top-4 right-10 z-20">
        <SunGlow />
      </div>

      {/* Floating Background Clouds */}
      <div className="absolute top-12 left-6 z-10 animate-float-slow">
        <div className="flex items-center space-x-1 bg-white/75 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/80">
          <Cloud className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-semibold text-solar-navy">100% Zero Emission</span>
        </div>
      </div>

      {/* Center 3D Modern Solar House Illustration */}
      <div className="relative z-10 animate-float-slow">
        <svg viewBox="0 0 320 280" className="w-80 sm:w-96 drop-shadow-2xl">
          <defs>
            <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#0C4A6E" />
            </linearGradient>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="lawnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>

          {/* Grass Landscape Island */}
          <ellipse cx="160" cy="235" rx="140" ry="38" fill="url(#lawnGrad)" opacity="0.9" />
          <ellipse cx="160" cy="245" rx="140" ry="25" fill="#15803D" opacity="0.3" />

          {/* House Structure */}
          {/* Main Wall */}
          <rect x="70" y="130" width="180" height="95" rx="8" fill="url(#wallGrad)" stroke="#CBD5E1" strokeWidth="2" />

          {/* Glass Door */}
          <rect x="135" y="165" width="50" height="60" rx="4" fill="#38BDF8" fillOpacity="0.25" stroke="#0284C7" strokeWidth="2" />
          <line x1="160" y1="165" x2="160" y2="225" stroke="#0284C7" strokeWidth="1.5" />
          
          {/* Windows with Sun Glare */}
          <rect x="85" y="150" width="35" height="40" rx="4" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
          <rect x="200" y="150" width="35" height="40" rx="4" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />

          {/* Rooftop Base */}
          <polygon points="160,50 45,135 275,135" fill="url(#roofGrad)" />

          {/* Installed Rooftop Solar Panels */}
          {/* Left Panel */}
          <polygon points="150,68 85,115 125,125 155,75" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="117" y1="91" x2="140" y2="100" stroke="#FACC15" strokeWidth="1" />
          {/* Right Panel */}
          <polygon points="165,75 195,125 235,115 170,68" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="180" y1="100" x2="203" y2="91" stroke="#FACC15" strokeWidth="1" />

          {/* Inverter Box on Wall */}
          <rect x="255" y="160" width="18" height="28" rx="2" fill="#0F2A43" />
          <circle cx="264" cy="170" r="3" fill="#22C55E" className="animate-ping" />
        </svg>

        {/* Floating Technician Status Pill */}
        <div className="absolute -bottom-4 right-2 bg-white/90 backdrop-blur-md border border-solar-sky px-4 py-2 rounded-2xl shadow-lg flex items-center space-x-2 animate-float-medium">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
            PV
          </div>
          <div>
            <div className="text-xs font-bold text-solar-navy">Technician On Duty</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Energy Sparks */}
      <EnergyParticle style={{ top: "25%", left: "20%", animationDelay: "0.2s" }} />
      <EnergyParticle style={{ top: "45%", right: "15%", animationDelay: "1.4s" }} />
      <EnergyParticle style={{ top: "65%", left: "10%", animationDelay: "2.1s" }} />
    </div>
  );
};
