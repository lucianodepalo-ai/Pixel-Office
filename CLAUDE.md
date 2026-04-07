# CLAUDE.md — Agents Hotel App

@AGENTS.md

## Que es este proyecto

Agents Hotel es una oficina/hotel virtual isometrica 100% estilo Habbo Hotel donde agentes de IA se visualizan como avatares Habbo reales (via Habbo Imaging API) y los muebles son sprites reales de Habbo. NO hay sprites custom, avatares procedurales ni assets dibujados en canvas — todo es Habbo.

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- Supabase (auth + profiles + rooms)
- Motor de juego: HTML5 Canvas en `public/game.html` (modularizado en 5 archivos JS)
- Avatares: Habbo Imaging API (`habbo.com/habbo-imaging/avatarimage`)
- Muebles: 413 sprites Habbo en `public/habbo-sprites/sprites-base64.js` (base64)
- Fuente: Inter (Google Fonts) — NO pixel fonts

## Estructura del proyecto

```
src/
  app/
    page.tsx              — Redirect a /auth
    layout.tsx            — Layout root con globals.css
    auth/page.tsx         — Login/registro con Supabase Auth
    lobby/page.tsx        — Selector de salas (rooms)
    room/[id]/page.tsx    — Iframe que carga game.html con postMessage config
  lib/
    supabase.ts           — Cliente Supabase
    database.types.ts     — Tipos generados de Supabase
public/
  game.html               — HTML/CSS + boot script (carga los modulos JS)
  engine-core.js          — Auth, canvas globals, isometric math, color helpers, render loop
  engine-map.js           — MAP data, tile rendering, walls
  engine-furniture.js     — Shop, inventory, furni rendering, economy
  engine-agents.js        — Habbo avatars, walking AI, skins, drawChar
  engine-ui.js            — Navigator, marketplace, chat, config, panels, onboarding
  engine-sound.js         — Sound manager (Web Audio API + Trax samples)
  sounds/                 — 188 Trax samples MP3 del CDN de Habbo
  habbo-sprites/
    sprites-base64.js     — 413 sprites de muebles Habbo en base64
```

## Arquitectura del engine (modularizado)

El motor de juego se divide en 5 modulos JS que se cargan en orden via `<script src>`:

1. **engine-core.js** — Canvas, auth, isometric math, color helpers, render loop, game loop
2. **engine-map.js** — MAP array, dTile(), drawWalls(), drawWallSegment()
3. **engine-furniture.js** — SHOP_ITEMS, FURN, dFurn(), shop/inventory, economy
4. **engine-agents.js** — AGENTS, Habbo cache, drawChar(), updateAgents(), skin editor
5. **engine-ui.js** — Navigator, marketplace, chat, config, onboarding, controls, keyboard
6. **engine-sound.js** — Sound manager con Web Audio API (UI sounds sintetizados) + Trax samples MP3

Todos comparten scope global (no ES modules). Las variables cross-module se referencian solo en funciones (runtime), no en parse time.

Para trabajar en paralelo: cada desarrollador/agente edita su modulo sin conflictos con los demas.

## Flujo de la app

1. `/auth` — Usuario se registra/loguea via Supabase
2. `/lobby` — Ve salas disponibles, puede crear o entrar
3. `/room/[id]` — Carga game.html en iframe, le pasa config via postMessage (mode, username, roomId)
4. `/room/test` — Modo test sin validar room en DB

## Comandos

```bash
npm run dev      # Desarrollo en localhost:3000
npm run build    # Build produccion
npm run lint     # ESLint
```

## Supabase

- Tablas: `profiles` (username, office_name), `rooms` (id, config)
- Schema en `supabase-schema.sql`
- Variables en `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Estilo visual (IMPORTANTE)

- **Solo Habbo**: avatares via Habbo Imaging API con figureCode, muebles via sprites base64 con habboClass
- **NO crear**: sprites custom, avatares procedurales dibujados en canvas, pixel art propio, SPRITE_DATA
- **Fuente**: Inter (Google Fonts) exclusivamente — NO usar Press Start 2P, Silkscreen ni ninguna pixel font
- **Paleta UI**: azules oscuros (#1a2a3a) + bordes teal (#2a4a5e) + dorados (#ffcc00) estilo Habbo Hotel

## Notas importantes

- game.html es ahora solo HTML/CSS (~777 lineas) que carga 5 modulos JS
- Los sprites estan embebidos como base64 en sprites-base64.js para evitar CORS
- La comunicacion Next.js <-> game.html es via postMessage con tipo "AGENTS_HOTEL_INIT"
- Los 5 modulos comparten scope global via `<script>` tags (NO ES modules) — el orden de carga importa
- Cada mueble usa `habboClass` para identificar su sprite exacto en HABBO_FURNI_IMAGES
- Cada agente usa `figureCode` para su avatar Habbo (formato: hd-X-X.hr-X-X.ch-X-X.lg-X-X.sh-X-X)
