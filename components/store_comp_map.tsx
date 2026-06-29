import React, { useState, useEffect, useRef } from 'react';
import { StoreBranch } from './store_types';

interface StoreCompMapProps {
  selectedBranch: StoreBranch | null;
  branches: StoreBranch[];
  isComp: boolean;
}

export const StoreCompMap: React.FC<StoreCompMapProps> = ({ selectedBranch, branches, isComp }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Map panning/zoom simulation coordinates tracking
  const [mapTarget, setMapTarget] = useState({ x: 62, y: 44 });
  const [mapCurrent, setMapCurrent] = useState({ x: 62, y: 44 });

  // Sync target coordinates when branch selection changes
  useEffect(() => {
    if (selectedBranch) {
      setMapTarget({ x: selectedBranch.mapX, y: selectedBranch.mapY });
    } else {
      setMapTarget({ x: 50, y: 50 });
    }
  }, [selectedBranch]);

  // Spring physics interpolation for smooth map panning
  useEffect(() => {
    let animId: number;
    const updatePhysics = () => {
      setMapCurrent(curr => {
        const dx = mapTarget.x - curr.x;
        const dy = mapTarget.y - curr.y;
        
        // Panning threshold
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          return mapTarget;
        }
        
        return {
          x: curr.x + dx * 0.12, // Smooth ease transition
          y: curr.y + dy * 0.12
        };
      });
      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [mapTarget]);

  // Handle map drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 500;
    let height = canvas.height = canvas.clientHeight || 420;

    let time = 0;
    let animFrame: number;
 
    const renderMap = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);
 
      // 1. Draw Map Base Background (Sleek minimalist cream / blueprint aesthetic)
      ctx.fillStyle = '#FAF9F5'; // Sleek minimalist warm cream background
      ctx.fillRect(0, 0, width, height);
 
      // Grid mesh layout lines
      ctx.strokeStyle = 'rgba(120, 110, 95, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
 
      // Map Offset translation centered on the active selected location panning context
      ctx.save();
      const mapScale = 1.3; // Zoom multiplier
      const originX = width / 2 - (mapCurrent.x / 100) * width * mapScale;
      const originY = height / 2 - (mapCurrent.y / 100) * height * mapScale;
      
      ctx.translate(originX, originY);
      ctx.scale(mapScale, mapScale);
 
      // 2. Draw Han River
      ctx.fillStyle = '#D4E6F5';
      ctx.beginPath();
      ctx.moveTo(10, height * 0.5);
      ctx.bezierCurveTo(width * 0.3, height * 0.58, width * 0.6, height * 0.38, width * 1.5, height * 0.52);
      ctx.lineTo(width * 1.5, height * 0.72);
      ctx.bezierCurveTo(width * 0.6, height * 0.58, width * 0.3, height * 0.78, 10, height * 0.7);
      ctx.closePath();
      ctx.fill();
 
      ctx.strokeStyle = '#9CBFDD';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, height * 0.56);
      ctx.bezierCurveTo(width * 0.3, height * 0.64, width * 0.6, height * 0.44, width * 1.5, height * 0.58);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
 
      // Draw roads
      ctx.strokeStyle = 'rgba(120, 110, 95, 0.12)';
      ctx.lineWidth = 4;
      const roads = [
        { sx: 0, sy: height * 0.2, ex: width * 1.5, ey: height * 0.2 },
        { sx: 0, sy: height * 0.8, ex: width * 1.5, ey: height * 0.8 },
        { sx: width * 0.25, sy: 0, ex: width * 0.25, ey: height },
        { sx: width * 0.5, sy: 0, ex: width * 0.5, ey: height },
        { sx: width * 0.75, sy: 0, ex: width * 0.75, ey: height },
        { sx: width * 0.4, sy: height * 0.1, ex: width * 0.65, ey: height * 0.9 }
      ];
      roads.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.sx, r.sy);
        ctx.lineTo(r.ex, r.ey);
        ctx.stroke();
      });
 
      // 3. Draw Markers
      branches.forEach(branch => {
        const bx = (branch.mapX / 100) * width;
        const by = (branch.mapY / 100) * height;
        const isSelected = selectedBranch?.name === branch.name;
 
        if (isSelected) {
          const radiusMultiplier = 1 + Math.sin(time * 3) * 0.2;
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx, by, 22 * radiusMultiplier, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
          ctx.beginPath();
          ctx.arc(bx, by, 14 * radiusMultiplier, 0, Math.PI * 2);
          ctx.fill();
 
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fill();
 
          // Lightning icon
          ctx.save();
          ctx.shadowColor = '#D97706';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#B45309';
          ctx.beginPath();
          ctx.moveTo(bx, by - 26 + Math.sin(time * 4) * 3);
          ctx.lineTo(bx + 4, by - 16 + Math.sin(time * 4) * 3);
          ctx.lineTo(bx - 2, by - 14 + Math.sin(time * 4) * 3);
          ctx.lineTo(bx + 2, by - 5 + Math.sin(time * 4) * 3);
          ctx.lineTo(bx - 5, by - 13 + Math.sin(time * 4) * 3);
          ctx.lineTo(bx + 1, by - 15 + Math.sin(time * 4) * 3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = 'rgba(120, 110, 95, 0.6)';
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fill();
 
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
 
        ctx.fillStyle = isSelected ? '#1C1917' : '#78716C';
        ctx.font = isSelected ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(branch.name.replace('헤이스트 ', ''), bx, by + 18);
      });
 
      ctx.restore();
 
      ctx.fillStyle = 'rgba(120, 110, 95, 0.65)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText("MAPSCALE [1.3X] // GOLDEN_GRID", width - 15, 20);
 
      animFrame = requestAnimationFrame(renderMap);
    };
 
    renderMap();
    return () => cancelAnimationFrame(animFrame);
  }, [mapCurrent, selectedBranch, branches]);
 
  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full bg-[#1E1B29] cursor-grab active:cursor-grabbing h-[230px] md:h-[420px]" 
    />
  );
};
