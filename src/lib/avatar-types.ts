// ─── Avatar System Types ─────────────────────────────────────────────────────

export type AvatarDirection = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type AvatarAction = 'std' | 'sit' | 'wlk' | 'wav' | 'drk';
export type AvatarGesture = 'std' | 'sml' | 'agr' | 'sad' | 'srp' | 'spk';
export type AgentCategory = 'leadership' | 'development' | 'data' | 'creative' | 'operations' | 'specialized' | 'custom';

export interface AgentPreset {
  id: string;
  name: string;
  description: string;
  figure: string;
  category: AgentCategory;
}

export interface AvatarSpriteSet {
  total: number;
  std: string[];
  sit: string[];
  wlk: string[];
  wav: string[];
  gestures: string[];
  drk: string[];
}

export interface AgentAvatarData extends AgentPreset {
  sprites: AvatarSpriteSet;
}

export interface AvatarIndex {
  [presetId: string]: AgentAvatarData;
}

// ─── Figure Code Parts ───────────────────────────────────────────────────────

export interface FigureParts {
  hr: { id: number; color: number };  // Hair
  hd: { id: number; color: number };  // Head (skin)
  ch: { id: number; color: number };  // Chest (shirt)
  lg: { id: number; color: number };  // Legs (pants)
  sh: { id: number; color: number };  // Shoes
  he?: { id: number; color: number }; // Head accessory (hat)
  ha?: { id: number; color: number }; // Hair accessory
  ca?: { id: number; color: number }; // Coat
  fa?: { id: number; color: number }; // Face accessory (glasses)
  ea?: { id: number; color: number }; // Ears
}

export type FigurePartKey = keyof FigureParts;

// ─── Customization Options ───────────────────────────────────────────────────
// These map to known valid Habbo figure part IDs

// Hair — verified IDs: 100-200, 500-600, 800-900, 1000-1100, 3000-3060, 3160-3200, 3500-3530
export const HAIR_OPTIONS = [
  { id: 100, label: 'Crew Cut' },
  { id: 110, label: 'Flat Top' },
  { id: 120, label: 'Side Fade' },
  { id: 135, label: 'Textured' },
  { id: 155, label: 'Short Messy' },
  { id: 170, label: 'Buzzed' },
  { id: 180, label: 'Wavy Short' },
  { id: 515, label: 'Long Straight' },
  { id: 525, label: 'Medium Layered' },
  { id: 545, label: 'Swept Side' },
  { id: 560, label: 'Shoulder Length' },
  { id: 580, label: 'Curly Medium' },
  { id: 800, label: 'Spiked Up' },
  { id: 815, label: 'Messy Fringe' },
  { id: 831, label: 'Spiky' },
  { id: 850, label: 'Pompadour' },
  { id: 870, label: 'Slicked' },
  { id: 893, label: 'Classic' },
  { id: 1010, label: 'Mohawk' },
  { id: 1025, label: 'Faux Hawk' },
  { id: 1040, label: 'Undercut' },
  { id: 1060, label: 'Long Back' },
  { id: 1080, label: 'Afro Short' },
  { id: 3004, label: 'HC Wavy' },
  { id: 3012, label: 'HC Ponytail' },
  { id: 3020, label: 'HC Buzz' },
  { id: 3037, label: 'HC Dreads' },
  { id: 3040, label: 'HC Long Waves' },
  { id: 3044, label: 'HC Afro' },
  { id: 3163, label: 'HC Curly Wild' },
  { id: 3194, label: 'HC Dreadlocks' },
  { id: 3519, label: 'HC Layered' },
] as const;

export const HEAD_OPTIONS = [
  { id: 180, label: 'Round' },
  { id: 208, label: 'Square' },
  { id: 600, label: 'Oval' },
] as const;

