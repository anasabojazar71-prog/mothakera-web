import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  GraduationCap,
  Search,
  Plus,
  Link2,
  X,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
  Users,
  BookOpen,
  Filter,
  Loader2,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Menu,
  Home as HomeIcon,
  Pencil,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { auth as firebaseAuth, db } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  reload,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

/* ---------------------------------- i18n ---------------------------------- */

const STRINGS = {
  ar: {
    nav: { logo: "مذكرة", home: "الرئيسية", add: "أضف مادة", about: "حول المنصة", menu: "القائمة" },
    common: { close: "إغلاق" },
    auth: {
      title: "حسابك",
      signInTab: "تسجيل الدخول",
      signUpTab: "إنشاء حساب",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@university.edu",
      passwordLabel: "كلمة السر",
      passwordPlaceholder: "٦ أحرف على الأقل",
      submitSignIn: "تسجيل الدخول",
      submitSignUp: "إنشاء الحساب",
      submitting: "جارٍ التحقق...",
      forgotPassword: "نسيت كلمة السر؟",
      backToSignIn: "رجوع لتسجيل الدخول",
      resetTitle: "استرجاع كلمة السر",
      resetSub: "بنبعتلك رابط لإعادة تعيين كلمة السر على بريدك.",
      sendResetLink: "إرسال رابط الاسترجاع",
      resetSent: "تم إرسال رابط استرجاع كلمة السر إلى بريدك.",
      signupSuccessVerify: "تم إنشاء الحساب! تفقّد بريدك الإلكتروني وفعّله.",
      verifyPendingTitle: "فعّل بريدك الإلكتروني",
      verifyPendingBody: "بعتنالك رابط تفعيل على {email}. افتح بريدك ودوس على الرابط، وبعدها ارجع دوس «تحققت».",
      resendVerification: "إعادة إرسال رابط التفعيل",
      resendSent: "تم إرسال رابط التفعيل من جديد.",
      checkVerified: "تحققت، تابع",
      verifiedNow: "تم تفعيل حسابك بنجاح!",
      loggedInAs: "مسجّل الدخول: {email}",
      displayNameLabel: "الاسم الظاهر للطلاب (اختياري)",
      displayNamePlaceholder: "كيف بدك اسمك يظهر؟",
      saveDisplayName: "حفظ",
      logout: "تسجيل خروج",
      needAccount: "ما عندك حساب؟",
      haveAccount: "عندك حساب أصلاً؟",
      errors: {
        EMAIL_EXISTS: "هذا البريد مسجّل مسبقًا.",
        INVALID_EMAIL: "صيغة البريد الإلكتروني غير صحيحة.",
        WEAK_PASSWORD: "كلمة السر لازم تكون ٦ أحرف على الأقل.",
        EMAIL_NOT_FOUND: "ما في حساب مسجّل بهذا البريد.",
        INVALID_PASSWORD: "كلمة السر غير صحيحة.",
        INVALID_LOGIN_CREDENTIALS: "البريد أو كلمة السر غير صحيحة.",
        TOO_MANY_ATTEMPTS_TRY_LATER: "محاولات كثيرة، جرّب بعد شوي.",
        NETWORK_ERROR: "تعذّر الاتصال بخادم تسجيل الدخول. تأكد من الإنترنت وجرّب مرة ثانية.",
        USER_DISABLED: "هذا الحساب معطّل.",
        MISSING_PASSWORD: "لازم تدخل كلمة السر.",
        MISSING_EMAIL: "لازم تدخل البريد الإلكتروني.",
        default: "صار في خطأ، جرّب مرة ثانية.",
      },
    },
    hero: {
      eyebrow: "مساحة مشتركة لطلاب الجامعة",
      title: "دوّن، شارك، واعثر على ما تحتاجه\nقبل الامتحان لا بعده",
      sub: "كل ملخص أو ملزمة أو رابط تشاركه يصبح متاحًا فورًا لأي طالب آخر يدرس نفس المادة. لا حاجة للتسجيل، فقط أدخل اسمك وابدأ.",
      statMaterials: "مادة متوفرة",
      statSubjects: "مقرر دراسي",
      cta: "شارك أول مادة",
    },
    toolbar: {
      searchPlaceholder: "ابحث بالعنوان أو المادة أو رمز المقرر...",
      allSubjects: "كل المواد",
      allTypes: "كل الأنواع",
      allSections: "كل الأقسام",
    },
    loading: "جارٍ تحميل المواد...",
    empty: {
      noResultsTitle: "لم نعثر على نتائج مطابقة",
      noResultsSub: "جرّب كلمة بحث مختلفة أو غيّر الفلتر.",
      noMaterialsTitle: "لا توجد مواد مضافة بعد",
      noMaterialsSub: "كن أول من يضيف ملخصًا أو ملزمة لزملائك.",
      addNow: "أضف مادة الآن",
      tryDemo: "أو جرّب الموقع ببيانات تجريبية",
    },
    card: { unknown: "طالب مجهول" },
    toast: {
      addSuccess: "تمت إضافة المادة بنجاح، وأصبحت ظاهرة لجميع الطلاب.",
      addSyncWarn: "تمت إضافة المادة على جهازك، لكن حدثت مشكلة في مزامنتها مع بقية الطلاب.",
      seedSuccess: "تمت إضافة بيانات تجريبية، جرّب التصفح والفلترة.",
      seedSyncWarn: "أُضيفت البيانات التجريبية محليًا فقط بسبب مشكلة في المزامنة.",
      updateSuccess: "تم حفظ التعديلات بنجاح.",
      updateSyncWarn: "تم حفظ التعديلات على جهازك، لكن حدثت مشكلة في مزامنتها.",
      fixErrors: "يرجى تصحيح الحقول المظلّلة قبل الإرسال.",
    },
    modal: {
      openLink: "فتح الملف / الرابط",
      edit: "تعديل",
    },
    addPage: {
      title: "أضف مادة دراسية",
      editTitle: "تعديل المادة",
      sub: "شارك رابط ملف (Google Drive أو OneDrive مثلاً). كل ما قد يفيد زميلك يستحق أن يُشارَك.",
      titleLabel: "عنوان المادة *",
      titlePlaceholder: "مثال: ملخص الفصل الثالث - فيزياء عامة",
      subjectLabel: "المقرر / المادة *",
      subjectPlaceholder: "مثال: فيزياء عامة 101",
      codeLabel: "رمز المقرر (اختياري)",
      codePlaceholder: "PHYS101",
      typeLabel: "نوع المادة",
      sectionLabel: "القسم (اختياري)",
      sectionPlaceholder: "مثال: متطلبات التخصص",
      sectionPresets: ["متطلبات الجامعة", "متطلبات الكلية", "متطلبات التخصص", "بنك الأسئلة والامتحانات", "ملخصات عامة"],
      descLabel: "وصف مختصر (اختياري)",
      descPlaceholder: "بجملة أو جملتين، ما الذي يغطيه هذا الملف؟",
      linkLabel: "رابط الملف *",
      linkPlaceholder: "https://drive.google.com/...",
      attributionLabel: "الاسم الظاهر على المادة",
      postAsName: "نشر باسم: {name}",
      postAnonymous: "نشر كمجهول (بدون اسم)",
      authRequiredTitle: "لازم تسجّل دخولك أول",
      authRequiredBody: "عشان تضيف مادة، لازم يكون عندك حساب مفعّل. بيستغرق دقيقة بس.",
      authRequiredCta: "تسجيل الدخول / إنشاء حساب",
      verifyRequiredBody: "بقى خطوة وحدة: فعّل بريدك الإلكتروني عشان تقدر تضيف مواد.",
      submit: "إضافة المادة",
      submitting: "جارٍ الإضافة...",
      saveChanges: "حفظ التعديلات",
      saving: "جارٍ الحفظ...",
      cancelEdit: "إلغاء",
      errTitle: "العنوان مطلوب",
      errSubject: "اسم المادة أو المقرر مطلوب",
      errLink: "رابط الملف مطلوب",
    },
    about: {
      title: "حول منصة مذكرة",
      sub: "فكرة بسيطة: عندما ينتهي طالب من مادة ولديه ملخص أو ملزمة منظمة، يشاركها خلال دقيقة، ليجدها طالب آخر يدرس نفس المقرر جاهزة.",
      rulesTitle: "قواعد المشاركة",
      rules: [
        "شارك موادًا من إعدادك الخاص أو مما يُسمح مشاركته فقط.",
        "لا تشارك أسئلة امتحانات محمية أو مواد فيها حقوق نشر.",
        'يُفضَّل استخدام روابط Google Drive أو OneDrive بصلاحية "أي شخص لديه الرابط".',
      ],
      howTitle: "كيف تعمل المنصة",
      how: [
        "كل مادة تضيفها تصبح ظاهرة لأي زائر يفتح الموقع.",
        "يظهر اسمك كتوقيع على المادة فقط، ويُحفظ على جهازك أنت.",
        "أضف رابط الملف مباشرة عند الإضافة.",
      ],
    },
    types: {
      summary: "ملخص",
      lecture: "ملزمة / محاضرة",
      exam: "أسئلة امتحان",
      slides: "شرائح عرض",
      reference: "مرجع / رابط خارجي",
      other: "أخرى",
    },
    time: { now: "الآن", min: "منذ {n} د", hr: "منذ {n} س", day: "منذ {n} يوم", month: "منذ {n} شهر" },
  },
  en: {
    nav: { logo: "Mothakera", home: "Home", add: "Add Material", about: "About", menu: "Menu" },
    common: { close: "Close" },
    auth: {
      title: "Your account",
      signInTab: "Sign in",
      signUpTab: "Create account",
      emailLabel: "Email",
      emailPlaceholder: "example@university.edu",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 6 characters",
      submitSignIn: "Sign in",
      submitSignUp: "Create account",
      submitting: "Checking...",
      forgotPassword: "Forgot password?",
      backToSignIn: "Back to sign in",
      resetTitle: "Reset password",
      resetSub: "We'll send a password reset link to your email.",
      sendResetLink: "Send reset link",
      resetSent: "A password reset link was sent to your email.",
      signupSuccessVerify: "Account created! Check your email to verify it.",
      verifyPendingTitle: "Verify your email",
      verifyPendingBody: "We sent a verification link to {email}. Open it, then come back and tap \"I've verified\".",
      resendVerification: "Resend verification link",
      resendSent: "Verification link resent.",
      checkVerified: "I've verified, continue",
      verifiedNow: "Your account is now verified!",
      loggedInAs: "Signed in: {email}",
      displayNameLabel: "Name shown to students (optional)",
      displayNamePlaceholder: "How should your name appear?",
      saveDisplayName: "Save",
      logout: "Log out",
      needAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      errors: {
        EMAIL_EXISTS: "This email is already registered.",
        INVALID_EMAIL: "That email address isn't valid.",
        WEAK_PASSWORD: "Password must be at least 6 characters.",
        EMAIL_NOT_FOUND: "No account found with this email.",
        INVALID_PASSWORD: "Incorrect password.",
        INVALID_LOGIN_CREDENTIALS: "Incorrect email or password.",
        TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts, try again shortly.",
        NETWORK_ERROR: "Couldn't reach the sign-in server. Check your connection and try again.",
        USER_DISABLED: "This account has been disabled.",
        MISSING_PASSWORD: "Please enter a password.",
        MISSING_EMAIL: "Please enter an email.",
        default: "Something went wrong, please try again.",
      },
    },
    hero: {
      eyebrow: "A shared space for university students",
      title: "Write it down, share it, find it\nbefore the exam, not after",
      sub: "Every summary, handout, or link you share becomes instantly available to any student in the same course. No sign-up needed — just add your name and start.",
      statMaterials: "materials available",
      statSubjects: "courses covered",
      cta: "Share the first material",
    },
    toolbar: {
      searchPlaceholder: "Search by title, subject, or course code...",
      allSubjects: "All subjects",
      allTypes: "All types",
      allSections: "All sections",
    },
    loading: "Loading materials...",
    empty: {
      noResultsTitle: "No matching results",
      noResultsSub: "Try a different search term or change the filters.",
      noMaterialsTitle: "No materials added yet",
      noMaterialsSub: "Be the first to share a summary or handout with your classmates.",
      addNow: "Add a material now",
      tryDemo: "Or try the site with sample data",
    },
    card: { unknown: "Anonymous student" },
    toast: {
      addSuccess: "Material added successfully and is now visible to everyone.",
      addSyncWarn: "Material added on your device, but syncing with other students failed.",
      seedSuccess: "Sample data added — try browsing and filtering.",
      seedSyncWarn: "Sample data added locally only, due to a sync issue.",
      updateSuccess: "Changes saved successfully.",
      updateSyncWarn: "Changes saved on your device, but syncing failed.",
      fixErrors: "Please fix the highlighted fields before submitting.",
    },
    modal: {
      openLink: "Open file / link",
      edit: "Edit",
    },
    addPage: {
      title: "Add a study material",
      editTitle: "Edit material",
      sub: "Share a file link (Google Drive, OneDrive, etc.). Anything that could help a classmate is worth sharing.",
      titleLabel: "Material title *",
      titlePlaceholder: "e.g. Chapter 3 summary - General Physics",
      subjectLabel: "Course / subject *",
      subjectPlaceholder: "e.g. General Physics 101",
      codeLabel: "Course code (optional)",
      codePlaceholder: "PHYS101",
      typeLabel: "Material type",
      sectionLabel: "Section (optional)",
      sectionPlaceholder: "e.g. Major requirement",
      sectionPresets: ["University requirement", "College requirement", "Major requirement", "Question bank", "General summaries"],
      descLabel: "Short description (optional)",
      descPlaceholder: "In a sentence or two, what does this file cover?",
      linkLabel: "File link *",
      linkPlaceholder: "https://drive.google.com/...",
      attributionLabel: "Name shown on the material",
      postAsName: "Post as: {name}",
      postAnonymous: "Post anonymously (no name)",
      authRequiredTitle: "Sign in first",
      authRequiredBody: "You need a verified account to add a material. It only takes a minute.",
      authRequiredCta: "Sign in / Create account",
      verifyRequiredBody: "One more step: verify your email to be able to add materials.",
      submit: "Add material",
      submitting: "Adding...",
      saveChanges: "Save changes",
      saving: "Saving...",
      cancelEdit: "Cancel",
      errTitle: "Title is required",
      errSubject: "Subject or course name is required",
      errLink: "File link is required",
    },
    about: {
      title: "About Mothakera",
      sub: "A simple idea: when a student finishes a course with a tidy summary or handout, they share it in a minute, and another student in the same course finds it ready to use.",
      rulesTitle: "Sharing guidelines",
      rules: [
        "Only share material you prepared yourself, or that you're allowed to share.",
        "Don't share protected exam questions or copyrighted material.",
        'Prefer Google Drive or OneDrive links set to "anyone with the link".',
      ],
      howTitle: "How the platform works",
      how: [
        "Every material you add becomes visible to anyone visiting the site.",
        "Your name appears only as a signature on the material, and is saved on your device.",
        "Add the file link directly when you submit.",
      ],
    },
    types: {
      summary: "Summary",
      lecture: "Handout / Lecture",
      exam: "Exam questions",
      slides: "Slides",
      reference: "External reference",
      other: "Other",
    },
    time: { now: "just now", min: "{n}m ago", hr: "{n}h ago", day: "{n}d ago", month: "{n}mo ago" },
  },
};

