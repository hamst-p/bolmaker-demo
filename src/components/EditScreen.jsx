// src/components/EditScreen.jsx
import React, { useEffect, useRef, useState } from 'react';

const EditScreen = ({ backgroundImage, overlay, setOverlay }) => {
  const canvasRef = useRef(null);

  // PC用ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // モバイル用タッチ操作の初期状態保持用の ref
  const initialTouchDistanceRef = useRef(null);
  const initialTouchAngleRef = useRef(null);
  const initialTouchCenterRef = useRef(null);
  const initialOverlayRef = useRef(null);

  // プレビュー用の状態（モーダル表示）
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // モバイル判定（簡易的なユーザーエージェント判定）
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // 最大拡大サイズの設定（必要に応じて調整）
  const MAX_OVERLAY_WIDTH = 1000;
  const MAX_OVERLAY_HEIGHT = 1000;

  /**
   * drawComposite
   *
   * キャンバスに背景画像とオーバーレイ画像（bolhat.png）を描画し、
   * 右下に透過0.75のグレー文字ウォーターマーク "fuckitwebol" を追加します。
   */
  const drawComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 背景画像の描画（アスペクト比を維持して中央寄せ）
    const bgImg = new Image();
    bgImg.src = backgroundImage.url;
    bgImg.onload = () => {
      const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;
      let drawWidth, drawHeight, drawX, drawY;
      if (imgAspect > canvasAspect) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgAspect;
        drawY = 0;
        drawX = (canvasWidth - drawWidth) / 2;
      }
      ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);

      // オーバーレイ画像の描画
      const overlayImg = new Image();
      overlayImg.src = '/bolhat.png';
      overlayImg.onload = () => {
        ctx.save();
        const centerX = overlay.x + overlay.width / 2;
        const centerY = overlay.y + overlay.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        ctx.drawImage(
          overlayImg,
          -overlay.width / 2,
          -overlay.height / 2,
          overlay.width,
          overlay.height
        );
        ctx.restore();

        // ウォーターマークの描画（右下に、透過0.75のグレー文字）
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = 'gray';
        ctx.font = '16px sans-serif';
        const watermarkText = 'fuckitwebol';
        const margin = 10;
        const textWidth = ctx.measureText(watermarkText).width;
        const xPos = canvasWidth - textWidth - margin;
        const yPos = canvasHeight - margin;
        ctx.fillText(watermarkText, xPos, yPos);
        ctx.restore();
      };
    };
  };

  useEffect(() => {
    drawComposite();
  }, [backgroundImage, overlay]);

  // ── モバイル対応：タッチイベントでの preventDefault と gesture イベント ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touchMoveHandler = (e) => {
      if (e.touches && e.touches.length >= 2) {
        e.preventDefault();
      }
    };
    const preventGesture = (e) => e.preventDefault();
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
    canvas.addEventListener('gesturestart', preventGesture, { passive: false });
    canvas.addEventListener('gesturechange', preventGesture, { passive: false });
    canvas.addEventListener('gestureend', preventGesture, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('gesturestart', preventGesture);
      canvas.removeEventListener('gesturechange', preventGesture);
      canvas.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // ── PC用マウスイベント ──
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (
      mouseX >= overlay.x &&
      mouseX <= overlay.x + overlay.width &&
      mouseY >= overlay.y &&
      mouseY <= overlay.y + overlay.height
    ) {
      setIsDragging(true);
      setDragOffset({ x: mouseX - overlay.x, y: mouseY - overlay.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (e.shiftKey) {
      const deltaRotation = e.movementX / 10;
      setOverlay((prev) => ({ ...prev, rotation: prev.rotation + deltaRotation }));
    } else {
      setOverlay((prev) => ({ ...prev, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (
      mouseX >= overlay.x &&
      mouseX <= overlay.x + overlay.width &&
      mouseY >= overlay.y &&
      mouseY <= overlay.y + overlay.height
    ) {
      let scaleFactor = e.deltaY < 0 ? 1.05 : 0.95;
      // 最大サイズ制限を適用
      const newWidth = overlay.width * scaleFactor;
      const newHeight = overlay.height * scaleFactor;
      if (newWidth > MAX_OVERLAY_WIDTH || newHeight > MAX_OVERLAY_HEIGHT) {
        scaleFactor = 1; // 拡大しない
      }
      setOverlay((prev) => ({
        ...prev,
        width: prev.width * scaleFactor,
        height: prev.height * scaleFactor,
      }));
    }
  };

  // ── モバイル用タッチイベント ──
  const handleTouchStart = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      if (
        touchX >= overlay.x &&
        touchX <= overlay.x + overlay.width &&
        touchY >= overlay.y &&
        touchY <= overlay.y + overlay.height
      ) {
        setIsDragging(true);
        setDragOffset({ x: touchX - overlay.x, y: touchY - overlay.y });
      }
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const [touch1, touch2] = e.touches;
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      initialTouchDistanceRef.current = distance;
      const angle = Math.atan2(dy, dx);
      initialTouchAngleRef.current = angle;
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      initialTouchCenterRef.current = { x: centerX, y: centerY };
      initialOverlayRef.current = { ...overlay };
    }
  };

  const handleTouchMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      setOverlay((prev) => ({ ...prev, x: touchX - dragOffset.x, y: touchY - dragOffset.y }));
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const [touch1, touch2] = e.touches;
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newAngle = Math.atan2(dy, dx);
      const scaleFactor = distance / initialTouchDistanceRef.current;
      const rotationDelta = (newAngle - initialTouchAngleRef.current) * (180 / Math.PI);
      const newCenterX = (touch1.clientX + touch2.clientX) / 2;
      const newCenterY = (touch1.clientY + touch2.clientY) / 2;
      const initialCenterCanvas = {
        x: initialTouchCenterRef.current.x - rect.left,
        y: initialTouchCenterRef.current.y - rect.top,
      };
      const newCenterCanvas = {
        x: newCenterX - rect.left,
        y: newCenterY - rect.top,
      };
      const deltaX = newCenterCanvas.x - initialCenterCanvas.x;
      const deltaY = newCenterCanvas.y - initialCenterCanvas.y;
      setOverlay(() => ({
        x: initialOverlayRef.current.x + deltaX,
        y: initialOverlayRef.current.y + deltaY,
        width: initialOverlayRef.current.width * scaleFactor,
        height: initialOverlayRef.current.height * scaleFactor,
        rotation: initialOverlayRef.current.rotation + rotationDelta,
      }));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      initialTouchDistanceRef.current = null;
      initialTouchAngleRef.current = null;
      initialTouchCenterRef.current = null;
      initialOverlayRef.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // ── モバイル用プレビューボタン ──
  const handlePreview = () => {
    drawComposite();
    setTimeout(() => {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      setPreviewImage(dataURL);
      setShowPreview(true);
    }, 500);
  };

  // ── ローカル保存（PC用） ──
  const handleLocalSave = () => {
    drawComposite();
    setTimeout(() => {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to convert canvas to Blob');
          return;
        }
        const originalName = backgroundImage.name;
        const dotIndex = originalName.lastIndexOf(".");
        let newName;
        if (dotIndex !== -1) {
          newName = originalName.slice(0, dotIndex) + "_bol" + originalName.slice(dotIndex);
        } else {
          newName = originalName + "_bol";
        }
        const file = new File([blob], newName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({
            files: [file],
            title: 'Bolmaker Collage',
            text: 'Check out my collage!'
          }).catch((err) => {
            console.error('Error sharing:', err);
          });
        } else {
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = newName;
          link.href = dataURL;
          link.click();
        }
      }, 'image/png');
    }, 500);
  };

  return (
    <div className="edit-screen" style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #000', width: '100%', touchAction: 'none' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      ></canvas>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {isMobile ? (
          <button
            onClick={handlePreview}
            style={{
              marginRight: '1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
            title="Preview"
          >
            {/* プレビューボタン用アイコン */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="8 9 12 5 16 9" />
              <line x1="12" y1="5" x2="12" y2="19" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleLocalSave}
            style={{
              marginRight: '1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
            title="Save to Local"
          >
            {/* ダウンロードアイコン */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        )}
      </div>
      {isMobile && showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowPreview(false)}
        >
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <p style={{ marginBottom: '1rem' }}>Long press to Save Image</p>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditScreen;
