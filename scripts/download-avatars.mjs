#!/usr/bin/env node
/**
 * Habbo Avatar Sprite Downloader
 *
 * Downloads HD avatar sprites from the official Habbo Imaging API
 * for all agent presets, directions, and actions.
 *
 * Usage:
 *   node scripts/download-avatars.mjs              # Download all presets
 *   node scripts/download-avatars.mjs --preset ceo  # Download specific preset
 *   node scripts/download-avatars.mjs --custom "hr-893-45.hd-180-1.ch-215-75.lg-285-76.sh-305-80" --name my-agent
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'avatars');

// ─── Agent Presets ───────────────────────────────────────────────────────────
// Each preset defines a unique look for a common AI agent role.
// Figure code format: hr-{hair}-{color}.hd-{head}-{skinColor}.ch-{chest}-{color}.lg-{legs}-{color}.sh-{shoes}-{color}
// Optional parts: .he-{headAcc}.ha-{hairAcc}.ca-{coat}.fa-{faceAcc}.ea-{ears}

export const AGENT_PRESETS = {
  // ── Leadership ──
  ceo: {
    name: 'CEO',
    description: 'Executive leader, formal suit',
    figure: 'hr-893-45.hd-180-1.ch-3185-110.lg-3116-110.sh-3115-110.ca-3187-110',
    category: 'leadership',
  },
  manager: {
    name: 'Manager',
    description: 'Project manager, business casual',
    figure: 'hr-545-31.hd-600-1.ch-255-75.lg-280-82.sh-300-91',
    category: 'leadership',
  },
  cto: {
    name: 'CTO',
    description: 'Tech lead, smart casual with glasses',
    figure: 'hr-831-37.hd-180-2.ch-3030-110.lg-3290-82.sh-3068-91.fa-1201-62',
    category: 'leadership',
  },

  // ── Development ──
  developer: {
    name: 'Developer',
    description: 'Full-stack dev, hoodie style',
    figure: 'hr-155-31.hd-208-8.ch-255-75.lg-275-82.sh-295-91',
    category: 'development',
  },
  frontend: {
    name: 'Frontend Dev',
    description: 'Creative frontend developer',
    figure: 'hr-515-37.hd-600-1.ch-665-75.lg-710-82.sh-725-91',
    category: 'development',
  },
  backend: {
    name: 'Backend Dev',
    description: 'Backend engineer, minimal style',
    figure: 'hr-3163-45.hd-180-14.ch-3185-82.lg-3116-82.sh-3115-110',
    category: 'development',
  },
  devops: {
    name: 'DevOps',
    description: 'Infrastructure engineer',
    figure: 'hr-831-61.hd-180-1.ch-3030-75.lg-3290-110.sh-3068-110',
    category: 'development',
  },

  // ── Data & AI ──
  data_scientist: {
    name: 'Data Scientist',
    description: 'Analytical mind, glasses, neat look',
    figure: 'hr-545-45.hd-600-2.ch-255-110.lg-280-110.sh-300-91.fa-1201-62',
    category: 'data',
  },
  ml_engineer: {
    name: 'ML Engineer',
    description: 'Machine learning specialist',
    figure: 'hr-3163-37.hd-180-8.ch-3185-75.lg-3116-75.sh-3115-91',
    category: 'data',
  },
  analyst: {
    name: 'Analyst',
    description: 'Business analyst, formal',
    figure: 'hr-893-31.hd-600-1.ch-3030-82.lg-3290-110.sh-3068-110',
    category: 'data',
  },

  // ── Design & Creative ──
  designer: {
    name: 'Designer',
    description: 'UI/UX designer, creative look',
    figure: 'hr-515-61.hd-600-14.ch-665-82.lg-710-75.sh-725-91',
    category: 'creative',
  },
  creative: {
    name: 'Creative Director',
    description: 'Bold creative style',
    figure: 'hr-3163-61.hd-180-2.ch-3185-75.lg-3116-82.sh-3115-75.he-1601-62',
    category: 'creative',
  },

  // ── Operations & Support ──
  support: {
    name: 'Support Agent',
    description: 'Customer support, friendly look',
    figure: 'hr-545-45.hd-600-8.ch-255-82.lg-280-75.sh-300-91',
    category: 'operations',
  },
  hr: {
    name: 'HR Manager',
    description: 'Human resources, approachable',
    figure: 'hr-893-37.hd-600-14.ch-3030-75.lg-3290-75.sh-3068-91',
    category: 'operations',
  },
  marketing: {
    name: 'Marketing',
    description: 'Marketing specialist, vibrant',
    figure: 'hr-515-31.hd-180-1.ch-665-110.lg-710-82.sh-725-75',
    category: 'operations',
  },
  sales: {
    name: 'Sales Rep',
    description: 'Sales representative, sharp dresser',
    figure: 'hr-831-45.hd-600-1.ch-3185-110.lg-3116-110.sh-3115-110',
    category: 'operations',
  },

  // ── Specialized ──
  security: {
    name: 'Security',
    description: 'Cybersecurity specialist, dark style',
    figure: 'hr-831-61.hd-180-14.ch-3030-110.lg-3290-110.sh-3068-110.fa-1201-62',
    category: 'specialized',
  },
  researcher: {
    name: 'Researcher',
    description: 'R&D researcher, academic',
    figure: 'hr-155-37.hd-208-2.ch-255-82.lg-275-110.sh-295-91.fa-1201-62',
    category: 'specialized',
  },
  intern: {
    name: 'Intern',
    description: 'New intern, casual and eager',
    figure: 'hr-3163-31.hd-180-1.ch-255-75.lg-275-82.sh-295-91.he-1601-62',
    category: 'specialized',
  },
  bot: {
    name: 'AI Bot',
    description: 'The AI assistant itself, distinctive look',
    figure: 'hr-155-61.hd-208-14.ch-3185-110.lg-3116-110.sh-3115-110.he-1601-62',
    category: 'specialized',
  },
};

// ─── Download Config ─────────────────────────────────────────────────────────

const DIRECTIONS = [0, 1, 2, 3, 4, 5, 6, 7];
const ACTIONS = ['std', 'sit', 'wlk', 'wav'];
const WALK_FRAMES = [0, 1, 2, 3];
const GESTURES = ['std', 'sml', 'agr', 'sad', 'srp', 'spk'];
const SIZE = 'l'; // large = HD

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(figure, direction, action = 'std', gesture = 'std', frame = 0) {
  let url = `https://www.habbo.com/habbo-imaging/avatarimage`
    + `?figure=${figure}`
    + `&direction=${direction}`
    + `&head_direction=${direction}`
    + `&size=${SIZE}`;

  if (action !== 'std') url += `&action=${action}`;
  if (gesture !== 'std') url += `&gesture=${gesture}`;
  if (action === 'wlk' && frame > 0) url += `&frame=${frame}`;
  if (action === 'drk') url += `&drk=1`;

  return url;
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/png,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.habbo.com/',
      },
    };
    https.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Download Logic ──────────────────────────────────────────────────────────

async function downloadPreset(presetId, preset) {
  const presetDir = path.join(OUTPUT_DIR, presetId);
  ensureDir(presetDir);

  // Save preset metadata
  fs.writeFileSync(
    path.join(presetDir, 'meta.json'),
    JSON.stringify({ id: presetId, ...preset }, null, 2)
  );

  const tasks = [];

  // Standard poses — all 8 directions
  for (const dir of DIRECTIONS) {
    tasks.push({ file: `std_d${dir}.png`, url: buildUrl(preset.figure, dir, 'std', 'std') });
  }

  // Sitting — directions 0,2,4,6 (cardinal)
  for (const dir of [0, 2, 4, 6]) {
    tasks.push({ file: `sit_d${dir}.png`, url: buildUrl(preset.figure, dir, 'sit', 'std') });
  }

  // Walking — 4 frames x 8 directions
  for (const dir of DIRECTIONS) {
    for (const frame of WALK_FRAMES) {
      tasks.push({ file: `wlk_d${dir}_f${frame}.png`, url: buildUrl(preset.figure, dir, 'wlk', 'std', frame) });
    }
  }

  // Waving — all 8 directions
  for (const dir of DIRECTIONS) {
    tasks.push({ file: `wav_d${dir}.png`, url: buildUrl(preset.figure, dir, 'wav', 'std') });
  }

  // Gestures — only front-facing (direction 2)
  for (const gesture of GESTURES) {
    if (gesture === 'std') continue;
    tasks.push({ file: `gest_${gesture}_d2.png`, url: buildUrl(preset.figure, 2, 'std', gesture) });
  }

  // Drinking — direction 2
  tasks.push({
    file: `drk_d2.png`,
    url: buildUrl(preset.figure, 2, 'drk', 'std'),
  });

  console.log(`\n📥 ${preset.name} (${presetId}) — ${tasks.length} sprites`);

  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const task of tasks) {
    const filePath = path.join(presetDir, task.file);

    // Skip already downloaded
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    try {
      const data = await downloadFile(task.url);
      fs.writeFileSync(filePath, data);
      downloaded++;

      // Progress
      const total = downloaded + skipped + errors;
      const pct = Math.round((total / tasks.length) * 100);
      process.stdout.write(`\r  [${pct}%] ${downloaded} downloaded, ${skipped} skipped, ${errors} errors`);

      // Rate limiting — be respectful to Habbo's servers
      await sleep(150);
    } catch (err) {
      errors++;
      console.error(`\n  ❌ ${task.file}: ${err.message}`);
    }
  }

  console.log(`\n  ✅ Done: ${downloaded} new, ${skipped} cached, ${errors} errors`);
  return { downloaded, skipped, errors };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const presetFlag = args.indexOf('--preset');
  const customFlag = args.indexOf('--custom');
  const nameFlag = args.indexOf('--name');
  const listFlag = args.includes('--list');

  console.log('🏨 Agents Hotel — Avatar Sprite Downloader');
  console.log('═══════════════════════════════════════════\n');

  if (listFlag) {
    console.log('Available presets:\n');
    const byCategory = {};
    for (const [id, p] of Object.entries(AGENT_PRESETS)) {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push({ id, ...p });
    }
    for (const [cat, presets] of Object.entries(byCategory)) {
      console.log(`  ${cat.toUpperCase()}`);
      for (const p of presets) {
        console.log(`    ${p.id.padEnd(18)} ${p.name.padEnd(20)} ${p.description}`);
      }
      console.log();
    }
    console.log(`Total: ${Object.keys(AGENT_PRESETS).length} presets`);
    console.log(`\nUsage:`);
    console.log(`  node scripts/download-avatars.mjs                    # All presets`);
    console.log(`  node scripts/download-avatars.mjs --preset developer # One preset`);
    console.log(`  node scripts/download-avatars.mjs --custom "hr-..." --name my-agent`);
    return;
  }

  ensureDir(OUTPUT_DIR);

  // Custom figure code
  if (customFlag !== -1 && args[customFlag + 1]) {
    const figure = args[customFlag + 1];
    const name = (nameFlag !== -1 && args[nameFlag + 1]) ? args[nameFlag + 1] : 'custom';
    console.log(`Custom avatar: ${name}`);
    console.log(`Figure: ${figure}\n`);
    await downloadPreset(name, { name, description: 'Custom avatar', figure, category: 'custom' });
    generateIndex();
    return;
  }

  // Specific preset
  if (presetFlag !== -1 && args[presetFlag + 1]) {
    const id = args[presetFlag + 1];
    if (!AGENT_PRESETS[id]) {
      console.error(`❌ Preset "${id}" not found. Use --list to see options.`);
      process.exit(1);
    }
    await downloadPreset(id, AGENT_PRESETS[id]);
    generateIndex();
    return;
  }

  // All presets
  const entries = Object.entries(AGENT_PRESETS);
  console.log(`Downloading ${entries.length} agent presets...`);
  console.log(`Each preset: 8 dirs × std + 4 dirs × sit + 8 dirs × 4 frames wlk + 8 dirs × wav + gestures + drk`);

  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [id, preset] of entries) {
    const result = await downloadPreset(id, preset);
    totalDownloaded += result.downloaded;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`🎉 Complete! ${totalDownloaded} downloaded, ${totalSkipped} cached, ${totalErrors} errors`);

  generateIndex();
}

// ─── Index Generator ─────────────────────────────────────────────────────────
// Creates a JSON index of all downloaded avatars for the React app to consume

function generateIndex() {
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  const presets = {};

  const dirs = fs.readdirSync(OUTPUT_DIR, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const metaPath = path.join(OUTPUT_DIR, dir.name, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const files = fs.readdirSync(path.join(OUTPUT_DIR, dir.name))
      .filter(f => f.endsWith('.png'));

    presets[dir.name] = {
      ...meta,
      sprites: {
        total: files.length,
        std: files.filter(f => f.startsWith('std_')),
        sit: files.filter(f => f.startsWith('sit_')),
        wlk: files.filter(f => f.startsWith('wlk_')),
        wav: files.filter(f => f.startsWith('wav_')),
        gestures: files.filter(f => f.startsWith('gest_')),
        drk: files.filter(f => f.startsWith('drk_')),
      },
    };
  }

  fs.writeFileSync(indexPath, JSON.stringify(presets, null, 2));
  console.log(`\n📋 Index saved: ${indexPath}`);
  console.log(`   ${Object.keys(presets).length} agents indexed`);
}

main().catch(console.error);
