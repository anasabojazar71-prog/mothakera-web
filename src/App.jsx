import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <h1>مرحباً بك في موقع مذكرة</h1>
      <p>الموقع يعمل بنجاح!</p>
    </div>
  );
}

export default App;
