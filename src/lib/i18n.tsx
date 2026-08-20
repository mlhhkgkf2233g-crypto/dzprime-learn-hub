import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "fr" | "en";

export const LANGS: { code: Lang; label: string; flag: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", label: "العربية", flag: "🇩🇿", dir: "rtl" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
];

const STORAGE_KEY = "dzpa.lang";

const ar = {
  appName: "DZ PRIME ACADEMY",
  tagline: "منصة تعليمية جزائرية متميزة",
  loading: "جاري التحميل...",
  preparing: "جاري تجهيز حسابك...",
  retry: "إعادة المحاولة",
  pageErrorTitle: "تعذر تحميل الصفحة",
  pageErrorDesc: "حدث خطأ غير متوقع، حاول مرة أخرى.",
  notFound: "الصفحة غير موجودة",
  backHome: "العودة للرئيسية",

  navHome: "الرئيسية",
  navNews: "الأخبار",
  navContent: "المحتوى",
  navAccount: "الحساب",
  navSettings: "الإعدادات",

  authTitle: "مطلوب تسجيل الدخول عبر تيليغرام",
  authDesc:
    "هذا التطبيق يعمل داخل تيليغرام. افتحه من بوت DZ PRIME ACADEMY لتسجيل الدخول بحسابك الحقيقي.",
  authButton: "فتح عبر تيليغرام",
  configTitle: "إعداد مطلوب",
  configDesc: "لم يتم ضبط مفاتيح الخادم بعد. يرجى إضافة TELEGRAM_BOT_TOKEN في إعدادات الخادم.",

  welcome: "مرحباً بك",
  lessons: "الدروس",
  summaries: "الملخصات",
  exercises: "التمارين",
  exams: "الاختبارات",
  files: "الملفات",
  all: "الكل",
  allSubjects: "كل المواد",
  importantAnnouncements: "إعلانات هامة",
  latestNews: "آخر الأخبار",
  recommended: "محتوى مقترح",
  emptyNews: "لا توجد أخبار حالياً",
  emptyContent: "لا يوجد محتوى متاح حالياً",

  onboardTitle: "أهلاً بك في DZ PRIME ACADEMY",
  onboardSubtitle: "أكمل معلوماتك لنجهز لك تجربتك الدراسية",
  fieldName: "الاسم",
  fieldYear: "السنة الدراسية",
  fieldBranch: "الشعبة",
  fieldWilaya: "الولاية",
  namePlaceholder: "اكتب اسمك الكامل",
  chooseYear: "اختر السنة الدراسية",
  chooseBranch: "اختر الشعبة",
  chooseYearFirst: "اختر السنة أولاً",
  chooseWilaya: "اختر الولاية",
  continue: "متابعة",
  saving: "جاري الحفظ...",
  save: "حفظ",
  cancel: "إلغاء",
  editInfo: "تعديل المعلومات",
  completeFields: "يرجى إكمال جميع الحقول",
  saved: "تم حفظ التعديلات",
  saveFailed: "تعذر الحفظ",
  profileSaveFailed: "تعذر حفظ المعلومات",

  notifications: "الإشعارات",
  language: "اللغة",
  aboutApp: "حول التطبيق",
  aboutText:
    "DZ PRIME ACADEMY — منصة تعليمية جزائرية للطور الثانوي، تقدم الدروس والملخصات والتمارين والاختبارات حسب السنة الدراسية والشعبة.",
  support: "الدعم",
  editPersonalInfo: "تعديل المعلومات الشخصية",
  settingSaved: "تم حفظ الإعداد",
  settingFailed: "تعذر حفظ الإعداد",
};

type Dict = typeof ar;

