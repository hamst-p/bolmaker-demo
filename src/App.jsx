// src/App.jsx
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadScreen from './components/UploadScreen';
import EditScreen from './components/EditScreen';

const App = () => {
  // 背景画像はオブジェクト { url, name } として管理
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
