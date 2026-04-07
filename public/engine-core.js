// =============================================
// ENGINE-CORE.JS — Auth, Canvas, Isometric Math, Render Loop
// =============================================

// ====== AUTH SYSTEM ======
let currentUser = null;
let isTestWorld = false;

// Generate login stars
function genStars(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'login-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (2 + Math.random() * 3) + 's';
    star.style.width = star.style.height = (1 + Math.random() * 2) + 'px';
    el.appendChild(star);
  }
}

function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent = '';
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem('agentsHotelUsers') || '{}'); } catch(e) { return {}; }
}
function saveUsers(users) {
  localStorage.setItem('agentsHotelUsers', JSON.stringify(users));
}

function doRegister() {
  const user = document.getElementById('reg-user').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const office = document.getElementById('reg-office').value.trim() || 'Mi Oficina';
  const errEl = document.getElementById('reg-error');

  if (!user || user.length < 3) { errEl.textContent = 'Usuario: mínimo 3 caracteres'; return; }
  if (!email.includes('@')) { errEl.textContent = 'Email inválido'; return; }
  if (pass.length < 6) { errEl.textContent = 'Contraseña: mínimo 6 caracteres'; return; }

  const users = getUsers();
  if (users[user.toLowerCase()]) { errEl.textContent = 'Ese usuario ya existe'; return; }

  users[user.toLowerCase()] = { username: user, email, password: btoa(pass), officeName: office, created: Date.now() };
  saveUsers(users);

  currentUser = users[user.toLowerCase()];
  localStorage.setItem('agentsHotelCurrentUser', user.toLowerCase());
  showLobby();
}

function doLogin() {
  const input = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  if (!input || !pass) { errEl.textContent = 'Completá todos los campos'; return; }

  const users = getUsers();
  // Find by username or email
  const found = users[input] || Object.values(users).find(u => u.email.toLowerCase() === input);
  if (!found || atob(found.password) !== pass) { errEl.textContent = 'Usuario o contraseña incorrectos'; return; }

  currentUser = found;
  localStorage.setItem('agentsHotelCurrentUser', found.username.toLowerCase());
  showLobby();
}

function doTestLogin() {
  currentUser = { username: 'TestUser', officeName: 'Test World HQ', isTest: true };
  isTestWorld = true;
  enterRoom('test');
}

function doLogout() {
  currentUser = null;
  isTestWorld = false;
  localStorage.removeItem('agentsHotelCurrentUser');
  document.getElementById('lobby-screen').classList.remove('open');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('game-wrapper').style.display = 'none';
}

function showLobby() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.add('open');
  document.getElementById('lobby-username').textContent = currentUser.username;
  genStars('lobby-stars');
}

