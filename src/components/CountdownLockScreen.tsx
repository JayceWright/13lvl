import React, { useState, useEffect } from 'react';
import { Lock, Clock } from 'lucide-react';
import { triggerHaptic, sound } from '../utils/audio';

interface CountdownLockScreenProps {
  onUnlock: () => void;
  targetDate?: Date;
}

export const CountdownLockScreen: React.FC<CountdownLockScreenProps> = ({
  onUnlock,
  targetDate,
}) => {
  // Target: 13:00 today (October 14)
  const defaultTarget = React.useMemo(() => {
    const d = new Date();
    d.setHours(13, 0, 0, 0);
    return d;
  }, []);

  const target = targetDate || defaultTarget;

  const calculateTimeLeft = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, total: diff };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [secretTaps, setSecretTaps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);
        sound.playCelebrationChime();
        triggerHaptic(40);
        onUnlock();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onUnlock, target]);

  // Secret 5-tap bypass on lock icon for Jayce (testing)
  const handleSecretLockTap = () => {
    const next = secretTaps + 1;
    triggerHaptic(12);
    setSecretTaps(next);
    if (next >= 5) {
      sound.playRadioBeep();
      triggerHaptic(50);
      onUnlock();
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[75vh] px-4 animate-fade-in text-center">
      {/* Top Protocol Status */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono mb-6">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
        <span>СИСТЕМА ЗАБЛОКИРОВАНА ДО 13:00</span>
      </div>

      {/* Center Lock Visual */}
      <div className="relative mb-6">
        <button
          type="button"
          onClick={handleSecretLockTap}
          title="Секретный пропуск (5 тапов)"
          className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-2xl relative active:scale-95 transition-transform"
        >
          <Lock size={44} className="stroke-[1.75]" />
          <div className="absolute inset-0 rounded-3xl bg-amber-500/5 animate-pulse" />
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">
          УРОВЕНЬ 13
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          ОТКРЫТИЕ ДОСТУПА В 13:00 (14 ОКТЯБРЯ)
        </p>
      </div>

      {/* Digital Flip Timer */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-3xl font-mono font-black text-amber-300 tracking-tight">
            {pad(timeLeft.hours)}
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">ЧАСОВ</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-3xl font-mono font-black text-amber-300 tracking-tight">
            {pad(timeLeft.minutes)}
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">МИНУТ</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-3xl font-mono font-black text-amber-300 tracking-tight">
            {pad(timeLeft.seconds)}
          </div>
          <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">СЕКУНД</div>
        </div>
      </div>

      {/* Note from Jayce */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left w-full space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span>Послание от Jayce</span>
          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
            <Clock size={12} />
            <span>В ОЖИДАНИИ 13:00</span>
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          «Не торопись, бро. Доступ закрыт ровно до 13:00. Ровно в 13:00 замок спадёт и откроется испытание фортуной. Жди назначенного времени.»
        </p>
      </div>
    </div>
  );
};
