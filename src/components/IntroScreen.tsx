import React from 'react';
import { FortuneConfig } from '../types/fortune';
import { sound, triggerHaptic } from '../utils/audio';

interface IntroScreenProps {
  config: FortuneConfig;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ config, onStart }) => {
  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in max-w-md mx-auto">
      {/* Age Transition Headline */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-amber-400 font-bold">УРОВЕНЬ 13</span>
          <span>·</span>
          <span>ВЗРОСЛАЯ ЛИГА</span>
        </div>
        <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">
          ИСПЫТАНИЕ ФОРТУНОЙ
        </h1>
        <p className="text-xs text-slate-400">
          На связи {config.olderBrotherName} · {config.olderBrotherAge} год
        </p>
      </div>

      {/* Letter Card from Older Brother */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden space-y-4">
        {/* Brother status badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-display font-bold text-sm text-amber-400">
              21
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                На связи {config.olderBrotherName}
              </div>
              <div className="text-[10px] text-slate-400">
                {config.olderBrotherAge} год
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
            ДЛЯ МЕЛКОГО
          </span>
        </div>

        {/* The Intro Prose */}
        <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
          <p>
            «Здорово, {config.youngerBrotherName}. Сегодня тебе 13 — детство официально закончилось.
          </p>
          <p>
            На связи {config.olderBrotherName}. Дежурную коробку с бантиком и открыткой ты от меня не получишь. Вместо этого мы прямо сейчас проверим, как работает слепой случай в реальной жизни:»
          </p>
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="text-amber-400 font-mono font-bold uppercase text-[11px]">
              ПРАВИЛА ИГРЫ:
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Перед тобой 8 закрытых конвертов разного калибра — от топ-лута до полной пустоты.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>У тебя ровно одна попытка запустить фортуну. Что выпадет — то и забираешь.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Никаких перекрутов, жалоб и вторых шансов. Всё по-взрослому.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Start Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            sound.initContext();
            sound.playTick(1.0, 0.4);
            triggerHaptic(30);
            onStart();
          }}
          className="w-full min-h-[54px] rounded-2xl font-display font-black text-base tracking-wide uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>ПРИНЯТЬ УСЛОВИЯ И ЗАПУСТИТЬ →</span>
        </button>
      </div>
    </div>
  );
};
