#!/usr/bin/env node
/**
 * Discovers valid Habbo figure part IDs by testing them against the API.
 * Tests a range of IDs for each part type and checks which ones produce
 * a different avatar (vs the default fallback).
 */

import https from 'https';
import crypto from 'crypto';

const BASE = 'hr-893-45.hd-180-1.ch-255-75.lg-280-82.sh-300-91';

function fetchSize(figure) {
  return new Promise((resolve) => {
    const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&direction=2&head_direction=2&size=l`;
    const parsedUrl = new URL(url);
    https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/png,image/*',
        'Referer': 'https://www.habbo.com/',
      },
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve({ size: buf.length, hash: crypto.createHash('md5').update(buf).digest('hex') });
      });
    }).on('error', () => resolve({ size: 0, hash: '' }));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function discoverPart(partCode, label, ranges) {
  console.log(`\n🔍 Discovering ${label} (${partCode})...`);

  // Get baseline hash (default look)
  const baseline = await fetchSize(BASE);

  const valid = [];
  let tested = 0;

  for (const range of ranges) {
    for (let id = range[0]; id <= range[1]; id++) {
      const figure = BASE.replace(
        new RegExp(`${partCode}-\\d+-\\d+`),
        `${partCode}-${id}-75`
      );
      // If part doesn't exist in base, append it
      const testFigure = figure.includes(`${partCode}-${id}`)
        ? figure
        : `${BASE}.${partCode}-${id}-75`;

      const result = await fetchSize(testFigure);
      tested++;

      if (result.size > 0 && result.hash !== baseline.hash) {
        valid.push(id);
        process.stdout.write(`✓`);
      } else {
        process.stdout.write(`.`);
      }

      await sleep(100);
    }
  }

  console.log(`\n  Found ${valid.length}/${tested} valid IDs: [${valid.join(', ')}]`);
  return valid;
}

async function main() {
  console.log('🔬 Habbo Figure Part Discovery Tool');
  console.log('====================================\n');

  // Test hair IDs in various ranges
  const hair = await discoverPart('hr', 'Hair styles', [
    [100, 200], [500, 600], [800, 900], [1000, 1100],
    [3000, 3060], [3160, 3200], [3500, 3530],
  ]);

  // Test chest IDs
  const chest = await discoverPart('ch', 'Chest/Shirts', [
    [200, 300], [600, 700], [3000, 3060], [3100, 3200],
  ]);

  // Test legs IDs
  const legs = await discoverPart('lg', 'Legs/Pants', [
    [250, 320], [700, 750], [3000, 3050], [3100, 3150], [3250, 3310],
  ]);

  // Test shoes IDs
  const shoes = await discoverPart('sh', 'Shoes', [
    [290, 320], [700, 740], [3000, 3080], [3100, 3130],
  ]);

  // Test head accessories
  const headAcc = await discoverPart('he', 'Head accessories', [
    [1600, 1650], [3000, 3030],
  ]);

  // Test face accessories
  const faceAcc = await discoverPart('fa', 'Face accessories (glasses)', [
    [1200, 1220], [3000, 3020],
  ]);

  // Test coats
  const coats = await discoverPart('ca', 'Coats/Capes', [
    [3180, 3200], [1700, 1730],
  ]);

  console.log('\n\n====== RESULTS ======');
  console.log(`Hair: ${hair.length} styles`);
  console.log(`Chest: ${chest.length} styles`);
  console.log(`Legs: ${legs.length} styles`);
  console.log(`Shoes: ${shoes.length} styles`);
  console.log(`Head acc: ${headAcc.length} styles`);
  console.log(`Face acc: ${faceAcc.length} styles`);
  console.log(`Coats: ${coats.length} styles`);

  console.log('\n// Paste into avatar-types.ts:');
  console.log(`HAIR_IDS = [${hair.join(',')}]`);
  console.log(`CHEST_IDS = [${chest.join(',')}]`);
  console.log(`LEGS_IDS = [${legs.join(',')}]`);
  console.log(`SHOES_IDS = [${shoes.join(',')}]`);
  console.log(`HEAD_ACC_IDS = [${headAcc.join(',')}]`);
  console.log(`FACE_ACC_IDS = [${faceAcc.join(',')}]`);
  console.log(`COAT_IDS = [${coats.join(',')}]`);
}

main().catch(console.error);