function enterRoom(type) {
  isTestWorld = (type === 'test');
  document.getElementById('lobby-screen').classList.remove('open');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('game-wrapper').style.display = 'block';
  document.getElementById('test-badge').style.display = isTestWorld ? 'block' : 'none';

  // Limpiar estado previo
  AGENTS.length = 0;
  FURN.length = 0;
  var _alEl=document.getElementById('al');if(_alEl)_alEl.innerHTML='';

  if (isTestWorld) {
    // ── TEST WORLD: todo desbloqueado ──
    COINS = 999999;
    DEFAULT_AGENTS.forEach(a => AGENTS.push(Object.assign({}, a)));
    DEFAULT_FURN.forEach(f => FURN.push(Object.assign({}, f)));
    loadAppearances();
    updCards();
    updateCoinsDisplay();
  } else {
    // ── LIVE MODE ──
    // Cargar estado guardado o empezar de cero
    const saved = currentUser ? loadUserState(currentUser.username) : null;
    // Solo restaurar si hay agentes REALES (configured:true, no residuos del test)
    const hasProgress = saved && saved.agents && saved.agents.some(a => a.configured === true);

    if (hasProgress) {
      // Usuario que ya tiene agentes guardados
      COINS = saved.coins || 0;
      saved.agents.forEach(a => AGENTS.push(hydrateAgent(a)));
      if (saved.furn) saved.furn.forEach(f => FURN.push(Object.assign({}, f)));
      loadAppearances();
    } else {
      // Primera vez o sin agentes: sala vacía con 1 agente starter
      COINS = 0;
      // Agente starter gratuito
      AGENTS.push(hydrateAgent({
        id:'starter', name:'Mi Primer Agente', emoji:'🤖',
        figureCode:'hd-180-1.hr-110-61.ch-255-82.lg-280-82.sh-300-91',
        class:'Rookie · Aprendiz', color:'#00ff88',
        skinColor:'#e8b88a', hairColor:'#2a1a0a',
        shirtColor:'#00aa66', pantsColor:'#1a1a3a',
        shoeColor:'#222222', hairStyle:'short', accessory:'none',
        level:1, xp:0, xpMax:1000,
        status:'idle', statusText:'Esperando instrucciones',
        configured:false,
        stats:{STR:{val:10,label:'Precision',color:'#ff4444'},DEX:{val:10,label:'Velocidad',color:'#ffaa00'},INT:{val:10,label:'Analisis',color:'#00aaff'},WIS:{val:10,label:'Paciencia',color:'#aa44ff'},CON:{val:10,label:'Resistencia',color:'#00ff88'},CHA:{val:10,label:'Comunicacion',color:'#ff66ff'}},
        skills:[],
        equipment:[],
        currentTask:{name:'Sin tarea',detail:'Importá agentes para configurar',progress:0},
        log:[{time:'00:00',text:'Agente creado — esperando configuración',type:'i'}],
        deskTile:{x:3,y:3}
      }));
      // Sala starter con muebles básicos Habbo
      FURN.push({t:'desk',x:3,y:3,rot:0,habboClass:'exe_wrkdesk'});
      FURN.push({t:'mon',x:3,y:3,rot:0,habboClass:'computer_flatscreen'});
      FURN.push({t:'chair',x:3,y:4,rot:0,habboClass:'waasa_chair'});
      FURN.push({t:'plant',x:1,y:1,rot:0,habboClass:'ducket_c25_plantpot'});
      FURN.push({t:'plant',x:5,y:1,rot:0,habboClass:'plant_small_cactus'});
      FURN.push({t:'lamp',x:1,y:3,rot:0,habboClass:'hygge_c25_desklamp'});
    }
    updCards();
    updateCoinsDisplay();
    updateImportPulse();

    // Onboarding si no lo completó
    if (!currentUser || !localStorage.getItem('agentsHotel_onboard_' + currentUser.username)) {
      setTimeout(function() { showOnboarding(); }, 100);
    }
  }

  // HUD
  var hudSub = document.querySelector('#hud .sub');
  if (hudSub) {
    hudSub.textContent = isTestWorld
      ? '🧪 Test World — todas las funciones desbloqueadas'
      : (currentUser ? currentUser.officeName : 'tu oficina virtual');
  }

  // Preload Habbo avatars now that AGENTS are populated
  preloadHabbo();
}

// ── Persistencia del estado Live ──
function saveUserState() {
  if (isTestWorld || !currentUser) return;
  const state = {
    coins: COINS,
    agents: AGENTS.map(a => ({
      id:a.id, name:a.name, emoji:a.emoji, class:a.class, color:a.color,
      skinColor:a.skinColor, hairColor:a.hairColor, shirtColor:a.shirtColor,
      pantsColor:a.pantsColor, shoeColor:a.shoeColor, hairStyle:a.hairStyle,
      accessory:a.accessory, level:a.level, xp:a.xp, xpMax:a.xpMax,
      stats:a.stats, skills:a.skills, equipment:a.equipment,
      deskTile:a.deskTile, figureCode:a.figureCode,
      totalEarned:a.totalEarned||0, workTicks:a.workTicks||0,
      webhookConfig:a.webhookConfig||null
    })),
    furn: FURN.map(f => ({t:f.t, x:f.x, y:f.y, rot:f.rot||0, variant:f.variant}))
  };
  try { localStorage.setItem('agentsHotel_state_' + currentUser.username, JSON.stringify(state)); } catch(e) {}
}
function loadUserState(username) {
  try {
    const raw = localStorage.getItem('agentsHotel_state_' + username);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// Auto-login check
function checkAutoLogin() {
  if (new URLSearchParams(window.location.search).get("mode")) return;
  const savedUser = localStorage.getItem('agentsHotelCurrentUser');
  if (savedUser) {
    const users = getUsers();
    if (users[savedUser]) {
      currentUser = users[savedUser];
      showLobby();
      return;
    }
  }
  // Show login
  genStars('login-stars');
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('login-pass').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('reg-pass').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doRegister();
  });
  document.getElementById('reg-office').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doRegister();
  });
});

