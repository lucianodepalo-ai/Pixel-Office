// =============================================
// ENGINE-AGENTS.JS — Avatars, Walking, Skins, Habbo Cache
// =============================================

// ====== HABBO AVATAR IMAGING ======
const HABBO_FIGURES = {
  debugger:  'hd-180-1.hr-828-61.ch-215-82.lg-270-82.sh-300-91.he-1610-62',
  frontend:  'hd-180-14.hr-170-37.ch-3474-110-1408.lg-275-110.sh-305-80',
  tester:    'hd-600-3.hr-515-31.ch-635-80.lg-700-72.sh-730-64',
  designer:  'hd-600-10.hr-545-33.ch-660-91.lg-710-66.sh-735-82',
  pm:        'hd-195-14.hr-100-45.ch-255-64.lg-280-91.sh-300-91',
  starter:   'hd-180-1.hr-110-61.ch-255-82.lg-280-82.sh-300-91'
};

// Cache de sprites: { agentId: { d2_std: Image, d2_sit: Image, ... } }
let HABBO_CACHE = {};
let HABBO_LOADED = 0, HABBO_TOTAL = 0;
const useHabboAvatars = true; // always Habbo avatars

function preloadHabbo(){
  const BASE = 'https://www.habbo.com/habbo-imaging/avatarimage';
  const dirs = [2, 6]; // front (SE/SW), back (NE/NW)
  const acts = [
    {key:'std', q:'std'},
    {key:'sit', q:'sit'},
    {key:'wlk0', q:'wlk&frame=0'},
    {key:'wlk1', q:'wlk&frame=2'},
    {key:'wav',  q:'wav&frame=0'}
  ];

  HABBO_LOADED = 0;
  HABBO_TOTAL = 0;

  AGENTS.forEach(a => {
    const fig = a.figureCode || HABBO_FIGURES[a.id];
    if(!fig) return;
    HABBO_CACHE[a.id] = {};

    dirs.forEach(d => {
      acts.forEach(act => {
        HABBO_TOTAL++;
        const key = 'd' + d + '_' + act.key;
        const img = new Image();
        // img.crossOrigin not needed for display-only (no canvas taint)
        img.onload = () => { HABBO_LOADED++; };
        img.onerror = () => { HABBO_LOADED++; console.warn('[AH] Failed to load Habbo sprite:', key, 'for', a.id); };
        img.src = BASE + '?figure=' + fig + '&direction=' + d + '&action=' + act.q + '&size=l';
        HABBO_CACHE[a.id][key] = img;
      });
    });
  });
  console.log('[AH] Habbo preloading ' + HABBO_TOTAL + ' sprites for ' + AGENTS.length + ' agents');
}

function isHabboReady(){ return HABBO_TOTAL > 0 && HABBO_LOADED >= HABBO_TOTAL; }

function getHabboSprite(a, dir, state, actionAnim){
  const sprites = HABBO_CACHE[a.id];
  if(!sprites) return null;

  // Direction → Habbo direction + mirror flag
  const facingBack = (dir === 'ne' || dir === 'nw');
  const mirror = (dir === 'sw' || dir === 'ne');
  const habDir = facingBack ? 6 : 2;

  // State → action key
  let actKey = 'std';
  if(state === 'walking' || a.targetPos){
    actKey = (Math.floor(tk / 10) % 2 === 0) ? 'wlk0' : 'wlk1';
  }
  if(actionAnim){
    if(actionAnim.type === 'wave') actKey = 'wav';
    // dance uses std (no Habbo dance API)
  }

  const key = 'd' + habDir + '_' + actKey;
  const img = sprites[key] || sprites['d2_std']; // fallback to front std
  if(!img || !img.complete || img.naturalWidth === 0) return null;

  return { img, mirror };
}

