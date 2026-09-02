import React, { useEffect, useRef, useState } from 'react';

const TOTAL_LOGIN_FRAMES = 300;

export default function LoginCanvasBackground({ onLoaded }) {
  const canvasRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const images = new Array(TOTAL_LOGIN_FRAMES);
    let loadedCount = 0;
    let currentFrameIndex = 0;
    let animFrameId = null;
    let lastTime = performance.now();
    let mouseOffset = { x: 0, y: 0 };
    let targetMouseOffset = { x: 0, y: 0 };

    function getFrameUrl(index) {
      const padded = String(index + 1).padStart(5, '0');
      return `/login_frames/frame_${padded}.png`;
    }

    function updateCanvasSize() {
      if (!canvas) return;
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrame(Math.floor(currentFrameIndex));
    }

    function drawImageCover(img, offsetX, offsetY) {
      if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const imgWidth = img.naturalWidth || 1920;
      const imgHeight = img.naturalHeight || 1080;

      // Crop source rect to exclude bottom-right Gemini watermark (8% margin)
      const cropW = Math.floor(imgWidth * 0.92);
      const cropH = Math.floor(imgHeight * 0.92);

      const hRatio = width / cropW;
      const vRatio = height / cropH;
      const ratio = Math.max(hRatio, vRatio);

      const drawWidth = cropW * ratio;
      const drawHeight = cropH * ratio;

      const zoom = 1.05;
      const finalWidth = drawWidth * zoom;
      const finalHeight = drawHeight * zoom;

      const x = (width - finalWidth) / 2 + offsetX;
      const y = (height - finalHeight) / 2 + offsetY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, cropW, cropH, x, y, finalWidth, finalHeight);
    }

    function renderFrame(index) {
      const frameIdx = Math.max(0, Math.min(TOTAL_LOGIN_FRAMES - 1, index));
      let img = images[frameIdx];

      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset < TOTAL_LOGIN_FRAMES; offset++) {
          const prev = images[frameIdx - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            img = prev;
            break;
          }
          const next = images[frameIdx + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            img = next;
            break;
          }
        }
      }

      if (img && img.complete) {
        drawImageCover(img, mouseOffset.x, mouseOffset.y);
      }
    }

    function animate(now) {
      const elapsed = now - lastTime;

      // Target ~30fps playback speed
      if (elapsed > 33) {
        lastTime = now - (elapsed % 33);
        currentFrameIndex = (currentFrameIndex + 1) % TOTAL_LOGIN_FRAMES;
      }

      mouseOffset.x += (targetMouseOffset.x - mouseOffset.x) * 0.05;
      mouseOffset.y += (targetMouseOffset.y - mouseOffset.y) * 0.05;

      renderFrame(Math.floor(currentFrameIndex));
      animFrameId = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetMouseOffset.x = ((e.clientX - centerX) / centerX) * -12;
      targetMouseOffset.y = ((e.clientY - centerY) / centerY) * -12;
    };

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('mousemove', handleMouseMove);

    updateCanvasSize();

    for (let i = 0; i < TOTAL_LOGIN_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      img.onload = () => {
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL_LOGIN_FRAMES) * 100);
        setLoadProgress(pct);

        if (loadedCount === 1) {
          renderFrame(0);
        }

        if (loadedCount === TOTAL_LOGIN_FRAMES) {
          setIsLoaded(true);
          if (onLoaded) onLoaded();
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_LOGIN_FRAMES) {
          setIsLoaded(true);
          if (onLoaded) onLoaded();
        }
      };

      images[i] = img;
    }

    animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 z-50 transition-all duration-500 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ width: `${loadProgress}%` }}
      />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}

