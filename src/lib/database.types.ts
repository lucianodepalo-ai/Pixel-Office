export interface Profile {
  id: string
  username: string
  office_name: string
  coins: number
  created_at: string
}

export interface Room {
  id: string
  owner_id: string
  name: string
  description: string
  category: 'startup' | 'agency' | 'freelancer' | 'enterprise' | 'community'
  is_public: boolean
  visitors_count: number
  furniture: FurnitureItem[]
  created_at: string
  // Joined fields
  owner?: Profile
}

export interface Agent {
  id: string
  room_id: string
  owner_id: string
  name: string
  emoji: string
  agent_class: string
  color: string
  level: number
  xp: number
  xp_max: number
  status: 'idle' | 'working' | 'thinking' | 'reading'
  status_text: string
  configured: boolean
  figure_code: string | null
  appearance: AgentAppearance
  stats: Record<string, { val: number; label: string; color: string }>
  skills: AgentSkill[]
  equipment: AgentEquipment[]
  current_task: { name: string; detail: string; progress: number }
  desk_tile: { x: number; y: number }
  total_earned: number
  work_ticks: number
  created_at: string
}

export interface AgentAppearance {
  skinColor: string
  hairColor: string
  shirtColor: string
  pantsColor: string
  shoeColor: string
  hairStyle: string
  accessory: string
}

export interface AgentSkill {
  cat: string
  items: { name: string; icon: string; desc: string; lvl: number; max: number; color: string }[]
}

export interface AgentEquipment {
  slot: string
  icon: string
  name: string
  desc: string
  rarity: string
}

export interface FurnitureItem {
  t: string
  x: number
  y: number
  rot: number
  variant?: string
}

export interface MarketplaceListing {
  id: string
  seller_id: string
  agent_id: string
  price: number
  status: 'active' | 'sold' | 'cancelled'
  created_at: string
  // Joined
  agent?: Agent
  seller?: Profile
}
