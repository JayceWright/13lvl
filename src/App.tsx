import { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, VolumeX, Sliders, Share2, RotateCcw } from 'lucide-react';
import {
  FortuneConfig,
  Sector,
  DEFAULT_CONFIG,
  DEFAULT_SECTORS,
  decodeConfigFromUrl,
  encodeConfigToUrl,
} from './types/fortune';
import { sound, triggerHaptic } from './utils/audio';
import { CountdownLockScreen } from './components/CountdownLockScreen';
import { IntroScreen } from './components/IntroScreen';
import { FortuneWheel } from './components/FortuneWheel';
import { BrotherMonologue } from './components/BrotherMonologue';
import { EnvelopeGrid } from './components/EnvelopeGrid';
import { RealGiftModal } from './components/RealGiftModal';
import { BrotherAdminModal } from './components/BrotherAdminModal';
import { RetryCelebrationModal } from './components/RetryCelebrationModal';

type GamePhase = 'intro' | 'wheel' | 'monologue' | 'envelopes' | 'real-gift';

export default function App() {
  const [config, setConfig] = useState<FortuneConfig>(() => {
    try {
      const saved = localStorage.getItem('fortune_config_custom_v9');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  // Track if user has already used their spins
  const [hasPlayed, setHasPlayed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fortune_user_played_v1') === 'true';
    } catch {}
    return false;
  });

  // Current attempt number (1 or 2)
  const [attemptNumber, setAttemptNumber] = useState<number>(() => {
    try {
      const savedAttempt = localStorage.getItem('fortune_attempt_number');
      if (savedAttempt) {
        return parseInt(savedAttempt, 10);
      }
    } catch {}
    return 1;
  });

  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);

  // Resume at saved phase if already played
  const [phase, setPhase] = useState<GamePhase>(() => {
    try {
      if (localStorage.getItem('fortune_user_played_v1') === 'true') {
        const savedPhase = localStorage.getItem('fortune_phase') as GamePhase;
        if (savedPhase && savedPhase !== 'wheel') {
          return savedPhase;
        }
        return 'monologue';
      }
    } catch {}
    return 'intro';
  });

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [landedSector, setLandedSector] = useState<Sector | null>(() => {
    try {
      const savedSec = localStorage.getItem('fortune_landed_sector');
      if (savedSec) {
        return JSON.parse(savedSec);
      }
    } catch {}
    return DEFAULT_SECTORS[1]; // Sector 2 "ПОЧТИ... МИМО"
  });

  const [isMillimeterMiss, setIsMillimeterMiss] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [showAdminControls, setShowAdminControls] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [linkCopiedToast, setLinkCopiedToast] = useState<boolean>(false);

  // Target lock time: 13:00 on October 14
  const targetLockDate = useMemo(() => {
    const t = new Date();
    t.setHours(13, 0, 0, 0);
    return t;
  }, []);

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return Date.now() < targetLockDate.getTime();
  });

  // Secret 5-tap counter on badge "21 → 13" for Jayce
  const secretTapCountRef = useRef<number>(0);
  const secretTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Unlock Web Audio context on very first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      sound.initContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Parse URL parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      // Check reset override (?reset=1)
      if (params.get('reset') === '1') {
        localStorage.removeItem('fortune_user_played_v1');
        localStorage.removeItem('fortune_landed_sector');
        localStorage.removeItem('fortune_phase');
        setHasPlayed(false);
        setPhase('intro');
      }

      // Check if custom config was passed via URL
      const encoded = params.get('cfg');
      if (encoded) {
        const decoded = decodeConfigFromUrl(encoded);
        if (decoded) {
          setConfig(decoded);
        }
      }

      // Check admin mode (?admin=1)
      if (params.get('admin') === '1') {
        setShowAdminControls(true);
        setIsAdminOpen(true);
        setIsLocked(false);
      }

      // Check unlock override (?unlock=1)
      if (params.get('unlock') === '1') {
        setIsLocked(false);
      }
    } catch {}
  }, []);

  const changePhase = (next: GamePhase) => {
    setPhase(next);
    try {
      localStorage.setItem('fortune_phase', next);
    } catch {}
  };

  const handleSecretBadgeTap = () => {
    secretTapCountRef.current += 1;
    triggerHaptic(12);

    if (secretTapTimeoutRef.current) {
      clearTimeout(secretTapTimeoutRef.current);
    }

    if (secretTapCountRef.current >= 5) {
      secretTapCountRef.current = 0;
      sound.playRadioBeep();
      triggerHaptic(50);
      setShowAdminControls(true);
      setIsAdminOpen(true);
      setIsLocked(false);
    } else {
      secretTapTimeoutRef.current = setTimeout(() => {
        secretTapCountRef.current = 0;
      }, 2500);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playTick(1.0, 0.3);
    }
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
  };

  const handleSpinComplete = (sector: Sector, millimeterMiss: boolean) => {
    setIsSpinning(false);
    setLandedSector(sector);
    setIsMillimeterMiss(millimeterMiss);

    // Theatrical show! Attempt 1 lands on "ЕЩЁ ПОПЫТКА" (+1 шанс)
    if (attemptNumber === 1 && (sector.type === 'retry' || config.mode === 'drama')) {
      setShowRetryModal(true);
      setAttemptNumber(2);
      try {
        localStorage.setItem('fortune_attempt_number', '2');
      } catch {}
      return;
    }

    // Final attempt (Spin 2): result is permanently sealed for this browser!
    setHasPlayed(true);

    try {
      localStorage.setItem('fortune_user_played_v1', 'true');
      localStorage.setItem('fortune_attempt_number', '2');
      localStorage.setItem('fortune_landed_sector', JSON.stringify(sector));
      localStorage.setItem('fortune_phase', 'monologue');
    } catch {}

    setPhase('monologue');
  };

  const handleResetTest = () => {
    try {
      localStorage.removeItem('fortune_user_played_v1');
      localStorage.removeItem('fortune_attempt_number');
      localStorage.removeItem('fortune_landed_sector');
      localStorage.removeItem('fortune_phase');
      localStorage.removeItem('fortune_config_custom_v5');
      localStorage.removeItem('fortune_config_custom_v8');
    } catch {}
    setConfig(DEFAULT_CONFIG);
    setHasPlayed(false);
    setAttemptNumber(1);
    setShowRetryModal(false);
    setIsSpinning(false);
    setPhase('intro');
    setLandedSector(DEFAULT_SECTORS[1]);
    setIsMillimeterMiss(true);
    triggerHaptic(30);
  };

  const handleCopyBrotherLink = () => {
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    const pathname = window.location.pathname;
    const encodedCfg = encodeConfigToUrl(config);
    const shareUrl = `${origin}${pathname}?view=play&cfg=${encodedCfg}`;

    navigator.clipboard.writeText(shareUrl);
    setLinkCopiedToast(true);
    triggerHaptic(20);
    setTimeout(() => setLinkCopiedToast(false), 2400);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar (Clean, no spoiler tabs, single brand mark) */}
      <header className="sticky top-0 z-40 bg-[#0a0c10]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand wordmark + Secret tap badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display font-black text-sm sm:text-base text-white tracking-wider uppercase">
              ФОРТУНА · 13
            </span>
            <button
              type="button"
              onClick={handleSecretBadgeTap}
              title="На связи Jayce (5 быстрых нажатий открывают секретный пульт)"
              className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded cursor-pointer active:scale-90 transition-transform"
            >
              21 → 13
            </button>
          </div>

          {/* Zone 2: Empty space (zero step spoilers for brother) */}
          <div className="flex-1" />

          {/* Zone 3: Actions (Sound + Admin controls only if unlocked by Jayce) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleSound}
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Admin, Reset, and Share buttons visible ONLY if Jayce activated admin mode */}
            {showAdminControls && (
              <>
                <button
                  onClick={handleResetTest}
                  title="Сбросить попытку (для теста Jayce)"
                  className="h-9 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span className="hidden xs:inline">Сброс</span>
                </button>

                <button
                  onClick={handleCopyBrotherLink}
                  title="Скопировать чистую ссылку для мелкого"
                  className="h-9 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 flex items-center gap-1.5 text-xs font-medium transition-colors active:scale-95"
                >
                  <Share2 size={14} />
                  <span className="hidden xs:inline">Ссылка</span>
                </button>

                <button
                  onClick={() => setIsAdminOpen(true)}
                  title="Пульт старшего брата"
                  className="h-9 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-95"
                >
                  <Sliders size={14} />
                  <span>Пульт</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification when Share Link is Copied */}
      {linkCopiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-4 py-2 rounded-full font-display font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <span>✓ Ссылка для мелкого скопирована! Отправь её в Telegram или WhatsApp.</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5 flex flex-col justify-center">
        {/* State A: Locked until 13:00 */}
        {isLocked ? (
          <CountdownLockScreen
            targetDate={targetLockDate}
            onUnlock={() => setIsLocked(false)}
          />
        ) : (
          /* State B: Unlocked Birthday Experience */
          <>
            {phase === 'intro' && (
              <IntroScreen
                config={config}
                onStart={() => {
                  if (hasPlayed) {
                    changePhase('monologue');
                  } else {
                    changePhase('wheel');
                  }
                }}
              />
            )}

            {phase === 'wheel' && (
              <div className="w-full flex flex-col items-center gap-3 animate-fade-in">
                {/* Header Status */}
                <div className="text-center space-y-1">
                  <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                    {hasPlayed
                      ? 'ПОПЫТКА ИСПОЛЬЗОВАНА'
                      : attemptNumber === 2
                      ? 'ВТОРОЙ ШАНС АКТИВИРОВАН'
                      : 'ОДНА ПОПЫТКА · БЕЗ ПЕРЕКРУТОВ'}
                  </div>
                  <h2 className="text-base text-slate-300 font-medium">
                    {hasPlayed
                      ? 'Твой спин уже сделан. Результат зафиксирован.'
                      : attemptNumber === 2
                      ? 'Решающий запуск. Больше шансов не будет.'
                      : 'Посмотрим, вывезет ли тебя слепая удача.'}
                  </h2>
                </div>

                {/* The Fortune Wheel */}
                <FortuneWheel
                  sectors={config.sectors}
                  mode={config.mode}
                  isSpinning={isSpinning}
                  onSpinStart={handleSpinStart}
                  onSpinComplete={handleSpinComplete}
                  attemptNumber={attemptNumber}
                  maxAttempts={2}
                  disabled={hasPlayed}
                />

                {hasPlayed && (
                  <button
                    onClick={() => changePhase('monologue')}
                    className="w-full mt-2 min-h-[48px] rounded-xl font-display font-bold text-xs uppercase bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    ПЕРЕЙТИ К РЕЗУЛЬТАТУ СПИНА →
                  </button>
                )}
              </div>
            )}

            {phase === 'monologue' && landedSector && (
              <BrotherMonologue
                sector={landedSector}
                isMillimeterMiss={isMillimeterMiss}
                config={config}
                onProceedToEnvelopes={() => changePhase('envelopes')}
              />
            )}

            {phase === 'envelopes' && (
              <EnvelopeGrid
                sectors={config.sectors}
                highlightedSectorId={landedSector?.id}
                onProceedToSecretGift={() => changePhase('real-gift')}
              />
            )}

            {phase === 'real-gift' && (
              <RealGiftModal
                realGift={config.realGift}
                olderBrotherName={config.olderBrotherName}
                youngerBrotherName={config.youngerBrotherName}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Zero spoilers, No restart button) */}
      <footer className="border-t border-slate-900 py-3 text-center text-[11px] text-slate-600">
        <div className="max-w-md mx-auto flex items-center justify-between px-4">
          <span>Фортуна на 13 лет · Jayce</span>
          <span className="font-mono text-[10px]">2026</span>
        </div>
      </footer>

      {/* Theatrical Retry Celebration Modal (When 1st spin hits "ЕЩЁ ПОПЫТКА") */}
      <RetryCelebrationModal
        isOpen={showRetryModal}
        onProceed={() => setShowRetryModal(false)}
      />

      {/* Older Brother's Secret Admin Modal (Unlocked via 5-tap or direct admin link) */}
      <BrotherAdminModal
        config={config}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSave={(newCfg) => setConfig(newCfg)}
        onResetTest={handleResetTest}
      />
    </div>
  );
}
