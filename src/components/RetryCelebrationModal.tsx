import React from 'react';
import { Sparkles, ArrowRight, RotateCw } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

interface RetryCelebrationModalProps {
  isOpen: boolean;
  onProceed: () => void;
}

export const RetryCelebrationModal: React.FC<RetryCelebrationModalProps> = ({
  isOpen,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl shadow-purple-950/60 relative overflow-hidden text-center space-y-4">
        {/* Ambient Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>СЕКТОР «ЕЩЁ ПОПЫТКА»</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
            ВТОРОЙ ШАНС!
          </h3>
          <p className="text-xs text-purple-300 font-medium">
            Стрелка зафиксировала сектор повторного запуска
          </p>
        </div>

        {/* Explanatory Box */}
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed space-y-2 text-left">
          <p>
            Фортуна выбросила редчайший расклад — <strong className="text-amber-400">право на один повторный запуск</strong>.
          </p>
          <p className="text-slate-300">
            Детство закончилось, но фортуна решила дать тебе второй бросок. Запомни: это твой последний шанс забрать куш.
          </p>
        </div>

        {/* Attempt indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500 line-through">Попытка 1: Сделана</span>
          <span>→</span>
          <span className="text-amber-400 font-bold">Попытка 2: Финальная</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sound.playTick(1.0, 0.4);
            triggerHaptic(25);
            onProceed();
          }}
          className="w-full min-h-[50px] rounded-2xl font-display font-black text-sm uppercase tracking-wide bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <RotateCw size={16} />
          <span>КРУТИТЬ ВТОРОЙ ШАНС →</span>
        </button>
      </div>
    </div>
  );
};