const TYPES = [
  { id: "summary", color: "var(--teal)" },
  { id: "lecture", color: "var(--amber)" },
  { id: "exam", color: "var(--rust)" },
  { id: "slides", color: "var(--blue)" },
  { id: "reference", color: "var(--muted)" },
  { id: "other", color: "var(--line)" },
];

function typeColor(id) {
  return TYPES.find((t) => t.id === id)?.color || "var(--line)";
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const DEMO_MATERIALS = [
  {
    title: "ملخص المحاضرتين 3 و4",
    subject: "برمجة 1",
    courseCode: "COMP101",
    type: "summary",
    section: "متطلبات التخصص",
    description: "ملخص يغطي الحلقات التكرارية والمصفوفات مع أمثلة محلولة",
    link: "https://drive.google.com/",
    uploaderName: "خالد",
  },
  {
    title: "أسئلة امتحان نصفي من فصل سابق مع الحل",
    subject: "تفاضل وتكامل 101",
    courseCode: "MATH101",
    type: "exam",
    section: "بنك الأسئلة والامتحانات",
    description: "أسئلة الفصل الماضي مع الحل الكامل، خمسة أسئلة تركز على المشتقات والتكامل",
    link: "https://drive.google.com/",
    uploaderName: "سارة",
  },
  {
    title: "شرائح المحاضرة الأولى كاملة",
    subject: "كيمياء عامة",
    courseCode: "CHEM101",
    type: "slides",
    section: "متطلبات الجامعة",
    description: "نسخة كاملة من شرائح الأستاذ",
    link: "https://drive.google.com/",
    uploaderName: "رهف",
  },
  {
    title: "ملزمة كاملة للغة الإنجليزية",
    subject: "لغة إنجليزية 101",
    courseCode: "ENG101",
    type: "lecture",
    section: "متطلبات الجامعة",
    description: "ملزمة مرتبة حسب الوحدات",
    link: "https://drive.google.com/",
    uploaderName: "لينا",
  },
  {
    title: "ملاحظات مراجعة سريعة لمبادئ المحاسبة",
    subject: "مبادئ محاسبة",
    courseCode: "ACC101",
    type: "summary",
    section: "متطلبات الكلية",
    description: "أهم نقطة هي حفظ القيود المحاسبية الأساسية والتمييز بين المدين والدائن",
    link: "https://drive.google.com/",
    uploaderName: "",
  },
  {
    title: "مرجع خارجي مفيد للفيزياء العامة",
    subject: "فيزياء عامة",
    courseCode: "PHYS101",
    type: "reference",
    section: "",
    description: "موقع يشرح الحركة والقوى بالفيديو بشكل أوضح من الكتاب",
    link: "https://www.khanacademy.org/",
    uploaderName: "عمر",
  },
];

function timeAgo(iso, T) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return T.time.now;
  if (mins < 60) return T.time.min.replace("{n}", mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return T.time.hr.replace("{n}", hrs);
  const days = Math.floor(hrs / 24);
  if (days < 30) return T.time.day.replace("{n}", days);
  const months = Math.floor(days / 30);
  return T.time.month.replace("{n}", months);
}

/* ------------------------------- storage helpers ------------------------------- */
// A real hosted site — localStorage works normally here (unlike the Claude
// artifact sandbox this was originally built in, which blocks it).

function getPref(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function setPref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // best effort — e.g. private browsing mode with storage disabled
  }
}

