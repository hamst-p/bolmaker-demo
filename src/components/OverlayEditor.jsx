import React, { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import interact from 'interactjs';

const OverlayEditor = ({ overlay, setOverlay }) => {
  const containerRef = useRef(null);
  const rotateHandleRef = useRef(null);

  useEffect(() => {
    if (!rotateHandleRef.current || !containerRef.current) return;

    // interact.js を使用して回転ハンドルのドラッグ操作を有効にする
    interact(rotateHandleRef.current).draggable({
      listeners: {
        move(event) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const { clientX, clientY } = event;
          const dx = clientX - centerX;
          const dy = clientY - centerY;
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          setOverlay(prev => ({ ...prev, rotation: angle }));
        }
      }
    });

    return () => {
      interact(rotateHandleRef.current).unset();
    };
  }, [setOverlay]);

  // ドラッグ終了時に新たな座標を更新
  const handleDragStop = (e, data) => {
    setOverlay(prev => ({ ...prev, x: data.x, y: data.y }));
  };

  // リサイズ終了時にサイズを更新
  const handleResizeStop = (event, { size }) => {
    setOverlay(prev => ({ ...prev, width: size.width, height: size.height }));
  };

  return (
    <Draggable
      position={{ x: overlay.x, y: overlay.y }}
      onStop={handleDragStop}
    >
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          transform: `rotate(${overlay.rotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        <ResizableBox
          width={overlay.width}
          height={overlay.height}
          onResizeStop={handleResizeStop}
          lockAspectRatio={true}
          resizeHandles={['se']}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src="/bolhat.png"
              alt="Overlay"
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            />
            {/* 回転操作用ハンドル（赤い丸） */}
            <div
              ref={rotateHandleRef}
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '50%',
                cursor: 'grab'
              }}
            ></div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};

export default OverlayEditor;