// ====== CANVAS GLOBALS ======
const C=document.getElementById('game');
let X=C.getContext('2d');
let W,H,zm=3.4,cx=0,cy=50,drag=false,dsx,dsy,csx,csy,dm=false,tk=0,hov=null;
let infoAgent=null,sheetAgent=null;
let appEditorOpen=false,appEditorAgent=null,appEditorDraft=null,aeActiveTab='skin';
let hovTile=null;
let editMode=false,dragFurn=null,dragFurnOff=null;
const TW=32,TH=16;

// Dust particles
const DUST=Array.from({length:30},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0003,vy:-Math.random()*.0004-.0001,alpha:Math.random()*.4+.1,r:Math.random()*1.5+.5}));


// Sprites: using Habbo only (no custom sprites)
const SPRITES={};
const SPRITES_READY=false;

const OL='#0a0a12';

// ====== COLOR HELPERS + BODY PART PRIMITIVES ======
// ---- COLOR HELPERS ----
function lgt(c,n=25){const[r,g,b]=hex2rgb(c);return rgb2hex(Math.min(255,r+n),Math.min(255,g+n),Math.min(255,b+n))}
function drk(c,n=30){const[r,g,b]=hex2rgb(c);return rgb2hex(Math.max(0,r-n),Math.max(0,g-n),Math.max(0,b-n))}
function hex2rgb(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function rgb2hex(r,g,b){return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}
function mkGrad(x1,y1,x2,y2,base){const g=X.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,drk(base,20));g.addColorStop(0.45,lgt(base,18));g.addColorStop(1,drk(base,15));return g}

// ---- BODY PART PRIMITIVES ----
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}

function partOval(cx2,cy2,rx,ry,color){
  const g=X.createLinearGradient(cx2-rx,cy2,cx2+rx,cy2);
  g.addColorStop(0,drk(color,22));g.addColorStop(0.4,lgt(color,20));g.addColorStop(1,drk(color,18));
  X.fillStyle=g;X.beginPath();X.ellipse(cx2,cy2,rx,ry,0,0,Math.PI*2);X.fill();
  X.strokeStyle=OL;X.lineWidth=0.8;X.beginPath();X.ellipse(cx2,cy2,rx,ry,0,0,Math.PI*2);X.stroke();
}

function partTrap(cx2,topY,topW,botW,h,color){
  const g=X.createLinearGradient(cx2-topW/2,topY,cx2+topW/2,topY);
  g.addColorStop(0,drk(color,20));g.addColorStop(0.42,lgt(color,16));g.addColorStop(1,drk(color,16));
  X.fillStyle=g;
  const tl=cx2-topW/2,tr=cx2+topW/2,bl=cx2-botW/2,br=cx2+botW/2;
  const sr=topW*.18;
  X.beginPath();
  X.moveTo(tl+sr,topY);X.lineTo(tr-sr,topY);
  X.arcTo(tr,topY,tr,topY+sr,sr);
  X.lineTo(br,topY+h);X.lineTo(bl,topY+h);
  X.lineTo(tl,topY+sr);
  X.arcTo(tl,topY,tl+sr,topY,sr);
  X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=0.7;X.stroke();
}

function partRnd(x,y,w,h,color){
  const g=X.createLinearGradient(x,y,x+w,y);
  g.addColorStop(0,drk(color,22));g.addColorStop(0.4,lgt(color,18));g.addColorStop(1,drk(color,16));
  X.fillStyle=g;
  const r=w*.42;
  X.beginPath();X.moveTo(x+r,y);X.lineTo(x+w-r,y);X.lineTo(x+w,y);X.lineTo(x+w,y+h-r);X.quadraticCurveTo(x+w,y+h,x+w-r,y+h);X.lineTo(x+r,y+h);X.quadraticCurveTo(x,y+h,x,y+h-r);X.lineTo(x,y);X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=0.6;X.stroke();
}

