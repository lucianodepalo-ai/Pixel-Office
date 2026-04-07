"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Existing user → check if they have agents, go to select or lobby
    const { data: { session: loginSession } } = await supabase.auth.getSession();
    if (loginSession) {
      const { count } = await supabase
        .from('agents')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', loginSession.user.id);
      if (count && count > 0) {
        router.push("/select-agent");
      } else {
        router.push("/create-agent?welcome=1");
      }
    } else {
      router.push("/lobby");
    }
  }

  async function handleRegister() {
    setError("");
    if (!username || username.length < 3) { setError("Usuario: mínimo 3 caracteres"); return; }
    if (!email.includes("@")) { setError("Email inválido"); return; }
    if (password.length < 6) { setError("Contraseña: mínimo 6 caracteres"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          office_name: officeName || "Mi Oficina",
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // New user → create first agent
    router.push("/create-agent?welcome=1");
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#060610] via-[#0a1025] to-[#0f0a20]">
      {/* Stars — seeded positions to avoid hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
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
                animationDuration: `${2 + (i % 3)}s`,
                opacity: 0.2 + ((i * 7) % 5) * 0.12,
              }}
            />
          );
        })}
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-[380px] max-w-[92vw] bg-[#080818]/95 border-2 border-[#1a1a2e] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,255,136,0.05)]">
        {/* Header */}
        <div className="p-7 text-center border-b border-[#1a1a2e] bg-gradient-to-b from-[rgba(0,255,136,0.03)] to-transparent">
          <h1 className="font-['Press_Start_2P',cursive] text-base text-[#00ff88] drop-shadow-[0_0_20px_rgba(0,255,136,0.3)] tracking-wider">
            AGENTS HOTEL
          </h1>
          <p className="text-[10px] text-[#444] mt-1">tu oficina virtual de agentes IA</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a2e]">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all ${
              tab === "login"
                ? "text-[#00ff88] border-[#00ff88] bg-[rgba(0,255,136,0.03)]"
                : "text-[#444] border-transparent hover:text-[#888]"
            }`}
          >
            INGRESAR
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all ${
              tab === "register"
                ? "text-[#00ff88] border-[#00ff88] bg-[rgba(0,255,136,0.03)]"
                : "text-[#444] border-transparent hover:text-[#888]"
            }`}
          >
            REGISTRARSE
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {tab === "register" && (
            <>
              <Field label="Nombre de usuario" value={username} onChange={setUsername} placeholder="AgentMaster99" />
              <Field label="Nombre de tu Oficina" value={officeName} onChange={setOfficeName} placeholder="Mi Startup HQ" />
            </>
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
            onEnter={tab === "login" ? handleLogin : handleRegister}
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            onClick={tab === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full py-3 font-['Press_Start_2P',cursive] text-[9px] bg-[#00ff88] text-[#060610] rounded-lg hover:bg-[#00ffaa] hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(0,255,136,0.25)] disabled:opacity-50"
          >
            {loading ? "..." : tab === "login" ? "ENTRAR" : "CREAR CUENTA"}
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 text-center border-t border-[#0f0f1e]">
          <span className="text-[9px] text-[#333]">Agents Hotel © 2026 — AI Workspace Platform</span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <div>
      <label className="block font-['Press_Start_2P',cursive] text-[7px] text-[#555] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-[#0a0a18] border border-[#1a1a2e] rounded-lg text-[#ccc] text-sm outline-none transition-colors focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.1)] placeholder:text-[#2a2a3e]"
      />
    </div>
  );
}
