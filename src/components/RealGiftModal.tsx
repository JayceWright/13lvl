import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RealGiftConfig } from '../types/fortune';
import { sound, triggerHaptic } from '../utils/audio';

interface RealGiftModalProps {
  realGift: RealGiftConfig;
  olderBrotherName: string;
  youngerBrotherName: string;
}

export const RealGiftModal: React.FC<RealGiftModalProps> = ({
  realGift,
  olderBrotherName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  useEffect(() => {
    sound.playCelebrationChime();
    triggerHaptic(50);

    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    const timer = setTimeout(() => setIsRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    if (!realGift.secretCodeOrTrack) return;
    navigator.clipboard.writeText(realGift.secretCodeOrTrack);
    setCopied(true);
    triggerHaptic(25);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in pb-8 max-w-md mx-auto">
      {/* Golden Climax Badge Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <span>★</span>
          <span>СИСТЕМНЫЙ ПЕРЕХВАТ: С 13-ЛЕТИЕМ, БРО</span>
          <span>★</span>
        </div>
        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
          Рандом для лохов.
        </h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          Старший брат не оставит тебя с пустым конвертом в твой день.
        </p>
      </div>

      {/* Real Gift Card */}
      <div
        className={`bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-700 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
            ОФИЦИАЛЬНЫЙ ДРОП
          </span>
          <span className="text-xs text-slate-400 font-mono">13 ЛЕТ</span>
        </div>

        {/* Gift Title & Description */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-xl font-display font-black text-amber-200 leading-snug">
            {realGift.title}
          </h3>
          <p className="text-sm font-semibold text-white">
            {realGift.description}
          </p>
          <div className="text-xs text-slate-400">
            {realGift.subtitle}
          </div>
        </div>

        {/* Secret Code Voucher Box */}
        <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>КОД АКТИВАЦИИ ПОДАРКА:</span>
            <span className="font-mono text-emerald-400">РАЗБЛОКИРОВАНО</span>
          </div>

          <div className="font-mono text-sm font-bold text-amber-300 tracking-wide break-all bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <span>{realGift.secretCodeOrTrack || 'СТАТУС: РАЗБЛОКИРОВАНО / КОД: LEVEL-13-FIRDAVS'}</span>
            <button
              onClick={handleCopy}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
        </div>

        {/* Letter from Jayce */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Личное послание от {olderBrotherName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">21 год → 13 лет</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            «Колесо и шара всегда подведут на миллиметр, а брат — нет. Этот тест был для того, чтобы ты понял простую вещь: хватит надеяться на авось и забрасывать начатое. В жизни забирает куш тот, кто фигачит, а не тот, кто ждет удачу. Сегодня твой праздник — забирай свой подарок и отметь как надо. А за твоими задачами и компом я вернусь на днях. С днюхой, мелкий!»
          </p>
        </div>
      </div>

      {/* Action Button: only gift copy, NO re-spin! */}
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full min-h-[50px] rounded-xl font-display font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{copied ? '✓ КОД СКОПИРОВАН В БУФЕР' : 'СКОПИРОВАТЬ ДАННЫЕ ПОДАРКА'}</span>
        </button>
      </div>
    </div>
  );
};
