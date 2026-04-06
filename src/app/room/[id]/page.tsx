"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import type { Room, Agent, Profile } from "@/lib/database.types";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const isTestWorld = roomId === "test";
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      // Get profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (prof) setProfile(prof);

      if (isTestWorld) {
        // Test world uses mock data
        setIsOwner(true);
        setLoading(false);
        return;
      }

      // Load room
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*, owner:profiles(*)")
        .eq("id", roomId)
        .single();

      if (!roomData) {
        router.push("/lobby");
        return;
      }

      setRoom(roomData);
      setIsOwner(roomData.owner_id === session.user.id);

      // Load agents
      const { data: agentsData } = await supabase
        .from("agents")
        .select("*")
        .eq("room_id", roomId);

      if (agentsData) setAgents(agentsData);

      // Log visit if not owner
      if (roomData.owner_id !== session.user.id) {
        await supabase.from("room_visits").insert({
          room_id: roomId,
          visitor_id: session.user.id,
        });
        // Increment visitor count
        await supabase
          .from("rooms")
          .update({ visitors_count: (roomData.visitors_count || 0) + 1 })
          .eq("id", roomId);
      }

      setLoading(false);
    }
    load();
  }, [roomId, isTestWorld, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#060610]">
        <div className="text-[#00ff88] font-['Press_Start_2P',cursive] text-sm animate-pulse">
          Cargando sala...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#060610]">
      {/* HUD */}
      <div className="fixed top-4 left-16 z-10">
        <h1 className="font-['Press_Start_2P',cursive] text-sm text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]">
          AGENTS HOTEL
        </h1>
        <p className="text-[9px] text-[#555]">
          {isTestWorld ? "🧪 Test World — todas las funciones" : room?.name || "Cargando..."}
        </p>
      </div>

      {/* Coins */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 font-['Press_Start_2P',cursive] text-[9px] text-[#ffcc00] bg-[rgba(8,8,18,0.88)] border border-[#332200] rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
        🪙 {isTestWorld ? "999,999" : profile?.coins || 0}
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push("/lobby")}
        className="fixed top-4 right-4 z-10 font-['Press_Start_2P',cursive] text-[7px] text-[#555] bg-[rgba(8,8,18,0.9)] border border-[#1a1a2e] rounded-lg px-3 py-2 hover:border-[#00ff88] hover:text-[#00ff88] transition-all"
      >
        ← Lobby
      </button>

      {/* Room info for visitors */}
      {!isOwner && !isTestWorld && room && (
        <div className="fixed top-16 left-16 z-10 bg-[rgba(8,8,18,0.9)] border border-[#1a1a2e] rounded-xl px-4 py-3 max-w-[250px]">
          <div className="text-xs text-[#aaa] font-bold">{room.name}</div>
          <div className="text-[9px] text-[#555] mt-1">por {(room as any).owner?.username}</div>
          <div className="text-[9px] text-[#444] mt-1">{room.description}</div>
          <div className="text-[8px] text-[#333] mt-2">👤 {room.visitors_count} visitas · {agents.length} agentes</div>
        </div>
      )}

      {/* Agent cards panel */}
      <div className="fixed right-4 top-16 w-[240px] z-10 flex flex-col gap-1.5">
        {agents.slice(0, 5).map((a) => (
          <div
            key={a.id}
            className="bg-[rgba(6,6,14,0.92)] border border-[#1a1a2e] border-l-[3px] rounded-md px-2.5 py-2 flex items-center gap-2 cursor-pointer transition-all hover:-translate-x-0.5"
            style={{ borderLeftColor: a.color }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-sm border border-[#222] flex-shrink-0"
              style={{ background: a.color + "15", borderColor: a.color + "40" }}
            >
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Press_Start_2P',cursive] text-[7px] text-[#ccc] truncate">{a.name}</div>
              <div className="text-[8px] text-[#555] flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: a.status === "working" ? "#00ff88" : a.status === "idle" ? "#444" : "#ffaa00" }}
                />
                {a.status_text}
              </div>
            </div>
            <div className="font-['Press_Start_2P',cursive] text-[8px] text-[#ffaa00]">{a.level}</div>
          </div>
        ))}
      </div>

      {/* Canvas placeholder — aquí va el motor isométrico */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ cursor: "grab" }}
      />

      {/* Toolbar */}
      {isOwner && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {[
            { icon: "👕", tip: "Apariencia" },
            { icon: "🛋️", tip: "Mover muebles" },
            { icon: "🛍️", tip: "Tienda" },
            { icon: "H", tip: "Modo Habbo", special: true },
            { icon: "📦", tip: "Inventario" },
            { icon: "📂", tip: "Importar agentes" },
            { icon: "👥", tip: "Panel agentes" },
          ].map((btn, i) => (
            <button
              key={i}
              title={btn.tip}
              className={`w-[52px] h-[52px] rounded-[14px] bg-[rgba(8,8,18,0.94)] border-2 border-[#1a1a2e] flex items-center justify-center text-2xl transition-all hover:border-[#00ff88] hover:-translate-y-1 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                btn.special ? "font-['Press_Start_2P',cursive] text-base font-bold text-[#ffcc00]" : ""
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Test badge */}
      {isTestWorld && (
        <div className="fixed top-12 left-16 z-10 font-['Press_Start_2P',cursive] text-[7px] text-[#ffcc00] bg-[rgba(255,200,0,0.08)] border border-[#ffcc0044] rounded-xl px-2.5 py-1">
          🧪 TEST WORLD — 🪙 999,999
        </div>
      )}
    </div>
  );
}
