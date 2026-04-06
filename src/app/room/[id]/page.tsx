"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const isTestWorld = roomId === "test";
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, office_name")
        .eq("id", session.user.id)
        .single();

      if (profile) setUsername(profile.username);

      // If not test, ensure room exists
      if (!isTestWorld) {
        const { data: room } = await supabase
          .from("rooms")
          .select("id")
          .eq("id", roomId)
          .single();
        if (!room) { router.push("/lobby"); return; }
      }

      setReady(true);
    }
    checkAuth();
  }, [roomId, isTestWorld, router]);

  function handleIframeLoad() {
    const iframe = document.getElementById("game-iframe") as HTMLIFrameElement;
    if (!iframe?.contentWindow) return;

    // Send config to the game via postMessage
    iframe.contentWindow.postMessage({
      type: "AGENTS_HOTEL_INIT",
      mode: isTestWorld ? "test" : "live",
      username: username,
      roomId: roomId,
    }, "*");
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#060610]">
        <div className="text-[#00ff88] font-['Press_Start_2P',cursive] text-sm animate-pulse">
          Cargando sala...
        </div>
      </div>
    );
  }

  // Build game URL with mode parameter
  const gameUrl = `/game.html?mode=${isTestWorld ? "test" : "live"}&room=${roomId}&user=${encodeURIComponent(username)}`;

  return (
    <div className="fixed inset-0 bg-[#060610]">
      {/* Back to lobby button - floating above iframe */}
      <button
        onClick={() => router.push("/lobby")}
        className="fixed top-3 right-3 z-50 font-['Press_Start_2P',cursive] text-[7px] text-[#555] bg-[rgba(8,8,18,0.95)] border border-[#1a1a2e] rounded-lg px-3 py-2 hover:border-[#00ff88] hover:text-[#00ff88] transition-all"
      >
        ← Lobby
      </button>

      {/* Game iframe - full screen */}
      <iframe
        id="game-iframe"
        src={gameUrl}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        allow="autoplay"
      />
    </div>
  );
}
