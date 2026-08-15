import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './App.css'; // سنحتاج لإنشاء هذا الملف أو إضافة التنسيقات هنا

// --- تهيئة Firebase (استبدل بالبيانات الخاصة بك) ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// -----------------------------------------------

function App() {
  const [materialCount, setMaterialCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materialsCollection = collection(db, 'materials');
        const materialsSnapshot = await getDocs(materialsCollection);
        setMaterialCount(materialsSnapshot.size);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container">
      {/* الشريط العلوي */}
      <header className="header">
        <div className="logo">مذكرة</div>
        <div className="nav-icons">
          <span>☰</span>
          <span className="icon-moon">🌙</span>
          <span className="icon-globe">ع</span>
        </div>
      </header>

            {/* البطاقة الرئيسية */}
            <section className="hero-card">
              <h3 className="hero-subtitle">مساحة مشتركة لطلاب الجامعة</h3>
              <h1 className="hero-title">
                دوّن، شارك، واعثر على ما تحتاجه قبل الامتحان لا بعده
              </h1>
              <p className="hero-description">
                كل ملخص أو ملزمة أو رابط تشاركه يصبح متاحاً فوراً لأي طالب آخر يدرس نفس المادة.
              </p>
              <button className="share-button">+ شارك أول مادة</button>
              
              {/* إحصائيات */}
              <div className="stats-container">
                <div className="stat-box">
                  <div className="stat-number">{materialCount}</div>
                  <div className="stat-label">مادة متوفرة</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">1</div>
                  <div className="stat-label">مقرر دراسي</div>
                </div>
              </div>
            </section>

      {/* شريط البحث */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="ابحث بالعنوان أو المادة أو رمز المقرر..." />
      </div>

      {/* القوائم المنسدلة */}
      <div className="dropdown-container">
        <select className="dropdown">
          <option>كل الأقسام</option>
        </select>
        <select className="dropdown">
          <option>كل الكليات</option>
        </select>
      </div>
      
      {/* الفوتر (يمكن إضافته لاحقاً) */}
    </div>
  );
}

// --- تنسيقات CSS (ملف App.css) ---
// ضع هذا الكود في ملف جديد باسم App.css في نفس مجلد src

/*
.app-container {
  font-family: 'Cairo', sans-serif; /* افترضنا استخدام خط كايرو */
  direction: rtl;
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #107c41; /* لون أخضر مذكرة */
}

.nav-icons span {
  margin-left: 15px;
  cursor: pointer;
}

.hero-card {
  background: linear-gradient(to bottom, #e8f5e9, #f1f8e8);
  border-radius: 15px;
  padding: 40px 20px;
  text-align: center;
  margin-top: 20px;
}

.hero-subtitle {
  color: #107c41;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.hero-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 15px;
  line-height: 1.3;
}

.hero-description {
  color: #5f5f5f;
  font-size: 1rem;
  margin-bottom: 25px;
  line-height: 1.6;
}

.share-button {
  background-color: #107c41;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-bottom: 30px;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.stat-box {
  background-color: white;
  padding: 15px 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #107c41;
}

.stat-label {
  font-size: 0.9rem;
  color: #5f5f5f;
}

.search-bar {
  position: relative;
  margin-top: 30px;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b0b0;
}

.search-bar input {
  width: 100%;
  padding: 15px 45px 15px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
}

.dropdown-container {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.dropdown {
  flex: 1;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  appearance: none; /* لإخفاء السهم الافتراضي */
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%235f5f5f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
  background-repeat: no-repeat;
  background-position: left 15px center;
  background-size: 16px;
}
*/

export default App;
