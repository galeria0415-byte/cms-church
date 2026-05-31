"use client";

import { useEffect, useRef } from "react";

import type { LiturgicalTheme } from "@/lib/liturgical-calendar";

type Orb = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  alpha: number;
};

function hexToRgb(value: string) {
  const normalized = value.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function LiturgicalAnimatedBackground({ theme }: { theme: LiturgicalTheme }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas = canvasElement;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const ctx = context;

    const accent = hexToRgb(theme.accent);
    const soft = hexToRgb(theme.accentSoft);
    let animationFrame = 0;
    let width = 0;
    let height = 0;

    const orbs: Orb[] = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 60 + Math.random() * 140,
      velocityX: (Math.random() - 0.5) * 0.0006,
      velocityY: (Math.random() - 0.5) * 0.0006,
      alpha: 0.08 + Math.random() * 0.12,
    }));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function draw(time: number) {
      const tick = time * 0.001;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, theme.gradient[0]);
      gradient.addColorStop(0.45, theme.gradient[1]);
      gradient.addColorStop(1, theme.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      orbs.forEach((orb, index) => {
        orb.x += orb.velocityX;
        orb.y += orb.velocityY;

        if (orb.x < -0.15) orb.x = 1.15;
        if (orb.x > 1.15) orb.x = -0.15;
        if (orb.y < -0.15) orb.y = 1.15;
        if (orb.y > 1.15) orb.y = -0.15;

        const x = orb.x * width;
        const y = orb.y * height;
        const pulse = 1 + Math.sin(tick + index) * 0.12;
        const radial = ctx.createRadialGradient(x, y, 0, x, y, orb.radius * pulse);
        radial.addColorStop(0, `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${orb.alpha})`);
        radial.addColorStop(1, `rgba(${soft.r}, ${soft.g}, ${soft.b}, 0)`);
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(x, y, orb.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let layer = 0; layer < 3; layer += 1) {
        ctx.beginPath();
        ctx.lineWidth = 2 + layer;
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.18 - layer * 0.04})`;

        for (let x = 0; x <= width; x += 12) {
          const y = height * (0.22 + layer * 0.16) + Math.sin(x * 0.006 + tick * (0.8 + layer * 0.2)) * (18 + layer * 10);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}