'use client';

import { useEffect, useRef } from 'react';

export default function SynthwaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid configuration
    const GRID_SIZE = 30;
    let offset = 0;

    // Draw sun glow
    const drawSunGlow = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.7,
        0,
        canvas.width / 2,
        canvas.height * 0.7,
        canvas.width * 0.4
      );
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.08)');
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.03)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw horizontal lines with glow
    const drawHorizonLines = () => {
      const lineCount = 5;
      const spacing = canvas.height * 0.1;
      const baseY = canvas.height * 0.7;

      for (let i = 0; i < lineCount; i++) {
        const y = baseY + i * spacing;
        const alpha = 0.1 - i * 0.02;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = 'rgba(147, 51, 234, 0.2)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    // Draw grid
    const drawGrid = () => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.08)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        const xPos = x + offset;
        const alpha =
          Math.abs(Math.sin((xPos / canvas.width) * Math.PI)) * 0.08;
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.moveTo(xPos, canvas.height * 0.7);
        ctx.lineTo(xPos, canvas.height);
      }

      // Horizontal lines with perspective effect
      for (let y = canvas.height; y > canvas.height * 0.7; y -= GRID_SIZE) {
        const progress = (y - canvas.height * 0.7) / (canvas.height * 0.3);
        const alpha = progress * 0.15;
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      ctx.stroke();
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(8, 8, 16, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSunGlow();
      drawHorizonLines();

      // Update and draw grid
      offset = (offset + 0.3) % GRID_SIZE;
      drawGrid();

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#1a103f]/20 to-[#050508]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