// ====== RENAME AGENT ======
// ====== RENAME AGENT ======
function renameAgent(agentId) {
  var a = AGENTS.find(function(x){return x.id === agentId});
  if (!a) return;
  var nameEl = document.querySelector('.ai-name');
  if (!nameEl) return;
  nameEl.innerHTML = '<input id="rename-input" type="text" value="' + a.name.replace(/"/g,'') + '" maxlength="20" style="width:110px;padding:4px 8px;background:#0a0a18;border:1px solid #00ff88;border-radius:6px;color:#fff;font-family:Inter,sans-serif;font-size:12px;outline:none" />' +
    '<button id="rename-ok" style="margin-left:4px;padding:4px 8px;background:#00ff88;color:#060610;border:none;border-radius:6px;font-family:Inter,sans-serif;font-weight:600;font-size:11px;cursor:pointer">OK</button>';
  var inp = document.getElementById('rename-input');
  inp.focus();
  inp.select();
  document.getElementById('rename-ok').onclick = function(){ confirmRename(agentId); };
  inp.onkeydown = function(e) {
    if (e.key === 'Enter') confirmRename(agentId);
    if (e.key === 'Escape') showAgentInfo(a);
  };
}
function confirmRename(agentId) {
  var a = AGENTS.find(function(x){return x.id === agentId});
  if (!a) return;
  var inp = document.getElementById('rename-input');
  if (!inp) return;
  var newName = inp.value.trim();
  if (!newName) return;
  a.name = newName.slice(0, 20);
  updCards();
  showAgentInfo(a);
  if (!isTestWorld) saveUserState();
  showToast('\u270f\ufe0f Renombrado: ' + a.name, '#00ff88');
}

// ====== CHARACTER DRAWING ======
// =============================================
// HABBO-STYLE CHARACTER v5
// =============================================
function drawChar(a,overrideCtx,overrideZm,overridePos,overrideW,overrideH,overrideCx,overrideCy){
  const isPreview=!!overrideCtx;
  const PX=isPreview?overrideCtx:X;
  const pzm=isPreview?overrideZm:zm;
  const pw=isPreview?overrideW:W;
  const ph=isPreview?overrideH:H;
  const pcx=isPreview?overrideCx:cx;
  const pcy=isPreview?overrideCy:cy;
  const apos=isPreview?overridePos:a.pos;
  const savedX=X;
  if(isPreview) X=PX;

  const isoP=isoXY(apos.x,apos.y);
  const scP={x:(isoP.x+pcx)*pzm+pw/2, y:(isoP.y+pcy)*pzm+ph/2};
  const sc=scP;
  const z=pzm;
  const walking=a.state==='walking'&&!isPreview;
  const bob=walking?Math.sin(tk*.22)*0.8:0;
  const s=z*0.65;
  const bY=sc.y+bob*s;

  // Discretized walking animation (2-3 frames like Habbo)
  const legAnim=walking?Math.floor(Math.sin(tk*.22)*2)*1.5:0;
  const armAnim=walking?Math.floor(Math.sin(tk*.22)*2)*1.8:0;
  const bodyW=10*s, headW=12*s, headH=10*s;
  const torsoTopW=bodyW+1.5*s, torsoBotW=bodyW;
  const armW=2.8*s, legW=bodyW/2-.8*s;
  const legGap=1.2*s;

  // Direction
  const dir=a.dir||'se';
  const facingBack=(dir==='ne'||dir==='nw');
  const mirrorX=(dir==='sw'||dir==='nw')?-1:1;

  // Action animation offsets
  let waveArm=false,danceOff=0,danceBob=0,danceRot=0;
  if(a.actionAnim){
    const af=a.actionAnim.frame;
    if(a.actionAnim.type==='wave') waveArm=true;
    if(a.actionAnim.type==='dance'){
      danceOff=Math.sin(af*.18)*3.5*s;
      danceBob=Math.abs(Math.sin(af*.36))*2*s;
      danceRot=Math.sin(af*.18)*.06;
    }
  }

  // Shadow
  X.fillStyle='rgba(0,0,0,0.25)';
  X.beginPath();X.ellipse(sc.x+danceOff,bY+1*s,7*s,3*s,0,0,Math.PI*2);X.fill();

  const cx2=sc.x+danceOff;
  const bYd=bY-danceBob; // apply dance bob to all body parts

  // === HABBO SPRITE (replaces procedural body when available) ===
  let headY=bYd-36*s; // default head pos for tags
  let _habboOk=false;
  if(useHabboAvatars && !isPreview && isHabboReady()){
    const _hs=getHabboSprite(a,dir,a.state,a.actionAnim);
    if(_hs){
      const _sprH=38*z; // larger avatar for visibility
      const _sprW=_sprH*(_hs.img.naturalWidth/_hs.img.naturalHeight);
      X.save();
      if(_hs.mirror){
        X.translate(cx2,0);X.scale(-1,1);X.translate(-cx2,0);
      }
      // Sitting offset
      const _sitOff=0;
      // High quality smoothing for Habbo avatar sprites
      X.imageSmoothingEnabled=true;
      X.imageSmoothingQuality='high';
      X.drawImage(_hs.img,cx2-_sprW/2,bYd-_sprH+4*z+_sitOff,_sprW,_sprH);
      X.restore();
      _habboOk=true;
      headY=bYd-_sprH*0.75; // labels just above habbo head
    }
  }

  if(!_habboOk){
  // === SHOES ===
  const shoeW=legW+2.5*s, shoeH=3*s;
  partShoe(cx2-bodyW/2+legGap/2-.5*s, bYd-shoeH+legAnim*.25*s, shoeW, shoeH, a.shoeColor);
  partShoe(cx2+bodyW/2-shoeW-legGap/2+.5*s, bYd-shoeH-legAnim*.25*s, shoeW, shoeH, a.shoeColor);

  // === LEGS ===
  partRnd(cx2-bodyW/2+legGap/2, bYd-10*s+legAnim*.4*s, legW, 8*s, a.pantsColor);
  partRnd(cx2+bodyW/2-legW-legGap/2, bYd-10*s-legAnim*.4*s, legW, 8*s, a.pantsColor);

  // === TORSO ===
  const torsoY=bYd-22*s;
  const torsoH=12*s;
  partTrap(cx2, torsoY, torsoTopW, torsoBotW, torsoH, a.shirtColor);

  // Horizontal collar line (Habbo style)
  X.strokeStyle=lgt(a.shirtColor,30);X.lineWidth=.7*s;
  X.beginPath();X.moveTo(cx2-3*s,torsoY+.8*s);X.lineTo(cx2+3*s,torsoY+.8*s);X.stroke();
  X.strokeStyle=OL;X.lineWidth=.3;
  X.beginPath();X.moveTo(cx2-3*s,torsoY+.8*s);X.lineTo(cx2+3*s,torsoY+.8*s);X.stroke();

  // Belt
  const beltY2=bY-10.5*s, beltW=torsoBotW+1*s;
  X.fillStyle='#1a1a1a';X.fillRect(cx2-beltW/2,beltY2,beltW,1.4*s);
  X.fillStyle='#c9a93e';X.fillRect(cx2-1*s,beltY2-.1*s,2*s,1.6*s);
  X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(cx2-beltW/2,beltY2,beltW,1.4*s);

  // === ARMS ===
  const armLX=cx2-torsoTopW/2+.5*s, armRX=cx2+torsoTopW/2-armW-.5*s;
  if(waveArm){
    // Left arm waves up and down (animated salute)
    const waveOff=Math.sin((a.actionAnim?a.actionAnim.frame:0)*.15)*3*s;
    partRnd(armLX-armW, torsoY-6*s+waveOff, armW, 3.5*s, a.shirtColor);
    partRnd(armLX-armW, torsoY-10*s+waveOff, armW, 4.5*s, a.skinColor);
    // Right arm normal
    partRnd(armRX+armW, torsoY+1.5*s, armW, 3.5*s, a.shirtColor);
    partRnd(armRX+armW, torsoY+5*s, armW, 5.5*s, a.skinColor);
  } else if(a.state==='standing'&&a.status==='working'&&!isPreview){
    const ta=Math.sin(tk*.35+(apos.x||0))*1;
    partRnd(armLX-armW, torsoY+1.5*s+ta*s, armW, 3.5*s, a.shirtColor);
    partRnd(armLX-armW, torsoY+5*s+ta*s, armW, 5*s, a.skinColor);
    partRnd(armRX+armW, torsoY+1.5*s-ta*s, armW, 3.5*s, a.shirtColor);
    partRnd(armRX+armW, torsoY+5*s-ta*s, armW, 5*s, a.skinColor);
  } else {
    partRnd(armLX-armW, torsoY+1.5*s-armAnim*.25*s, armW, 3.5*s, a.shirtColor);
    partRnd(armRX+armW, torsoY+1.5*s+armAnim*.25*s, armW, 3.5*s, a.shirtColor);
    partRnd(armLX-armW, torsoY+5*s-armAnim*.25*s, armW, 5.5*s, a.skinColor);
    partRnd(armRX+armW, torsoY+5*s+armAnim*.25*s, armW, 5.5*s, a.skinColor);
  }

  // === NECK ===
  X.fillStyle=a.skinColor;X.fillRect(cx2-1.8*s,torsoY-1.8*s,3.6*s,2.2*s);
  X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(cx2-1.8*s,torsoY-1.8*s,3.6*s,2.2*s);

  // === HEAD (blocky-rounded Habbo style) ===
  headY=torsoY-2*s-headH;
  const hcx=cx2, hcy=headY+headH/2;
  // Use rounded rect for Habbo-style blocky head
  const hg=X.createLinearGradient(hcx-headW/2,hcy,hcx+headW/2,hcy);
  hg.addColorStop(0,drk(a.skinColor,22));hg.addColorStop(0.4,lgt(a.skinColor,20));hg.addColorStop(1,drk(a.skinColor,18));
  X.fillStyle=hg;
  rr(X,hcx-headW/2,headY,headW,headH,3*s);X.fill();
  X.strokeStyle=OL;X.lineWidth=0.8;
  rr(X,hcx-headW/2,headY,headW,headH,3*s);X.stroke();

  // Ear
  const earSide=mirrorX;
  X.fillStyle=drk(a.skinColor,8);
  X.beginPath();X.ellipse(hcx+earSide*(headW/2-1*s), hcy+.5*s, 1.4*s, 2*s, 0, 0, Math.PI*2);X.fill();
  X.strokeStyle=OL;X.lineWidth=.35;X.stroke();

  // === HAIR ===
  X.lineCap='butt';
  const hc=a.hairColor;
  drawHair(a,hcx,hcy,headY,headW,headH,s,hc,facingBack);

  // === FACE (only if facing forward) ===
  if(!facingBack){
    const eyeY=hcy-1*s;
    const bl=tk%160<4&&!isPreview;
    // Eye whites
    X.fillStyle='#fff';
    X.beginPath();X.ellipse(hcx-3*s*mirrorX, eyeY, 1.8*s, 1.5*s, 0, 0, Math.PI*2);X.fill();
    X.beginPath();X.ellipse(hcx+3*s*mirrorX, eyeY, 1.8*s, 1.5*s, 0, 0, Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.3;
    X.beginPath();X.ellipse(hcx-3*s*mirrorX, eyeY, 1.8*s, 1.5*s, 0, 0, Math.PI*2);X.stroke();
    X.beginPath();X.ellipse(hcx+3*s*mirrorX, eyeY, 1.8*s, 1.5*s, 0, 0, Math.PI*2);X.stroke();
    if(!bl){
      X.fillStyle='#1a1a2e';
      X.beginPath();X.ellipse(hcx-2.8*s*mirrorX, eyeY+.1*s, 1.1*s, 1.2*s, 0, 0, Math.PI*2);X.fill();
      X.beginPath();X.ellipse(hcx+3.2*s*mirrorX, eyeY+.1*s, 1.1*s, 1.2*s, 0, 0, Math.PI*2);X.fill();
      X.fillStyle='rgba(255,255,255,0.9)';
      X.beginPath();X.arc(hcx-3.3*s*mirrorX, eyeY-.5*s, .5*s, 0, Math.PI*2);X.fill();
      X.beginPath();X.arc(hcx+2.7*s*mirrorX, eyeY-.5*s, .5*s, 0, Math.PI*2);X.fill();
    } else {
      X.strokeStyle=OL;X.lineWidth=.6*s;
      X.beginPath();X.moveTo(hcx-4.5*s,eyeY);X.lineTo(hcx-1.5*s,eyeY);X.stroke();
      X.beginPath();X.moveTo(hcx+1.5*s,eyeY);X.lineTo(hcx+4.5*s,eyeY);X.stroke();
    }
    // Eyebrows
    X.save();
    X.strokeStyle=drk(a.hairColor,8);X.lineWidth=.55*s;X.lineCap='round';
    X.beginPath();X.moveTo(hcx-4.5*s,eyeY-2.2*s);X.quadraticCurveTo(hcx-3*s,eyeY-3*s,hcx-1.5*s,eyeY-2*s);X.stroke();
    X.beginPath();X.moveTo(hcx+1.5*s,eyeY-2*s);X.quadraticCurveTo(hcx+3*s,eyeY-3*s,hcx+4.5*s,eyeY-2.2*s);X.stroke();
    X.restore();
    // Nose
    X.fillStyle=drk(a.skinColor,15);
    X.beginPath();X.arc(hcx, eyeY+2.5*s, .55*s, 0, Math.PI);X.fill();
    // Mouth
    X.save();
    X.strokeStyle=drk(a.skinColor,30);X.lineWidth=.55*s;X.lineCap='round';
    X.beginPath();X.moveTo(hcx-1.5*s, eyeY+4*s);X.quadraticCurveTo(hcx, eyeY+5*s, hcx+1.5*s, eyeY+4*s);X.stroke();
    X.restore();
    // Blush
    X.fillStyle='rgba(255,120,120,0.1)';
    X.beginPath();X.ellipse(hcx-4*s, eyeY+2.5*s, 1.8*s, 1*s, 0, 0, Math.PI*2);X.fill();
    X.beginPath();X.ellipse(hcx+4*s, eyeY+2.5*s, 1.8*s, 1*s, 0, 0, Math.PI*2);X.fill();

    // === ACCESSORY ===
    drawAccessory(a,hcx,hcy,headY,headW,headH,s,cx2,torsoY,torsoTopW,eyeY);
  } else {
    // Back view accessories that show from behind
    if(a.accessory==='headphones'){
      X.strokeStyle='#555';X.lineWidth=1.2*s;
      X.beginPath();X.arc(hcx, headY+headH*.35, headW/2+1.5*s, Math.PI+.35, -.35);X.stroke();
      partOval(hcx-headW/2-1.5*s, hcy+.5*s, 2*s, 3*s, '#3a3a3a');
      partOval(hcx+headW/2+1.5*s, hcy+.5*s, 2*s, 3*s, '#3a3a3a');
    } else if(a.accessory==='cap'){
      X.fillStyle=drk(a.shirtColor,10);
      rr(X,hcx-headW/2-1*s,headY-1*s,headW+2*s,4*s,2*s);X.fill();
      X.strokeStyle=OL;X.lineWidth=.4;
      rr(X,hcx-headW/2-1*s,headY-1*s,headW+2*s,4*s,2*s);X.stroke();
    }
  }

  } // end if(!_habboOk) — procedural body fallback

  // === LEVEL UP EFFECT ===
  if(a.levelUpEffect&&a.levelUpEffect>0&&!isPreview){
    const ef=a.levelUpEffect;
    for(let p=0;p<8;p++){
      const ang=(Math.PI*2/8)*p+tk*.08;
      const rad=(60-ef)*.3*s;
      const px=cx2+Math.cos(ang)*rad*3;
      const py=headY-2*s+Math.sin(ang)*rad*1.5;
      X.globalAlpha=(ef/60)*.8;
      X.fillStyle=p%2===0?'#ffaa00':'#ffdd44';
      X.beginPath();
      const starR=1.5*s;
      for(let i=0;i<5;i++){
        X.lineTo(px+Math.cos(Math.PI*2*i/5-Math.PI/2)*starR, py+Math.sin(Math.PI*2*i/5-Math.PI/2)*starR);
        X.lineTo(px+Math.cos(Math.PI*2*i/5-Math.PI/2+Math.PI/5)*starR*.4, py+Math.sin(Math.PI*2*i/5-Math.PI/2+Math.PI/5)*starR*.4);
      }
      X.closePath();X.fill();
    }
    X.globalAlpha=1;
  }

  // === CHAT BUBBLE ===
  if(a.chatBubble&&a.chatBubble.timer>0&&!isPreview){
    const bubText=a.chatBubble.text;
    X.font=`${3.5*s}px Inter`;
    const tw2=X.measureText(bubText).width;
    const bw=tw2+8*s, bh=7*s;
    const bx=cx2-bw/2, by2=headY-14*s;
    // Bubble
    X.fillStyle='rgba(255,255,255,0.95)';
    rr(X,bx,by2,bw,bh,2.5*s);X.fill();
    X.strokeStyle='#aaa';X.lineWidth=.5;
    rr(X,bx,by2,bw,bh,2.5*s);X.stroke();
    // Triangle
    X.fillStyle='rgba(255,255,255,0.95)';
    X.beginPath();X.moveTo(cx2-2*s,by2+bh);X.lineTo(cx2,by2+bh+3*s);X.lineTo(cx2+2*s,by2+bh);X.closePath();X.fill();
    X.strokeStyle='#aaa';X.lineWidth=.5;
    X.beginPath();X.moveTo(cx2-2*s,by2+bh);X.lineTo(cx2,by2+bh+3*s);X.lineTo(cx2+2*s,by2+bh);X.stroke();
    // Text
    X.fillStyle='#1a1a2e';X.textAlign='center';
    X.fillText(bubText,cx2,by2+bh-2.2*s);
    X.textAlign='left';
  }

  // === ACTION EMOJI (floating above head during animation) ===
  if(!isPreview && a.actionAnim){
    const af=a.actionAnim.frame;
    const emojiY=headY-12*s-Math.sin(af*.1)*3*s;
    const emoji=a.actionAnim.type==='wave'?'👋':a.actionAnim.type==='dance'?'💃':'';
    if(emoji){
      X.font=`${8*s}px sans-serif`;X.textAlign='center';
      X.globalAlpha=af<10?af/10:af>a.actionAnim.maxFrames-15?(a.actionAnim.maxFrames-af)/15:1;
      X.fillText(emoji,cx2,emojiY);
      X.globalAlpha=1;
    }
  }

  // === STATUS BUBBLE ===
  if(!isPreview){
    const bubY=headY-9*s-(a.chatBubble&&a.chatBubble.timer>0?14*s:0);
    if(a.status==='thinking'){
      X.fillStyle='rgba(0,0,0,0.82)';rr(X,cx2-6*s,bubY,12*s,6*s,2*s);X.fill();
      X.strokeStyle='#ffaa0044';X.lineWidth=.5;rr(X,cx2-6*s,bubY,12*s,6*s,2*s);X.stroke();
      X.fillStyle='#ffaa00';
      for(let j=0;j<3;j++){X.globalAlpha=Math.sin(tk*.12+j*1.1)*.5+.5;X.beginPath();X.arc(cx2+(j-1)*3*s,bubY+3*s,1.2*s,0,Math.PI*2);X.fill()}
      X.globalAlpha=1;
    }
    // ── Agent label: unified status + level pill ──
    if(!isPreview){
      // Status colors
      var _stLabel='',_stBg='',_stDot='';
      if(a.status==='idle'){_stLabel='IDLE';_stBg='#cc2222';_stDot='#ff4444';}
      else if(a.status==='working'){_stLabel='WORKING';_stBg='#00884a';_stDot='#00ff88';}
      else if(a.status==='thinking'){_stLabel='THINKING';_stBg='#cc8800';_stDot='#ffcc00';}
      else if(a.status==='reading'){_stLabel='READING';_stBg='#0066cc';_stDot='#44aaff';}

      // Status pill above head — shifts up when chat bubble is visible
      if(_stLabel){
        X.font=2.8*s+'px Inter';
        var _tw=X.measureText(_stLabel).width;
        var _pillW=_tw+8*s, _pillH=3.5*s;
        var _chatUp=(a.chatBubble&&a.chatBubble.timer>0)?14*s:0;
        var _pillY=headY-12*s-_chatUp;
        X.fillStyle=_stBg;
        rr(X,cx2-_pillW/2,_pillY,_pillW,_pillH,_pillH/2);X.fill();
        // Colored dot indicator
        var _dotColor=SC[a.status]||'#444';
        X.fillStyle=_dotColor;
        X.beginPath();X.arc(cx2-_pillW/2+3*s,_pillY+_pillH/2,1.2*s,0,Math.PI*2);X.fill();
        X.textAlign='center';X.fillStyle='#fff';
        X.fillText(_stLabel,cx2+1*s,_pillY+_pillH-1*s);
      }
    }
    // Hover highlight (circle only, no name tooltip)
    if(hov===a){
      X.strokeStyle=a.color+'88';X.lineWidth=2;X.beginPath();X.ellipse(cx2,bY+2*s,10*s,5*s,0,0,Math.PI*2);X.stroke();
    }
    a._sx=cx2;a._sy=sc.y-10*s;a._z=s;
  }

  if(isPreview) X=savedX;
}

function drawHair(a,hcx,hcy,headY,headW,headH,s,hc,facingBack){
  if(facingBack){
    // Back of head — larger hair covering
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    // Cover most of head
    rr(X,hcx-headW/2-.5*s,headY-.5*s,headW+1*s,headH*.75,3*s);X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;
    rr(X,hcx-headW/2-.5*s,headY-.5*s,headW+1*s,headH*.75,3*s);X.stroke();
    if(a.hairStyle==='ponytail'){
      X.fillStyle=hc;
      X.beginPath();
      X.moveTo(hcx,headY+3*s);
      X.quadraticCurveTo(hcx-3*s,headY+8*s,hcx-1*s,headY+14*s);
      X.lineTo(hcx+1*s,headY+14*s);
      X.quadraticCurveTo(hcx+3*s,headY+8*s,hcx,headY+3*s);
      X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.4;X.stroke();
      X.fillStyle='#ff4444';
      X.beginPath();X.ellipse(hcx, headY+4*s, 1.2*s, 1.4*s, 0, 0, Math.PI*2);X.fill();
      X.strokeStyle=OL;X.lineWidth=.3;X.stroke();
    } else if(a.hairStyle==='bun'){
      X.fillStyle=hc;
      X.beginPath();X.ellipse(hcx,headY-1*s,3*s,3*s,0,0,Math.PI*2);X.fill();
      X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    } else if(a.hairStyle==='long'){
      X.fillStyle=hc;
      X.beginPath();X.moveTo(hcx-headW/2-1*s,headY+2*s);
      X.quadraticCurveTo(hcx-headW/2-2*s,hcy+3*s,hcx-headW/2-.5*s,hcy+10*s);
      X.lineTo(hcx-headW/2+1.5*s,hcy+10*s);
      X.quadraticCurveTo(hcx-headW/2+.5*s,hcy+3*s,hcx-headW/2+.5*s,headY+2*s);
      X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
      X.fillStyle=drk(hc,8);
      X.beginPath();X.moveTo(hcx+headW/2+1*s,headY+2*s);
      X.quadraticCurveTo(hcx+headW/2+2*s,hcy+3*s,hcx+headW/2+.5*s,hcy+10*s);
      X.lineTo(hcx+headW/2-1.5*s,hcy+10*s);
      X.quadraticCurveTo(hcx+headW/2-.5*s,hcy+3*s,hcx+headW/2-.5*s,headY+2*s);
      X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
    }
    return;
  }
  // Forward-facing hair styles
  if(a.hairStyle==='short'){
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();X.ellipse(hcx, headY+1.5*s, headW/2+.8*s, headH*.3, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    X.fillStyle=drk(hc,12);
    X.beginPath();X.ellipse(hcx-headW/2+.8*s, hcy-1.5*s, 1.5*s, 2.5*s, .2, 0, Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
  } else if(a.hairStyle==='afro'){
    const ag=X.createRadialGradient(hcx-1.5*s,hcy-2*s,2*s,hcx,hcy,headW/2+3*s);
    ag.addColorStop(0,lgt(hc,18));ag.addColorStop(1,drk(hc,12));
    X.fillStyle=ag;
    X.beginPath();X.ellipse(hcx, hcy-1*s, headW/2+3*s, headH/2+3*s, 0, 0, Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.7;X.stroke();
    X.fillStyle=lgt(hc,20)+'44';
    const curls=[[0,-5],[3,-3],[-3,-3],[4,0],[-4,0],[2,2],[-2,3]];
    curls.forEach(([cx3,cy3])=>{X.beginPath();X.arc(hcx+cx3*s,hcy+cy3*s,1.2*s,0,Math.PI*2);X.fill()});
  } else if(a.hairStyle==='ponytail'){
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();X.ellipse(hcx, headY+1.5*s, headW/2+.5*s, headH*.28, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    X.fillStyle=hc;
    X.beginPath();
    X.moveTo(hcx+headW/2-1*s, headY+2*s);
    X.quadraticCurveTo(hcx+headW/2+4*s, headY+6*s, hcx+headW/2+2*s, headY+14*s);
    X.quadraticCurveTo(hcx+headW/2+.5*s, headY+13*s, hcx+headW/2-1*s, headY+5*s);
    X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.4;X.stroke();
    X.fillStyle='#ff4444';
    X.beginPath();X.ellipse(hcx+headW/2, headY+3.5*s, 1.2*s, 1.4*s, .3, 0, Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.3;X.stroke();
  } else if(a.hairStyle==='long'){
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();X.ellipse(hcx, headY+1.5*s, headW/2+1.2*s, headH*.32, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    X.fillStyle=hc;
    X.beginPath();X.moveTo(hcx-headW/2-1*s,headY+2*s);
    X.quadraticCurveTo(hcx-headW/2-2*s,hcy+3*s,hcx-headW/2-.5*s,hcy+10*s);
    X.lineTo(hcx-headW/2+1.5*s,hcy+10*s);
    X.quadraticCurveTo(hcx-headW/2+.5*s,hcy+3*s,hcx-headW/2+.5*s,headY+2*s);
    X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
    X.fillStyle=drk(hc,8);
    X.beginPath();X.moveTo(hcx+headW/2+1*s,headY+2*s);
    X.quadraticCurveTo(hcx+headW/2+2*s,hcy+3*s,hcx+headW/2+.5*s,hcy+10*s);
    X.lineTo(hcx+headW/2-1.5*s,hcy+10*s);
    X.quadraticCurveTo(hcx+headW/2-.5*s,hcy+3*s,hcx+headW/2-.5*s,headY+2*s);
    X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
  } else if(a.hairStyle==='mohawk'){
    const hg=X.createLinearGradient(hcx-2*s,headY-4*s,hcx+2*s,headY-4*s);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.5,lgt(hc,18));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();
    X.moveTo(hcx-2*s,headY+2*s);X.lineTo(hcx-2.5*s,headY-3*s);
    X.quadraticCurveTo(hcx,headY-6*s,hcx+2.5*s,headY-3*s);
    X.lineTo(hcx+2*s,headY+2*s);
    X.closePath();X.fill();X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
  } else if(a.hairStyle==='curly'){
    const ag=X.createRadialGradient(hcx,hcy-2*s,2*s,hcx,hcy,headW/2+1.5*s);
    ag.addColorStop(0,lgt(hc,15));ag.addColorStop(1,drk(hc,10));
    X.fillStyle=ag;
    X.beginPath();X.ellipse(hcx, headY+1*s, headW/2+1.5*s, headH*.38, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    // Curly loops
    X.fillStyle=lgt(hc,15)+'66';
    for(let i=0;i<6;i++){
      const cx3=hcx+(i-2.5)*2.2*s;
      const cy3=headY+.5*s+Math.sin(i*1.3)*.8*s;
      X.beginPath();X.arc(cx3,cy3,1.5*s,0,Math.PI*2);X.fill();
    }
  } else if(a.hairStyle==='bun'){
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();X.ellipse(hcx, headY+1.5*s, headW/2+.3*s, headH*.25, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    // Bun on top
    X.fillStyle=hc;
    X.beginPath();X.ellipse(hcx, headY-2*s, 3*s, 3*s, 0, 0, Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    X.fillStyle=lgt(hc,20);
    X.beginPath();X.arc(hcx-.8*s,headY-3*s,1*s,0,Math.PI*2);X.fill();
  } else { // neat
    const hg=X.createLinearGradient(hcx-headW/2,headY,hcx+headW/2,headY);
    hg.addColorStop(0,drk(hc,18));hg.addColorStop(.4,lgt(hc,12));hg.addColorStop(1,drk(hc,12));
    X.fillStyle=hg;
    X.beginPath();X.ellipse(hcx, headY+1.5*s, headW/2+.3*s, headH*.28, 0, Math.PI, 0);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
    X.strokeStyle=drk(hc,15);X.lineWidth=.4*s;
    X.beginPath();X.moveTo(hcx-2*s,headY+.5*s);X.quadraticCurveTo(hcx-.5*s,headY+1.5*s,hcx+1*s,headY+3*s);X.stroke();
  }
}

function drawAccessory(a,hcx,hcy,headY,headW,headH,s,cx2,torsoY,torsoTopW,eyeY){
  if(a.accessory==='glasses'){
    X.strokeStyle='#4488cc';X.lineWidth=.55*s;
    X.beginPath();X.ellipse(hcx-3*s, eyeY, 2.2*s, 1.8*s, 0, 0, Math.PI*2);X.stroke();
    X.beginPath();X.ellipse(hcx+3*s, eyeY, 2.2*s, 1.8*s, 0, 0, Math.PI*2);X.stroke();
    X.beginPath();X.moveTo(hcx-.8*s,eyeY);X.lineTo(hcx+.8*s,eyeY);X.stroke();
    X.beginPath();X.moveTo(hcx-5.2*s,eyeY-.3*s);X.lineTo(hcx-headW/2+.5*s,eyeY-.8*s);X.stroke();
    X.beginPath();X.moveTo(hcx+5.2*s,eyeY-.3*s);X.lineTo(hcx+headW/2-.5*s,eyeY-.8*s);X.stroke();
  } else if(a.accessory==='headphones'){
    X.strokeStyle='#555';X.lineWidth=1.2*s;
    X.beginPath();X.arc(hcx, headY+headH*.35, headW/2+1.5*s, Math.PI+.35, -.35);X.stroke();
    partOval(hcx-headW/2-1.5*s, hcy+.5*s, 2*s, 3*s, '#3a3a3a');
    partOval(hcx+headW/2+1.5*s, hcy+.5*s, 2*s, 3*s, '#3a3a3a');
    X.fillStyle='#00aaff22';X.beginPath();X.ellipse(hcx-headW/2-1.5*s,hcy+.5*s,1.2*s,2*s,0,0,Math.PI*2);X.fill();
    X.fillStyle='#00aaff22';X.beginPath();X.ellipse(hcx+headW/2+1.5*s,hcy+.5*s,1.2*s,2*s,0,0,Math.PI*2);X.fill();
  } else if(a.accessory==='badge'){
    X.fillStyle='#ffaa00';
    const bx=hcx+3*s,by2=torsoY+3*s;
    X.beginPath();X.moveTo(bx,by2);X.lineTo(bx+1.5*s,by2+1*s);X.lineTo(bx+1.2*s,by2+2.5*s);X.lineTo(bx,by2+2*s);X.lineTo(bx-1.2*s,by2+2.5*s);X.lineTo(bx-1.5*s,by2+1*s);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
    X.fillStyle='#fff';X.beginPath();X.arc(bx,by2+1.3*s,.6*s,0,Math.PI*2);X.fill();
  } else if(a.accessory==='scarf'){
    X.fillStyle='#ff88cc';
    rr(X,cx2-torsoTopW/2-.5*s,torsoY-.8*s,torsoTopW+1*s,2.5*s,1*s);X.fill();
    X.strokeStyle=OL;X.lineWidth=.35;rr(X,cx2-torsoTopW/2-.5*s,torsoY-.8*s,torsoTopW+1*s,2.5*s,1*s);X.stroke();
    partRnd(cx2-2.5*s,torsoY+1.5*s,2*s,5*s,'#ee66aa');
  } else if(a.accessory==='tie'){
    X.fillStyle='#cc2222';
    X.beginPath();X.moveTo(hcx,torsoY+1.5*s);X.lineTo(hcx+1.3*s,torsoY+3.5*s);X.lineTo(hcx,torsoY+9*s);X.lineTo(hcx-1.3*s,torsoY+3.5*s);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.35;X.stroke();
    X.fillStyle='#ee3333';rr(X,hcx-1.2*s,torsoY+.3*s,2.4*s,1.6*s,.4*s);X.fill();
    X.strokeStyle=OL;X.lineWidth=.3;rr(X,hcx-1.2*s,torsoY+.3*s,2.4*s,1.6*s,.4*s);X.stroke();
  } else if(a.accessory==='cap'){
    X.fillStyle=drk(a.shirtColor,10);
    rr(X,hcx-headW/2-1*s,headY-1*s,headW+2*s,4*s,2*s);X.fill();
    X.strokeStyle=OL;X.lineWidth=.4;
    rr(X,hcx-headW/2-1*s,headY-1*s,headW+2*s,4*s,2*s);X.stroke();
    // Brim
    X.fillStyle=drk(a.shirtColor,20);
    X.beginPath();X.moveTo(hcx-headW/2-2*s,headY+2.5*s);X.lineTo(hcx+headW/2+2*s,headY+2.5*s);
    X.lineTo(hcx+headW/2+3*s,headY+4*s);X.lineTo(hcx-headW/2-1*s,headY+4*s);X.closePath();X.fill();
    X.strokeStyle=OL;X.lineWidth=.3;X.stroke();
  } else if(a.accessory==='earring'){
    X.fillStyle='#ffdd00';
    X.beginPath();X.arc(hcx+headW/2-.5*s,hcy+3*s,1*s,0,Math.PI*2);X.fill();
    X.strokeStyle=OL;X.lineWidth=.3;X.stroke();
    X.fillStyle='#ffee66';
    X.beginPath();X.arc(hcx+headW/2-.5*s,hcy+3*s,.4*s,0,Math.PI*2);X.fill();
  } else if(a.accessory==='watch'){
    X.fillStyle='#555';
    X.fillRect(cx2+torsoTopW/2+.5*s-1.5*s,torsoY+8*s,3*s,1.5*s);
    X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(cx2+torsoTopW/2+.5*s-1.5*s,torsoY+8*s,3*s,1.5*s);
    X.fillStyle='#00ff88';
    X.fillRect(cx2+torsoTopW/2+.5*s-1*s,torsoY+8.2*s,2*s,1*s);
  }
}

// Preview wrapper
function drawCharPreview(agent){
  const pcanvas=document.getElementById('app-preview');
  const pctx=pcanvas.getContext('2d');
  const pw=160,ph=260,pzm=2.2;
  pctx.clearRect(0,0,pw,ph);
  const bg=pctx.createLinearGradient(0,0,0,ph);bg.addColorStop(0,'#0d0d1a');bg.addColorStop(1,'#080810');pctx.fillStyle=bg;pctx.fillRect(0,0,pw,ph);
  const pcy2=(ph*.72-ph/2)/pzm;
  drawChar(agent, pctx, pzm, {x:0,y:0}, pw, ph, 0, pcy2);
}

// ====== AGENTS DATA ======
// =============================================
// AGENTS DATA
// =============================================
const SC={working:'#00ff88',thinking:'#ffaa00',reading:'#00aaff',idle:'#444'};
const RC={common:'#aaa',uncommon:'#00ff88',rare:'#00aaff',epic:'#aa44ff',legendary:'#ffaa00'};
const SA={working:['Writing tests','Refactoring','Pushing branch','Compiling','Reviewing PR','Deploying','Building component'],thinking:['Analyzing arch','Planning sprint','Evaluating','Reviewing reqs'],reading:['Reading docs','Scanning code','Checking logs','Reading config'],idle:['Coffee break','Stretching...','Messages','Waiting build']};

const CHAT_MSGS=['Pushing to main...','LGTM!','Need coffee','Fixed the bug!','Code review?','In a meeting...','Ship it!','Writing tests...','Hmm...','Almost done!','Deploying...','Listo!','PR merged','Checking logs','brb','On it!'];

const TASK_POOL=[{name:'Fixing bug',detail:'main.ts:42',progress:0},{name:'Code review',detail:'PR #238',progress:0},{name:'Writing tests',detail:'coverage 78%',progress:0},{name:'Deploying',detail:'v2.1.0',progress:0},{name:'Refactoring',detail:'auth module',progress:0}];

// Default agents (fallback when agents.json is not available)
const DEFAULT_AGENTS=[
{id:'debugger',figureCode:'hd-180-1.hr-828-61.ch-215-82.lg-270-82.sh-300-91.he-1610-62',name:'Debugger',emoji:'🔧',class:'Bug Hunter · Guerrero',color:'#ff4444',skinColor:'#e8b88a',hairColor:'#2a1a0a',shirtColor:'#cc2222',pantsColor:'#1a1a3a',shoeColor:'#222222',hairStyle:'short',accessory:'glasses',level:42,xp:7800,xpMax:10000,status:'working',statusText:'Fixing null pointer',dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0,
currentTask:{name:'Resolver crash auth',detail:'auth.ts:142',progress:68},
stats:{STR:{val:88,label:'Precision',color:'#ff4444'},DEX:{val:72,label:'Velocidad',color:'#ffaa00'},INT:{val:95,label:'Analisis',color:'#00aaff'},WIS:{val:65,label:'Paciencia',color:'#aa44ff'},CON:{val:80,label:'Resistencia',color:'#00ff88'},CHA:{val:40,label:'Comunicacion',color:'#ff66ff'}},
skills:[{cat:'Combate',items:[{name:'Stack Trace',icon:'🔍',desc:'Analizar traces',lvl:5,max:5,color:'#ff4444'},{name:'Breakpoint',icon:'⏸️',desc:'Breakpoints',lvl:4,max:5,color:'#ff4444'},{name:'Mem Leak Hunt',icon:'💧',desc:'Memory leaks',lvl:4,max:5,color:'#44aaff'}]},{cat:'Soporte',items:[{name:'Log Forensics',icon:'📜',desc:'Desde logs',lvl:5,max:5,color:'#00aaff'},{name:'Root Cause',icon:'🌳',desc:'Causa raiz',lvl:5,max:5,color:'#00ff88'}]}],
equipment:[{slot:'Arma',icon:'⚔️',name:'Console.log',desc:'+50% visibility',rarity:'legendary'},{slot:'Armadura',icon:'🛡️',name:'Try-Catch',desc:'Absorbe exc',rarity:'epic'},{slot:'Casco',icon:'🎩',name:'Linter Crown',desc:'+30 detect',rarity:'rare'},{slot:'Reliquia',icon:'📿',name:'Rubber Duck',desc:'Debug divino',rarity:'legendary'}],
log:[{time:'14:32',text:'Null pointer fix auth.ts',type:'s'},{time:'14:15',text:'Stack trace analysis',type:'i'},{time:'13:58',text:'Mem leak fix',type:'s'}],
deskTile:{x:2,y:2},pos:{x:2,y:2},targetPos:null,frame:0,state:'standing',stateTimer:0},

{id:'frontend',figureCode:'hd-180-14.hr-170-37.ch-3474-110-1408.lg-275-110.sh-305-80',name:'Frontend Dev',emoji:'🎨',class:'Pixel Mage · Mago',color:'#00aaff',skinColor:'#c68642',hairColor:'#1a1a2e',shirtColor:'#0088cc',pantsColor:'#2a2a4a',shoeColor:'#333333',hairStyle:'afro',accessory:'headphones',level:38,xp:5200,xpMax:8000,status:'working',statusText:'Building dashboard',dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0,
currentTask:{name:'Dashboard stats',detail:'React + Recharts',progress:45},
stats:{STR:{val:45,label:'Precision',color:'#ff4444'},DEX:{val:90,label:'Velocidad',color:'#ffaa00'},INT:{val:85,label:'Analisis',color:'#00aaff'},WIS:{val:70,label:'Paciencia',color:'#aa44ff'},CON:{val:55,label:'Resistencia',color:'#00ff88'},CHA:{val:92,label:'Comunicacion',color:'#ff66ff'}},
skills:[{cat:'Arcano',items:[{name:'React Mastery',icon:'⚛️',desc:'Hooks, Context',lvl:5,max:5,color:'#00aaff'},{name:'CSS Sorcery',icon:'🎭',desc:'Grid layouts',lvl:5,max:5,color:'#00aaff'},{name:'Animation',icon:'✨',desc:'Framer Motion',lvl:4,max:5,color:'#aa44ff'}]},{cat:'Invocacion',items:[{name:'Components',icon:'🧩',desc:'Reusables',lvl:5,max:5,color:'#00ff88'},{name:'State Mgmt',icon:'🔮',desc:'Zustand/Redux',lvl:4,max:5,color:'#aa44ff'}]}],
equipment:[{slot:'Arma',icon:'🪄',name:'Tailwind Wand',desc:'+40% styles',rarity:'epic'},{slot:'Armadura',icon:'🧥',name:'Next.js Robe',desc:'SSR protect',rarity:'rare'},{slot:'Casco',icon:'👑',name:'Figma Helm',desc:'Pixel-perfect',rarity:'epic'},{slot:'Reliquia',icon:'🏺',name:'Design System',desc:'+100% consist',rarity:'legendary'}],
log:[{time:'14:30',text:'Recharts chart OK',type:'s'},{time:'14:20',text:'Responsive fix',type:'i'},{time:'13:50',text:'Dark mode done',type:'s'}],
deskTile:{x:4,y:2},pos:{x:4,y:2},targetPos:null,frame:0,state:'standing',stateTimer:0},

{id:'tester',figureCode:'hd-600-3.hr-515-31.ch-635-80.lg-700-72.sh-730-64',name:'Test Engineer',emoji:'🧪',class:'Quality Guard · Paladin',color:'#ffaa00',skinColor:'#f5d0a9',hairColor:'#8b4513',shirtColor:'#cc8800',pantsColor:'#2a2a3a',shoeColor:'#4a3020',hairStyle:'ponytail',accessory:'badge',level:35,xp:6100,xpMax:9000,status:'thinking',statusText:'Reviewing coverage',dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0,
currentTask:{name:'Auditoria coverage',detail:'67% -> 85%',progress:32},
stats:{STR:{val:70,label:'Precision',color:'#ff4444'},DEX:{val:60,label:'Velocidad',color:'#ffaa00'},INT:{val:80,label:'Analisis',color:'#00aaff'},WIS:{val:95,label:'Paciencia',color:'#aa44ff'},CON:{val:90,label:'Resistencia',color:'#00ff88'},CHA:{val:50,label:'Comunicacion',color:'#ff66ff'}},
skills:[{cat:'Defensa',items:[{name:'Unit Shield',icon:'🛡️',desc:'Tests unitarios',lvl:5,max:5,color:'#ffaa00'},{name:'E2E Barrier',icon:'🏰',desc:'Tests E2E',lvl:4,max:5,color:'#ffaa00'},{name:'Regression',icon:'🔄',desc:'Anti regresion',lvl:4,max:5,color:'#ff4444'}]},{cat:'Bendicion',items:[{name:'CI/CD',icon:'🔧',desc:'GitHub Actions',lvl:4,max:5,color:'#00ff88'},{name:'Coverage',icon:'📊',desc:'Analisis deep',lvl:4,max:5,color:'#ffaa00'}]}],
equipment:[{slot:'Arma',icon:'⚔️',name:'Jest Blade',desc:'+35% speed',rarity:'rare'},{slot:'Armadura',icon:'🛡️',name:'Playwright',desc:'E2E full',rarity:'epic'},{slot:'Reliquia',icon:'📿',name:'TDD Grail',desc:'Red-Green',rarity:'legendary'}],
log:[{time:'14:25',text:'Coverage: 67%',type:'w'},{time:'14:10',text:'340/342 pass',type:'s'},{time:'13:30',text:'Regression login',type:'e'}],
deskTile:{x:2,y:4},pos:{x:2,y:4},targetPos:null,frame:0,state:'standing',stateTimer:0},

{id:'designer',figureCode:'hd-600-10.hr-545-33.ch-660-91.lg-710-66.sh-735-82',name:'UI/UX Designer',emoji:'✨',class:'Pixel Artisan · Bardo',color:'#ff66ff',skinColor:'#e8b88a',hairColor:'#cc6600',shirtColor:'#cc44cc',pantsColor:'#2a1a3a',shoeColor:'#8a4a8a',hairStyle:'long',accessory:'scarf',level:36,xp:4500,xpMax:7500,status:'reading',statusText:'Auditing a11y',dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0,
currentTask:{name:'WCAG 2.1 Audit',detail:'Contraste + SR',progress:55},
stats:{STR:{val:35,label:'Precision',color:'#ff4444'},DEX:{val:85,label:'Velocidad',color:'#ffaa00'},INT:{val:75,label:'Analisis',color:'#00aaff'},WIS:{val:80,label:'Paciencia',color:'#aa44ff'},CON:{val:50,label:'Resistencia',color:'#00ff88'},CHA:{val:98,label:'Comunicacion',color:'#ff66ff'}},
skills:[{cat:'Performance',items:[{name:'Color Theory',icon:'🌈',desc:'Paletas',lvl:5,max:5,color:'#ff66ff'},{name:'Typography',icon:'🔤',desc:'Tipografias',lvl:5,max:5,color:'#ff66ff'},{name:'Layout Art',icon:'📐',desc:'Jerarquia',lvl:4,max:5,color:'#aa44ff'}]},{cat:'Inspiracion',items:[{name:'User Empathy',icon:'💝',desc:'Entender user',lvl:5,max:5,color:'#ff66ff'},{name:'A11y',icon:'♿',desc:'Accesibilidad',lvl:4,max:5,color:'#00ff88'}]}],
equipment:[{slot:'Arma',icon:'🖌️',name:'Figma Pro',desc:'+60% creative',rarity:'legendary'},{slot:'Armadura',icon:'🎨',name:'Design System',desc:'Consistencia',rarity:'epic'},{slot:'Reliquia',icon:'🏺',name:'Dieter Rams',desc:'10 principios',rarity:'legendary'}],
log:[{time:'14:28',text:'WCAG AA OK',type:'s'},{time:'14:15',text:'No focus state',type:'w'},{time:'14:00',text:'Onboarding redo',type:'s'}],
deskTile:{x:4,y:4},pos:{x:4,y:4},targetPos:null,frame:0,state:'standing',stateTimer:0},

{id:'pm',figureCode:'hd-195-14.hr-100-45.ch-255-64.lg-280-91.sh-300-91',name:'Project Manager',emoji:'📋',class:'Orchestrator · Lider',color:'#00ff88',skinColor:'#d4a574',hairColor:'#1a0a2e',shirtColor:'#118844',pantsColor:'#1a2a1a',shoeColor:'#2a2a2a',hairStyle:'neat',accessory:'tie',level:45,xp:9200,xpMax:12000,status:'working',statusText:'Coordinating sprint',dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0,
currentTask:{name:'Sprint #14',detail:'6 tasks · 2 blocked',progress:78},
stats:{STR:{val:60,label:'Precision',color:'#ff4444'},DEX:{val:75,label:'Velocidad',color:'#ffaa00'},INT:{val:90,label:'Analisis',color:'#00aaff'},WIS:{val:92,label:'Paciencia',color:'#aa44ff'},CON:{val:85,label:'Resistencia',color:'#00ff88'},CHA:{val:95,label:'Comunicacion',color:'#ff66ff'}},
skills:[{cat:'Liderazgo',items:[{name:'Delegation',icon:'📤',desc:'Asignar correcto',lvl:5,max:5,color:'#00ff88'},{name:'Priority',icon:'📊',desc:'P0-P3 matrix',lvl:5,max:5,color:'#00ff88'},{name:'Unblock',icon:'🚧',desc:'Desbloquear',lvl:4,max:5,color:'#ffaa00'}]},{cat:'Estrategia',items:[{name:'Reporting',icon:'📈',desc:'Status clear',lvl:5,max:5,color:'#00aaff'},{name:'Orchestration',icon:'🎼',desc:'Multi-agent',lvl:5,max:5,color:'#aa44ff'}]}],
equipment:[{slot:'Arma',icon:'📋',name:'Obsidian Board',desc:'+50% plan',rarity:'legendary'},{slot:'Armadura',icon:'🧥',name:'Agile Cloak',desc:'Scrum+Kanban',rarity:'epic'},{slot:'Reliquia',icon:'📿',name:'Gantt Ancient',desc:'Time vision',rarity:'legendary'}],
log:[{time:'14:35',text:'6 P1 tasks done',type:'s'},{time:'14:20',text:'Auth bug -> Debug',type:'i'},{time:'13:55',text:'12 story pts',type:'s'}],
deskTile:{x:6,y:3},pos:{x:6,y:3},targetPos:null,frame:0,state:'standing',stateTimer:0}
];

let AGENTS=DEFAULT_AGENTS.map(a=>Object.assign({},a));
// preloadHabbo() se llama cuando el usuario activa el modo Habbo

// Hydrate agent from JSON data (merges external data with runtime defaults)
function hydrateAgent(data){
  if(!data.currentTask) data.currentTask={name:"Sin tarea",detail:"—",progress:0};
  // If idle, don't default to sitting state
  if(data.status === 'idle' && !data.state) data.state = 'idle';
  return Object.assign({},{
    status:'working',statusText:'Working...',dir:'se',actionAnim:null,
    chatBubble:null,levelUpEffect:0,targetPos:null,frame:0,state:'standing',stateTimer:0,
    pos:data.deskTile?{x:data.deskTile.x,y:data.deskTile.y}:{x:3,y:3}
  },data);
}

function loadAgentsFromJSON(jsonData){
  try{
    const parsed=typeof jsonData==='string'?JSON.parse(jsonData):jsonData;
    if(!Array.isArray(parsed)||parsed.length===0)return false;
    AGENTS.length=0;
    parsed.forEach(d=>AGENTS.push(hydrateAgent(d)));
    loadAppearances();updCards();
    AGENTS.forEach(a=>{
      // En Live: resetear nivel y XP para que arranquen de cero
      if(!isTestWorld){
        a.level=1; a.xp=0; a.xpMax=1000;
        a.totalEarned=0; a.workTicks=0;
        a.configured=true; // agente real importado — puede auto-actuar
      }
      addLog(a);
    });
    preloadHabbo();
    if(!isTestWorld) saveUserState();
    updateImportPulse(); // quitar pulse
    return true;
  }catch(e){console.error('Failed to load agents:',e);return false}
}

// Try to fetch agents.json on startup
function tryLoadExternalAgents(){
  fetch('agents.json').then(r=>{
    if(!r.ok)throw new Error(r.status);
    return r.json();
  }).then(data=>{
    loadAgentsFromJSON(data);
    console.log('Loaded '+AGENTS.length+' agents from agents.json');
  }).catch(()=>{
    console.log('Using default built-in agents');
  });
}

function importAgentsFile(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='.json';
  inp.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      if(loadAgentsFromJSON(ev.target.result)){
        // Save to localStorage so it persists
        try{localStorage.setItem('agentsHotelAgents',ev.target.result)}catch(ex){}
      }
    };
    reader.readAsText(file);
  };
  inp.click();
}

// =============================================
// LOCALSTORAGE
// =============================================
function saveAppearances(){
  const data=AGENTS.map(a=>({id:a.id,skinColor:a.skinColor,hairColor:a.hairColor,shirtColor:a.shirtColor,pantsColor:a.pantsColor,shoeColor:a.shoeColor,hairStyle:a.hairStyle,accessory:a.accessory}));
  try{localStorage.setItem('agentsHotelAppearances',JSON.stringify(data))}catch(e){}
}
function loadAppearances(){
  try{
    const data=JSON.parse(localStorage.getItem('agentsHotelAppearances'));
    if(data)data.forEach(d=>{const a=AGENTS.find(x=>x.id===d.id);if(a)Object.assign(a,d)});
  }catch(e){}
}

// ====== APPEARANCE EDITOR ======
// =============================================
// APPEARANCE EDITOR
// =============================================
const AE_PALETTES={
  skin:['#FDDBB4','#F5C28B','#E8B88A','#D4956A','#C68642','#A0522D','#8B4513','#5C2E00','#3D1A00','#F5D0A9','#EAC086','#D4A574'],
  hair:['#0a0a0a','#2a1a0a','#4a2a0a','#8B4513','#A0522D','#cc6600','#D2691E','#8B0000','#800080','#1a1a2e','#003366','#004400','#FFD700','#FF4500','#888888','#cccccc'],
  shirt:['#cc2222','#0088cc','#cc8800','#cc44cc','#118844','#cc6633','#3344cc','#888822','#224488','#883388','#228888','#444444','#dddddd','#111111','#aa5522','#225522'],
  pants:['#1a1a3a','#2a2a4a','#3a2a1a','#2a1a3a','#1a2a1a','#2a2a2a','#4a3020','#1a3a3a','#3a1a1a','#222244','#333333','#111122','#445566','#332211','#223344','#334422'],
  shoes:['#222222','#333333','#4a3020','#8a4a8a','#2a2a2a','#5a3a1a','#1a1a1a','#663322','#224466','#333322','#aa8844','#664444','#446644','#444466','#886644','#668888']
};
const AE_HAIR_STYLES=['short','afro','ponytail','long','neat','mohawk','curly','bun'];
const AE_ACCESSORIES=['none','glasses','headphones','badge','scarf','tie','cap','earring','watch'];

// Habbo skin catalog — diverse looks
const HABBO_SKINS = [
  {name:'Office Pro',     fig:'hd-180-1.hr-828-61.ch-215-82.lg-270-82.sh-300-91.he-1610-62'},
  {name:'Creative Dev',   fig:'hd-180-14.hr-170-37.ch-3474-110-1408.lg-275-110.sh-305-80'},
  {name:'QA Engineer',    fig:'hd-600-3.hr-515-31.ch-635-80.lg-700-72.sh-730-64'},
  {name:'Designer',       fig:'hd-600-10.hr-545-33.ch-660-91.lg-710-66.sh-735-82'},
  {name:'Manager',        fig:'hd-195-14.hr-100-45.ch-255-64.lg-280-91.sh-300-91'},
  {name:'Rookie',         fig:'hd-180-1.hr-110-61.ch-255-82.lg-280-82.sh-300-91'},
  {name:'Hacker',         fig:'hd-190-1.hr-831-45.ch-220-82.lg-285-91.sh-295-64.he-1609-62'},
  {name:'Scientist',      fig:'hd-600-7.hr-515-37.ch-635-91.lg-700-64.sh-730-82.he-1601-62'},
  {name:'Casual',         fig:'hd-180-3.hr-893-45.ch-210-66.lg-270-82.sh-290-91'},
  {name:'Formal',         fig:'hd-180-1.hr-100-40.ch-255-91.lg-280-64.sh-300-80'},
  {name:'Sporty',         fig:'hd-190-14.hr-802-45.ch-225-82.lg-281-91.sh-305-64'},
  {name:'Punk',           fig:'hd-180-1.hr-891-61.ch-3474-82-1408.lg-3116-91.sh-906-80'},
  {name:'Summer',         fig:'hd-600-3.hr-545-37.ch-210-91.lg-270-66.sh-290-82'},
  {name:'Winter',         fig:'hd-180-7.hr-100-45.ch-215-64.lg-280-82.sh-300-91.he-1610-80'},
  {name:'Geek',           fig:'hd-190-1.hr-828-40.ch-255-82.lg-270-91.sh-300-64.he-1610-62'},
  {name:'Elegant',        fig:'hd-600-10.hr-515-33.ch-255-91.lg-280-64.sh-300-80'},
  {name:'Street',         fig:'hd-180-14.hr-893-61.ch-220-82.lg-285-91.sh-905-64'},
  {name:'CEO',            fig:'hd-195-1.hr-100-45.ch-255-64.lg-280-91.sh-300-80.he-1601-62'},
  {name:'Indie',          fig:'hd-180-3.hr-802-37.ch-3474-66-1408.lg-275-82.sh-290-91'},
  {name:'Retro',          fig:'hd-600-7.hr-891-31.ch-210-82.lg-270-64.sh-730-91'},
];
let _selectedSkin = null;

function openAppEditor(a){
  appEditorAgent=a;
  _selectedSkin = a.figureCode || HABBO_FIGURES[a.id] || HABBO_SKINS[0].fig;
  document.getElementById('ae-title').textContent='AVATAR — '+a.name.toUpperCase();
  renderSkinGrid();
  document.getElementById('app-editor').classList.add('open');
  appEditorOpen=true;
  hideAgentInfo();
}

function renderSkinGrid(){
  const grid=document.getElementById('ae-skin-grid');
  const BASE='https://www.habbo.com/habbo-imaging/avatarimage';
  grid.innerHTML=HABBO_SKINS.map((s,i)=>{
    const sel=s.fig===_selectedSkin;
    const url=BASE+'?figure='+s.fig+'&direction=2&action=std&size=l';
    return '<div onclick="pickSkin('+i+')" style="cursor:pointer;background:'+(sel?'rgba(0,255,136,0.1)':'rgba(255,255,255,0.02)')+';border:2px solid '+(sel?'#00ff88':'#1a1a2e')+';border-radius:10px;padding:8px;text-align:center;transition:all .15s">'+
      '<img src="'+url+'" style="width:50px;height:80px;object-fit:contain;image-rendering:pixelated" alt="'+s.name+'">'+
      '<div style="font-family:Inter,sans-serif;font-size:10px;color:'+(sel?'#00ff88':'#888')+';margin-top:4px;font-weight:'+(sel?'600':'400')+'">'+s.name+'</div>'+
    '</div>';
  }).join('');
}

function pickSkin(idx){
  _selectedSkin=HABBO_SKINS[idx].fig;
  renderSkinGrid();
}

function closeAppEditor(){
  document.getElementById('app-editor').classList.remove('open');
  appEditorOpen=false;appEditorAgent=null;
}

function saveHabboSkin(){
  if(!appEditorAgent||!_selectedSkin)return;
  appEditorAgent.figureCode=_selectedSkin;
  // Reload Habbo sprites for this agent
  const BASE='https://www.habbo.com/habbo-imaging/avatarimage';
  const dirs=[2,6];
  const acts=[{key:'std',q:'std'},{key:'wlk0',q:'wlk&frame=0'},{key:'wlk1',q:'wlk&frame=2'},{key:'wav',q:'wav&frame=0'}];
  HABBO_CACHE[appEditorAgent.id]={};
  dirs.forEach(d=>{acts.forEach(act=>{
    const img=new Image();
    img.src=BASE+'?figure='+_selectedSkin+'&direction='+d+'&action='+act.q+'&size=l';
    HABBO_CACHE[appEditorAgent.id]['d'+d+'_'+act.key]=img;
  })});
  closeAppEditor();updCards();
  showToast('✓ Avatar actualizado','#00ff88');
  if(!isTestWorld) saveUserState();
}

function buildPreviewAgent(){
  return Object.assign({},appEditorAgent,appEditorDraft,{state:'standing',status:'idle',pos:{x:0,y:0},dir:'se',actionAnim:null,chatBubble:null,levelUpEffect:0});
}

function renderAeTabs(){
  const tabs=['skin','hair','shirt','pants','shoes','acc'];
  const labels=['Piel','Pelo','Camisa','Pantalon','Calzado','Accesorios'];
  document.getElementById('ae-tabs').innerHTML=tabs.map((t,i)=>`<div class="ae-tab${aeActiveTab===t?' a':''}" onclick="aeSetTab('${t}')">${labels[i]}</div>`).join('');
}

function aeSetTab(t){aeActiveTab=t;renderAeTabs();renderAeOptions()}

function renderAeOptions(){
  const el=document.getElementById('ae-options');
  if(aeActiveTab==='acc'){
    el.innerHTML='<div style="font-family:\'Inter\',sans-serif;font-size:10px;color:#444;margin-bottom:8px">ACCESORIO</div><div class="ae-styles">'+
      AE_ACCESSORIES.map(a=>`<div class="style-btn${appEditorDraft.accessory===a?' a':''}" onclick="aePick('accessory','${a}')">${a}</div>`).join('')+
      '</div>';
  } else if(aeActiveTab==='hair'){
    const dk=appEditorDraft.hairColor;
    el.innerHTML='<div style="font-family:\'Inter\',sans-serif;font-size:10px;color:#444;margin-bottom:8px">COLOR DE PELO</div><div class="ae-swatches">'+
      AE_PALETTES.hair.map(c=>`<div class="swatch${dk===c?' sel':''}" style="background:${c}" title="${c}" onclick="aePick('hairColor','${c}')"></div>`).join('')+
      '</div><div style="font-family:\'Inter\',sans-serif;font-size:10px;color:#444;margin:12px 0 6px">ESTILO</div><div class="ae-styles">'+
      AE_HAIR_STYLES.map(s2=>`<div class="style-btn${appEditorDraft.hairStyle===s2?' a':''}" onclick="aePick('hairStyle','${s2}')">${s2}</div>`).join('')+
      '</div>';
  } else {
    const palKey={'skin':'skin','shirt':'shirt','pants':'pants','shoes':'shoes'}[aeActiveTab]||'skin';
    const draftKey={'skin':'skinColor','shirt':'shirtColor','pants':'pantsColor','shoes':'shoeColor'}[aeActiveTab]||'skinColor';
    const labelMap={'skin':'COLOR DE PIEL','shirt':'COLOR DE CAMISA','pants':'COLOR DE PANTALON','shoes':'COLOR DE CALZADO'};
    const cur=appEditorDraft[draftKey];
    el.innerHTML=`<div style="font-family:'Inter',sans-serif;font-size:10px;color:#555;margin-bottom:8px">${labelMap[aeActiveTab]||''}</div><div class="ae-swatches">`+
      AE_PALETTES[palKey].map(c=>`<div class="swatch${cur===c?' sel':''}" style="background:${c}" title="${c}" onclick="aePick('${draftKey}','${c}')"></div>`).join('')+
      '</div>';
  }
}

function aePick(key,val){
  appEditorDraft[key]=val;
  renderAeOptions();
  drawCharPreview(buildPreviewAgent());
}

// ====== UPDATE AGENTS ======
// =============================================
// UPDATE AGENTS
// =============================================
function updateAgents(){AGENTS.forEach(a=>{a.stateTimer++;

  // ── Auto-behavior: solo en Test World o agentes con configured:true ──
  const canAutoAct = isTestWorld || a.configured !== false;

  if(canAutoAct && a.stateTimer>250+Math.random()*350){a.stateTimer=0;const r=Math.random();
    if(r<.4){
      // Volver al escritorio a trabajar
      a.state='walking';a.targetPos={x:a.deskTile.x,y:a.deskTile.y};
      const ss=['working','thinking','reading'];a.status=ss[~~(Math.random()*ss.length)];a.statusText=SA[a.status][~~(Math.random()*SA[a.status].length)];
    } else if(r<.6){
      // Ir a una silla/couch random para descansar
      const _seats=FURN.filter(f=>f.t==='chair'||f.t==='couch');
      if(_seats.length>0){
        const _sf=_seats[~~(Math.random()*_seats.length)];
        a.state='walking';a.targetPos={x:_sf.x,y:_sf.y};a.status='idle';a.statusText=SA.idle[~~(Math.random()*SA.idle.length)];
      }
    } else if(r<.75){
      // Ir a la zona de café/watercooler
      const _social=FURN.filter(f=>f.t==='coffee'||f.t==='watercooler');
      if(_social.length>0){
        const _sf=_social[~~(Math.random()*_social.length)];
        a.state='walking';a.targetPos={x:_sf.x+1,y:_sf.y};a.status='idle';a.statusText='Coffee break ☕';
      }
    } else {
      // Quedarse en su lugar haciendo algo
      const ss=['working','thinking','reading'];a.status=ss[~~(Math.random()*ss.length)];a.statusText=SA[a.status][~~(Math.random()*SA[a.status].length)];
    }
    updCards();addLog(a)}

  // Walking + direction (siempre, para movimiento manual)
  if(a.state==='walking'&&a.targetPos){
    const dx=a.targetPos.x-a.pos.x,dy=a.targetPos.y-a.pos.y,d=Math.sqrt(dx*dx+dy*dy);
    if(d>.1){
      a.pos.x+=(dx/d)*.012;a.pos.y+=(dy/d)*.012;
      if(Math.abs(dx)>Math.abs(dy)) a.dir=dx>0?'se':'nw';
      else a.dir=dy>0?'sw':'ne';
    }else{
      a.pos.x=a.targetPos.x;a.pos.y=a.targetPos.y;
      a.targetPos=null;a.dir='se';
      a.state='standing';
      // Si es agente no configurado, volver a idle
      if(a.configured===false){a.status='idle';a.statusText='Esperando instrucciones'}
    }
  }

  // Action animations
  if(a.actionAnim){a.actionAnim.frame++;if(a.actionAnim.frame>=a.actionAnim.maxFrames)a.actionAnim=null}

  // Level up effect countdown
  if(a.levelUpEffect>0) a.levelUpEffect--;

  // Chat bubbles (solo para agentes configurados o test)
  if(canAutoAct){
    if(a.chatBubble&&a.chatBubble.timer>0) a.chatBubble.timer--;
    if(a.chatBubble&&a.chatBubble.timer<=0) a.chatBubble=null;
    if(!a.chatBubble&&Math.random()<0.01){
      a.chatBubble={text:CHAT_MSGS[~~(Math.random()*CHAT_MSGS.length)],timer:180};
    }
  }

  // XP progress (solo en test world — Live usa tickEconomy)
  if(isTestWorld&&a.status==='working'&&tk%120===0){
    a.xp+=5+Math.floor(Math.random()*10);
    if(a.xp>=a.xpMax){
      a.level++;
      a.xp=a.xp-a.xpMax;
      a.xpMax=Math.floor(a.xpMax*1.15);
      a.levelUpEffect=60;
      if(typeof playSound==='function')playSound('levelup');
      addLog(a);
      updCards();
    }
  }

  // Task progress (solo agentes configurados)
  if(canAutoAct&&a.currentTask&&a.status==='working'&&tk%200===0){
    a.currentTask.progress=Math.min(100,a.currentTask.progress+1+Math.floor(Math.random()*3));
    if(a.currentTask.progress>=100){
      a.currentTask.progress=0;
      const t=TASK_POOL[Math.floor(Math.random()*TASK_POOL.length)];
      a.currentTask={name:t.name,detail:t.detail,progress:0};
    }
  }

  a.frame++})}

