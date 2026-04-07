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

    // Listen for messages from game iframe
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'GO_LOBBY') router.push('/lobby');
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
