"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import ChatPanel from '@/components/ChatPanel';

// Dynamically import the graph without SSR because it relies on window
const GraphView = dynamic(() => import('@/components/GraphView'), { ssr: false });

export default function Home() {
  const [graphData, setGraphData] = useState<{nodes: any[], links: any[]}>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isGranularHidden, setIsGranularHidden] = useState(false);

  useEffect(() => {
    fetch('/api/graph')
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold tracking-tighter">D</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Mapping<span className="text-slate-400 font-normal mx-2">/</span>Order to Cash</h1>
        </div>
        <div className="flex gap-2">
          <button 
            suppressHydrationWarning 
            onClick={() => setIsChatMinimized(!isChatMinimized)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors border border-slate-200/60 shadow-sm"
          >
            {isChatMinimized ? 'Expand Chat' : 'Minimize Chat'}
          </button>
          <button 
            suppressHydrationWarning 
            onClick={() => setIsGranularHidden(!isGranularHidden)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-md shadow-md hover:bg-slate-700 transition-colors"
          >
            {isGranularHidden ? 'Show Granular Overlay' : 'Hide Granular Overlay'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-[1800px] w-full mx-auto pb-8">
        {/* Graph Section */}
        <div className="flex-[2] relative h-full flex flex-col">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 rounded-xl border border-slate-200">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium animate-pulse">Loading Graph Nodes...</p>
              </div>
            </div>
          ) : null}
          <div className="flex-1 h-full relative">
             <GraphView data={
               isGranularHidden ? {
                 nodes: graphData.nodes.filter((n: any) => !String(n.id).toUpperCase().includes('ITEM') && !String(n.label).toUpperCase().includes('ITEM')),
                 links: graphData.links.filter((l: any) => {
                   const src = typeof l.source === 'object' ? l.source.id : l.source;
                   const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                   return !String(src).toUpperCase().includes('ITEM') && !String(tgt).toUpperCase().includes('ITEM');
                 })
               } : graphData
             } />
          </div>
        </div>

        {/* Chat Section */}
        {!isChatMinimized && (
          <div className="flex-1 h-full min-w-[320px] max-w-[450px] transition-all duration-300">
            <ChatPanel />
          </div>
        )}
      </div>
    </main>
  );
}
