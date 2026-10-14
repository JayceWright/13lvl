import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sector, GameMode } from '../types/fortune';
import { sound, triggerHaptic } from '../utils/audio';

interface FortuneWheelProps {
  sectors: Sector[];
  mode: GameMode;
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinComplete: (resultSector: Sector, millimeterMiss: boolean) => void;
  attemptNumber: number;
  maxAttempts: number;
  disabled?: boolean;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  sectors,
  mode,
  isSpinning,
  onSpinStart,
  onSpinComplete,
  attemptNumber = 1,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wheel physics state
  const rotationRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isSpinningRef = useRef<boolean>(false);
  const targetRotationRef = useRef<number | null>(null);
  const lastPinIndexRef = useRef<number>(-1);
  const needleDeflectionRef = useRef<number>(0);
  const needleVelocityRef = useRef<number>(0);

  // Tension & millimeter precision indicators
  const [isTensionActive, setIsTensionActive] = useState<boolean>(false);
  const [millimeterGap, setMillimeterGap] = useState<number | null>(null);

  const numSectors = sectors.length;
  const arcSize = (2 * Math.PI) / numSectors;

  // Render wheel on canvas with top needle completely visible on mobile phones
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Logical CSS pixel size
    const size = Math.floor(canvas.width / dpr);
    if (size <= 0) return;

    // Reset transform & scale explicitly to ensure retina perfection without drift
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Geometry layout: scale wheel comfortably so 100% of the circle and top needle are visible with breathing room
    const padding = 14;
    const topRoom = 42; // Generous space for needle bracket, aiming indicator and laser line
    const bottomRoom = 14;
    const diameter = Math.min(size - padding * 2, size - topRoom - bottomRoom);
    const radius = Math.floor(diameter / 2);

    const centerX = size / 2;
    const centerY = topRoom + radius;

