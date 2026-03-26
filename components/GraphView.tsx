"use client";

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphView({ data }: { data: any }) {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Resize graph to fit container
    const updateDimensions = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    // Settle graph after load
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
    }
    return () => window.removeEventListener('resize', updateDimensions);
  }, [data]);

  return (
    <div id="graph-container" className="w-full h-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200/60 shadow-inner">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="label"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || '';
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          if (node.id === "CUST_310000108") {
             // Highlight demo root node
             ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
          }

          ctx.beginPath();
          // @ts-ignore
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // @ts-ignore
          ctx.fillStyle = node.color;
          // @ts-ignore
          ctx.fillText(label, node.x, node.y + 8);
        }}
      />
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-lg text-sm border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800">Graph Legend</h3>
        <ul className="text-slate-600 mt-1 flex flex-col gap-1 text-xs">
          <li>🔵 Customer</li>
          <li>🟢 Sales Order</li>
          <li>🟠 Delivery</li>
          <li>🟣 Billing</li>
        </ul>
      </div>
    </div>
  );
}
