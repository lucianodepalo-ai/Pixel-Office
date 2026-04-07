'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  HAIR_OPTIONS,
  HEAD_OPTIONS,
  CHEST_OPTIONS,
  LEGS_OPTIONS,
  SHOES_OPTIONS,
  SKIN_COLORS,
  CLOTHING_COLORS,
  ACCESSORIES,
  buildFigureCode,
  parseFigureCode,
  getAvatarUrl,
  type FigureParts,
  type AvatarDirection,
} from '@/lib/avatar-types';

interface AvatarCustomizerProps {
  /** Called when user confirms their avatar */
  onSave?: (figureCode: string, name: string) => void;
  /** Initial figure code to edit */
  initialFigure?: string;
  /** Initial name */
  initialName?: string;
}

type Tab = 'hair' | 'body' | 'shirt' | 'pants' | 'shoes' | 'accessories';

export default function AvatarCustomizer({ onSave, initialFigure, initialName = '' }: AvatarCustomizerProps) {
  const [name, setName] = useState(initialName);
  const [activeTab, setActiveTab] = useState<Tab>('hair');
  const [direction, setDirection] = useState<AvatarDirection>(2);

  const defaultParts: FigureParts = initialFigure
    ? parseFigureCode(initialFigure)
    : {
        hr: { id: 893, color: 45 },
        hd: { id: 180, color: 1 },
        ch: { id: 255, color: 75 },
        lg: { id: 280, color: 82 },
        sh: { id: 300, color: 91 },
      };

  const [parts, setParts] = useState<FigureParts>(defaultParts);

  // Update name if prop changes (e.g. from URL params loaded after mount)
  useEffect(() => { if (initialName) setName(initialName); }, [initialName]);

  const [faceAcc, setFaceAcc] = useState<string>('none');
  const [headAcc, setHeadAcc] = useState<string>('none');
  const [coatAcc, setCoatAcc] = useState<string>('none');

  const figureCode = useMemo(() => {
    const p = { ...parts };
    const accKeys = { fa: faceAcc, he: headAcc, ca: coatAcc };
    for (const [, accKey] of Object.entries(accKeys)) {
      if (accKey !== 'none') {
        const acc = ACCESSORIES[accKey as keyof typeof ACCESSORIES];
        if (acc) {
          (p as Record<string, { id: number; color: number }>)[acc.part] = { id: acc.id, color: acc.color };
        }
      }
    }
    return buildFigureCode(p);
  }, [parts, faceAcc, headAcc, coatAcc]);

  const previewUrl = useMemo(
    () => getAvatarUrl(figureCode, direction),
    [figureCode, direction],
  );

  function updatePart(key: keyof FigureParts, field: 'id' | 'color', value: number) {
    setParts(prev => ({
      ...prev,
      [key]: { ...prev[key]!, [field]: value },
    }));
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'hair', label: 'Pelo', icon: '💇' },
    { key: 'body', label: 'Piel', icon: '🧑' },
    { key: 'shirt', label: 'Remera', icon: '👕' },
    { key: 'pants', label: 'Pantalón', icon: '👖' },
    { key: 'shoes', label: 'Zapatos', icon: '👟' },
    { key: 'accessories', label: 'Accesorios', icon: '🕶️' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a4a]">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 min-w-[200px]">
        <div className="relative bg-[#12122a] rounded-lg p-4 border border-[#2a2a4a]">
          <img
            src={previewUrl}
            alt="Avatar preview"
            width={128}
            height={218}
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </div>

        {/* Direction controls */}
        <div className="grid grid-cols-3 gap-1 w-24">
          <button onClick={() => setDirection(7)} className="avatar-dir-btn">↖</button>
          <button onClick={() => setDirection(0)} className="avatar-dir-btn">↑</button>
          <button onClick={() => setDirection(1)} className="avatar-dir-btn">↗</button>
          <button onClick={() => setDirection(6)} className="avatar-dir-btn">←</button>
          <div className="w-8 h-8" />
          <button onClick={() => setDirection(2)} className="avatar-dir-btn font-bold ring-1 ring-blue-500">→</button>
          <button onClick={() => setDirection(5)} className="avatar-dir-btn">↙</button>
          <button onClick={() => setDirection(4)} className="avatar-dir-btn">↓</button>
          <button onClick={() => setDirection(3)} className="avatar-dir-btn">↘</button>
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre del agente..."
          maxLength={20}
          className="w-full px-3 py-2 bg-[#12122a] border border-[#2a2a4a] rounded-lg text-white text-sm text-center focus:outline-none focus:border-blue-500"
        />

        {/* Figure code display */}
        <div className="w-full">
          <p className="text-[10px] text-gray-500 mb-1 text-center">Figure Code</p>
          <input
            type="text"
            value={figureCode}
            readOnly
            className="w-full px-2 py-1 bg-[#12122a] border border-[#2a2a4a] rounded text-[9px] text-gray-400 text-center font-mono focus:outline-none"
            onClick={e => (e.target as HTMLInputElement).select()}
          />
        </div>

        {onSave && (
          <button
            onClick={() => onSave(figureCode, name)}
            disabled={!name.trim()}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Guardar Avatar
          </button>
        )}
      </div>

      {/* Customization panel */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#12122a] text-gray-400 hover:text-white hover:bg-[#2a2a4a]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {activeTab === 'hair' && (
            <>
              <OptionGrid
                label="Estilo"
                options={HAIR_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                selected={parts.hr.id}
                onSelect={v => updatePart('hr', 'id', v)}
              />
              <CustomIdInput
                label="O probá un ID (100-5600+)"
                value={parts.hr.id}
                onChange={v => updatePart('hr', 'id', v)}
              />
              <ColorPicker
                label="Color de pelo"
                colors={CLOTHING_COLORS}
                selected={parts.hr.color}
                onSelect={v => updatePart('hr', 'color', v)}
              />
            </>
          )}

          {activeTab === 'body' && (
            <>
              <OptionGrid
                label="Forma de cara"
                options={HEAD_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                selected={parts.hd.id}
                onSelect={v => updatePart('hd', 'id', v)}
              />
              <ColorPicker
                label="Color de piel"
                colors={SKIN_COLORS}
                selected={parts.hd.color}
                onSelect={v => updatePart('hd', 'color', v)}
              />
            </>
          )}

          {activeTab === 'shirt' && (
            <>
              <OptionGrid
                label="Tipo"
                options={CHEST_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                selected={parts.ch.id}
                onSelect={v => updatePart('ch', 'id', v)}
              />
              <CustomIdInput label="O probá un ID" value={parts.ch.id} onChange={v => updatePart('ch', 'id', v)} />
              <ColorPicker
                label="Color"
                colors={CLOTHING_COLORS}
                selected={parts.ch.color}
                onSelect={v => updatePart('ch', 'color', v)}
              />
            </>
          )}

          {activeTab === 'pants' && (
            <>
              <OptionGrid
                label="Tipo"
                options={LEGS_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                selected={parts.lg.id}
                onSelect={v => updatePart('lg', 'id', v)}
              />
              <CustomIdInput label="O probá un ID" value={parts.lg.id} onChange={v => updatePart('lg', 'id', v)} />
              <ColorPicker
                label="Color"
                colors={CLOTHING_COLORS}
                selected={parts.lg.color}
                onSelect={v => updatePart('lg', 'color', v)}
              />
            </>
          )}

          {activeTab === 'shoes' && (
            <>
              <OptionGrid
                label="Tipo"
                options={SHOES_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                selected={parts.sh.id}
                onSelect={v => updatePart('sh', 'id', v)}
              />
              <CustomIdInput label="O probá un ID" value={parts.sh.id} onChange={v => updatePart('sh', 'id', v)} />
              <ColorPicker
                label="Color"
                colors={CLOTHING_COLORS}
                selected={parts.sh.color}
                onSelect={v => updatePart('sh', 'color', v)}
              />
            </>
          )}

          {activeTab === 'accessories' && (
            <>
              <OptionGrid
                label="Cara"
                options={[
                  { value: 'none', label: 'Ninguno' },
                  { value: 'glasses', label: '🤓 Anteojos' },
                  { value: 'sunglasses', label: '🕶️ Lentes de sol' },
                  { value: 'roundglasses', label: '👓 Redondos' },
                  { value: 'monocle', label: '🧐 Monóculo' },
                  { value: 'eyepatch', label: '🏴‍☠️ Parche' },
                ]}
                selected={faceAcc}
                onSelect={v => setFaceAcc(v)}
              />
              <OptionGrid
                label="Cabeza"
                options={[
                  { value: 'none', label: 'Ninguno' },
                  { value: 'beanie', label: '🧶 Gorro' },
                  { value: 'cap', label: '🧢 Gorra' },
                  { value: 'tophat', label: '🎩 Galera' },
                  { value: 'bandana', label: '🎀 Bandana' },
                  { value: 'headband', label: '💫 Vincha' },
                ]}
                selected={headAcc}
                onSelect={v => setHeadAcc(v)}
              />
              <OptionGrid
                label="Abrigo"
                options={[
                  { value: 'none', label: 'Ninguno' },
                  { value: 'coat', label: '🧥 Sobretodo' },
                  { value: 'cape', label: '🦸 Capa' },
                  { value: 'trench', label: '🥋 Trench' },
                ]}
                selected={coatAcc}
                onSelect={v => setCoatAcc(v)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OptionGrid<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => onSelect(opt.value)}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              selected === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-[#12122a] text-gray-300 hover:bg-[#2a2a4a]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CustomIdInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[10px] text-gray-500 whitespace-nowrap">{label}:</p>
      <input
        type="number"
        value={value}
        onChange={e => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v > 0) onChange(v);
        }}
        className="w-20 px-2 py-1 bg-[#12122a] border border-[#2a2a4a] rounded text-xs text-white text-center focus:outline-none focus:border-blue-500"
        min={1}
      />
      <button
        onClick={() => onChange(value - 1)}
        className="w-6 h-6 bg-[#12122a] border border-[#2a2a4a] rounded text-gray-400 text-xs hover:bg-[#2a2a4a]"
      >
        -
      </button>
      <button
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 bg-[#12122a] border border-[#2a2a4a] rounded text-gray-400 text-xs hover:bg-[#2a2a4a]"
      >
        +
      </button>
    </div>
  );
}

function ColorPicker({
  label,
  colors,
  selected,
  onSelect,
}: {
  label: string;
  colors: readonly { id: number; label: string; hex: string }[];
  selected: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {colors.map(color => (
          <button
            key={color.id}
            onClick={() => onSelect(color.id)}
            title={color.label}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              selected === color.id ? 'border-blue-400 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
