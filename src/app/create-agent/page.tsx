'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import AvatarCustomizer from '@/components/AvatarCustomizer';

export default function CreateAgentPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [initialFigure, setInitialFigure] = useState<string | undefined>();
  const [initialName, setInitialName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') === '1') setIsNewUser(true);
    const fig = searchParams.get('figure');
    const name = searchParams.get('name');
    if (fig) setInitialFigure(fig);
    if (name) setInitialName(name);
  }, [searchParams]);

  async function handleSave(figureCode: string, name: string) {
    setSaving(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth'); return; }

    // Ensure user has a room
    let { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('owner_id', session.user.id)
      .single();

    if (!room) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('office_name')
        .eq('id', session.user.id)
        .single();

      const { data: newRoom } = await supabase
        .from('rooms')
        .insert({
          owner_id: session.user.id,
          name: profile?.office_name || 'Mi Oficina',
          description: 'Oficina personalizada',
          category: 'startup',
          is_public: true,
          furniture: [],
        })
        .select('id')
        .single();

      room = newRoom;
    }

    if (!room) { setError('Error creando sala'); setSaving(false); return; }

    // Determine dominant color from figure code for the agent card
    const color = extractDominantColor(figureCode);

    const { error: insertErr } = await supabase.from('agents').insert({
      owner_id: session.user.id,
      room_id: room.id,
      name,
      emoji: '🤖',
      agent_class: 'Rookie',
      color,
      figure_code: figureCode,
      appearance: figureToAppearance(figureCode),
      status: 'idle',
      status_text: 'Listo para trabajar',
      configured: false,
      desk_tile: { x: 3, y: 3 },
    });

    if (insertErr) {
      setError(insertErr.message);
      setSaving(false);
      return;
    }

    router.push('/lobby');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060610] via-[#0a1025] to-[#0f0a20] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {isNewUser && (
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#00ff88] mb-2">
              Bienvenido a Agents Hotel
            </h1>
            <p className="text-sm text-gray-400">
              Creá tu primer agente para empezar. Elegí su apariencia y dale un nombre.
            </p>
          </div>
        )}

        {!isNewUser && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold text-white">Crear nuevo agente</h1>
            <button
              onClick={() => router.push('/lobby')}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Volver al lobby
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        <AvatarCustomizer
          onSave={handleSave}
          initialName={initialName}
          initialFigure={initialFigure}
        />

        {saving && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="text-[#00ff88] animate-pulse text-sm">Creando agente...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Extract the shirt color from figure code as the agent's "reference color"
function extractDominantColor(figureCode: string): string {
  const colorMap: Record<number, string> = {
    62: '#EEEEEE', 91: '#838383', 110: '#2B2B2B', 82: '#5B98CC',
    85: '#3B5998', 75: '#9B84BF', 68: '#CC4444', 78: '#CC6699',
    70: '#D4862A', 61: '#CCB33F', 95: '#7D9B3C', 100: '#3C9B8F',
    31: '#9B7D3C', 37: '#6B4D2D', 45: '#8B4726', 105: '#6B2D3D',
  };

  const chMatch = figureCode.match(/ch-\d+-(\d+)/);
  if (chMatch) {
    const colorId = parseInt(chMatch[1], 10);
    return colorMap[colorId] || '#00ff88';
  }
  return '#00ff88';
}

function figureToAppearance(figureCode: string) {
  const parts = figureCode.split('.');
  const get = (prefix: string) => {
    const seg = parts.find(p => p.startsWith(prefix + '-'));
    if (!seg) return { id: 0, color: 0 };
    const [, id, color] = seg.split('-');
    return { id: parseInt(id), color: parseInt(color) };
  };

  return {
    skinColor: `skin-${get('hd').color}`,
    hairColor: `hair-${get('hr').color}`,
    shirtColor: `shirt-${get('ch').color}`,
    pantsColor: `pants-${get('lg').color}`,
    shoeColor: `shoe-${get('sh').color}`,
    hairStyle: `hr-${get('hr').id}`,
    accessory: 'none',
  };
}
