import React, { useMemo } from 'react';
import { useSettings } from '@/store/settingsStore';

// Contract: given data + type, returns a React element minimal chart
// Fallback to lightweight canvas for medium/low quality; use provided heavy component for high

interface LineDatum { x: string | number; y: number }
interface DonutDatum { label: string; value: number; color?: string }

interface ChartRenderer {
  renderDonut: (data: DonutDatum[], opts?: { size?: number }) => React.ReactElement | null;
  renderLine: (data: LineDatum[], opts?: { width?: number; height?: number }) => React.ReactElement | null;
}

function CanvasDonut({ data, size = 120 }: { data: DonutDatum[]; size?: number }) {
  return React.createElement('canvas', {
    width: size,
    height: size,
    className: 'block',
    ref: (el: HTMLCanvasElement | null) => {
      if (!el) return;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      const total = data.reduce((s,d)=>s+d.value,0) || 1;
      let start = -Math.PI/2;
      data.forEach((seg,i) => {
        const angle = (seg.value/total) * Math.PI*2;
        ctx.beginPath();
        ctx.fillStyle = seg.color || ['#6366f1','#10b981','#f59e0b','#ef4444'][i%4];
        ctx.moveTo(size/2,size/2);
        ctx.arc(size/2,size/2,size/2,start,start+angle,false);
        ctx.closePath(); ctx.fill();
        start += angle;
      });
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(size/2,size/2,size/2*0.55,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  });
}

function CanvasLine({ data, width = 260, height = 80 }: { data: LineDatum[]; width?: number; height?: number }) {
  return React.createElement('canvas', {
    width,
    height,
    className: 'block',
    ref: (el: HTMLCanvasElement | null) => {
      if (!el) return;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0,0,width,height);
      if (!data.length) return;
      const xs = data.map(d=>Number(d.x));
      const ys = data.map(d=>d.y);
      const minY = Math.min(...ys,0);
      const maxY = Math.max(...ys,1);
      const rangeY = maxY - minY || 1;
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const rangeX = maxX - minX || 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      data.forEach((pt,i) => {
        const nx = ((Number(pt.x)-minX)/rangeX) * (width-8) + 4;
        const ny = height - (((pt.y - minY)/rangeY) * (height-8) + 4);
        if (i===0) ctx.moveTo(nx,ny); else ctx.lineTo(nx,ny);
      });
      ctx.stroke();
    }
  });
}

export function useChartRenderer(): ChartRenderer {
  const visualsQuality = useSettings(s => s.visualsQuality);
  return useMemo(() => {
    if (visualsQuality === 'high') {
      // Expect caller to still use heavy libs directly for high mode; provide fallbacks anyway
      return {
        renderDonut: (data, opts) => React.createElement(CanvasDonut, { data, size: opts?.size || 120 }),
        renderLine: (data, opts) => React.createElement(CanvasLine, { data, width: opts?.width || 260, height: opts?.height || 80 })
      };
    }
    // Medium/Low always use lightweight versions (no animation, no tooltips)
    return {
      renderDonut: (data, opts) => React.createElement(CanvasDonut, { data, size: opts?.size || 120 }),
      renderLine: (data, opts) => React.createElement(CanvasLine, { data, width: opts?.width || 260, height: opts?.height || 80 })
    };
  }, [visualsQuality]);
}
