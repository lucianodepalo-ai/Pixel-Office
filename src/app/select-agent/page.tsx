'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { Agent, Profile } from '@/lib/database.types';
import { getAvatarUrl } from '@/lib/avatar-types';

export default function SelectAgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profile) setUser(profile);

      const { data: myAgents } = await supabase
        .from('agents')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: true });

      if (myAgents) {
        setAgents(myAgents);
        if (myAgents.length > 0) setSelectedId(myAgents[0].id);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  function enterLobby() {
    router.push('/lobby');
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#060610]">
        <div className="text-[#00ff88] text-sm animate-pulse">Cargando agentes...</div>
      </div>
    );
  }

  const selected = agents.find(a => a.id === selectedId);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#060610] via-[#0a1025] to-[#0f0a20]">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => {
          const seed = i * 137.508;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${(seed * 0.618) % 100}%`,
                top: `${(seed * 0.382) % 100}%`,
                width: `${1 + (i % 3)}px`,
                height: `${1 + ((i + 1) % 3)}px`,
                animationDelay: `${(i * 0.37) % 3}s`,
                opacity: 0.15 + ((i * 7) % 5) * 0.08,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-[700px] max-w-[95vw]">
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold text-[#00ff88] mb-1">AGENTS HOTEL</h1>
          <p className="text-xs text-gray-500">
            Hola <span className="text-gray-300">{user?.username}</span> — elegí tu agente
          </p>
        </div>

        {/* Agent cards */}
        <div className="flex gap-3 justify-center flex-wrap mb-6">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedId === agent.id}
              onClick={() => setSelectedId(agent.id)}
            />
          ))}

          {/* Create new agent button */}
          <button
            onClick={() => router.push('/create-agent')}
            className="w-[140px] min-h-[200px] bg-[#080818]/80 border-2 border-dashed border-[#1a1a2e] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-[#00ff88] hover:-translate-y-1"
          >
            <span className="text-3xl">+</span>
            <span className="text-[9px] text-gray-500">Nuevo Agente</span>
          </button>
        </div>

        {/* Selected agent detail */}
        {selected && (
          <div className="bg-[#080818]/90 border border-[#1a1a2e] rounded-2xl p-5 flex items-center gap-6">
            {/* Avatar big */}
            <div className="flex-shrink-0">
              {selected.figure_code ? (
                <img
                  src={getAvatarUrl(selected.figure_code, 2)}
                  alt={selected.name}
                  width={80}
                  height={136}
                  style={{ imageRendering: 'pixelated' }}
                  draggable={false}
                />
              ) : (
                <div className="w-20 h-[136px] bg-[#12122a] rounded-lg flex items-center justify-center text-3xl">
                  {selected.emoji}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-bold text-white">{selected.name}</h2>
                <span
                  className="text-[8px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: selected.color + '22',
                    color: selected.color,
                    border: `1px solid ${selected.color}44`,
                  }}
                >
                  {selected.agent_class}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label="Nivel" value={`${selected.level}`} icon="⭐" />
                <Stat label="Oro ganado" value={`${selected.total_earned}`} icon="🪙" />
                <Stat label="XP" value={`${selected.xp}/${selected.xp_max}`} icon="📊" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">{selected.status_text}</span>
                <span className={`w-2 h-2 rounded-full ${
                  selected.status === 'working' ? 'bg-green-400' :
                  selected.status === 'thinking' ? 'bg-yellow-400' :
                  'bg-gray-500'
                }`} />
              </div>
            </div>

            {/* Enter button */}
            <button
              onClick={enterLobby}
              className="flex-shrink-0 px-6 py-3 bg-[#00ff88] text-[#060610] rounded-xl font-bold text-sm hover:bg-[#00ffaa] hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(0,255,136,0.25)]"
            >
              Entrar
            </button>
          </div>
        )}

        {agents.length === 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">No tenés agentes todavía</p>
            <button
              onClick={() => router.push('/create-agent?welcome=1')}
              className="px-6 py-3 bg-[#00ff88] text-[#060610] rounded-xl font-bold text-sm"
            >
              Crear mi primer agente
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="text-center mt-6">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/auth'); }}
            className="text-[9px] text-[#333] hover:text-[#ff4444] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  isSelected,
  onClick,
}: {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-[140px] bg-[#080818]/95 rounded-2xl p-4 text-center cursor-pointer transition-all hover:-translate-y-1 ${
        isSelected
          ? 'border-2 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
          : 'border border-[#1a1a2e] hover:border-[#2a2a4a]'
      }`}
      style={{
        borderColor: isSelected ? agent.color : undefined,
      }}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-2">
        {agent.figure_code ? (
          <img
            src={getAvatarUrl(agent.figure_code, 2)}
            alt={agent.name}
            width={56}
            height={95}
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        ) : (
          <div className="w-14 h-[95px] bg-[#12122a] rounded-lg flex items-center justify-center text-2xl">
            {agent.emoji}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-[10px] font-bold text-white truncate">{agent.name}</div>

      {/* Color bar */}
      <div
        className="h-1 rounded-full mt-1.5 mx-auto w-12"
        style={{ backgroundColor: agent.color }}
      />

      {/* Stats */}
      <div className="flex justify-center gap-2 mt-2">
        <span className="text-[8px] text-gray-500">Lv.{agent.level}</span>
        <span className="text-[8px] text-yellow-600">🪙 {agent.total_earned}</span>
      </div>
    </button>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-[#12122a] rounded-lg px-2 py-1.5 text-center">
      <div className="text-[10px] text-gray-500">{icon} {label}</div>
      <div className="text-xs font-bold text-white mt-0.5">{value}</div>
    </div>
  );
}
