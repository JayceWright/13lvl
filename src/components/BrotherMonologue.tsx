import React, { useEffect, useState } from 'react';
import { Sector, FortuneConfig } from '../types/fortune';
import { sound, triggerHaptic } from '../utils/audio';

interface BrotherMonologueProps {
  sector: Sector;
  isMillimeterMiss: boolean;
  config: FortuneConfig;
  onProceedToEnvelopes: () => void;
}

export const BrotherMonologue: React.FC<BrotherMonologueProps> = ({
  sector,
  onProceedToEnvelopes,
}) => {
  const [step, setStep] = useState<number>(0);

  // Exact monologue requested:
  const script = [
    'Смотри на стрелку. Полмиллиметра — и ты бы забрал жирный куш.',
    'Но в зачет идет только результат, а не то, насколько ты был близко.',
    'Запомни это ощущение. Вот что бывает, когда забиваешь на систему и надеешься проскочить на шару.',
    'Слепая фортуна всегда кидает в последний момент. В жизни работает только то, что ты выбил своими руками и головой.',
  ];

  useEffect(() => {
    // Reveal lines sequentially
    const timeouts: NodeJS.Timeout[] = [];

    timeouts.push(
      setTimeout(() => {
        setStep(1);
        sound.playTick(0.8, 0.2);
        triggerHaptic(15);
      }, 1200)
    );

    timeouts.push(
      setTimeout(() => {
        setStep(2);
        sound.playTick(0.8, 0.2);
        triggerHaptic(15);
      }, 3400)
    );

    timeouts.push(
      setTimeout(() => {
        setStep(3);
        sound.playTick(0.8, 0.2);
        triggerHaptic(15);
      }, 5800)
    );

    timeouts.push(
      setTimeout(() => {
        setStep(4);
        triggerHaptic(25);
      }, 8200)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in max-w-md mx-auto">
      {/* Result Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>РЕЗУЛЬТАТ ЗАПУСКА</span>
          <span className="font-mono text-rose-400 font-bold">
            ПРОМАХ: 0.5 ММ ОТ ГЛАВНОГО ПРИЗА
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: sector.bgGradient[0] }}
          />
          <div>
            <div className="font-display font-black text-lg text-white">
              {sector.title}
            </div>
            <div className="text-xs text-slate-300">
              {sector.itemDescription}
            </div>
          </div>
        </div>
      </div>

      {/* The Brother's Real Talk Dialogue Box */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              На связи Jayce
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            21 год
          </span>
        </div>

        {/* Sequential Monologue lines */}
        <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
          {script.map((line, idx) => {
            const isVisible = step > idx;
            const isHighlight = idx === 0 || idx === 3;
            return (
              <p
                key={idx}
                className={`text-sm leading-relaxed transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0 text-slate-200'
                    : 'opacity-0 translate-y-2 text-transparent select-none'
                } ${isHighlight ? 'font-semibold text-white' : ''}`}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* Button to proceed to envelope inspection */}
      <div className="pt-1">
        <button
          onClick={() => {
            sound.playTick(1.0, 0.3);
            triggerHaptic(25);
            onProceedToEnvelopes();
          }}
          className="w-full min-h-[50px] rounded-xl font-display font-bold text-sm tracking-wide bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>ВСКРЫТЬ ОСТАЛЬНЫЕ КОНВЕРТЫ →</span>
        </button>
      </div>
    </div>
  );
};