function partShoe(x,y,w,h,color){
  const g=X.createLinearGradient(x,y,x+w,y);
  g.addColorStop(0,drk(color,22));g.addColorStop(0.45,lgt(color,12));g.addColorStop(1,drk(color,18));
  X.fillStyle=g;
  const r=Math.min(w*.3,h*.4);
  X.beginPath();
  X.moveTo(x+r,y);X.lineTo(x+w-r,y);X.arcTo(x+w,y,x+w,y+r,r);
  X.lineTo(x+w,y+h);X.lineTo(x,y+h);X.lineTo(x,y+r);X.arcTo(x,y,x+r,y,r);
  X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=0.6;X.stroke();
}

function fp2(x,y,w,h,c){
  X.fillStyle=lgt(c,15);X.fillRect(x,y,w*.45,h);
  X.fillStyle=drk(c,10);X.fillRect(x+w*.55,y,w*.45,h);
  X.fillStyle=c;X.fillRect(x+w*.2,y,w*.6,h);
  X.strokeStyle=OL;X.lineWidth=.6;X.strokeRect(x,y,w,h);
}

// ---- ISOMETRIC BOX (3 visible faces) ----
function isoBox(cx2,cy2,w,h,d,color){
  const hw=w/2,hd=d/2;
  const topCol=lgt(color,20);
  const leftCol=drk(color,10);
  const rightCol=drk(color,25);
  // Top face
  X.fillStyle=topCol;
  X.beginPath();X.moveTo(cx2,cy2-h);X.lineTo(cx2+hw,cy2-h+hd);X.lineTo(cx2,cy2-h+d);X.lineTo(cx2-hw,cy2-h+hd);X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
  // Left face
  X.fillStyle=leftCol;
  X.beginPath();X.moveTo(cx2-hw,cy2-h+hd);X.lineTo(cx2,cy2-h+d);X.lineTo(cx2,cy2+d);X.lineTo(cx2-hw,cy2+hd);X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
  // Right face
  X.fillStyle=rightCol;
  X.beginPath();X.moveTo(cx2+hw,cy2-h+hd);X.lineTo(cx2,cy2-h+d);X.lineTo(cx2,cy2+d);X.lineTo(cx2+hw,cy2+hd);X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
}

// ====== ISOMETRIC MATH ======
function isoXY(tx,ty){return{x:(tx-ty)*(TW/2),y:(tx+ty)*(TH/2)}}
function w2s(wx,wy){return{x:(wx+cx)*zm+W/2,y:(wy+cy)*zm+H/2}}

function screenToTile(sx,sy){
  const wx=(sx-W/2)/zm-cx;
  const wy=(sy-H/2)/zm-cy;
  const tx=(wx/(TW/2)+wy/(TH/2))/2;
  const ty=(wy/(TH/2)-wx/(TW/2))/2;
  return{x:Math.floor(tx),y:Math.floor(ty)};
}

// ====== ZOOM / RESIZE ======
function zoomIn(){zm=Math.min(zm*1.2,5)}function zoomOut(){zm=Math.max(zm/1.2,.8)}function resetView(){zm=3.4;cx=0;cy=50}
function resize(){W=innerWidth;H=innerHeight;C.width=W;C.height=H}

