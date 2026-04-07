'use client';

import { useState, useEffect } from 'react';
import Avatar from '@/components/Avatar';
import AvatarCustomizer from '@/components/AvatarCustomizer';
import type { AvatarIndex, AvatarAction } from '@/lib/avatar-types';

type Tab = 'gallery' | 'customizer';

export default function AvatarsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [index, setIndex] = useState<AvatarIndex | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [demoAction, setDemoAction] = useState<AvatarAction>('std');

  useEffect(() => {
    fetch('/avatars/index.json')
      .then(r => r.json())
      .then(setIndex)
      .catch(() => setIndex(null));
  }, []);

  const categories = index
    ? Object.entries(
        Object.entries(index).reduce((acc, [id, agent]) => {
          const cat = agent.category || 'other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({ id, ...agent });
          return acc;
        }, {} as Record<string, Array<{ id: string } & (typeof index)[string]>>)
      )
    : [];

  const categoryLabels: Record<string, string> = {
    leadership: 'Leadership',
    development: 'Development',
    data: 'Data & AI',
    creative: 'Creative',
    operations: 'Operations',
    specialized: 'Specialized',
  };

  const actions: { key: AvatarAction; label: string }[] = [
    { key: 'std', label: 'Parado' },
    { key: 'wlk', label: 'Caminar' },
    { key: 'sit', label: 'Sentado' },
    { key: 'wav', label: 'Saludar' },
    { key: 'drk', label: 'Café' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060610] via-[#0a1025] to-[#0f0a20] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-[#00ff88] transition-colors text-lg"
              title="Volver"
            >
              ←
            </button>
            <div>
            <h1 className="text-lg font-bold text-[#00ff88]">
              AGENTS HOTEL — Avatars
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {index ? `${Object.keys(index).length} agentes · ${Object.values(index).reduce((t, a) => t + a.sprites.total, 0)} sprites` : 'Cargando...'}
            </p>
          </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'gallery' ? 'bg-[#00ff88] text-black font-bold' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
              }`}
            >
              Galería
            </button>
            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'customizer' ? 'bg-[#00ff88] text-black font-bold' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
              }`}
            >
              Crear Avatar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'gallery' && (
          <div className="space-y-10">
            {/* Action selector */}
            <div className="flex gap-2 justify-center">
              {actions.map(a => (
                <button
                  key={a.key}
                  onClick={() => setDemoAction(a.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    demoAction === a.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Agent grid by category */}
            {categories.map(([cat, agents]) => (
              <div key={cat}>
                <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                  {categoryLabels[cat] || cat}
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                      className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                        selectedAgent === agent.id
                          ? 'bg-[#1a1a3e] border border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                          : 'bg-[#0a0a1a] border border-[#1a1a2e] hover:border-[#2a2a4a] hover:-translate-y-0.5'
                      }`}
                    >
                      <Avatar
                        preset={agent.id}
                        action={demoAction}
                        direction={2}
                        size={56}
                        animate={demoAction === 'wlk'}
                      />
                      <span className="mt-2 text-[10px] text-gray-400 text-center leading-tight">
                        {agent.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Selected agent detail */}
            {selectedAgent && index?.[selectedAgent] && (
              <div className="bg-[#0d0d20] border border-[#1a1a2e] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-white">
                    {index[selectedAgent].name}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {index[selectedAgent].description}
                  </span>
                </div>

                {/* All 8 directions */}
                <p className="text-xs text-gray-500 mb-2">8 direcciones:</p>
                <div className="flex gap-3 mb-6 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(dir => (
                    <div key={dir} className="flex flex-col items-center">
                      <Avatar
                        preset={selectedAgent}
                        direction={dir as 0|1|2|3|4|5|6|7}
                        action="std"
                        size={48}
                      />
                      <span className="text-[9px] text-gray-600 mt-1">d{dir}</span>
                    </div>
                  ))}
                </div>

                {/* All actions */}
                <p className="text-xs text-gray-500 mb-2">Acciones:</p>
                <div className="flex gap-4 flex-wrap">
                  {actions.map(a => (
                    <div key={a.key} className="flex flex-col items-center">
                      <Avatar
                        preset={selectedAgent}
                        action={a.key}
                        direction={2}
                        size={56}
                        animate={a.key === 'wlk'}
                      />
                      <span className="text-[10px] text-gray-500 mt-1">{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sprite count */}
                <p className="text-[10px] text-gray-600 mt-4">
                  {index[selectedAgent].sprites.total} sprites totales ·
                  figure: <code className="text-[9px] text-gray-500">{index[selectedAgent].figure}</code>
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customizer' && (
          <div>
            <p className="text-sm text-gray-400 mb-6">
              Armá tu propio avatar personalizado. La preview se genera en vivo desde la API de Habbo.
            </p>
            <AvatarCustomizer
              onSave={(figureCode, name) => {
                // Redirect to create-agent with the figure code pre-loaded
                const params = new URLSearchParams({ figure: figureCode, name });
                window.location.href = `/create-agent?${params.toString()}`;
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
