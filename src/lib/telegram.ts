export interface TelegramUserPreview {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramUserPreview };
  ready: () => void;
  expand: () => void;
  colorScheme?: string;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: { impactOccurred: (s: string) => void };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** Raw Telegram initData string. Empty when the app is not running inside Telegram. */
export function getInitData(): string {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData ?? "";
}

export function isTelegramEnvironment(): boolean {
  return getInitData().length > 0;
}

export function initTelegram() {
  if (typeof window === "undefined") return;
  const wa = window.Telegram?.WebApp;
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
    wa.setHeaderColor?.("#0b1730");
    wa.setBackgroundColor?.("#0b1730");
  } catch {
    /* Telegram client version may not support these */
  }
}