// Chest — verified ranges: 200-300, 600-700. Using safe single-part IDs only.
export const CHEST_OPTIONS = [
  { id: 205, label: 'Tank Top' },
  { id: 210, label: 'Basic Tee' },
  { id: 215, label: 'T-Shirt' },
  { id: 220, label: 'V-Neck' },
  { id: 225, label: 'Henley' },
  { id: 230, label: 'Long Sleeve' },
  { id: 235, label: 'Button Up' },
  { id: 240, label: 'Dress Shirt' },
  { id: 245, label: 'Turtleneck' },
  { id: 250, label: 'Sweater' },
  { id: 255, label: 'Polo' },
  { id: 260, label: 'Hoodie' },
  { id: 265, label: 'Jacket' },
  { id: 270, label: 'Blazer' },
  { id: 275, label: 'Suit Jacket' },
  { id: 280, label: 'Vest' },
  { id: 285, label: 'Cardigan' },
  { id: 290, label: 'Coat' },
  { id: 600, label: 'Crop Top' },
  { id: 610, label: 'Blouse' },
  { id: 620, label: 'Wrap Top' },
  { id: 640, label: 'Denim Jacket' },
  { id: 660, label: 'Bomber' },
  { id: 665, label: 'Casual Shirt' },
  { id: 680, label: 'Parka' },
  { id: 3030, label: 'HC Sweater' },
  { id: 3185, label: 'HC Formal' },
] as const;

// Legs — verified ranges: 250-320, 700-750. Safe single-part IDs.
export const LEGS_OPTIONS = [
  { id: 255, label: 'Slim Fit' },
  { id: 260, label: 'Straight' },
  { id: 265, label: 'Bootcut' },
  { id: 270, label: 'Relaxed' },
  { id: 275, label: 'Jeans' },
  { id: 280, label: 'Chinos' },
  { id: 285, label: 'Casual' },
  { id: 290, label: 'Cargo' },
  { id: 295, label: 'Joggers' },
  { id: 300, label: 'Dress Pants' },
  { id: 305, label: 'Pleated' },
  { id: 310, label: 'Corduroy' },
  { id: 700, label: 'Short' },
  { id: 710, label: 'Bermuda' },
  { id: 720, label: 'Board Shorts' },
  { id: 730, label: 'Capri' },
  { id: 740, label: 'Skirt' },
  { id: 3116, label: 'HC Slim' },
  { id: 3290, label: 'HC Skinny' },
] as const;

// Shoes — verified ranges: 290-320, 700-740. Safe single-part IDs.
export const SHOES_OPTIONS = [
  { id: 290, label: 'Trainers' },
  { id: 295, label: 'Sneakers' },
  { id: 300, label: 'Loafers' },
  { id: 305, label: 'Casual' },
  { id: 310, label: 'Boots' },
  { id: 315, label: 'Chelsea' },
  { id: 700, label: 'Sandals' },
  { id: 710, label: 'Flip Flops' },
  { id: 720, label: 'Slides' },
  { id: 725, label: 'High Tops' },
  { id: 730, label: 'Combat Boots' },
  { id: 735, label: 'Platforms' },
  { id: 3068, label: 'HC Oxford' },
  { id: 3115, label: 'HC Formal' },
] as const;

// Skin colors — Habbo's actual palette (matched from rendered output)
export const SKIN_COLORS = [
  { id: 1, label: 'Pale', hex: '#FFCDA4' },
  { id: 2, label: 'Light', hex: '#F0B682' },
  { id: 3, label: 'Fair', hex: '#E5A072' },
  { id: 5, label: 'Medium', hex: '#C88B5E' },
  { id: 8, label: 'Tan', hex: '#A16E3F' },
  { id: 10, label: 'Brown', hex: '#7A5229' },
  { id: 12, label: 'Dark', hex: '#5C3D1E' },
  { id: 14, label: 'Deep', hex: '#3E2711' },
] as const;

// Clothing/hair colors — Habbo palette IDs with approximate hex
export const CLOTHING_COLORS = [
  { id: 62, label: 'White', hex: '#EEEEEE' },
  { id: 91, label: 'Gray', hex: '#838383' },
  { id: 110, label: 'Black', hex: '#2B2B2B' },
  { id: 82, label: 'Blue', hex: '#5B98CC' },
  { id: 85, label: 'Navy', hex: '#3B5998' },
  { id: 75, label: 'Lavender', hex: '#9B84BF' },
  { id: 68, label: 'Red', hex: '#CC4444' },
  { id: 78, label: 'Pink', hex: '#CC6699' },
  { id: 70, label: 'Orange', hex: '#D4862A' },
  { id: 61, label: 'Yellow', hex: '#CCB33F' },
  { id: 95, label: 'Olive', hex: '#7D9B3C' },
  { id: 100, label: 'Teal', hex: '#3C9B8F' },
  { id: 31, label: 'Tan', hex: '#9B7D3C' },
  { id: 37, label: 'Brown', hex: '#6B4D2D' },
  { id: 45, label: 'Auburn', hex: '#8B4726' },
  { id: 105, label: 'Burgundy', hex: '#6B2D3D' },
] as const;