    // 1. Outer rim / metallic chassis
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 6, 0, 2 * Math.PI);
    const rimGrad = ctx.createRadialGradient(centerX, centerY, radius - 2, centerX, centerY, radius + 6);
    rimGrad.addColorStop(0, '#334155');
    rimGrad.addColorStop(0.4, '#1e293b');
    rimGrad.addColorStop(0.8, '#475569');
    rimGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Outer border ring
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Wheel Sectors
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRef.current);

    sectors.forEach((sector, i) => {
      const startAngle = i * arcSize;
      const endAngle = startAngle + arcSize;

      // Draw Sector Wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Sector Gradient
      const midAngle = startAngle + arcSize / 2;
      const gx1 = Math.cos(midAngle) * (radius * 0.15);
      const gy1 = Math.sin(midAngle) * (radius * 0.15);
      const gx2 = Math.cos(midAngle) * radius;
      const gy2 = Math.sin(midAngle) * radius;
      const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      grad.addColorStop(0, sector.bgGradient[0]);
      grad.addColorStop(1, sector.bgGradient[1]);

      ctx.fillStyle = grad;
      ctx.fill();

      // Sector Separator
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
      ctx.strokeStyle =
        sector.type === 'kush' || sectors[(i - 1 + numSectors) % numSectors].type === 'kush'
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sector Text & Label
      ctx.save();
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = sector.textColor;

      ctx.font = 'bold 12px Outfit, system-ui, sans-serif';
      if (size < 320) {
        ctx.font = 'bold 10px Outfit, system-ui, sans-serif';
      }
      ctx.fillText(sector.title, radius - 16, 0);

      // Sub-label / Tag
      if (sector.type === 'kush') {
        ctx.font = 'bold 9px Outfit, system-ui, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('★ 10 000 ₽', radius - 16, 12);
      } else if (sector.type === 'almost') {
        ctx.font = 'bold 8px Outfit, system-ui, sans-serif';
        ctx.fillStyle = '#fecdd3';
        ctx.fillText('0.5 ММ', radius - 16, 12);
      } else if (sector.type === 'retry') {
        ctx.font = 'bold 8px Outfit, system-ui, sans-serif';
        ctx.fillStyle = '#ddd6fe';
        ctx.fillText('+1 ШАНС', radius - 16, 12);
      }

      ctx.restore();
    });

    // 3. Draw Perimeter Pegs (Pins)
    for (let i = 0; i < numSectors; i++) {
      const pinAngle = i * arcSize;
      const px = Math.cos(pinAngle) * (radius - 1);
      const py = Math.sin(pinAngle) * (radius - 1);

      // Shadow
      ctx.beginPath();
      ctx.arc(px + 1, py + 1, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // Metal pin cap
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      const pinGrad = ctx.createRadialGradient(px - 1, py - 1, 1, px, py, 3.5);
      pinGrad.addColorStop(0, '#ffffff');
      pinGrad.addColorStop(0.6, '#cbd5e1');
      pinGrad.addColorStop(1, '#475569');
      ctx.fillStyle = pinGrad;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore(); // restore center translation

    // 4. Center hub / wheel bearing
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 24);
    hubGrad.addColorStop(0, '#fbbf24');
    hubGrad.addColorStop(0.3, '#1e293b');
    hubGrad.addColorStop(0.85, '#090d16');
    hubGrad.addColorStop(1, '#000000');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center text / logo in hub
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Outfit, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('13 ЛЕТ', centerX, centerY);
    ctx.restore();

    // 5. Draw Needle Mounting Bracket at top center
    const needlePivotX = centerX;
    const needlePivotY = centerY - radius;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const bw = 28;
    const bh = 12;
    ctx.rect(centerX - bw / 2, needlePivotY - bh - 2, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6. Draw Physical Indicator (Needle) pointing down
    ctx.save();
    const deflection = needleDeflectionRef.current;

    ctx.translate(needlePivotX, needlePivotY);
    ctx.rotate(deflection);

    // Needle shadow
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(7, -8);
    ctx.lineTo(-7, -8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Needle triangle pointing down into the wheel
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(7, -4);
    ctx.lineTo(5, -10);
    ctx.lineTo(-5, -10);
    ctx.lineTo(-7, -4);
    ctx.closePath();

    const needleGrad = ctx.createLinearGradient(-7, -10, 7, 24);
    needleGrad.addColorStop(0, '#f43f5e');
    needleGrad.addColorStop(0.6, '#e11d48');
    needleGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = needleGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center pin of the needle
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }, [sectors, numSectors, arcSize]);

  // High-DPI Canvas resize setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const rawWidth = rect.width > 50 ? rect.width : window.innerWidth - 32;
      // Cap at 315px so it fits fully on any mobile device without clipping
      const size = Math.floor(Math.min(rawWidth, window.innerWidth - 32, 315));

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.style.maxWidth = '100%';

      drawWheel();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWheel]);

  // Needle physics update loop
  useEffect(() => {
    let animId: number;
    const updatePhysics = () => {
      const k = 0.3;
      const damping = 0.72;
      needleVelocityRef.current += -k * needleDeflectionRef.current;
      needleVelocityRef.current *= damping;
      needleDeflectionRef.current += needleVelocityRef.current;

      drawWheel();
      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [drawWheel]);

  // Main spin animation routine
  const startSpinAnimation = useCallback(() => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    onSpinStart();
    setIsTensionActive(false);
    setMillimeterGap(null);

    let targetSectorAngle: number;
    let isDramaMillimeter = false;

    if (mode === 'drama') {
      if (attemptNumber === 1) {
        // Spin 1: lands squarely on "ЕЩЁ ПОПЫТКА" (+1 шанс)
        const retryIdx = sectors.findIndex((s) => s.type === 'retry');
        const targetIdx = retryIdx >= 0 ? retryIdx : 4;
        targetSectorAngle = targetIdx * arcSize + arcSize * 0.5;
        isDramaMillimeter = false;
      } else {
        // Spin 2: lands 0.5 mm past the border into "ПОЧТИ... МИМО"
        isDramaMillimeter = true;
        targetSectorAngle = arcSize + 0.013;
      }
    } else {
      targetSectorAngle = Math.random() * (2 * Math.PI);
    }

    const currentRot = rotationRef.current;
    const spins = 6 + Math.floor(Math.random() * 2);
    const baseTarget = -Math.PI / 2 - targetSectorAngle;

    let finalTarget = baseTarget;
    while (finalTarget < currentRot + spins * 2 * Math.PI) {
      finalTarget += 2 * Math.PI;
    }

    targetRotationRef.current = finalTarget;

    const startTime = performance.now();
    const duration = 7200;
    const startRot = currentRot;
    const totalDistance = finalTarget - startRot;

    let subBassPlayed = false;

    const spinStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const eased = 1 - Math.pow(1 - progress, 4.6);
      const newRot = startRot + totalDistance * eased;
      const deltaRot = newRot - rotationRef.current;
      velocityRef.current = deltaRot;
      rotationRef.current = newRot;

      const currentWheelAngleAtPointer = (-Math.PI / 2 - newRot) % (2 * Math.PI);
      const normalizedAngle = (currentWheelAngleAtPointer + 2 * Math.PI) % (2 * Math.PI);
      const currentPinIndex = Math.floor(normalizedAngle / arcSize);

      if (currentPinIndex !== lastPinIndexRef.current) {
        lastPinIndexRef.current = currentPinIndex;

        const kickIntensity = Math.min(0.35, Math.max(0.08, velocityRef.current * 2.2));
        needleDeflectionRef.current = -kickIntensity;
        needleVelocityRef.current = kickIntensity * 0.6;

        const pitchRatio = Math.max(0.65, Math.min(1.4, velocityRef.current * 18));
        const vol = Math.min(0.5, Math.max(0.18, velocityRef.current * 3));
        sound.playTick(pitchRatio, vol);

        if (progress > 0.85) {
          sound.playHeartbeat();
          triggerHaptic(22);
        } else {
          triggerHaptic(12);
        }
      }

      if (progress > 0.75 && !subBassPlayed) {
        subBassPlayed = true;
        sound.playDramaticSuspense();
        setIsTensionActive(true);
      }

      if (progress > 0.85) {
        const distToBorder = Math.abs(normalizedAngle - arcSize);
        const mm = Math.max(0.4, Number((distToBorder * 120).toFixed(1)));
        setMillimeterGap(mm);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(spinStep);
      } else {
        rotationRef.current = finalTarget;
        velocityRef.current = 0;
        isSpinningRef.current = false;

        const finalAngleAtPointer = (-Math.PI / 2 - finalTarget) % (2 * Math.PI);
        const finalNormalized = (finalAngleAtPointer + 2 * Math.PI) % (2 * Math.PI);
        const landedIndex = Math.floor(finalNormalized / arcSize) % numSectors;
        const landedSector = sectors[landedIndex] || sectors[1];

        if (isDramaMillimeter) {
          sound.playMissTone();
        } else if (landedSector.type === 'retry') {
          sound.playCelebrationChime();
        }

        setTimeout(() => {
          onSpinComplete(landedSector, isDramaMillimeter);
        }, 1200);
      }
    };

    animFrameRef.current = requestAnimationFrame(spinStep);
  }, [arcSize, attemptNumber, mode, numSectors, onSpinComplete, onSpinStart, sectors]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[320px] mx-auto">
      {/* Millimeter Tension Banner */}
      <div
        className={`h-8 flex items-center justify-center transition-all duration-300 mb-1 ${
          isTensionActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-rose-950/90 border border-rose-500/70 rounded-full px-3.5 py-0.5 text-xs font-mono font-bold tracking-tight text-rose-200 flex items-center gap-2 shadow-xl shadow-rose-950/50 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          ДО ГЛАВНОГО СЕКТОРА: {millimeterGap ? `${millimeterGap} мм` : '0.5 мм'}
        </div>
      </div>

      {/* Wheel Stage */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square flex items-center justify-center overflow-visible"
      >
        {/* Glow ambient aura */}
        <div
          className={`absolute inset-2 rounded-full blur-2xl transition-opacity duration-1000 -z-10 ${
            isSpinning ? 'opacity-40 bg-amber-500/35' : 'opacity-15 bg-slate-500/20'
          }`}
        />

        {/* Top Pointer Indicator: always crystal clear & perfectly visible on all devices */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/95 border border-amber-500/60 shadow-lg text-[9px] font-mono font-black text-amber-300 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
            СТРЕЛА
          </div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500 filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.9)] -mt-0.5" />
        </div>

        {/* The Complete Canvas - fully visible with generous margins */}
        <canvas
          ref={canvasRef}
          className="touch-none block mx-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
        />

        {/* Laser target indicator during the slow-down */}
        {isTensionActive && (
          <div className="absolute top-10 pointer-events-none flex flex-col items-center animate-fade-in z-20">
            <div className="w-8 h-[1.5px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <div className="text-[9px] font-mono font-extrabold text-rose-300 bg-black/90 px-1 py-0.5 rounded mt-0.5 border border-rose-500/40">
              0.5 mm
            </div>
          </div>
        )}
      </div>

      {/* Big Ergonomic Spin Button */}
      <div className="w-full mt-4 px-2">
        <button
          onClick={startSpinAnimation}
          disabled={isSpinning || disabled}
          className={`w-full min-h-[54px] rounded-2xl font-display font-black text-base tracking-wide uppercase transition-all duration-200 shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] ${
            isSpinning || disabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/25 hover:brightness-110 active:brightness-95'
          }`}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Фиксация результата...
            </span>
          ) : (
            <span>
              {attemptNumber === 2
                ? 'ИСПОЛЬЗОВАТЬ 2-Й ШАНС (ФИНАЛ)'
                : 'ЗАПУСТИТЬ ФОРТУНУ'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
