"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Profile, Room } from "@/lib/database.types";

export default function LobbyPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<(Room & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) setUser(profile);

      const { data: myRoom } = await supabase
        .from("rooms")
        .select("*")
        .eq("owner_id", session.user.id)
        .single();

      if (!myRoom) {
        await supabase.from("rooms").insert({
          owner_id: session.user.id,
          name: profile?.office_name || "Mi Oficina",
          description: "Oficina personalizada",
          category: "startup",
          is_public: true,
          furniture: [],
        });
      }

      const { data: publicRooms } = await supabase
        .from("rooms")
        .select("*, owner:profiles(*)")
        .eq("is_public", true)
        .order("visitors_count", { ascending: false })
        .limit(20);

      if (publicRooms) setRooms(publicRooms);
      setLoading(false);
    }
    load();
  }, [router]);

  async function enterMyRoom() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: room } = await supabase
      .from("rooms")
      .select("id")
      .eq("owner_id", session.user.id)
      .single();
    if (room) router.push(`/room/${room.id}`);
  }

  async function visitRoom(roomId: string) {
    router.push(`/room/${roomId}`);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#060610]">
        <div className="text-[#00ff88] text-sm animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#060610] overflow-auto">
      {/* Hotel background — real Habbo hotel view */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/hotel-view.gif)',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
        }}
      >
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060610]/70 via-[#060610]/50 to-[#060610]/80" />
      </div>

      {/* Settings button — top right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-9 h-9 bg-[#080818]/90 border border-[#1a1a2e] rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-[#2a2a4a] transition-all"
          title="Configuracion"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>

        {showSettings && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />

            {/* Menu */}
            <div className="absolute top-11 right-0 z-50 w-[220px] bg-[#0c0c1e] border border-[#1a1a2e] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#1a1a2e]">
                <div className="text-[11px] font-bold text-white">{user?.username}</div>
                <div className="text-[9px] text-gray-500">{user?.office_name}</div>
                <div className="text-[9px] text-[#FFD700] mt-0.5">{user?.coins || 0} monedas</div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <SettingsItem
                  icon="👤"
                  label="Mis Agentes"
                  desc="Seleccionar personaje"
                  onClick={() => { setShowSettings(false); router.push('/select-agent'); }}
                />
                <SettingsItem
                  icon="🎨"
                  label="Crear Agente"
                  desc="Nuevo avatar personalizado"
                  onClick={() => { setShowSettings(false); router.push('/create-agent'); }}
                />
                <SettingsItem
                  icon="👕"
                  label="Galeria de Avatares"
                  desc="Ver presets y customizer"
                  onClick={() => { setShowSettings(false); router.push('/avatars'); }}
                />
              </div>

              <div className="border-t border-[#1a1a2e] py-1">
                <SettingsItem
                  icon="🏠"
                  label="Mi Oficina"
                  desc={user?.office_name || 'Configurar nombre'}
                  onClick={() => { setShowSettings(false); enterMyRoom(); }}
                />
              </div>

              <div className="border-t border-[#1a1a2e] py-1">
                <button
                  onClick={() => { setShowSettings(false); logout(); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#1a1a2e] transition-colors group"
                >
                  <div className="text-[10px] text-red-400 group-hover:text-red-300">Cerrar sesion</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4">
        <div className="w-[660px] max-w-[95vw] text-center">
          <h1 className="text-2xl font-bold text-[#00ff88] mb-1 tracking-wider" style={{ textShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
            AGENTS HOTEL
          </h1>
          <p className="text-xs text-[#555] mb-8">Elegí un mundo para entrar</p>

          <div className="flex gap-4 justify-center flex-wrap">
            {/* My Room */}
            <button
              onClick={enterMyRoom}
              className="w-[190px] bg-[#080818]/95 border-2 border-[#1a1a2e] rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-[#00ff88] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="text-[36px] mb-2">🏢</div>
              <div className="text-[11px] font-bold text-[#ccc] mb-1">
                {user?.office_name || "Mi Oficina"}
              </div>
              <div className="text-[9px] text-[#555] leading-relaxed">
                Tu espacio personalizado
              </div>
              <div className="inline-block mt-2 text-[7px] font-bold px-2 py-0.5 rounded-full bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[#00ff8844]">
                LIVE
              </div>
            </button>

            {/* Avatar Customizer */}
            <button
              onClick={() => router.push("/avatars")}
              className="w-[190px] bg-[#080818]/95 border-2 border-[#8b5cf644] rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-[#8b5cf6] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]"
            >
              <div className="text-[36px] mb-2">👤</div>
              <div className="text-[11px] font-bold text-[#ccc] mb-1">Mi Avatar</div>
              <div className="text-[9px] text-[#555] leading-relaxed">
                Personalizá tu agente
              </div>
              <div className="inline-block mt-2 text-[7px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border border-[#8b5cf644]">
                20 PRESETS
              </div>
            </button>

            {/* Test World */}
            <button
              onClick={() => router.push("/room/test")}
              className="w-[190px] bg-[#080818]/95 border-2 border-[#ffcc0044] rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-[#ffcc00] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,200,0,0.1)]"
            >
              <div className="text-[36px] mb-2">🧪</div>
              <div className="text-[11px] font-bold text-[#ccc] mb-1">Test World</div>
              <div className="text-[9px] text-[#555] leading-relaxed">
                Sandbox para probar
              </div>
              <div className="inline-block mt-2 text-[7px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,200,0,0.1)] text-[#ffcc00] border border-[#ffcc0044]">
                DEV MODE
              </div>
            </button>
          </div>

          {/* Public Rooms */}
          {rooms.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs text-[#444] mb-3 font-bold">Salas Publicas</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                {rooms.slice(0, 6).map((room) => (
                  <button
                    key={room.id}
                    onClick={() => visitRoom(room.id)}
                    className="bg-[#080818]/80 border border-[#1a1a2e] rounded-xl px-4 py-3 text-left min-w-[160px] transition-all hover:border-[#00ff8833] hover:translate-x-0.5"
                  >
                    <div className="font-bold text-[10px] text-[#aaa] truncate">{room.name}</div>
                    <div className="text-[9px] text-[#555] truncate">{room.owner?.username}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, desc, onClick }: {
  icon: string; label: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2.5 text-left hover:bg-[#1a1a2e] transition-colors flex items-center gap-3 group"
    >
      <span className="text-sm">{icon}</span>
      <div>
        <div className="text-[10px] font-bold text-gray-300 group-hover:text-white">{label}</div>
        <div className="text-[8px] text-gray-600">{desc}</div>
      </div>
    </button>
  );
}
