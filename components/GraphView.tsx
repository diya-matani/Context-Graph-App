"use client";

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';

export default function GraphView({ data }: { data: any }) {
  const fgRef = useRef<any>(null);
  const initialSettle = useRef(false);
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
      fgRef.current.d3Force('charge').strength(-600);
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) linkForce.distance(80);
      fgRef.current.d3Force('collide', forceCollide((node: any) => 25));
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
        cooldownTicks={100}
        onEngineStop={() => {
          if (!initialSettle.current && fgRef.current) {
            fgRef.current.zoomToFit(400, 50); // Automatically fit to canvas!
            initialSettle.current = true;
          }
        }}
        nodeLabel="label"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || '';
          const fontSize = Math.max(10 / globalScale, 2); // Minimum font size
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4); // some padding

          // Draw Node
          // @ts-ignore
          ctx.fillStyle = node.color || '#94a3b8';
          if (node.id === "CUST_310000108") {
             // Highlight demo root node
             ctx.fillStyle = '#eab308'; // yellow-500
          }

          ctx.beginPath();
          // @ts-ignore
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          ctx.fill();

          const showLabel = globalScale >= 1.5 || node.id === "CUST_310000108";
          if (showLabel) {
            // Draw Text Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            // @ts-ignore
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 10 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

            // Draw Text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#0f172a'; // dark text
            // @ts-ignore
            ctx.fillText(label, node.x, node.y + 10);
          }
        }}
      />
      
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl text-sm border border-slate-200 shadow-md">
        <h3 className="font-semibold text-slate-800">Graph Legend</h3>
        <ul className="text-slate-600 mt-2 flex flex-col gap-1.5 text-xs font-medium">
          <li className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>Customer</li>
          <li className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-sm"></span>Sales Order</li>
          <li className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mr-2 shadow-sm"></span>Delivery</li>
          <li className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-sm"></span>Billing</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-slate-200/60 max-w-[170px] leading-relaxed">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide mb-1 uppercase">Navigating</p>
          <p className="text-xs text-slate-600">Scroll to zoom in/out. <strong>Click and drag</strong> the white background to pan the view.</p>
        </div>
      </div>
    </div>
  );
}