// Accessories — verified IDs only
export const ACCESSORIES = {
  none: null,
  glasses: { part: 'fa' as const, id: 1201, color: 62, label: 'Glasses' },
  sunglasses: { part: 'fa' as const, id: 1202, color: 110, label: 'Sunglasses' },
  roundglasses: { part: 'fa' as const, id: 1203, color: 62, label: 'Round Glasses' },
  monocle: { part: 'fa' as const, id: 1206, color: 62, label: 'Monocle' },
  eyepatch: { part: 'fa' as const, id: 1210, color: 110, label: 'Eye Patch' },
  beanie: { part: 'he' as const, id: 1601, color: 91, label: 'Beanie' },
  cap: { part: 'he' as const, id: 1602, color: 82, label: 'Cap' },
  tophat: { part: 'he' as const, id: 1604, color: 110, label: 'Top Hat' },
  bandana: { part: 'he' as const, id: 1606, color: 68, label: 'Bandana' },
  headband: { part: 'he' as const, id: 1610, color: 75, label: 'Headband' },
  coat: { part: 'ca' as const, id: 3187, color: 110, label: 'Overcoat' },
  cape: { part: 'ca' as const, id: 3188, color: 82, label: 'Cape' },
  trench: { part: 'ca' as const, id: 3190, color: 37, label: 'Trench Coat' },
} as const;

// ─── Figure Code Builder ─────────────────────────────────────────────────────

export function buildFigureCode(parts: FigureParts): string {
  const segments: string[] = [
    `hr-${parts.hr.id}-${parts.hr.color}`,
    `hd-${parts.hd.id}-${parts.hd.color}`,
    `ch-${parts.ch.id}-${parts.ch.color}`,
    `lg-${parts.lg.id}-${parts.lg.color}`,
    `sh-${parts.sh.id}-${parts.sh.color}`,
  ];

  if (parts.he) segments.push(`he-${parts.he.id}-${parts.he.color}`);
  if (parts.ha) segments.push(`ha-${parts.ha.id}-${parts.ha.color}`);
  if (parts.ca) segments.push(`ca-${parts.ca.id}-${parts.ca.color}`);
  if (parts.fa) segments.push(`fa-${parts.fa.id}-${parts.fa.color}`);
  if (parts.ea) segments.push(`ea-${parts.ea.id}-${parts.ea.color}`);

  return segments.join('.');
}

export function parseFigureCode(code: string): FigureParts {
  const parts: Partial<FigureParts> = {};
  const segments = code.split('.');

  for (const seg of segments) {
    const [key, idStr, colorStr] = seg.split('-');
    const id = parseInt(idStr, 10);
    const color = parseInt(colorStr, 10);

    if (key in parts || ['hr', 'hd', 'ch', 'lg', 'sh', 'he', 'ha', 'ca', 'fa', 'ea'].includes(key)) {
      (parts as Record<string, { id: number; color: number }>)[key] = { id, color };
    }
  }

  return parts as FigureParts;
}

// ─── Habbo API URL Builder ───────────────────────────────────────────────────

export function getAvatarUrl(
  figure: string,
  direction: AvatarDirection = 2,
  action: AvatarAction = 'std',
  gesture: AvatarGesture = 'std',
  frame = 0,
): string {
  let url = `https://www.habbo.com/habbo-imaging/avatarimage`
    + `?figure=${figure}`
    + `&direction=${direction}`
    + `&head_direction=${direction}`
    + `&size=l`;

  if (action !== 'std') url += `&action=${action}`;
  if (gesture !== 'std') url += `&gesture=${gesture}`;
  if (action === 'wlk' && frame > 0) url += `&frame=${frame}`;
  if (action === 'drk') url += `&drk=1`;

  return url;
}

// ─── Sprite Path Resolver ────────────────────────────────────────────────────

export function getSpritePath(
  presetId: string,
  action: AvatarAction = 'std',
  direction: AvatarDirection = 2,
  frame = 0,
): string {
  if (action === 'wlk') return `/avatars/${presetId}/wlk_d${direction}_f${frame}.png`;
  if (action === 'sit') return `/avatars/${presetId}/sit_d${direction}.png`;
  if (action === 'wav') return `/avatars/${presetId}/wav_d${direction}.png`;
  if (action === 'drk') return `/avatars/${presetId}/drk_d${direction}.png`;
  return `/avatars/${presetId}/std_d${direction}.png`;
}
