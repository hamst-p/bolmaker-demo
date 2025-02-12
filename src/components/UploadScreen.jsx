// src/components/UploadScreen.jsx
import React from 'react';

const UploadScreen = ({ setBackgroundImage }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // オリジナルのファイル名と URL をオブジェクトとして渡す
      setBackgroundImage({ url, name: file.name });
    }
  };

  return (
    <div className="upload-screen">
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
    </div>
  );
};

export default UploadScreen;
