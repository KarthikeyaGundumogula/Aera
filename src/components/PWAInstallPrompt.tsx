import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, installApp, hasNativePrompt } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (isInstalled || !isInstallable || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      await installApp();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[999]"
          >
            <div className="relative overflow-hidden rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Install Framehouse
                  </h4>
                  <p className="text-[10px] text-white/50 font-medium">
                    Get the native app experience
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-lg shrink-0"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Manual Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs rounded-2xl bg-neutral-900 border border-white/10 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto text-white">
                <Share className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Install on iOS Safari
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Follow these steps to add Framehouse to your home screen:
                </p>
              </div>

              <div className="space-y-3 text-left bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-white/80">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span className="flex items-center gap-1">
                    Tap the <Share className="w-4 h-4 text-blue-400 inline" /> Share button
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span className="flex items-center gap-1">
                    Select <PlusSquare className="w-4 h-4 text-white inline" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
