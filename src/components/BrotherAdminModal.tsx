import React, { useState } from 'react';
import { FortuneConfig, GameMode, encodeConfigToUrl } from '../types/fortune';
import { triggerHaptic } from '../utils/audio';

interface BrotherAdminModalProps {
  config: FortuneConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: FortuneConfig) => void;
  onResetTest?: () => void;
}

export const BrotherAdminModal: React.FC<BrotherAdminModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
  onResetTest,
}) => {
  const [formData, setFormData] = useState<FortuneConfig>({ ...config });
  const [copiedLink, setCopiedLink] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'sectors' | 'gift' | 'share'>('general');

  if (!isOpen) return null;

  const handleCopyShareLink = () => {
    try {
      localStorage.setItem('fortune_config_custom_v9', JSON.stringify(formData));
    } catch {}
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    const pathname = window.location.pathname;
    const encodedCfg = encodeConfigToUrl(formData);
    const shareUrl = `${origin}${pathname}?view=play&cfg=${encodedCfg}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerHaptic(30);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleResetClick = () => {
    try {
      localStorage.removeItem('fortune_user_played_v1');
      localStorage.removeItem('fortune_attempt_number');
      localStorage.removeItem('fortune_landed_sector');
      localStorage.removeItem('fortune_phase');
    } catch {}
    setResetSuccess(true);
    triggerHaptic(30);
    if (onResetTest) {
      onResetTest();
    }
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const handleSaveAndClose = () => {
    try {
      localStorage.setItem('fortune_config_custom_v9', JSON.stringify(formData));
    } catch {}
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="font-display font-bold text-base text-white">
              Пульт старшего брата
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation (Segmented Control) */}
        <div className="p-2 bg-slate-950/60 border-b border-slate-800 flex gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'general' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Сценарий & Имена
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'sectors' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Сектора (8 шт)
          </button>
          <button
            onClick={() => setActiveTab('gift')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'gift' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Реальный подарок
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'share' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ссылка для мелкого
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Режим испытания фортуны
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'drama' as GameMode,
                      title: '«Тот самый 1 миллиметр» (Идеально)',
                      desc: 'Стрелка остановится ровно в 0.5 мм от Жирного куша в секторе «Почти...». Чистая драма и жизненный урок.',
                    },
                    {
                      id: 'shrinking' as GameMode,
                      title: '«3 попытки (Сжимающееся окно)»',
                      desc: 'После каждой неудачной попытки один хороший сектор пропадает.',
                    },
                    {
                      id: 'fair' as GameMode,
                      title: '«Честный рандом»',
                      desc: 'Случайное физическое выпадение любого из 8 секторов.',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: m.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.mode === m.id
                          ? 'border-amber-400 bg-amber-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-sm text-amber-300">{m.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Имя мелкого (13 лет)
                  </label>
                  <input
                    type="text"
                    value={formData.youngerBrotherName}
                    onChange={(e) =>
                      setFormData({ ...formData, youngerBrotherName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Имя старшего (21 год)
                  </label>
                  <input
                    type="text"
                    value={formData.olderBrotherName}
                    onChange={(e) =>
                      setFormData({ ...formData, olderBrotherName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Вступительное слово старшего брата
                </label>
                <textarea
                  rows={4}
                  value={formData.introMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, introMessage: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'sectors' && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                Сектора фортуны (расположены так, чтобы «Жирный куш» и «Почти» стояли впритирку):
              </div>
              <div className="space-y-2">
                {formData.sectors.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-bold">
                        Сектор #{idx + 1}: {sec.title}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{sec.type}</span>
                    </div>
                    <input
                      type="text"
                      value={sec.itemDescription}
                      onChange={(e) => {
                        const newSectors = [...formData.sectors];
                        newSectors[idx] = { ...sec, itemDescription: e.target.value };
                        setFormData({ ...formData, sectors: newSectors });
                      }}
                      placeholder="Что реально внутри..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gift' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Название настоящего подарка
                </label>
                <input
                  type="text"
                  value={formData.realGift.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realGift: { ...formData.realGift, title: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Описание подарка
                </label>
                <input
                  type="text"
                  value={formData.realGift.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realGift: { ...formData.realGift, description: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Трек-номер / Промокод / Данные перевода
                </label>
                <input
                  type="text"
                  value={formData.realGift.secretCodeOrTrack}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realGift: { ...formData.realGift, secretCodeOrTrack: e.target.value },
                    })
                  }
                  placeholder="CDEK: 1548920194 / Код: 13-BROTHER"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Финальная записка-поздравление от старшего
                </label>
                <textarea
                  rows={4}
                  value={formData.realGift.brotherNote}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realGift: { ...formData.realGift, brotherNote: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="font-display font-bold text-sm text-amber-300">
                  Как отправить ссылку младшему брату:
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Скопируй ссылку ниже и отправь ему в Telegram или WhatsApp.
                  Он откроет её на телефоне, услышит твоё обращение, раскрутит фортуну, словит тот самый миллиметр драмы и в финале заберёт твой реальный подарок!
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full min-h-[48px] rounded-xl font-display font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{copiedLink ? '✓ ССЫЛКА СКОПИРОВАНА' : 'СКОПИРОВАТЬ ПУБЛИЧНУЮ ССЫЛКУ ДЛЯ МЕЛКОГО'}</span>
              </button>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 break-all select-all">
                {(() => {
                  let origin = window.location.origin;
                  if (origin.includes('ais-dev-')) {
                    origin = origin.replace('ais-dev-', 'ais-pre-');
                  }
                  return `${origin}${window.location.pathname}?view=play`;
                })()}
              </div>

              <div className="text-[11px] text-amber-300/80 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                💡 <strong>Важно:</strong> Если отправляешь через Telegram или WhatsApp, скажи ему нажать три точки и <em>«Открыть в браузере» (Chrome / Safari)</em>, чтобы встроенный браузер мессенджера не блокировал куки.
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="w-full py-2.5 rounded-xl text-xs font-mono text-amber-300 hover:text-amber-200 bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-center gap-2"
                >
                  <span>{resetSuccess ? '✓ ТЕСТ СБРОШЕН: МОЖНО КРУТИТЬ ЗАНОВО' : '🔄 Сбросить попытку (для теста Jayce)'}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Очищает localStorage твоего браузера, чтобы ты мог протестировать оба спина заново.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};
