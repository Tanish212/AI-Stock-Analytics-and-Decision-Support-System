import React, { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 299;

export default function CanvasBackground() {
  const canvasRef = useRef(null);
  const loadingBarRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const images = [];
    let loadedCount = 0;
    let targetFrameIndex = 0;
    let currentFrameIndex = 0;
    let lastRenderedIndex = -1;
    let animFrameId = null;

    function getFrameUrl(index) {
      const paddedIndex = String(index).padStart(6, '0');
      return `/frames/frame_${paddedIndex}.png`;
    }

    function updateCanvasSize() {
      if (!canvas) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
      const height = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      lastRenderedIndex = -1;
      render(currentFrameIndex);
    }

    function drawImageCover(img) {
      if (!canvas || !ctx) return;
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      const hRatio = canvas.width / imgWidth;
      const vRatio = canvas.height / imgHeight;
      const ratio = Math.max(hRatio, vRatio);

      const drawWidth = imgWidth * ratio;
      const drawHeight = imgHeight * ratio;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, drawWidth, drawHeight);
    }

    function render(frameFloat) {
      const index = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameFloat)));
      const img = images[index];

      if (!img || !img.complete || img.naturalWidth === 0) {
        // Fallback to nearest loaded frame
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          const prev = images[index - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            drawImageCover(prev);
            return;
          }
          const next = images[index + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            drawImageCover(next);
            return;
          }
        }
        return;
      }

      if (index === lastRenderedIndex && canvas.width > 0) return;
      lastRenderedIndex = index;
      drawImageCover(img);
    }

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
      targetFrameIndex = scrollFraction * (TOTAL_FRAMES - 1);
    }

    function tick() {
      const diff = targetFrameIndex - currentFrameIndex;
      if (Math.abs(diff) > 0.001) {
        currentFrameIndex += diff * 0.15;
        render(currentFrameIndex);
      }
      animFrameId = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('scroll', onScroll, { passive: true });

    updateCanvasSize();
    onScroll();

    // Preload images
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      img.onload = () => {
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadProgress(pct);

        if (i === 0 || loadedCount === 1) {
          render(0);
        }

        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      images.push(img);
    }

    animFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('scroll', onScroll);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <>
      <div
        ref={loadingBarRef}
        id="loading-bar"
        className={isLoaded ? 'done' : ''}
        style={{ width: `${loadProgress}%` }}
      />
      <canvas ref={canvasRef} id="canvas-bg" />
    </>
  );
}
