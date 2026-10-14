import React, { useState } from 'react';
import { Sector } from '../types/fortune';
import { sound, triggerHaptic } from '../utils/audio';

interface EnvelopeGridProps {
  sectors: Sector[];
  highlightedSectorId?: string;
  onAllInspected?: () => void;
  onProceedToSecretGift: () => void;
}

export const EnvelopeGrid: React.FC<EnvelopeGridProps> = ({
  sectors,
  highlightedSectorId,
  onProceedToSecretGift,
}) => {
  const [openedIds, setOpenedIds] = useState<Record<string, boolean>>({
    'sec-2': true, // Opened by default since it landed on near-miss
  });
  const [activeEnvelope, setActiveEnvelope] = useState<Sector | null>(
    sectors.find((s) => s.id === highlightedSectorId) || sectors[1]
  );

  const toggleEnvelope = (sector: Sector) => {
    sound.playTick(1.2, 0.3);
    triggerHaptic(18);
    setOpenedIds((prev) => ({ ...prev, [sector.id]: true }));
    setActiveEnvelope(sector);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in max-w-md mx-auto">
      {/* Intro Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-mono text-amber-400 font-bold">АУДИТ СТОЛА · 8 КОНВЕРТОВ</span>
          <span className="text-[10px] text-slate-500 uppercase">ПРОВЕРКА ЛУТА</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Никаких фокусов: нажми на любой конверт и посмотри, что лежало на кону с самого начала:
        </p>
      </div>

      {/* Grid of Envelopes */}
      <div className="grid grid-cols-2 gap-2.5">
        {sectors.map((sector, index) => {
          const isOpened = !!openedIds[sector.id];
          const isHighlighted = sector.id === highlightedSectorId;
          const isKush = sector.type === 'kush';
          const isSelected = activeEnvelope?.id === sector.id;

          return (
            <button
              key={sector.id}
              onClick={() => toggleEnvelope(sector)}
              className={`p-3 rounded-xl text-left border transition-all duration-200 relative flex flex-col justify-between min-h-[92px] active:scale-[0.98] ${
                isSelected
                  ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50'
                  : isHighlighted
                  ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500/50'
                  : isOpened
                  ? 'border-slate-700 bg-slate-900/80 text-slate-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              {/* Badge & Number */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  КОНВЕРТ #{index + 1}
                </span>
                {isKush && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                    ТОП-ЛУТ
                  </span>
                )}
                {isHighlighted && !isKush && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                    ВЫПАЛ
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="my-1">
                <div
                  className={`text-xs font-display font-bold truncate ${
                    isKush ? 'text-amber-300' : isHighlighted ? 'text-rose-300' : 'text-slate-200'
                  }`}
                >
                  {sector.title}
                </div>
              </div>

              {/* Status footer */}
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>{isOpened ? 'Вскрыт' : 'Запечатан'}</span>
                <span className="text-amber-400 text-xs">{isOpened ? '✓' : '→'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Envelope Detail Inspection Card */}
      {activeEnvelope && (
        <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl relative animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeEnvelope.bgGradient[0] }}
              />
              <span className="font-display font-bold text-sm text-white">
                {activeEnvelope.title}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase">
              {activeEnvelope.type === 'kush'
                ? 'Главный лот'
                : activeEnvelope.type === 'almost'
                ? 'Мимо на 0.5 мм'
                : 'Конверт'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Что лежало внутри:
              </div>
              <div className="text-slate-100 font-semibold text-sm mt-0.5">
                {activeEnvelope.itemDescription}
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
              <div className="text-[10px] text-amber-400 uppercase font-mono tracking-wider mb-1">
                Записка от Jayce:
              </div>
              <p className="text-slate-300 italic leading-relaxed">
                «{activeEnvelope.envelopeNote}»
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transition CTA without spoilers */}
      <div className="pt-2">
        <button
          onClick={() => {
            sound.playCelebrationChime();
            triggerHaptic(40);
            onProceedToSecretGift();
          }}
          className="w-full min-h-[52px] rounded-xl font-display font-bold text-sm tracking-wide bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>ЗАВЕРШИТЬ ИСПЫТАНИЕ И ВЫЙТИ НА СВЯЗЬ С JAYCE →</span>
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Все конверты проверены. Перейти к финальному сообщению.
        </p>
      </div>
    </div>
  );
};
