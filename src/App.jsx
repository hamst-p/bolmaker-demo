// src/App.jsx
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadScreen from './components/UploadScreen';
import EditScreen from './components/EditScreen';

const App = () => {
  // 背景画像（ユーザーアップロード）とオーバーレイ画像の状態管理
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [overlay, setOverlay] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    rotation: 0,
  });

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {/* 背景画像が未アップロードの場合はアップロード画面を表示 */}
        {!backgroundImage ? (
          <UploadScreen setBackgroundImage={setBackgroundImage} />
        ) : (
          <EditScreen
            backgroundImage={backgroundImage}
            overlay={overlay}
            setOverlay={setOverlay}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