/* ------------------------------- Firestore (materials) ------------------------------- */

const materialsQuery = query(collection(db, "materials"), orderBy("dateAdded", "desc"));

async function addMaterialDoc(mat) {
  const { id, ...rest } = mat;
  await addDoc(collection(db, "materials"), rest);
}

async function updateMaterialDoc(mat) {
  const { id, ...rest } = mat;
  await updateDoc(doc(db, "materials", id), rest);
}

async function seedMaterialDocs(list) {
  const batch = writeBatch(db);
  list.forEach((mat) => {
    const { id, ...rest } = mat;
    const ref = doc(collection(db, "materials"));
    batch.set(ref, rest);
  });
  await batch.commit();
}

/* ------------------------------- Firebase Auth error mapping ------------------------------- */
// The real Firebase SDK throws errors like "auth/email-already-in-use" — map
// those onto the same T.auth.errors keys used throughout the UI.

const FIREBASE_ERROR_MAP = {
  "auth/email-already-in-use": "EMAIL_EXISTS",
  "auth/invalid-email": "INVALID_EMAIL",
  "auth/weak-password": "WEAK_PASSWORD",
  "auth/user-not-found": "EMAIL_NOT_FOUND",
  "auth/wrong-password": "INVALID_PASSWORD",
  "auth/invalid-credential": "INVALID_LOGIN_CREDENTIALS",
  "auth/invalid-login-credentials": "INVALID_LOGIN_CREDENTIALS",
  "auth/too-many-requests": "TOO_MANY_ATTEMPTS_TRY_LATER",
  "auth/network-request-failed": "NETWORK_ERROR",
  "auth/user-disabled": "USER_DISABLED",
  "auth/missing-password": "MISSING_PASSWORD",
  "auth/missing-email": "MISSING_EMAIL",
};

function mapAuthError(err, T) {
  const code = FIREBASE_ERROR_MAP[err?.code] || "default";
  return T.auth.errors[code] || T.auth.errors.default;
}

/* ---------------------------------- App ---------------------------------- */

