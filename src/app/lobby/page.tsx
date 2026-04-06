"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Profile, Room } from "@/lib/database.types";

export default function LobbyPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<(Room & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) setUser(profile);

      // Ensure user has a room
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

      // Load public rooms
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
        <div className="text-[#00ff88] font-['Press_Start_2P',cursive] text-sm animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#060610] via-[#0a1025] to-[#0f0a20]">
      {/* Stars — seeded */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
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
                opacity: 0.2 + ((i * 7) % 5) * 0.1,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-[560px] max-w-[95vw] text-center">
        <h1 className="font-['Press_Start_2P',cursive] text-xl text-[#00ff88] drop-shadow-[0_0_30px_rgba(0,255,136,0.4)] mb-1.5">
          AGENTS HOTEL
        </h1>
        <p className="text-xs text-[#555] mb-8">Elegí un mundo para entrar</p>

        <div className="flex gap-4 justify-center flex-wrap">
          {/* My Room */}
          <button
            onClick={enterMyRoom}
            className="w-[240px] bg-[#080818]/95 border-2 border-[#1a1a2e] rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-[#00ff88] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[42px] mb-3">🏢</div>
            <div className="font-['Press_Start_2P',cursive] text-[9px] text-[#ccc] mb-1.5">
              {user?.office_name || "Mi Oficina"}
            </div>
            <div className="text-[9px] text-[#444] leading-relaxed">
              Tu espacio personalizado.<br />Agentes, muebles y proyectos.
            </div>
            <div className="inline-block mt-2 font-['Press_Start_2P',cursive] text-[6px] px-2 py-0.5 rounded-full bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[#00ff8844]">
              LIVE
            </div>
          </button>

          {/* Test World */}
          <button
            onClick={() => router.push("/room/test")}
            className="w-[240px] bg-[#080818]/95 border-2 border-[#ffcc0044] rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-[#ffcc00] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,200,0,0.1)]"
          >
            <div className="text-[42px] mb-3">🧪</div>
            <div className="font-['Press_Start_2P',cursive] text-[9px] text-[#ccc] mb-1.5">Test World</div>
            <div className="text-[9px] text-[#444] leading-relaxed">
              Dinero ilimitado. Todas las funciones. Sandbox para probar.
            </div>
            <div className="inline-block mt-2 font-['Press_Start_2P',cursive] text-[6px] px-2 py-0.5 rounded-full bg-[rgba(255,200,0,0.1)] text-[#ffcc00] border border-[#ffcc0044]">
              DEV MODE
            </div>
          </button>
        </div>

        {/* Public Rooms */}
        {rooms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs text-[#333] mb-3 font-bold">🌍 Salas Públicas</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
              {rooms.slice(0, 6).map((room) => (
                <button
                  key={room.id}
                  onClick={() => visitRoom(room.id)}
                  className="bg-[#080818]/80 border border-[#1a1a2e] rounded-xl px-4 py-3 text-left min-w-[160px] transition-all hover:border-[#00ff8833] hover:translate-x-0.5"
                >
                  <div className="font-bold text-[9px] text-[#aaa] truncate">{room.name}</div>
                  <div className="text-[8px] text-[#444] truncate">{room.owner?.username}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-[10px] text-[#333]">
          Conectado como <span className="text-[#00ff88]">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="mt-2 font-['Press_Start_2P',cursive] text-[7px] text-[#333] bg-transparent border border-[#1a1a2e] rounded-md px-3 py-1.5 hover:text-[#ff4444] hover:border-[#ff444444] transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
