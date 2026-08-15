# مذكرة (Mothakera)

موقع مشاركة مواد دراسية بين طلاب الجامعة، مبني بـ React + Vite، ومربوط بمشروع
Firebase حقيقي (تسجيل دخول بالإيميل + تفعيل الحساب عبر رابط يوصل للبريد +
قاعدة بيانات Firestore لتخزين المواد بشكل حي بين كل الزوار).

هذا مشروع حقيقي (مش Claude artifact)، فلازم يُستضاف على الإنترنت حتى يشتغل
تسجيل الدخول والتفعيل بشكل كامل. اتبع الخطوات بالترتيب.

## الخطوة ١: فعّل Firestore بمشروع Firebase

1. افتح https://console.firebase.google.com وادخل على مشروع **mothakera**
2. من القائمة الجانبية: **Build → Firestore Database**
3. دوس **Create database**
4. اختر **Start in production mode** (رح نضبط الصلاحيات يدويًا بالخطوة الجاية)
5. اختر أي موقع سيرفر قريب (مثلاً `eur3` أو أي خيار افتراضي) ودوس **Enable**

## الخطوة ٢: اضبط صلاحيات الوصول (Security Rules)

1. جوا Firestore Database، روح لتبويب **Rules**
2. امسح المحتوى الموجود، وألصق هذا بدله:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /materials/{materialId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
```

3. دوس **Publish**

**ملاحظة مهمة:** هاي الصلاحيات مفتوحة (أي حدا يقدر يضيف/يعدّل مادة، حتى بدون
تسجيل دخول) — نفس فلسفة الموقع اللي بنيناها من البداية (نشر بدون حساب أو
كمجهول). ما حدا يقدر يحذف. إذا بدك لاحقًا تشدد الصلاحيات (مثلاً تربط الإضافة
بتسجيل الدخول فقط)، قلي وبعدلها.

## الخطوة ٣: ارفع المشروع على GitHub (بدون سطر أوامر)

1. سوّي حساب مجاني على https://github.com إذا ما عندك
2. دوس **New repository**، اعطيه اسم (مثلاً `mothakera`)، خليه **Public** أو
   **Private** زي ما بدك، ودوس **Create repository**
3. بالصفحة اللي بتفتح، دوس على رابط **uploading an existing file**
4. اسحب كل ملفات ومجلدات هذا المشروع (`package.json`, `vite.config.js`,
   `index.html`, `src/`, `.gitignore`, هذا الملف) وأفلتها هناك
5. دوس **Commit changes**

## الخطوة ٤: انشر الموقع عبر Vercel (بناء واستضافة تلقائية)

1. افتح https://vercel.com وسجّل دخول بحساب GitHub تبعك
2. دوس **Add New → Project**
3. اختر المستودع (repository) اللي رفعته هلق (`mothakera`) ودوس **Import**
4. Vercel رح يتعرف تلقائيًا إنه مشروع Vite — بس دوس **Deploy** بدون ما تغيّر شي
5. بعد دقيقة أو دقيقتين، رح يعطيك رابط مباشر (مثلاً
   `https://mothakera-xxxx.vercel.app`) — هذا موقعك الحقيقي المباشر

## الخطوة ٥: ضيف الدومين لـ Firebase (خطوة ضرورية)

1. رجّع عالرابط: هذا الرابط اللي عطاك ياه Vercel
2. روح لـ Firebase Console → **Authentication → Settings → Authorized domains**
3. دوس **Add domain** وألصق الدومين (بدون `https://`، مثلاً
   `mothakera-xxxx.vercel.app`)
4. احفظ

بدون هالخطوة، رح يطلع خطأ `auth/unauthorized-domain` عند أي محاولة تسجيل دخول.

## بعد هيك

جرّب تسوي حساب جديد من الموقع المباشر — المفروض يوصلك إيميل حقيقي فيه رابط
تفعيل. إذا واجهت أي مشكلة أو رسالة خطأ، ارجعلي بنصها كامل وبساعدك.

## التطوير محليًا (اختياري، لو بدك تعدّل الكود بجهازك)

يحتاج [Node.js](https://nodejs.org) مثبّت عندك:

```bash
npm install
npm run dev
```