export default function App() {
  const [page, setPage] = useState("home");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null); // firebase.User | null
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => getPref("theme-pref", "dark"));
  const [lang, setLang] = useState(() => getPref("lang-pref", "ar"));
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const T = STRINGS[lang];

  // Real-time materials list from Firestore — updates instantly for every
  // visitor whenever anyone adds or edits a material, no manual refresh needed.
  useEffect(() => {
    const unsub = onSnapshot(
      materialsQuery,
      (snap) => {
        setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Materials listener failed:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Real-time auth state from Firebase — fires once on load with the restored
  // session (if any), then again on every sign-in/out.
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setAuth(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const doSignUp = useCallback(
    async (email, password) => {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await sendEmailVerification(cred.user);
        setToast({ type: "success", text: T.auth.signupSuccessVerify });
        return { ok: true };
      } catch (err) {
        console.error("Sign-up failed:", err);
        return { ok: false, error: mapAuthError(err, T) };
      }
    },
    [T]
  );

  const doSignIn = useCallback(
    async (email, password) => {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { ok: true };
      } catch (err) {
        console.error("Sign-in failed:", err);
        return { ok: false, error: mapAuthError(err, T) };
      }
    },
    [T]
  );

  const doSendPasswordReset = useCallback(
    async (email) => {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
        return { ok: true };
      } catch (err) {
        console.error("Password reset failed:", err);
        return { ok: false, error: mapAuthError(err, T) };
      }
    },
    [T]
  );

  const doLogout = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  }, []);

  const doResendVerification = useCallback(async () => {
    if (!firebaseAuth.currentUser) return;
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
      setToast({ type: "success", text: T.auth.resendSent });
    } catch (err) {
      console.error("Resend verification failed:", err);
      setToast({ type: "warn", text: mapAuthError(err, T) });
    }
  }, [T]);

  const doCheckVerified = useCallback(async () => {
    if (!firebaseAuth.currentUser) return;
    try {
      await reload(firebaseAuth.currentUser);
      // reload() mutates currentUser in place but doesn't itself notify
      // onAuthStateChanged listeners, so refresh local state explicitly.
      const refreshed = firebaseAuth.currentUser;
      setAuth(refreshed ? { ...refreshed } : null);
      if (refreshed?.emailVerified) setToast({ type: "success", text: T.auth.verifiedNow });
    } catch (err) {
      console.error("Check-verified failed:", err);
      setToast({ type: "warn", text: mapAuthError(err, T) });
    }
  }, [T]);

  const doSetDisplayName = useCallback(async (name) => {
    if (!firebaseAuth.currentUser) return;
    try {
      await updateProfile(firebaseAuth.currentUser, { displayName: name.trim() });
      setAuth({ ...firebaseAuth.currentUser });
    } catch (err) {
      console.error("Updating display name failed:", err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      setPref("theme-pref", next);
      return next;
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      setPref("lang-pref", next);
      return next;
    });
  }, []);

  // Materials come from a real-time Firestore listener (see effect above), so
  // these just write through — the UI updates itself when the listener fires.
  const addMaterial = useCallback(
    async (mat) => {
      setPage("home");
      try {
        await addMaterialDoc(mat);
        setToast({ type: "success", text: T.toast.addSuccess });
      } catch (err) {
        console.error("Failed to add material:", err);
        setToast({ type: "warn", text: T.toast.addSyncWarn });
      }
    },
    [T]
  );

  const seedDemoData = useCallback(async () => {
    const now = Date.now();
    const seeded = DEMO_MATERIALS.map((m, i) => ({
      ...m,
      dateAdded: new Date(now - i * 3600000).toISOString(),
    }));
    try {
      await seedMaterialDocs(seeded);
      setToast({ type: "success", text: T.toast.seedSuccess });
    } catch (err) {
      console.error("Failed to add demo data:", err);
      setToast({ type: "warn", text: T.toast.seedSyncWarn });
    }
  }, [T]);

  const updateMaterial = useCallback(
    async (mat) => {
      setEditingMaterial(null);
      setPage("home");
      try {
        await updateMaterialDoc(mat);
        setToast({ type: "success", text: T.toast.updateSuccess });
      } catch (err) {
        console.error("Failed to update material:", err);
        setToast({ type: "warn", text: T.toast.updateSyncWarn });
      }
    },
    [T]
  );

  const goToAdd = useCallback(() => {
    setEditingMaterial(null);
    setPage("add");
  }, []);

  const startEdit = useCallback((m) => {
    setEditingMaterial(m);
    setDetail(null);
    setPage("add");
  }, []);

  const handleNavigate = useCallback((key) => {
    if (key === "add") setEditingMaterial(null);
    setPage(key);
    setDrawerOpen(false);
  }, []);

  const subjects = useMemo(() => {
    const set = new Set(materials.map((m) => m.subject).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [materials]);

  const sections = useMemo(() => {
    const set = new Set(materials.map((m) => m.section).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [materials]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter((m) => {
      if (subjectFilter !== "all" && m.subject !== subjectFilter) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (sectionFilter !== "all" && m.section !== sectionFilter) return false;
      if (!q) return true;
      const hay = `${m.title} ${m.subject} ${m.courseCode} ${m.description} ${m.section || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [materials, search, subjectFilter, typeFilter, sectionFilter]);

  const navLinks = [
    { key: "home", label: T.nav.home, icon: HomeIcon },
    { key: "add", label: T.nav.add, icon: Plus },
    { key: "about", label: T.nav.about, icon: Info },
  ];

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className="mz-root" data-theme={theme}>
      <Style />
      <Nav T={T} theme={theme} lang={lang} onToggleTheme={toggleTheme} onToggleLang={toggleLang} onOpenDrawer={() => setDrawerOpen(true)} setPage={handleNavigate} />

      <Drawer
        T={T}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        page={page}
        setPage={handleNavigate}
        navLinks={navLinks}
        auth={auth}
        onOpenAuth={() => {
          setDrawerOpen(false);
          setAuthModalOpen(true);
        }}
        onLogout={doLogout}
        onResendVerification={doResendVerification}
        onCheckVerified={doCheckVerified}
        onSetDisplayName={doSetDisplayName}
      />

      <main className="mz-main">
        {page === "home" && (
          <Home
            T={T}
            loading={loading}
            materials={materials}
            filtered={filtered}
            subjects={subjects}
            sections={sections}
            search={search}
            setSearch={setSearch}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sectionFilter={sectionFilter}
            setSectionFilter={setSectionFilter}
            setPage={setPage}
            setDetail={setDetail}
            onSeed={seedDemoData}
            onAddNew={goToAdd}
          />
        )}
        {page === "add" && (
          <AddMaterial
            T={T}
            auth={auth}
            authLoading={authLoading}
            editingMaterial={editingMaterial}
            onAdd={addMaterial}
            onUpdate={updateMaterial}
            onOpenLogin={() => setAuthModalOpen(true)}
            onResendVerification={doResendVerification}
            onCheckVerified={doCheckVerified}
            onCancel={() => {
              setEditingMaterial(null);
              setPage("home");
            }}
          />
        )}
        {page === "about" && <About T={T} />}
      </main>

      {detail && (
        <DetailModal T={T} material={detail} onClose={() => setDetail(null)} onEdit={startEdit} />
      )}
      <AuthModal
        T={T}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignIn={doSignIn}
        onSignUp={doSignUp}
        onSendPasswordReset={doSendPasswordReset}
      />
      {toast && <Toast toast={toast} />}
    </div>
  );
}

/* --------------------------------- Nav --------------------------------- */

function Nav({ T, theme, lang, onToggleTheme, onToggleLang, onOpenDrawer, setPage }) {
  return (
    <header className="mz-nav">
      <div className="mz-nav-inner">
        <button className="mz-logo" onClick={() => setPage("home")}>
          <GraduationCap size={22} strokeWidth={2.2} />
          <span>{T.nav.logo}</span>
        </button>

        <div className="mz-nav-start">
          <button className="mz-lang-btn" onClick={onToggleLang} aria-label={T.nav.menu}>
            <span className="mz-lang-code">{lang === "ar" ? "AR" : "EN"}</span>
            <Globe size={15} />
            <ChevronDown size={12} />
          </button>
          <button className="mz-theme-toggle" onClick={onToggleTheme} aria-label={T.nav.menu}>
            {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="mz-hamburger-btn" onClick={onOpenDrawer} aria-label={T.nav.menu}>
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------- Drawer -------------------------------- */

function Drawer({ T, isOpen, onClose, page, setPage, navLinks, auth, onOpenAuth, onLogout, onResendVerification, onCheckVerified, onSetDisplayName }) {
  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(auth?.displayName || "");

  useEffect(() => setDraft(auth?.displayName || ""), [auth?.displayName]);
  useEffect(() => {
    if (!isOpen) setEditingName(false);
  }, [isOpen]);

  const confirmName = () => {
    onSetDisplayName(draft.trim());
    setEditingName(false);
  };

  return (
    <>
      <div className={`mz-drawer-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose} aria-hidden={!isOpen} />
      <aside className={`mz-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="mz-drawer-header">
          <div className="mz-logo">
            <GraduationCap size={20} strokeWidth={2.2} />
            <span>{T.nav.logo}</span>
          </div>
          <button className="mz-icon-btn" onClick={onClose} aria-label={T.common.close}>
            <X size={16} />
          </button>
        </div>

        <nav className="mz-drawer-nav">
          {navLinks.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`mz-drawer-link ${page === key ? "is-active" : ""}`}
              onClick={() => setPage(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mz-drawer-footer">
          <span className="mz-drawer-footer-label">{T.auth.title}</span>

          {!auth ? (
            <button className="mz-name-pill" onClick={onOpenAuth}>
              <Users size={14} />
              <span>{T.auth.signInTab}</span>
            </button>
          ) : !auth.emailVerified ? (
            <div className="mz-verify-pending">
              <p className="mz-hint">{T.auth.verifyPendingBody.replace("{email}", auth.email)}</p>
              <div className="mz-login-actions">
                <button className="mz-text-link" onClick={onCheckVerified}>
                  <RefreshCw size={12} />
                  {T.auth.checkVerified}
                </button>
                <button className="mz-text-link" onClick={onResendVerification}>
                  {T.auth.resendVerification}
                </button>
                <button className="mz-text-link" onClick={onLogout}>
                  {T.auth.logout}
                </button>
              </div>
            </div>
          ) : editingName ? (
            <div className="mz-name-edit">
              <input
                autoFocus
                className="mz-name-input"
                value={draft}
                maxLength={30}
                placeholder={T.auth.displayNamePlaceholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmName();
                  if (e.key === "Escape") {
                    setDraft(auth?.displayName || "");
                    setEditingName(false);
                  }
                }}
              />
              <button className="mz-icon-btn" onClick={confirmName} aria-label={T.auth.saveDisplayName}>
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="mz-login-active">
              <span className="mz-login-badge">
                <ShieldCheck size={14} />
                {T.auth.loggedInAs.replace("{email}", auth.email)}
              </span>
              <div className="mz-login-actions">
                <button className="mz-text-link" onClick={() => setEditingName(true)}>
                  <Pencil size={11} />
                  {auth.displayName ? T.auth.displayNameLabel : T.auth.saveDisplayName}
                </button>
                <button className="mz-text-link" onClick={onLogout}>
                  {T.auth.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* --------------------------------- Home --------------------------------- */

function Home({
  T,
  loading,
  materials,
  filtered,
  subjects,
  sections,
  search,
  setSearch,
  subjectFilter,
  setSubjectFilter,
  typeFilter,
  setTypeFilter,
  sectionFilter,
  setSectionFilter,
  setPage,
  setDetail,
  onSeed,
  onAddNew,
}) {
  const subjectCount = subjects.length - 1;
  const [titleLine1, titleLine2] = T.hero.title.split("\n");

  return (
    <div className="mz-container">
      <section className="mz-hero">
        <div className="mz-hero-eyebrow">
          <Sparkles size={14} />
          <span>{T.hero.eyebrow}</span>
        </div>
        <h1 className="mz-hero-title">
          {titleLine1}
          <br />
          {titleLine2}
        </h1>
        <p className="mz-hero-sub">{T.hero.sub}</p>
        <div className="mz-stats">
          <div className="mz-stat">
            <span className="mz-stat-num">{materials.length}</span>
            <span className="mz-stat-label">{T.hero.statMaterials}</span>
          </div>
          <div className="mz-stat-divider" />
          <div className="mz-stat">
            <span className="mz-stat-num">{subjectCount}</span>
            <span className="mz-stat-label">{T.hero.statSubjects}</span>
          </div>
        </div>
        <button className="mz-btn-primary mz-hero-cta" onClick={onAddNew}>
          <Plus size={17} />
          {T.hero.cta}
        </button>
      </section>

      <section className="mz-toolbar">
        <div className="mz-search">
          <Search size={16} />
          <input placeholder={T.toolbar.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="mz-filters">
          <div className="mz-select-wrap">
            <Filter size={13} />
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? T.toolbar.allSubjects : s}
                </option>
              ))}
            </select>
          </div>
          <div className="mz-select-wrap">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{T.toolbar.allTypes}</option>
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {T.types[t.id]}
                </option>
              ))}
            </select>
          </div>
          {sections.length > 1 && (
            <div className="mz-select-wrap">
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? T.toolbar.allSections : s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="mz-loading">
          <Loader2 className="mz-spin" size={20} />
          <span>{T.loading}</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState T={T} hasMaterials={materials.length > 0} onAddNew={onAddNew} onSeed={onSeed} />
      ) : (
        <div className="mz-grid">
          {filtered.map((m, i) => (
            <MaterialCard key={m.id} T={T} material={m} index={i} onOpen={() => setDetail(m)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ T, hasMaterials, onAddNew, onSeed }) {
  return (
    <div className="mz-empty">
      <BookOpen size={30} strokeWidth={1.6} />
      {hasMaterials ? (
        <>
          <h3>{T.empty.noResultsTitle}</h3>
          <p>{T.empty.noResultsSub}</p>
        </>
      ) : (
        <>
          <h3>{T.empty.noMaterialsTitle}</h3>
          <p>{T.empty.noMaterialsSub}</p>
          <div className="mz-empty-actions">
            <button className="mz-btn-primary" onClick={onAddNew}>
              <Plus size={16} />
              {T.empty.addNow}
            </button>
            <button className="mz-btn-ghost" onClick={onSeed}>
              🧪 {T.empty.tryDemo}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MaterialCard({ T, material, index, onOpen }) {
  const rot = ROTATIONS[index % ROTATIONS.length];
  return (
    <button className="mz-card" style={{ "--rot": `${rot}deg`, "--dot": typeColor(material.type) }} onClick={onOpen}>
      <span className="mz-pin" aria-hidden="true" />
      <div className="mz-card-top">
        <span className="mz-type-badge">
          <span className="mz-dot" />
          {T.types[material.type] || material.type}
        </span>
        {material.courseCode && <span className="mz-code">{material.courseCode}</span>}
      </div>
      <h3 className="mz-card-title">{material.title}</h3>
      <p className="mz-card-subject">{material.subject}</p>
      {material.section && <span className="mz-section-tag">{material.section}</span>}
      {material.description && <p className="mz-card-desc">{material.description}</p>}
      <div className="mz-card-foot">
        <span>{material.uploaderName || T.card.unknown}</span>
        <span>{timeAgo(material.dateAdded, T)}</span>
      </div>
    </button>
  );
}

const ROTATIONS = [-1.4, 1, -0.6, 1.6, -1.1, 0.7];

/* -------------------------------- Modal -------------------------------- */

function DetailModal({ T, material, onClose, onEdit }) {
  return (
    <div className="mz-overlay" onClick={onClose}>
      <div className="mz-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mz-icon-btn mz-modal-close" onClick={onClose} aria-label={T.common.close}>
          <X size={17} />
        </button>
        <span className="mz-type-badge" style={{ "--dot": typeColor(material.type) }}>
          <span className="mz-dot" />
          {T.types[material.type] || material.type}
        </span>
        <h2 className="mz-modal-title">{material.title}</h2>
        <p className="mz-modal-meta">
          {material.subject}
          {material.courseCode ? ` · ${material.courseCode}` : ""} · {material.uploaderName || T.card.unknown}
          {material.section ? ` · ${material.section}` : ""}
        </p>
        {material.description && <p className="mz-modal-desc">{material.description}</p>}
        {material.link && (
          <a className="mz-btn-primary mz-modal-link" href={material.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
            {T.modal.openLink}
          </a>
        )}

        <div className="mz-modal-actions">
          <button className="mz-btn-ghost-sm" onClick={() => onEdit(material)}>
            <Pencil size={13} />
            {T.modal.edit}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Auth modal --------------------------------- */

function AuthModal({ T, isOpen, onClose, onSignIn, onSignUp, onSendPasswordReset }) {
  const [mode, setMode] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMode("signin");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setSubmitting(false);
      setError("");
      setResetSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError(T.auth.errors.MISSING_EMAIL);
      return;
    }
    if (mode !== "reset" && !password) {
      setError(T.auth.errors.MISSING_PASSWORD);
      return;
    }
    setSubmitting(true);
    let result;
    if (mode === "signin") result = await onSignIn(email.trim(), password);
    else if (mode === "signup") result = await onSignUp(email.trim(), password);
    else result = await onSendPasswordReset(email.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "reset") setResetSent(true);
    else onClose();
  };

  return (
    <div className="mz-overlay" onClick={onClose}>
      <div className="mz-modal mz-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mz-icon-btn mz-modal-close" onClick={onClose} aria-label={T.common.close}>
          <X size={17} />
        </button>

        {mode === "reset" ? (
          <>
            <h2 className="mz-modal-title">{T.auth.resetTitle}</h2>
            <p className="mz-modal-meta">{T.auth.resetSub}</p>
            {resetSent ? (
              <p className="mz-hint mz-auth-success">{T.auth.resetSent}</p>
            ) : (
              <>
                <Field label={T.auth.emailLabel}>
                  <div className="mz-input-icon">
                    <Mail size={15} />
                    <input
                      className="mz-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={T.auth.emailPlaceholder}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                  </div>
                </Field>
                {error && (
                  <span className="mz-error">
                    <AlertCircle size={12} />
                    {error}
                  </span>
                )}
                <button className="mz-btn-primary mz-submit" onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="mz-spin" size={16} />}
                  {T.auth.sendResetLink}
                </button>
              </>
            )}
            <button className="mz-text-link mz-auth-back" onClick={() => switchMode("signin")}>
              {T.auth.backToSignIn}
            </button>
          </>
        ) : (
          <>
            <div className="mz-auth-tabs">
              <button className={`mz-auth-tab ${mode === "signin" ? "is-active" : ""}`} onClick={() => switchMode("signin")}>
                {T.auth.signInTab}
              </button>
              <button className={`mz-auth-tab ${mode === "signup" ? "is-active" : ""}`} onClick={() => switchMode("signup")}>
                {T.auth.signUpTab}
              </button>
            </div>

            <Field label={T.auth.emailLabel}>
              <div className="mz-input-icon">
                <Mail size={15} />
                <input
                  className="mz-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={T.auth.emailPlaceholder}
                />
              </div>
            </Field>

            <Field label={T.auth.passwordLabel}>
              <div className="mz-input-icon">
                <button
                  type="button"
                  className="mz-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={T.auth.passwordLabel}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <input
                  className="mz-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={T.auth.passwordPlaceholder}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </Field>

            {mode === "signin" && (
              <button className="mz-text-link mz-auth-forgot" onClick={() => switchMode("reset")}>
                {T.auth.forgotPassword}
              </button>
            )}

            {error && (
              <span className="mz-error">
                <AlertCircle size={12} />
                {error}
              </span>
            )}

            <button className="mz-btn-primary mz-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mz-spin" size={16} />}
              {submitting ? T.auth.submitting : mode === "signin" ? T.auth.submitSignIn : T.auth.submitSignUp}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Add material ------------------------------- */

function AddMaterial({ T, auth, authLoading, onAdd, onUpdate, onCancel, editingMaterial, onOpenLogin, onResendVerification, onCheckVerified }) {
  const isEditing = !!editingMaterial;
  const attributionName = auth ? (auth.displayName?.trim() || auth.email) : "";
  const [title, setTitle] = useState(editingMaterial?.title || "");
  const [subject, setSubject] = useState(editingMaterial?.subject || "");
  const [courseCode, setCourseCode] = useState(editingMaterial?.courseCode || "");
  const [type, setType] = useState(editingMaterial?.type || TYPES[0].id);
  const [section, setSection] = useState(editingMaterial?.section || "");
  const [description, setDescription] = useState(editingMaterial?.description || "");
  const [link, setLink] = useState(editingMaterial?.link || "");
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const linkRef = useRef(null);

  const handleSubmit = async () => {
    const errs = {};
    if (!title.trim()) errs.title = T.addPage.errTitle;
    if (!subject.trim()) errs.subject = T.addPage.errSubject;
    if (!link.trim()) errs.link = T.addPage.errLink;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.link && linkRef.current) {
        linkRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    const base = {
      title: title.trim(),
      subject: subject.trim(),
      courseCode: courseCode.trim(),
      type,
      section: section.trim(),
      description: description.trim(),
      link: link.trim(),
    };
    if (isEditing) {
      // Original attribution is preserved on edit — only the editor's content changes.
      await onUpdate({ ...editingMaterial, ...base });
    } else {
      const uploaderName = postAnonymously ? "" : attributionName;
      await onAdd({ ...base, uploaderName, id: genId(), dateAdded: new Date().toISOString() });
    }
    setSubmitting(false);
  };

  return (
    <div className="mz-container mz-narrow">
      <h1 className="mz-page-title">{isEditing ? T.addPage.editTitle : T.addPage.title}</h1>
      <p className="mz-page-sub">{T.addPage.sub}</p>

      <div className="mz-form">
        <Field label={T.addPage.titleLabel} error={errors.title}>
          <input
            className={`mz-input ${errors.title ? "mz-input-invalid" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={T.addPage.titlePlaceholder}
          />
        </Field>

        <div className="mz-field-row">
          <Field label={T.addPage.subjectLabel} error={errors.subject}>
            <input
              className={`mz-input ${errors.subject ? "mz-input-invalid" : ""}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={T.addPage.subjectPlaceholder}
            />
          </Field>
          <Field label={T.addPage.codeLabel}>
            <input
              className="mz-input mz-mono"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder={T.addPage.codePlaceholder}
            />
          </Field>
        </div>

        <Field label={T.addPage.typeLabel}>
          <div className="mz-type-grid">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`mz-type-choice ${type === t.id ? "is-active" : ""}`}
                style={{ "--dot": t.color }}
                onClick={() => setType(t.id)}
              >
                <span className="mz-dot" />
                {T.types[t.id]}
              </button>
            ))}
          </div>
        </Field>

        <Field label={T.addPage.sectionLabel}>
          <input
            className="mz-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder={T.addPage.sectionPlaceholder}
          />
          <div className="mz-section-suggestions">
            {T.addPage.sectionPresets.map((p) => (
              <button
                key={p}
                type="button"
                className={`mz-suggestion-chip ${section === p ? "is-active" : ""}`}
                onClick={() => setSection(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Field label={T.addPage.descLabel}>
          <textarea
            className="mz-textarea"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={T.addPage.descPlaceholder}
          />
        </Field>

        <div ref={linkRef}>
          <Field label={T.addPage.linkLabel} error={errors.link}>
            <div className={`mz-input-icon ${errors.link ? "mz-input-invalid" : ""}`}>
              <Link2 size={15} />
              <input className="mz-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder={T.addPage.linkPlaceholder} />
            </div>
          </Field>
        </div>

        {!isEditing && (
          <Field label={T.addPage.attributionLabel}>
            {authLoading ? (
              <p className="mz-hint">
                <Loader2 className="mz-spin" size={12} />
              </p>
            ) : auth ? (
              <>
                <div className="mz-attribution-toggle">
                  <button
                    type="button"
                    className={`mz-attr-choice ${!postAnonymously ? "is-active" : ""}`}
                    onClick={() => setPostAnonymously(false)}
                  >
                    <Users size={14} />
                    {T.addPage.postAsName.replace("{name}", attributionName)}
                  </button>
                  <button
                    type="button"
                    className={`mz-attr-choice ${postAnonymously ? "is-active" : ""}`}
                    onClick={() => setPostAnonymously(true)}
                  >
                    {T.addPage.postAnonymous}
                  </button>
                </div>
                {!auth.emailVerified && !postAnonymously && (
                  <p className="mz-hint mz-inline-verify-hint">
                    {T.auth.verifyPendingBody.replace("{email}", auth.email)}{" "}
                    <button type="button" className="mz-text-link mz-inline-link" onClick={onCheckVerified}>
                      {T.auth.checkVerified}
                    </button>{" "}
                    <button type="button" className="mz-text-link mz-inline-link" onClick={onResendVerification}>
                      {T.auth.resendVerification}
                    </button>
                  </p>
                )}
              </>
            ) : (
              <p className="mz-hint">
                {T.addPage.notLoggedIn}{" "}
                <button type="button" className="mz-text-link mz-inline-link" onClick={onOpenLogin}>
                  {T.addPage.loginNow}
                </button>
              </p>
            )}
          </Field>
        )}

        <div className="mz-submit-row">
          <button className="mz-btn-primary mz-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mz-spin" size={16} /> : <Plus size={16} />}
            {submitting ? (isEditing ? T.addPage.saving : T.addPage.submitting) : isEditing ? T.addPage.saveChanges : T.addPage.submit}
          </button>
          {isEditing && (
            <button className="mz-btn-ghost" onClick={onCancel} type="button">
              {T.addPage.cancelEdit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="mz-field">
      <label className="mz-label">{label}</label>
      {children}
      {error && (
        <span className="mz-error">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
      {!error && hint && <span className="mz-hint">{hint}</span>}
    </div>
  );
}

/* ---------------------------------- About ---------------------------------- */

function About({ T }) {
  return (
    <div className="mz-container mz-narrow">
      <h1 className="mz-page-title">{T.about.title}</h1>
      <p className="mz-page-sub">{T.about.sub}</p>

      <div className="mz-about-grid">
        <div className="mz-about-card">
          <ShieldCheck size={20} />
          <h3>{T.about.rulesTitle}</h3>
          <ul>
            {T.about.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="mz-about-card">
          <Info size={20} />
          <h3>{T.about.howTitle}</h3>
          <ul>
            {T.about.how.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Toast ---------------------------------- */

function Toast({ toast }) {
  const kind = toast.type === "success" ? "success" : toast.type === "warn" ? "warn" : "error";
  return (
    <div className={`mz-toast mz-toast-${kind}`} role="status">
      {kind === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
      <span>{toast.text}</span>
    </div>
  );
}

/* ---------------------------------- Style ---------------------------------- */

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@300;400;500;700&family=JetBrains+Mono:wght@400;600&display=swap');

      .mz-root {
        /* constant tokens — same in both themes */
        --paper: #F3EEE2;
        --paper-2: #EAE2CD;
        --ink: #1F2A22;
        --muted: #8B8378;
        --line: #6E8577;
        --amber: #E3A730;
        --rust: #C1543C;
        --teal: #3F7D6B;
        --blue: #5C7CBF;
        --font-display: 'Cairo', sans-serif;
        --font-body: 'Tajawal', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;

        /* theme tokens — dark by default */
        --surface: #16241C;
        --surface-deep: #101B14;
        --text: #F3EEE2;
        --text-rgb: 243,238,226;

        min-height: 100vh;
        background:
          radial-gradient(circle at 15% 8%, rgba(227,167,48,0.05), transparent 40%),
          radial-gradient(circle at 85% 92%, rgba(63,125,107,0.08), transparent 45%),
          var(--surface);
        font-family: var(--font-body);
        color: var(--text);
        position: relative;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        line-height: 1.55;
        transition: background-color 0.2s, color 0.2s;
        overflow-x: hidden;
      }

      .mz-root[data-theme="light"] {
        --surface: #FFFFFF;
        --surface-deep: #F2EEE3;
        --text: #1F2A22;
        --text-rgb: 31,42,34;
      }

      .mz-root *, .mz-root *::before, .mz-root *::after { box-sizing: border-box; }

      @media (prefers-reduced-motion: reduce) {
        .mz-root *, .mz-root *::before, .mz-root *::after {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
      }

      .mz-root button, .mz-root input, .mz-root select, .mz-root textarea {
        font-family: inherit;
        color: inherit;
      }
      .mz-root button { cursor: pointer; background: none; border: none; }

      .mz-root :focus-visible {
        outline: 2px solid var(--amber);
        outline-offset: 2px;
        border-radius: 4px;
      }

      /* NAV */
      .mz-nav {
        position: sticky;
        top: 0;
        z-index: 20;
        background: var(--surface-deep);
        border-bottom: 1px dashed rgba(227,167,48,0.35);
      }
      .mz-nav-inner {
        max-width: 1080px;
        margin: 0 auto;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .mz-nav-start { display: flex; align-items: center; gap: 8px; }
      .mz-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.2rem;
        color: var(--amber);
      }

      .mz-hamburger-btn {
        display: grid; place-items: center;
        width: 38px; height: 38px;
        border-radius: 10px;
        background: rgba(var(--text-rgb),0.08);
        color: var(--text);
        transition: background 0.15s;
      }
      .mz-hamburger-btn:hover { background: rgba(var(--text-rgb),0.14); }

      .mz-lang-btn {
        display: flex; align-items: center; gap: 5px;
        height: 38px;
        padding: 0 10px;
        border-radius: 10px;
        background: rgba(var(--text-rgb),0.08);
        color: var(--text);
        font-size: 0.78rem; font-weight: 700;
        letter-spacing: 0.02em;
      }
      .mz-lang-btn:hover { background: rgba(var(--text-rgb),0.14); }
      .mz-lang-code { font-family: var(--font-mono); }

      .mz-theme-toggle {
        display: grid; place-items: center;
        width: 38px; height: 38px;
        border-radius: 10px;
        background: rgba(227,167,48,0.14);
        border: 1px solid rgba(227,167,48,0.3);
        color: var(--amber);
        transition: background 0.15s;
      }
      .mz-theme-toggle:hover { background: rgba(227,167,48,0.22); }

      /* DRAWER */
      .mz-drawer-overlay {
        position: fixed; inset: 0; z-index: 40;
        background: rgba(16,27,20,0.6);
        opacity: 0; pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .mz-drawer-overlay.is-open { opacity: 1; pointer-events: auto; }

      .mz-drawer {
        position: fixed; top: 0; bottom: 0;
        inset-inline-start: 0;
        width: 280px; max-width: 82vw;
        z-index: 41;
        background: var(--surface-deep);
        color: var(--text);
        border-inline-end: 1px dashed rgba(227,167,48,0.3);
        display: flex; flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }
      [dir="rtl"] .mz-drawer { transform: translateX(100%); }
      .mz-drawer.is-open { transform: translateX(0); }

      .mz-drawer-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 18px 14px;
        border-bottom: 1px dashed rgba(var(--text-rgb),0.18);
      }
      .mz-drawer-nav { display: flex; flex-direction: column; padding: 14px 12px; gap: 4px; }
      .mz-drawer-link {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 0.95rem; font-weight: 500;
        color: rgba(var(--text-rgb),0.75);
        text-align: start;
      }
      .mz-drawer-link:hover { background: rgba(var(--text-rgb),0.06); color: var(--text); }
      .mz-drawer-link.is-active { background: var(--amber); color: var(--ink); font-weight: 700; }

      .mz-drawer-footer {
        margin-top: auto;
        padding: 16px 18px 20px;
        border-top: 1px dashed rgba(var(--text-rgb),0.18);
        display: flex; flex-direction: column; gap: 8px;
      }
      .mz-drawer-footer-label { font-size: 0.72rem; color: rgba(var(--text-rgb),0.5); font-weight: 600; }

      .mz-name-pill {
        display: flex; align-items: center; gap: 6px;
        padding: 8px 12px;
        border: 1px dashed rgba(var(--text-rgb),0.3);
        border-radius: 999px;
        font-size: 0.85rem;
        color: var(--text);
        align-self: flex-start;
      }
      .mz-name-pill:hover { border-color: var(--amber); }
      .mz-name-edit { display: flex; align-items: center; gap: 6px; }
      .mz-name-input {
        background: rgba(var(--text-rgb),0.08);
        border: 1px solid var(--amber);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 0.85rem;
        width: 150px;
      }
      .mz-icon-btn {
        display: grid; place-items: center;
        width: 30px; height: 30px;
        border-radius: 999px;
        background: var(--amber);
        color: var(--ink);
        flex-shrink: 0;
      }

      /* LAYOUT */
      .mz-main { padding-bottom: 60px; }
      .mz-container { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
      .mz-narrow { max-width: 640px; padding-top: 40px; }

      /* HERO */
      .mz-hero { padding: 56px 0 36px; text-align: center; }
      .mz-hero-eyebrow {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.8rem; color: var(--amber); font-weight: 600;
        background: rgba(227,167,48,0.1);
        border: 1px dashed rgba(227,167,48,0.4);
        padding: 5px 12px; border-radius: 999px;
        margin-bottom: 18px;
      }
      .mz-hero-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: clamp(1.6rem, 4vw, 2.4rem);
        line-height: 1.55;
        color: var(--text);
        margin: 0 0 14px;
      }
      .mz-hero-sub {
        max-width: 480px; margin: 0 auto 26px;
        color: rgba(var(--text-rgb),0.68);
        font-size: 0.98rem; line-height: 1.75;
      }
      .mz-stats {
        display: flex; align-items: center; justify-content: center;
        gap: 22px; margin-bottom: 26px;
      }
      .mz-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .mz-stat-num { font-family: var(--font-mono); font-size: 1.7rem; color: var(--amber); font-weight: 600; }
      .mz-stat-label { font-size: 0.78rem; color: rgba(var(--text-rgb),0.55); }
      .mz-stat-divider { width: 1px; height: 32px; background: rgba(var(--text-rgb),0.2); }

      .mz-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--amber);
        color: var(--ink);
        font-weight: 700;
        font-size: 0.95rem;
        padding: 12px 22px;
        border-radius: 10px;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 3px 3px 0 rgba(0,0,0,0.22);
      }
      .mz-btn-primary:hover { transform: translateY(-2px); }
      .mz-btn-primary:active { transform: translateY(0); box-shadow: 1px 1px 0 rgba(0,0,0,0.22); }
      .mz-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      /* TOOLBAR */
      .mz-toolbar {
        display: flex; flex-wrap: wrap; gap: 12px;
        margin-bottom: 30px;
      }
      .mz-search {
        flex: 1 1 260px;
        display: flex; align-items: center; gap: 8px;
        background: rgba(var(--text-rgb),0.07);
        border: 1px solid rgba(var(--text-rgb),0.18);
        border-radius: 10px;
        padding: 10px 14px;
        color: rgba(var(--text-rgb),0.5);
      }
      .mz-search input {
        background: none; border: none; outline: none;
        width: 100%; color: var(--text); font-size: 0.9rem;
      }
      .mz-search input::placeholder { color: rgba(var(--text-rgb),0.4); }
      .mz-filters { display: flex; gap: 10px; flex-wrap: wrap; }
      .mz-select-wrap {
        display: flex; align-items: center; gap: 6px;
        background: rgba(var(--text-rgb),0.07);
        border: 1px solid rgba(var(--text-rgb),0.18);
        border-radius: 10px;
        padding: 0 10px;
        color: var(--muted);
      }
      .mz-select-wrap select {
        background: none; border: none; outline: none;
        color: var(--text); font-size: 0.86rem;
        padding: 10px 4px;
        max-width: 160px;
      }
      .mz-select-wrap select option { background: var(--surface-deep); color: var(--text); }

      /* GRID + CARDS (always paper-toned, regardless of theme) */
      .mz-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 26px 20px;
        padding: 6px 0 20px;
      }
      .mz-card {
        position: relative;
        text-align: start;
        background: var(--paper);
        color: var(--ink);
        border: 1.5px dashed rgba(31,42,34,0.28);
        border-radius: 4px;
        padding: 20px 18px 16px;
        transform: rotate(var(--rot));
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        box-shadow: 4px 5px 0 rgba(0,0,0,0.2);
        display: flex; flex-direction: column; gap: 8px;
        min-height: 168px;
      }
      .mz-card:hover { transform: rotate(0deg) translateY(-3px); box-shadow: 5px 8px 14px rgba(0,0,0,0.28); }
      .mz-pin {
        position: absolute; top: -7px; inset-inline-end: 20px;
        width: 11px; height: 11px; border-radius: 999px;
        background: var(--dot);
        box-shadow: 0 2px 3px rgba(0,0,0,0.35);
      }
      .mz-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .mz-type-badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.72rem; font-weight: 700;
        color: var(--ink);
      }
      .mz-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--dot); flex-shrink: 0; }
      .mz-code { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); }
      .mz-card-title {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 1.05rem; line-height: 1.45;
        margin: 0;
      }
      .mz-card-subject { font-size: 0.82rem; color: var(--teal); font-weight: 700; margin: 0; }
      .mz-section-tag {
        align-self: flex-start;
        font-size: 0.68rem; font-weight: 700;
        color: var(--ink);
        background: rgba(31,42,34,0.08);
        border: 1px dashed rgba(31,42,34,0.22);
        padding: 2px 8px;
        border-radius: 999px;
      }
      .mz-card-desc {
        font-size: 0.83rem; color: rgba(31,42,34,0.72);
        margin: 0; line-height: 1.6;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      }
      .mz-card-foot {
        margin-top: auto; padding-top: 8px;
        display: flex; justify-content: space-between;
        font-size: 0.72rem; color: var(--muted);
        border-top: 1px dashed rgba(31,42,34,0.18);
      }

      /* EMPTY / LOADING */
      .mz-empty, .mz-loading {
        display: flex; flex-direction: column; align-items: center;
        gap: 10px; text-align: center;
        padding: 60px 20px;
        color: rgba(var(--text-rgb),0.6);
      }
      .mz-empty h3 { color: var(--text); font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; margin: 4px 0 0; }
      .mz-empty p { font-size: 0.88rem; max-width: 280px; margin: 0 0 6px; }
      .mz-loading { flex-direction: row; padding: 50px 0; font-size: 0.88rem; }
      .mz-spin { animation: mz-spin 0.9s linear infinite; }
      @keyframes mz-spin { to { transform: rotate(360deg); } }

      /* MODAL */
      .mz-overlay {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(16,27,20,0.72);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        backdrop-filter: blur(2px);
      }
      .mz-modal {
        position: relative;
        background: var(--paper); color: var(--ink);
        border-radius: 6px;
        padding: 30px 26px 26px;
        max-width: 480px; width: 100%;
        max-height: 84vh; overflow-y: auto;
        box-shadow: 6px 10px 0 rgba(0,0,0,0.28);
      }
      .mz-modal-close {
        position: absolute; top: 14px; inset-inline-start: 14px;
        background: rgba(31,42,34,0.08); color: var(--ink);
      }
      .mz-modal-title { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; margin: 10px 0 4px; }
      .mz-modal-meta { font-size: 0.82rem; color: var(--muted); margin: 0 0 14px; }
      .mz-modal-desc { font-size: 0.92rem; line-height: 1.75; margin: 0 0 12px; }
      .mz-modal-link { width: 100%; justify-content: center; }
      .mz-modal-actions {
        margin-top: 16px; padding-top: 14px;
        border-top: 1px dashed rgba(31,42,34,0.18);
        display: flex; align-items: center;
      }

      /* FORM */
      .mz-page-title { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; margin: 0 0 8px; }
      .mz-page-sub { color: rgba(var(--text-rgb),0.65); font-size: 0.92rem; line-height: 1.75; margin: 0 0 30px; }
      .mz-form { display: flex; flex-direction: column; gap: 18px; }
      .mz-field { display: flex; flex-direction: column; gap: 6px; }
      .mz-field-row { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
      .mz-label { font-size: 0.85rem; font-weight: 700; color: var(--amber); }
      .mz-hint { font-size: 0.76rem; color: rgba(var(--text-rgb),0.45); }
      .mz-error { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: #E58A78; font-weight: 600; }
      .mz-input, .mz-textarea {
        width: 100%;
        background: rgba(var(--text-rgb),0.06);
        border: 1px solid rgba(var(--text-rgb),0.2);
        border-radius: 8px;
        padding: 11px 13px;
        font-size: 0.92rem;
        color: var(--text);
        outline: none;
        transition: border-color 0.15s;
      }
      .mz-input:focus, .mz-textarea:focus { border-color: var(--amber); }
      .mz-input::placeholder, .mz-textarea::placeholder { color: rgba(var(--text-rgb),0.4); }
      .mz-input-invalid, .mz-input-invalid .mz-input { border-color: #E58A78 !important; }
      .mz-mono { font-family: var(--font-mono); }
      .mz-textarea { resize: vertical; font-family: var(--font-body); margin-top: 8px; }
      .mz-input-icon {
        display: flex; align-items: center; gap: 8px;
        background: rgba(var(--text-rgb),0.06);
        border: 1px solid rgba(var(--text-rgb),0.2);
        border-radius: 8px;
        padding: 0 13px;
        color: rgba(var(--text-rgb),0.45);
      }
      .mz-input-icon .mz-input { border: none; background: none; padding-inline-start: 0; }
      .mz-type-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .mz-type-choice {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 8px 13px;
        border: 1px solid rgba(var(--text-rgb),0.2);
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 500;
        color: rgba(var(--text-rgb),0.7);
      }
      .mz-type-choice.is-active {
        border-color: var(--dot);
        background: rgba(var(--text-rgb),0.08);
        color: var(--text);
        font-weight: 700;
      }
      .mz-section-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .mz-suggestion-chip {
        font-size: 0.76rem; font-weight: 500;
        padding: 5px 11px;
        border-radius: 999px;
        border: 1px dashed rgba(var(--text-rgb),0.25);
        color: rgba(var(--text-rgb),0.62);
      }
      .mz-suggestion-chip:hover { border-color: var(--amber); color: var(--amber); }
      .mz-suggestion-chip.is-active { border-style: solid; border-color: var(--teal); background: rgba(63,125,107,0.12); color: var(--text); font-weight: 700; }
      .mz-submit { justify-content: center; }

      /* EXTRA BUTTONS */
      .mz-empty-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 4px; }
      .mz-btn-ghost {
        display: inline-flex; align-items: center; gap: 6px;
        background: none;
        border: 1px dashed rgba(var(--text-rgb),0.35);
        color: rgba(var(--text-rgb),0.75);
        font-size: 0.85rem; font-weight: 600;
        padding: 9px 16px;
        border-radius: 999px;
        transition: border-color 0.15s, color 0.15s;
      }
      .mz-btn-ghost:hover { border-color: var(--amber); color: var(--amber); }
      .mz-btn-ghost-sm {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 0.8rem; font-weight: 700;
        padding: 6px 12px; border-radius: 999px;
        background: rgba(31,42,34,0.08); color: var(--ink);
      }
      .mz-submit-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }

      /* LOGIN (drawer) */
      .mz-text-link {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 0.78rem; font-weight: 600;
        color: rgba(var(--text-rgb),0.55);
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .mz-text-link:hover { color: var(--amber); }
      .mz-inline-link { font-size: inherit; font-weight: 700; }
      .mz-login-active { display: flex; flex-direction: column; gap: 6px; }
      .mz-login-badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.82rem; font-weight: 700;
        color: var(--text);
      }
      .mz-login-actions { display: flex; align-items: center; gap: 14px; }

      /* ATTRIBUTION TOGGLE (add form) */
      .mz-attribution-toggle { display: flex; flex-wrap: wrap; gap: 8px; }
      .mz-attr-choice {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 14px;
        border: 1px solid rgba(var(--text-rgb),0.2);
        border-radius: 999px;
        font-size: 0.82rem; font-weight: 500;
        color: rgba(var(--text-rgb),0.7);
      }
      .mz-attr-choice.is-active {
        border-color: var(--teal);
        background: rgba(63,125,107,0.12);
        color: var(--text);
        font-weight: 700;
      }
      .mz-inline-verify-hint { margin-top: 8px; line-height: 1.7; }

      /* AUTH MODAL */
      .mz-auth-modal { max-width: 400px; }
      .mz-auth-tabs {
        display: flex; gap: 6px;
        margin: 6px 0 20px;
        background: rgba(31,42,34,0.06);
        border-radius: 10px;
        padding: 4px;
      }
      .mz-auth-tab {
        flex: 1;
        padding: 9px 10px;
        border-radius: 8px;
        font-size: 0.88rem; font-weight: 600;
        color: rgba(31,42,34,0.6);
      }
      .mz-auth-tab.is-active { background: var(--paper); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
      .mz-eye-btn { color: inherit; flex-shrink: 0; display: flex; align-items: center; }
      .mz-auth-forgot { margin-top: -8px; }
      .mz-auth-back { margin-top: 14px; }
      .mz-auth-success { color: var(--teal); font-weight: 600; }
      .mz-auth-modal .mz-field { margin-bottom: 4px; }
      .mz-auth-modal .mz-submit { width: 100%; margin-top: 8px; }
      .mz-verify-pending { display: flex; flex-direction: column; gap: 8px; }

      /* mz-input, mz-hint, and mz-text-link are theme-aware by default (built for
         the outer page background). The auth modal sits on the fixed paper
         background like other modals, so it needs fixed ink-based colors instead
         — otherwise text nearly disappears in dark theme. */
      .mz-auth-modal .mz-input,
      .mz-auth-modal .mz-input-icon,
      .mz-auth-modal .mz-textarea {
        color: var(--ink);
        background: rgba(31,42,34,0.05);
        border-color: rgba(31,42,34,0.18);
      }
      .mz-auth-modal .mz-input::placeholder,
      .mz-auth-modal .mz-textarea::placeholder { color: rgba(31,42,34,0.4); }
      .mz-auth-modal .mz-input-icon { color: rgba(31,42,34,0.45); }
      .mz-auth-modal .mz-input:focus,
      .mz-auth-modal .mz-textarea:focus { border-color: var(--amber); }
      .mz-auth-modal .mz-hint { color: rgba(31,42,34,0.55); }
      .mz-auth-modal .mz-text-link { color: rgba(31,42,34,0.55); }
      .mz-auth-modal .mz-text-link:hover { color: var(--teal); }

      /* ABOUT */
      .mz-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; }
      .mz-about-card {
        background: rgba(var(--text-rgb),0.06);
        border: 1px dashed rgba(var(--text-rgb),0.25);
        border-radius: 10px;
        padding: 20px;
        color: rgba(var(--text-rgb),0.8);
      }
      .mz-about-card svg { color: var(--amber); margin-bottom: 8px; }
      .mz-about-card h3 { font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: var(--text); margin: 0 0 10px; }
      .mz-about-card ul { margin: 0; padding-inline-start: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; line-height: 1.65; }

      /* TOAST */
      .mz-toast {
        position: fixed; bottom: 22px; left: 50%;
        transform: translateX(-50%);
        display: flex; align-items: center; gap: 8px;
        padding: 12px 18px;
        border-radius: 10px;
        font-size: 0.86rem; font-weight: 600;
        z-index: 60;
        max-width: 90vw;
        box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        animation: mz-toast-in 0.25s ease;
      }
      .mz-toast-success { background: var(--teal); color: var(--paper); }
      .mz-toast-warn { background: var(--amber); color: var(--ink); }
      .mz-toast-error { background: var(--rust); color: var(--paper); }
      @keyframes mz-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

      @media (max-width: 640px) {
        .mz-field-row { grid-template-columns: 1fr; }
        .mz-about-grid { grid-template-columns: 1fr; }
        .mz-select-wrap select { max-width: 120px; }
      }
    `}</style>
  );
}
