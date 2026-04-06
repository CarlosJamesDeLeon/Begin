import React, { useRef, useState, useEffect } from 'react';

const SketchPad = ({ initialDataUrl, onSave }) => {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser]   = useState(false);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const ctx       = canvas.getContext('2d');

    const resizeObserver = new ResizeObserver(() => {
      const currentData = canvas.toDataURL();
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      if (currentData !== 'data:,') {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = currentData;
      }
    });

    resizeObserver.observe(container);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialDataUrl;
    }

    return () => resizeObserver.disconnect();
  }, []);

  /* resolve stroke color from CSS variable so it adapts to dark mode */
  function getStrokeColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--text-1')
      .trim() || '#1A1A1A';
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const rect   = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const rect   = canvas.getBoundingClientRect();

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth   = 2.5;
      ctx.strokeStyle = getStrokeColor();
    }

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    canvasRef.current.getContext('2d').closePath();
    setIsDrawing(false);
    if (onSave) onSave(canvasRef.current.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (onSave) onSave(canvas.toDataURL());
  };

  return (
    <div className="sketch-pad-container" ref={containerRef}>
      <div className="sketch-toolbar">
        <button className={`sketch-btn ${!isEraser ? 'active' : ''}`} onClick={() => setIsEraser(false)} title="Pen">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2l2 2-8 8H2v-2L10 2z"/>
          </svg>
        </button>
        <button className={`sketch-btn ${isEraser ? 'active' : ''}`} onClick={() => setIsEraser(true)} title="Eraser">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9l-4 4-7-7 4-4a2.828 2.828 0 0 1 4 0l3 3z"/>
            <path d="M5 6l3 3"/>
          </svg>
        </button>
        <div className="sketch-sep"></div>
        <button className="sketch-btn clear-btn" onClick={clearCanvas} title="Clear">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 1.5l11 11M1.5 12.5l11-11"/>
          </svg>
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="sketch-canvas"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerOut={stopDrawing}
      />
    </div>
  );
};

export default SketchPad;