// ====== MAIN RENDER ======
function render(){
  X.clearRect(0,0,W,H);

  // Background gradient
  const bg=X.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#04040e');bg.addColorStop(.4,'#07071a');bg.addColorStop(1,'#0c0c1e');
  X.fillStyle=bg;X.fillRect(0,0,W,H);

  // Ambient orbs
  X.fillStyle='rgba(0,255,136,0.008)';
  for(let i=0;i<5;i++){X.beginPath();X.arc((Math.sin(tk*.004+i*2.1)*.5+.5)*W,(Math.cos(tk*.003+i*1.7)*.5+.5)*H,40,0,Math.PI*2);X.fill()}

  // Monitor light halos
  FURN.filter(f=>f.t==='mon').forEach(f=>{
    const mi=isoXY(f.x,f.y),ms=w2s(mi.x,mi.y);
    const hue=(tk*1.5+f.x*60)%360;
    const hg=X.createRadialGradient(ms.x,ms.y-21*zm,1,ms.x,ms.y-21*zm,18*zm);
    hg.addColorStop(0,`hsla(${hue},70%,50%,0.12)`);hg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=hg;X.beginPath();X.arc(ms.x,ms.y-21*zm,18*zm,0,Math.PI*2);X.fill();
  });

  // Lamp warm glow on nearby tiles
  FURN.filter(f=>f.t==='lamp').forEach(f=>{
    const li=isoXY(f.x,f.y),ls=w2s(li.x,li.y);
    const lg=X.createRadialGradient(ls.x,ls.y,1,ls.x,ls.y,30*zm);
    lg.addColorStop(0,'rgba(255,200,80,0.06)');lg.addColorStop(1,'rgba(255,200,80,0)');
    X.fillStyle=lg;X.beginPath();X.arc(ls.x,ls.y,30*zm,0,Math.PI*2);X.fill();
  });

  // Dust particles
  DUST.forEach(d=>{
    d.x+=d.vx;d.y+=d.vy;
    if(d.x<0)d.x=1;if(d.x>1)d.x=0;
    if(d.y<0){d.y=1;d.x=Math.random()}
    X.globalAlpha=d.alpha*(Math.sin(tk*.02+d.x*20)*.3+.7);
    X.fillStyle='#ffffff';
    X.beginPath();X.arc(d.x*W,d.y*H,d.r,0,Math.PI*2);X.fill();
  });
  X.globalAlpha=1;

  // Walls (before tiles)
  drawWalls();

  // Draw tiles
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++)if(MAP[ty]?.[tx]>0)dTile(tx,ty);

  // Tile hover highlight
  if(hovTile&&MAP[hovTile.y]?.[hovTile.x]>0){
    const hi=isoXY(hovTile.x,hovTile.y);
    const hs=w2s(hi.x,hi.y);
    const tw=TW*zm,th=TH*zm;
    X.fillStyle='rgba(255,255,255,0.08)';
    X.beginPath();X.moveTo(hs.x,hs.y);X.lineTo(hs.x+tw/2,hs.y+th/2);X.lineTo(hs.x,hs.y+th);X.lineTo(hs.x-tw/2,hs.y+th/2);X.closePath();X.fill();
    X.strokeStyle='rgba(255,255,255,0.2)';X.lineWidth=1;X.stroke();
  }

  // Rug first (below everything)
  FURN.filter(f=>f.t==='rug').forEach(f=>dFurn(f));

  // Depth-sort and draw rest
  const dr=[];
  FURN.forEach(f=>{if(f.t!=='rug'){dr.push({k:'f',d:f,dp:f.x+f.y})}});
  AGENTS.forEach(a=>dr.push({k:'a',d:a,dp:a.pos.x+a.pos.y+.01}));
  dr.sort((a,b)=>a.dp-b.dp);
  dr.forEach(d=>{
    if(d.k==='f'){
      drawFurnShadow(d.d);
      dFurn(d.d);
    } else {
      drawChar(d.d);
    }
  });
}

// ====== GAME LOOP ======
function loop(){tk++;updateAgents();tickCoins();if(tk%3600===0)tickWebhooks();tickChat();
  // Habbo loading indicator
  const _hlel=document.getElementById('habbo-loading');
  if(_hlel){
    if(HABBO_TOTAL>0&&HABBO_LOADED<HABBO_TOTAL){_hlel.style.display='block';_hlel.textContent='Loading Habbo avatars... '+HABBO_LOADED+'/'+HABBO_TOTAL;}
    else if(HABBO_LOADED>=HABBO_TOTAL&&_hlel.style.display!=='none'){_hlel.style.display='none';}
  }
  render();requestAnimationFrame(loop)}

