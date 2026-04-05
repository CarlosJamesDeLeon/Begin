import React, { useRef, useState, useEffect } from 'react';

const SketchPad = ({ initialDataUrl, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  // Initialize canvas size and load initial image
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    // Make canvas resize to match container
    const resizeObserver = new ResizeObserver(() => {
      // Save current content
      const currentData = canvas.toDataURL();
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Setup drawing context
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Restore content after resize
      if (currentData !== 'data:,') {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = currentData;
      }
    });

    resizeObserver.observe(container);

    // Initial load
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialDataUrl;
    }

    return () => resizeObserver.disconnect();
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    // Prevent scrolling while drawing (eStop propagation and default on canvas touch action handles this mostly, but good practice)
    e.preventDefault(); 

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2d334a'; // Main Begin dark text color
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    
    if (onSave) {
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onSave) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="sketch-pad-container" ref={containerRef}>
      <div className="sketch-toolbar">
        <button 
          className={`sketch-btn ${!isEraser ? 'active' : ''}`}
          onClick={() => setIsEraser(false)}
          title="Pen"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2l2 2-8 8H2v-2L10 2z" />
          </svg>
        </button>
        <button 
          className={`sketch-btn ${isEraser ? 'active' : ''}`}
          onClick={() => setIsEraser(true)}
          title="Eraser"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9l-4 4-7-7 4-4a2.828 2.828 0 0 1 4 0l3 3z" />
            <path d="M5 6l3 3" />
          </svg>
        </button>
        <div className="sketch-sep"></div>
        <button 
          className="sketch-btn clear-btn"
          onClick={clearCanvas}
          title="Clear Area"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 1.5l11 11M1.5 12.5l11-11" />
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