const fr: Dict = {
  appName: "DZ PRIME ACADEMY",
  tagline: "Plateforme éducative algérienne premium",
  loading: "Chargement...",
  preparing: "Préparation de votre compte...",
  retry: "Réessayer",
  pageErrorTitle: "Impossible de charger la page",
  pageErrorDesc: "Une erreur inattendue est survenue, réessayez.",
  notFound: "Page introuvable",
  backHome: "Retour à l'accueil",

  navHome: "Accueil",
  navNews: "Actualités",
  navContent: "Contenu",
  navAccount: "Compte",
  navSettings: "Paramètres",

  authTitle: "Connexion Telegram requise",
  authDesc:
    "Cette application fonctionne dans Telegram. Ouvrez-la depuis le bot DZ PRIME ACADEMY pour vous connecter avec votre vrai compte.",
  authButton: "Ouvrir dans Telegram",
  configTitle: "Configuration requise",
  configDesc:
    "Les clés serveur ne sont pas configurées. Ajoutez TELEGRAM_BOT_TOKEN dans les paramètres serveur.",

  welcome: "Bienvenue",
  lessons: "Cours",
  summaries: "Résumés",
  exercises: "Exercices",
  exams: "Examens",
  files: "Fichiers",
  all: "Tout",
  allSubjects: "Toutes les matières",
  importantAnnouncements: "Annonces importantes",
  latestNews: "Dernières actualités",
  recommended: "Contenu recommandé",
  emptyNews: "Aucune actualité pour le moment",
  emptyContent: "Aucun contenu disponible pour le moment",

  onboardTitle: "Bienvenue à DZ PRIME ACADEMY",
  onboardSubtitle: "Complétez vos informations pour personnaliser votre expérience",
  fieldName: "Nom",
  fieldYear: "Année scolaire",
  fieldBranch: "Filière",
  fieldWilaya: "Wilaya",
  namePlaceholder: "Votre nom complet",
  chooseYear: "Choisissez l'année",
  chooseBranch: "Choisissez la filière",
  chooseYearFirst: "Choisissez d'abord l'année",
  chooseWilaya: "Choisissez la wilaya",
  continue: "Continuer",
  saving: "Enregistrement...",
  save: "Enregistrer",
  cancel: "Annuler",
  editInfo: "Modifier les informations",
  completeFields: "Veuillez compléter tous les champs",
  saved: "Modifications enregistrées",
  saveFailed: "Échec de l'enregistrement",
  profileSaveFailed: "Impossible d'enregistrer les informations",

  notifications: "Notifications",
  language: "Langue",
  aboutApp: "À propos",
  aboutText:
    "DZ PRIME ACADEMY — plateforme éducative algérienne pour le secondaire : cours, résumés, exercices et examens selon l'année et la filière.",
  support: "Support",
  editPersonalInfo: "Modifier les informations personnelles",
  settingSaved: "Paramètre enregistré",
  settingFailed: "Échec de l'enregistrement du paramètre",
};

const en: Dict = {
  appName: "DZ PRIME ACADEMY",
  tagline: "Premium Algerian learning platform",
  loading: "Loading...",
  preparing: "Preparing your account...",
  retry: "Try again",
  pageErrorTitle: "Could not load the page",
  pageErrorDesc: "An unexpected error occurred, please try again.",
  notFound: "Page not found",
  backHome: "Back to home",

  navHome: "Home",
  navNews: "News",
  navContent: "Content",
  navAccount: "Account",
  navSettings: "Settings",

  authTitle: "Telegram sign-in required",
  authDesc:
    "This app runs inside Telegram. Open it from the DZ PRIME ACADEMY bot to sign in with your real account.",
  authButton: "Open in Telegram",
  configTitle: "Configuration required",
  configDesc: "Server keys are not set yet. Please add TELEGRAM_BOT_TOKEN in server settings.",

  welcome: "Welcome",
  lessons: "Lessons",
  summaries: "Summaries",
  exercises: "Exercises",
  exams: "Exams",
  files: "Files",
  all: "All",
  allSubjects: "All subjects",
  importantAnnouncements: "Important announcements",
  latestNews: "Latest news",
  recommended: "Recommended content",
  emptyNews: "No news yet",
  emptyContent: "No content available yet",

  onboardTitle: "Welcome to DZ PRIME ACADEMY",
  onboardSubtitle: "Complete your details so we can tailor your experience",
  fieldName: "Name",
  fieldYear: "School year",
  fieldBranch: "Branch",
  fieldWilaya: "Wilaya",
  namePlaceholder: "Your full name",
  chooseYear: "Choose the school year",
  chooseBranch: "Choose the branch",
  chooseYearFirst: "Choose the year first",
  chooseWilaya: "Choose the wilaya",
  continue: "Continue",
  saving: "Saving...",
  save: "Save",
  cancel: "Cancel",
  editInfo: "Edit information",
  completeFields: "Please complete all fields",
  saved: "Changes saved",
  saveFailed: "Could not save",
  profileSaveFailed: "Could not save your information",

  notifications: "Notifications",
  language: "Language",
  aboutApp: "About",
  aboutText:
    "DZ PRIME ACADEMY — an Algerian secondary-school learning platform with lessons, summaries, exercises and exams by year and branch.",
  support: "Support",
  editPersonalInfo: "Edit personal information",
  settingSaved: "Setting saved",
  settingFailed: "Could not save the setting",
};

export const translations: Record<Lang, Dict> = { ar, fr, en };

export function dirOf(lang: Lang) {
  return lang === "ar" ? "rtl" : "ltr";
}

export function localeOf(lang: Lang) {
  return lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB";
}

type I18nValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: keyof Dict) => string;
  setLang: (lang: Lang) => void;
};

const Ctx = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    const d = dirOf(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", d);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: dirOf(lang),
      t: (key) => translations[lang][key] ?? translations.ar[key],
      setLang,
    }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
