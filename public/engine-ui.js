// =============================================
// ENGINE-UI.JS — Navigator, Marketplace, Chat, Config, Panels
// =============================================

// ====== NAVIGATOR DRAG ======
// ====== NAVIGATOR DRAG ======
(function(){
  var isDragging=false, dragOffX=0, dragOffY=0;
  document.addEventListener('mousedown', function(e){
    var header = e.target.closest('.nav-header');
    if(!header) return;
    var nav = document.getElementById('navigator');
    if(!nav || !nav.classList.contains('open')) return;
    isDragging = true;
    nav.classList.add('dragging');
    var rect = nav.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;
    // Switch from transform positioning to absolute positioning
    nav.style.position = 'fixed';
    nav.style.left = rect.left + 'px';
    nav.style.top = rect.top + 'px';
    nav.style.transform = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e){
    if(!isDragging) return;
    var nav = document.getElementById('navigator');
    var newX = e.clientX - dragOffX;
    var newY = e.clientY - dragOffY;
    // Clamp to viewport
    newX = Math.max(0, Math.min(newX, window.innerWidth - 100));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 100));
    nav.style.left = newX + 'px';
    nav.style.top = newY + 'px';
  });
  document.addEventListener('mouseup', function(){
    if(!isDragging) return;
    isDragging = false;
    var nav = document.getElementById('navigator');
    nav.classList.remove('dragging');
  });
})();

// ====== SIDEBAR + NAVIGATOR ======
// ====== SIDEBAR TOGGLE ======
let sidebarOpen = false;
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !sidebarOpen);
  document.getElementById('sb-toggle').textContent = sidebarOpen ? '✕' : '☰';
  document.getElementById('sb-toggle').style.left = sidebarOpen ? '54px' : '0';
  if (!sidebarOpen) closeNavigator();
}

// ====== NAVIGATOR SYSTEM ======
let navOpen = false;
let navTab = 'public';
let navCatFilter = 'all';
let navSearchQuery = '';

// Salas públicas demo — showcase de la plataforma
const PUBLIC_ROOMS = [
  // ── Startups ──
  {id:'r1', name:'Startup AI Labs', owner:'@marcelo_ai', desc:'Equipo de 8 agentes desarrollando ML pipeline', users:8, category:'startup', agents:8, level:32, featured:true, icon:'🚀'},
  {id:'r2', name:'NeoBank HQ', owner:'@fintech_crew', desc:'Oficina fintech con traders y analistas IA', users:5, category:'startup', agents:5, level:28, icon:'🏦'},
  {id:'r3', name:'EduTech Campus', owner:'@learn_ai', desc:'Plataforma educativa con tutores IA', users:12, category:'startup', agents:12, level:45, featured:true, icon:'🎓'},
  // ── Agencies ──
  {id:'r4', name:'Creative Agency Co', owner:'@design_studio', desc:'Agencia creativa con diseñadores y copywriters', users:6, category:'agency', agents:6, level:25, icon:'🎨'},
  {id:'r5', name:'DevShop Elite', owner:'@dev_masters', desc:'Software factory — 10 devs especializados', users:10, category:'agency', agents:10, level:38, featured:true, icon:'💻'},
  {id:'r6', name:'Marketing Hub', owner:'@growth_team', desc:'Growth hacking con analistas de datos', users:4, category:'agency', agents:4, level:18, icon:'📈'},
  // ── Freelancers ──
  {id:'r7', name:'Solo Dev Studio', owner:'@indie_coder', desc:'Desarrollador independiente full-stack', users:1, category:'freelancer', agents:3, level:22, icon:'🧑‍💻'},
  {id:'r8', name:'Design Corner', owner:'@pixel_artist', desc:'Diseñador UI/UX freelance', users:1, category:'freelancer', agents:2, level:15, icon:'✏️'},
  {id:'r9', name:'Data Wizard', owner:'@data_guru', desc:'Científico de datos con agentes de análisis', users:1, category:'freelancer', agents:4, level:30, icon:'📊'},
  // ── Enterprise ──
  {id:'r10', name:'TechCorp Global', owner:'@techcorp', desc:'Corporación tech — departamento de innovación', users:20, category:'enterprise', agents:20, level:50, featured:true, icon:'🏢'},
  {id:'r11', name:'Consulting Group', owner:'@consult_pro', desc:'Consultora con analistas y gestores de proyecto', users:7, category:'enterprise', agents:7, level:35, icon:'📋'},
  // ── Community ──
  {id:'r12', name:'AI Hackathon 2026', owner:'@hackathon', desc:'Espacio abierto para hackathons de IA', users:15, category:'community', agents:0, level:1, icon:'🏆'},
  {id:'r13', name:'Agents Trading Floor', owner:'@market_ai', desc:'Compra/venta/subasta de agentes IA', users:9, category:'marketplace', agents:0, level:1, featured:true, icon:'🏪'},
  {id:'r14', name:'Open Source Lab', owner:'@oss_community', desc:'Colaboración en proyectos open source', users:6, category:'community', agents:8, level:20, icon:'🔓'},
  {id:'r15', name:'Coffee & Code', owner:'@chill_devs', desc:'Lounge para networking casual entre devs', users:3, category:'community', agents:2, level:10, icon:'☕'},
];

const NAV_CATEGORIES = [
  {id:'all',     label:'Todas',       icon:'✨'},
  {id:'startup', label:'Startups',    icon:'🚀'},
  {id:'agency',  label:'Agencias',    icon:'🎨'},
  {id:'freelancer',label:'Freelancers',icon:'🧑‍💻'},
  {id:'enterprise',label:'Empresas',  icon:'🏢'},
  {id:'community',label:'Comunidad',  icon:'🌐'},
  {id:'marketplace',label:'Marketplace',icon:'🏪'},
];

const TITLES = {
  public: '🌍 Salas Públicas',
  mine: '📁 Mis Salas',
  friends: '👥 Salas de Amigos',
  market: '🏪 Marketplace de Agentes',
  events: '🎯 Eventos y Hackathons'
};

function toggleNavigator(tab) {
  if (navOpen && navTab === tab) { closeNavigator(); return; }
  navTab = tab || 'public';
  navOpen = true;
  navSearchQuery = '';
  navCatFilter = 'all';
  document.getElementById('nav-search-input').value = '';
  var _navEl=document.getElementById('navigator');_navEl.classList.add('open');_navEl.style.left='60px';_navEl.style.top='50%';_navEl.style.transform='translateY(-50%)';
  document.getElementById('navigator').style.display = 'flex';
  // Highlight sidebar button
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  // Activate matching tab
  document.querySelectorAll('.nav-tab').forEach((t, i) => {
    const tabs = ['public','market','events'];
    t.classList.toggle('active', tabs[i] === navTab);
  });
  document.getElementById('nav-title-text').textContent = TITLES[navTab] || 'Navigator';
  renderNavCats();
  renderNavRooms();
}

function closeNavigator() {
  navOpen = false;
  document.getElementById('navigator').classList.remove('open');
  document.getElementById('navigator').style.display = 'none';
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
}

function switchNavTab(tab, el) {
  navTab = tab;
  navCatFilter = 'all';
  navSearchQuery = '';
  document.getElementById('nav-search-input').value = '';
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('nav-title-text').textContent = TITLES[tab] || 'Navigator';
  renderNavCats();
  renderNavRooms();
}

function renderNavCats() {
  const row = document.getElementById('nav-cats-row');
  if (navTab !== 'public') { row.style.display = 'none'; return; }
  row.style.display = 'flex';
  row.innerHTML = NAV_CATEGORIES.map(c =>
    '<div class="nav-cat-chip' + (navCatFilter === c.id ? ' active' : '') + '" onclick="setNavCat(\'' + c.id + '\')">' + c.icon + ' ' + c.label + '</div>'
  ).join('');
}

function setNavCat(cat) {
  navCatFilter = cat;
  renderNavCats();
  renderNavRooms();
}

function filterNavRooms() {
  navSearchQuery = document.getElementById('nav-search-input').value.toLowerCase();
  renderNavRooms();
}

function renderNavRooms() {
  const body = document.getElementById('nav-body');

  if (navTab === 'public') {
    // Mi sala propia al inicio
    var _myName = currentUser ? currentUser.officeName : 'Mi Oficina';
    var _myHtml = '<div class="nav-section"><div class="nav-section-title">🏠 Mi Oficina</div><div class="nav-room mine" onclick="goToMyRoom()"><div class="nav-room-icon">🏠</div><div class="nav-room-info"><div class="nav-room-name">' + _myName + '</div><div class="nav-room-desc">Tu espacio personalizado</div></div><div class="nav-room-meta"><div class="nav-room-users">👤 ' + AGENTS.length + '</div><div class="nav-room-cat" style="color:#00ff88;border-color:#00ff8844">LIVE</div></div></div></div><div class="nav-section"><div class="nav-section-title">🌍 Salas Públicas</div></div>';
    let rooms = PUBLIC_ROOMS;
    if (navCatFilter !== 'all') rooms = rooms.filter(r => r.category === navCatFilter);
    if (navSearchQuery) rooms = rooms.filter(r =>
      r.name.toLowerCase().includes(navSearchQuery) ||
      r.desc.toLowerCase().includes(navSearchQuery) ||
      r.owner.toLowerCase().includes(navSearchQuery)
    );
    // Featured first
    rooms.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    if (!rooms.length) {
      body.innerHTML = _myHtml + '<div class="nav-empty">No se encontraron salas<br>Probá con otro filtro</div>';
      return;
    }

    body.innerHTML = _myHtml + rooms.map(r => `
      <div class="nav-room${r.featured ? ' featured' : ''}" onclick="visitRoom('${r.id}')">
        <div class="nav-room-icon">${r.icon}</div>
        <div class="nav-room-info">
          <div class="nav-room-name">${r.name}</div>
          <div class="nav-room-desc">${r.owner} — ${r.desc}</div>
        </div>
        <div class="nav-room-meta">
          <div class="nav-room-users">👤 ${r.users}</div>
          ${r.featured ? '<div class="nav-room-cat" style="color:#ffcc00;border-color:#ffcc0044">⭐</div>' : ''}
        </div>
      </div>`).join('');

  } else if (navTab === 'mine') {
    var myName = currentUser ? currentUser.officeName : 'Mi Oficina';
    body.innerHTML = `
      <div class="nav-room mine" onclick="goToMyRoom()">
        <div class="nav-room-icon">🏠</div>
        <div class="nav-room-info">
          <div class="nav-room-name">${myName}</div>
          <div class="nav-room-desc">Tu oficina personalizada</div>
        </div>
        <div class="nav-room-meta">
          <div class="nav-room-users">👤 ${AGENTS.length}</div>
          <div class="nav-room-cat" style="color:#00ff88;border-color:#00ff8844">LIVE</div>
        </div>
      </div>
      <div class="nav-create-btn" onclick="showToast('🔜 Crear sala adicional — Próximamente','#ffcc00')">+ Crear nueva sala</div>`;

  } else if (navTab === 'friends') {
    body.innerHTML = `
      <div class="nav-empty">👥 Tus amigos aparecerán aquí<br><br><span style="font-size:8px;color:#333">Agregá amigos visitando sus salas<br>y haciendo click en "Seguir"</span></div>`;

  } else if (navTab === 'market') {
    body.innerHTML = `
      <div class="nav-section">
        <div class="nav-section-title">🔥 Agentes destacados</div>
        <div class="nav-room featured" onclick="showToast('🔜 Marketplace — Próximamente','#ffcc00')">
          <div class="nav-room-icon">🤖</div>
          <div class="nav-room-info">
            <div class="nav-room-name">Full-Stack Dev Agent</div>
            <div class="nav-room-desc">React + Node.js + DB — Nivel 45</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-cat" style="color:#ffcc00;border-color:#ffcc0044">🪙 500</div></div>
        </div>
        <div class="nav-room" onclick="showToast('🔜 Marketplace — Próximamente','#ffcc00')">
          <div class="nav-room-icon">📊</div>
          <div class="nav-room-info">
            <div class="nav-room-name">Data Analyst Agent</div>
            <div class="nav-room-desc">Python + SQL + Tableau — Nivel 30</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-cat" style="color:#ffcc00;border-color:#ffcc0044">🪙 350</div></div>
        </div>
        <div class="nav-room" onclick="showToast('🔜 Marketplace — Próximamente','#ffcc00')">
          <div class="nav-room-icon">🎨</div>
          <div class="nav-room-info">
            <div class="nav-room-name">UI/UX Designer Agent</div>
            <div class="nav-room-desc">Figma + CSS + Animaciones — Nivel 25</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-cat" style="color:#ffcc00;border-color:#ffcc0044">🪙 280</div></div>
        </div>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">📦 Subastas activas</div>
        <div class="nav-empty" style="padding:16px">🏷️ No hay subastas activas<br><span style="font-size:8px;color:#333">Las subastas se abren los viernes</span></div>
      </div>`;

  } else if (navTab === 'events') {
    body.innerHTML = `
      <div class="nav-section">
        <div class="nav-section-title">📅 Próximos eventos</div>
        <div class="nav-room featured" onclick="showToast('🔜 Eventos — Próximamente','#ffcc00')">
          <div class="nav-room-icon">🏆</div>
          <div class="nav-room-info">
            <div class="nav-room-name">AI Hackathon Abril 2026</div>
            <div class="nav-room-desc">12 Apr — 48hs de innovación con agentes IA</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-users">👤 128</div></div>
        </div>
        <div class="nav-room" onclick="showToast('🔜 Eventos — Próximamente','#ffcc00')">
          <div class="nav-room-icon">🎤</div>
          <div class="nav-room-info">
            <div class="nav-room-name">Demo Day Startups</div>
            <div class="nav-room-desc">18 Apr — Presentá tu proyecto a inversores</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-users">👤 45</div></div>
        </div>
        <div class="nav-room" onclick="showToast('🔜 Eventos — Próximamente','#ffcc00')">
          <div class="nav-room-icon">📚</div>
          <div class="nav-room-info">
            <div class="nav-room-name">Workshop: Agentes Productivos</div>
            <div class="nav-room-desc">20 Apr — Cómo maximizar el rendimiento de tus agentes</div>
          </div>
          <div class="nav-room-meta"><div class="nav-room-users">👤 30</div></div>
        </div>
      </div>`;
  }
}

function visitRoom(roomId) {
  var room = PUBLIC_ROOMS.find(function(r){return r.id === roomId});
  if (!room) return;
  showToast('🚪 Visitando: ' + room.name + ' — Próximamente podrás entrar', '#00ccff');
  closeNavigator();
}

function goToMyRoom() {
  closeNavigator();
  showToast('🏠 Estás en tu oficina', '#00ff88');
}

// ====== HABBO TOGGLE (stub) ======
// ====== UNIFIED HABBO TOGGLE ======
// Habbo mode is always on — no toggle needed


// ====== AGENT MARKETPLACE ======
// ====== AGENT MARKETPLACE ======
var marketTab = 'buy';

// Demo marketplace listings
var MARKET_LISTINGS = [
  {id:'ml1', name:'Senior Full-Stack Dev', emoji:'💻', class:'Full-Stack · Arquitecto', level:42, color:'#00aaff', price:800, seller:'@dev_masters', skills:['React','Node','PostgreSQL'], type:'direct'},
  {id:'ml2', name:'Data Science Expert', emoji:'📊', class:'Data Scientist · PhD', level:38, color:'#aa44ff', price:650, seller:'@data_guru', skills:['Python','ML','TensorFlow'], type:'direct'},
  {id:'ml3', name:'UI/UX Designer Pro', emoji:'🎨', class:'Designer · Creative Lead', level:35, color:'#ff66ff', price:500, seller:'@design_studio', skills:['Figma','CSS','Motion'], type:'direct'},
  {id:'ml4', name:'DevOps Engineer', emoji:'🔧', class:'DevOps · SRE', level:40, color:'#ff8800', price:750, seller:'@cloud_ops', skills:['Docker','K8s','Terraform'], type:'direct'},
  {id:'ml5', name:'Security Analyst', emoji:'🛡️', class:'CyberSec · Pentester', level:45, color:'#ff4444', price:900, seller:'@sec_team', skills:['Pentest','OSINT','Forensics'], type:'direct'},
  {id:'ml6', name:'AI/ML Researcher', emoji:'🧠', class:'Researcher · Innovator', level:50, color:'#00ff88', price:0, seller:'@ai_labs', skills:['PyTorch','LLM','RAG'], type:'auction', currentBid:450, endsIn:'2h 15m', bids:7},
  {id:'ml7', name:'Mobile Dev Expert', emoji:'📱', class:'Mobile · Cross-Platform', level:33, color:'#00ccff', price:0, seller:'@app_forge', skills:['Flutter','Swift','Kotlin'], type:'auction', currentBid:320, endsIn:'5h 42m', bids:4},
  {id:'ml8', name:'QA Automation Lead', emoji:'🧪', class:'QA · Test Architect', level:36, color:'#ffaa00', price:550, seller:'@quality_first', skills:['Playwright','Jest','CI/CD'], type:'direct'},
];

function openMarket() {
  marketTab = 'buy';
  document.getElementById('agent-market').classList.add('open');
  document.getElementById('agent-market').style.display = 'flex';
  document.querySelectorAll('.am-tab').forEach(function(t,i){t.classList.toggle('active',i===0)});
  renderMarket();
}
function closeMarket() {
  document.getElementById('agent-market').classList.remove('open');
  document.getElementById('agent-market').style.display = 'none';
}
function switchMarketTab(tab, el) {
  marketTab = tab;
  document.querySelectorAll('.am-tab').forEach(function(t){t.classList.remove('active')});
  if (el) el.classList.add('active');
  renderMarket();
}

function renderMarket() {
  var body = document.getElementById('am-body');

  if (marketTab === 'buy') {
    var directs = MARKET_LISTINGS.filter(function(l){return l.type==='direct'});
    body.innerHTML = directs.map(function(l) {
      var canBuy = COINS >= l.price;
      return '<div class="am-listing">' +
        '<div class="am-listing-icon" style="border-color:' + l.color + '33;background:' + l.color + '08">' + l.emoji + '</div>' +
        '<div class="am-listing-info">' +
        '<div class="am-listing-name" style="color:' + l.color + '">' + l.name + '</div>' +
        '<div class="am-listing-desc">' + l.class + ' — por ' + l.seller + '</div>' +
        '<div class="am-listing-stats">' + l.skills.map(function(s){return '<div class="am-listing-stat">' + s + '</div>'}).join('') +
        '<div class="am-listing-stat">Lv.' + l.level + '</div></div></div>' +
        '<div style="text-align:right">' +
        '<div class="am-listing-price">🪙 ' + l.price + '</div>' +
        '<button class="am-listing-btn buy" onclick="buyAgent(\'' + l.id + '\')"' + (canBuy?'':' disabled style="opacity:0.4;cursor:not-allowed"') + '>' + (canBuy?'Comprar':'Sin fondos') + '</button>' +
        '</div></div>';
    }).join('');

  } else if (marketTab === 'sell') {
    var myAgents = AGENTS.filter(function(a){return a.configured});
    body.innerHTML = '<div class="am-sell-form">' +
      '<label>Seleccioná un agente para vender</label>' +
      '<select id="am-sell-agent">' +
      (myAgents.length ? myAgents.map(function(a){return '<option value="' + a.id + '">' + a.emoji + ' ' + a.name + ' (Lv.' + a.level + ')</option>'}).join('') : '<option>No tenés agentes configurados</option>') +
      '</select>' +
      '<label>Precio (monedas)</label>' +
      '<input id="am-sell-price" type="number" min="10" value="100" placeholder="100">' +
      '<label>Tipo de venta</label>' +
      '<select id="am-sell-type">' +
      '<option value="direct">Venta directa</option>' +
      '<option value="auction">Subasta (24 horas)</option>' +
      '</select>' +
      '<button class="am-listing-btn buy" onclick="listAgent()" style="width:100%;margin-top:6px">📤 Publicar en Marketplace</button>' +
      '</div>' +
      '<div class="am-empty" style="padding:16px;font-size:9px;color:#333">Los agentes vendidos se transfieren al comprador.<br>Recibirás las monedas al completarse la venta.</div>';

  } else if (marketTab === 'auctions') {
    var auctions = MARKET_LISTINGS.filter(function(l){return l.type==='auction'});
    body.innerHTML = auctions.length ? auctions.map(function(l) {
      return '<div class="am-listing am-auction">' +
        '<div class="am-listing-icon" style="border-color:' + l.color + '33;background:' + l.color + '08">' + l.emoji + '</div>' +
        '<div class="am-listing-info">' +
        '<div class="am-listing-name" style="color:' + l.color + '">' + l.name + '</div>' +
        '<div class="am-listing-desc">' + l.class + ' — por ' + l.seller + '</div>' +
        '<div class="am-listing-stats">' + l.skills.map(function(s){return '<div class="am-listing-stat">' + s + '</div>'}).join('') +
        '<div class="am-listing-stat">Lv.' + l.level + '</div></div></div>' +
        '<div style="text-align:right">' +
        '<div class="am-listing-price">🪙 ' + l.currentBid + '</div>' +
        '<div class="am-auction-timer">⏱ ' + l.endsIn + ' · ' + l.bids + ' pujas</div>' +
        '<button class="am-listing-btn bid" onclick="bidAgent(\'' + l.id + '\')">🔨 Pujar</button>' +
        '</div></div>';
    }).join('') : '<div class="am-empty">No hay subastas activas</div>';

  } else if (marketTab === 'my') {
    body.innerHTML = '<div class="am-empty">📋 Tus ofertas activas aparecerán aquí<br><br><span style="font-size:9px;color:#333">Publicá un agente en la pestaña "Vender"</span></div>';
  }
}

function buyAgent(listingId) {
  var listing = MARKET_LISTINGS.find(function(l){return l.id === listingId});
  if (!listing) return;
  if (COINS < listing.price) { showToast('No tenés suficientes monedas 🪙', '#ff4444'); return; }

  COINS -= listing.price;
  updateCoinsDisplay();

  // Create agent from listing
  var newAgent = {
    id: 'bought_' + Date.now(),
    name: listing.name,
    emoji: listing.emoji,
    class: listing.class,
    color: listing.color,
    level: listing.level,
    xp: 0, xpMax: listing.level * 250,
    status: 'idle', statusText: 'Recién adquirido',
    configured: true,
    skinColor: '#e8b88a', hairColor: '#2a1a0a', shirtColor: listing.color,
    pantsColor: '#1a1a3a', shoeColor: '#222222', hairStyle: 'short', accessory: 'none',
    stats: {}, skills: listing.skills.map(function(s){return {cat:'Skills',items:[{name:s,icon:'⚡',desc:s,lvl:3,max:5,color:listing.color}]}}),
    equipment: [], currentTask: {name:'Sin tarea',detail:'Configuralo con ⚙️',progress:0},
    log: [{time:new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}),text:'Comprado en marketplace',type:'s'}],
    deskTile: {x:2+Math.floor(Math.random()*5), y:2+Math.floor(Math.random()*5)}
  };

  AGENTS.push(hydrateAgent(newAgent));
  MARKET_LISTINGS = MARKET_LISTINGS.filter(function(l){return l.id !== listingId});
  updCards();
  renderMarket();
  if (!isTestWorld) saveUserState();
  showToast('🎉 ' + listing.name + ' comprado por 🪙' + listing.price, '#00ff88');
}

function bidAgent(listingId) {
  var listing = MARKET_LISTINGS.find(function(l){return l.id === listingId});
  if (!listing) return;
  var minBid = (listing.currentBid || 0) + 10;
  var bid = parseInt(prompt('Ingresá tu puja (mínimo 🪙' + minBid + '):', minBid));
  if (!bid || bid < minBid) { showToast('Puja mínima: 🪙' + minBid, '#ff4444'); return; }
  if (COINS < bid) { showToast('No tenés suficientes monedas', '#ff4444'); return; }
  listing.currentBid = bid;
  listing.bids = (listing.bids||0) + 1;
  renderMarket();
  showToast('🔨 Puja de 🪙' + bid + ' registrada en ' + listing.name, '#ffcc00');
}

function listAgent() {
  var sel = document.getElementById('am-sell-agent');
  var priceEl = document.getElementById('am-sell-price');
  var typeEl = document.getElementById('am-sell-type');
  if (!sel || !sel.value) return;
  var a = AGENTS.find(function(x){return x.id === sel.value});
  if (!a) return;
  var price = parseInt(priceEl.value) || 100;

  showToast('📤 ' + a.name + ' publicado por 🪙' + price + ' — Próximamente con Supabase', '#ffcc00');
  switchMarketTab('my', document.querySelectorAll('.am-tab')[3]);
}

// ====== ROOM CHAT ======
// ====== ROOM CHAT ======
var chatMessages = [];
var MAX_CHAT = 50;

function sendChatMessage() {
  var input = document.getElementById('chat-input');
  var text = input.value.trim();
  if (!text) return;
  input.value = '';
  if(typeof playSound==='function')playSound('message');

  var user = currentUser ? currentUser.username : 'Anon';
  var msg = {
    user: user,
    text: text,
    time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}),
    color: '#00ff88'
  };
  chatMessages.unshift(msg);
  if (chatMessages.length > MAX_CHAT) chatMessages.pop();
  renderChat();

  // Also show as bubble on a random agent
  if (AGENTS.length > 0) {
    var randomAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    randomAgent.chatBubble = {text: text, timer: 240};
  }
}

function renderChat() {
  var el = document.getElementById('chat-messages');
  el.innerHTML = chatMessages.slice(0, 20).map(function(m) {
    return '<div class="chat-msg">' +
      '<span class="chat-msg-user" style="color:' + m.color + '">' + m.user + '</span>' +
      '<span class="chat-msg-time">' + m.time + '</span>' +
      '<div class="chat-msg-text">' + m.text.replace(/</g,'&lt;') + '</div></div>';
  }).join('');
}

// Chat enter key
document.addEventListener('DOMContentLoaded', function() {
  var ci = document.getElementById('chat-input');
  if (ci) ci.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendChatMessage();
  });
});

// Simulated chat messages from agents (in test mode)
function tickChat() {
  if (!isTestWorld) return;
  if (Math.random() < 0.003 && AGENTS.length > 0) {
    var a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    var msgs = ['¿Alguien revisó el PR?', 'Deploy en 5 min', 'LGTM 👍', 'Necesito café ☕', 'Bug encontrado en prod 🐛', 'Sprint terminado 🎉', 'Quién hace code review?', 'Merge conflict otra vez...', 'Tests pasando ✅', 'Documentación actualizada'];
    var text = msgs[Math.floor(Math.random() * msgs.length)];
    chatMessages.unshift({user: a.name, text: text, time: new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}), color: a.color});
    if (chatMessages.length > MAX_CHAT) chatMessages.pop();
    renderChat();
    if(typeof playSound==='function')playSound('notification');
  }
}

// ====== AGENT CONFIG + WEBHOOKS ======
// ====== AGENT CONFIG + WEBHOOKS ======
var configAgent = null;

function openAgentConfig(agentId) {
  var a = AGENTS.find(function(x){return x.id === agentId});
  if (!a) return;
  configAgent = a;
  document.getElementById('ac-agent-name').textContent = '⚙️ ' + a.name;

  var cfg = a.webhookConfig || {};
  var body = document.getElementById('ac-body');
  body.innerHTML = '<div class="ac-section">' +
    '<div class="ac-section-title">📋 Tarea del Agente</div>' +
    '<div class="ac-field"><label>Nombre de la tarea</label>' +
    '<input id="ac-task-name" value="' + (cfg.taskName||'').replace(/"/g,'&quot;') + '" placeholder="Ej: Monitorear servidor"></div>' +
    '<div class="ac-field"><label>Descripción</label>' +
    '<textarea id="ac-task-desc" placeholder="Qué hace este agente...">' + (cfg.taskDesc||'') + '</textarea></div>' +
    '<div class="ac-field"><label>Rol / Clase</label>' +
    '<input id="ac-role" value="' + (cfg.role||a.class||'').replace(/"/g,'&quot;') + '" placeholder="Ej: Backend Developer"></div>' +
    '</div>' +
    '<div class="ac-section">' +
    '<div class="ac-section-title">🔗 Webhook (opcional)</div>' +
    '<div class="ac-field"><label>URL del webhook</label>' +
    '<input id="ac-webhook-url" value="' + (cfg.webhookUrl||'').replace(/"/g,'&quot;') + '" placeholder="https://tu-api.com/agent-status">' +
    '<div class="ac-hint">El agente hará GET a esta URL periódicamente para obtener su estado</div></div>' +
    '<div class="ac-field"><label>Intervalo de consulta</label>' +
    '<select id="ac-webhook-interval">' +
    '<option value="60"' + (cfg.interval==60?' selected':'') + '>Cada 1 minuto</option>' +
    '<option value="300"' + (cfg.interval==300||!cfg.interval?' selected':'') + '>Cada 5 minutos</option>' +
    '<option value="900"' + (cfg.interval==900?' selected':'') + '>Cada 15 minutos</option>' +
    '<option value="3600"' + (cfg.interval==3600?' selected':'') + '>Cada 1 hora</option>' +
    '</select></div>' +
    '<div class="ac-field"><label>Headers (JSON, opcional)</label>' +
    '<input id="ac-webhook-headers" value="' + (cfg.headers||'').replace(/"/g,'&quot;') + '" placeholder="Authorization: Bearer xxx"></div>' +
    '<button class="ac-btn secondary" onclick="testWebhook()" style="margin-top:4px">🧪 Probar webhook</button>' +
    '<div class="ac-test-result" id="ac-test-result"></div>' +
    '</div>' +
    '<div class="ac-section">' +
    '<div class="ac-section-title">📊 Formato de respuesta esperado</div>' +
    '<div class="ac-hint" style="padding:10px;background:#0a0a14;border-radius:8px;line-height:1.8;color:#555">' +
    'El webhook debe responder JSON con:<br>' +
    '<span style="color:#00ff88">status</span>: "working" | "idle" | "done" | "error"<br>' +
    '<span style="color:#00ff88">message</span>: "Texto del estado actual"<br>' +
    '<span style="color:#00ff88">progress</span>: 0-100 (opcional)<br><br>' +
    'Ejemplo: {"status":"working","message":"Procesando datos...","progress":45}' +
    '</div></div>';

  // Show current status
  if (cfg.lastCheck) {
    var statusDot = a.status === 'working' ? '#00ff88' : a.status === 'error' ? '#ff4444' : '#ffaa00';
    var statusHtml = '<div class="ac-status-row"><div class="ac-status-dot" style="background:' + statusDot + '"></div>' +
      '<div class="ac-status-text">' + (a.statusText||'Sin estado') + '</div>' +
      '<div class="ac-status-time">Último check: ' + new Date(cfg.lastCheck).toLocaleTimeString() + '</div></div>';
    body.innerHTML = statusHtml + body.innerHTML;
  }

  document.getElementById('agent-config').classList.add('open');
  document.getElementById('agent-config').style.display = 'flex';
}

function closeAgentConfig() {
  configAgent = null;
  document.getElementById('agent-config').classList.remove('open');
  document.getElementById('agent-config').style.display = 'none';
}

function saveAgentConfig() {
  if (!configAgent) return;
  var taskName = document.getElementById('ac-task-name').value.trim();
  var taskDesc = document.getElementById('ac-task-desc').value.trim();
  var role = document.getElementById('ac-role').value.trim();
  var webhookUrl = document.getElementById('ac-webhook-url').value.trim();
  var interval = parseInt(document.getElementById('ac-webhook-interval').value) || 300;
  var headers = document.getElementById('ac-webhook-headers').value.trim();

  configAgent.webhookConfig = {
    taskName: taskName,
    taskDesc: taskDesc,
    role: role,
    webhookUrl: webhookUrl,
    interval: interval,
    headers: headers,
    lastCheck: configAgent.webhookConfig ? configAgent.webhookConfig.lastCheck : null
  };

  // Update agent display
  if (taskName) {
    configAgent.currentTask = { name: taskName, detail: taskDesc || role, progress: 0 };
    configAgent.configured = true;
    configAgent.status = webhookUrl ? 'working' : 'idle';
    configAgent.statusText = webhookUrl ? 'Conectando...' : taskName;
    if (role) configAgent.class = role;
  }

  updCards();
  updateImportPulse();
  if (!isTestWorld) saveUserState();
  closeAgentConfig();
  showToast('💾 ' + configAgent.name + ' configurado', '#00ff88');

  // Trigger first webhook check if URL provided
  if (webhookUrl) {
    setTimeout(function() { checkAgentWebhook(configAgent); }, 500);
  }
}

function resetAgentConfig() {
  if (!configAgent) return;
  configAgent.webhookConfig = null;
  configAgent.configured = false;
  configAgent.status = 'idle';
  configAgent.statusText = 'Esperando instrucciones';
  configAgent.currentTask = { name: 'Sin tarea', detail: '—', progress: 0 };
  updCards();
  if (!isTestWorld) saveUserState();
  closeAgentConfig();
  showToast('🔄 ' + configAgent.name + ' reseteado', '#ffcc00');
}

async function testWebhook() {
  var url = document.getElementById('ac-webhook-url').value.trim();
  var headersStr = document.getElementById('ac-webhook-headers').value.trim();
  var resultEl = document.getElementById('ac-test-result');

  if (!url) { resultEl.className = 'ac-test-result err'; resultEl.textContent = '❌ Ingresá una URL'; return; }

  resultEl.className = 'ac-test-result'; resultEl.style.display = 'block';
  resultEl.style.background = '#1a1a2e'; resultEl.style.color = '#888';
  resultEl.textContent = '⏳ Probando...';

  try {
    var opts = { method: 'GET', headers: {} };
    if (headersStr) {
      try { opts.headers = JSON.parse(headersStr); } catch(e) {}
    }
    var resp = await fetch(url, opts);
    var data = await resp.json();

    if (data.status && data.message) {
      resultEl.className = 'ac-test-result ok';
      resultEl.textContent = '✅ OK — status: ' + data.status + ' — ' + data.message + (data.progress != null ? ' (' + data.progress + '%)' : '');
    } else {
      resultEl.className = 'ac-test-result err';
      resultEl.textContent = '⚠️ Respuesta sin formato esperado: ' + JSON.stringify(data).slice(0, 100);
    }
  } catch(e) {
    resultEl.className = 'ac-test-result err';
    resultEl.textContent = '❌ Error: ' + e.message;
  }
}

// Periodic webhook checker
async function checkAgentWebhook(a) {
  if (!a.webhookConfig || !a.webhookConfig.webhookUrl) return;
  try {
    var opts = { method: 'GET', headers: {} };
    if (a.webhookConfig.headers) {
      try { opts.headers = JSON.parse(a.webhookConfig.headers); } catch(e) {}
    }
    var resp = await fetch(a.webhookConfig.webhookUrl, opts);
    var data = await resp.json();
    a.webhookConfig.lastCheck = Date.now();

    if (data.status) {
      a.status = data.status === 'done' ? 'idle' : data.status;
      a.statusText = data.message || a.webhookConfig.taskName;
      if (data.progress != null) a.currentTask.progress = data.progress;
      if (data.status === 'done') {
        a.currentTask.progress = 100;
        showToast('✅ ' + a.name + ': tarea completada!', '#00ff88');
      }
    }
    updCards();
  } catch(e) {
    a.status = 'idle';
    a.statusText = 'Webhook error';
    updCards();
  }
}

// Check all webhooks periodically
function tickWebhooks() {
  AGENTS.forEach(function(a) {
    if (!a.webhookConfig || !a.webhookConfig.webhookUrl) return;
    var interval = (a.webhookConfig.interval || 300) * 60; // convert to ticks (60fps)
    var lastCheck = a.webhookConfig.lastCheck || 0;
    var elapsed = (Date.now() - lastCheck) / 1000;
    if (elapsed >= (a.webhookConfig.interval || 300)) {
      checkAgentWebhook(a);
    }
  });
}

// ====== IMPORT GUIDE ======
// ====== IMPORT GUIDE ======
function handleImportClick() {
  // En Live sin agentes configurados: mostrar guía primero
  if (!isTestWorld && !AGENTS.some(a => a.configured === true)) {
    openImportGuide();
  } else {
    importAgentsFile();
  }
}
function openImportGuide() {
  document.getElementById('import-guide').classList.add('open');
  document.getElementById('import-guide').style.display = 'flex';
}
function closeImportGuide() {
  document.getElementById('import-guide').classList.remove('open');
  document.getElementById('import-guide').style.display = 'none';
}

// Activar pulse en botón importar cuando hay agentes sin configurar
function updateImportPulse() {
  var btn = document.getElementById('importBtn');
  if (!btn) return;
  var needsPulse = !isTestWorld && !AGENTS.some(function(a){return a.configured===true});
  btn.classList.toggle('pulse-import', needsPulse);
}

// ====== ONBOARDING ======
// ====== ONBOARDING SYSTEM v2 ======
// Bloqueante — el usuario DEBE completar todos los pasos
const ONBOARD_STEPS = [
  {
    icon: '🏨',
    title: 'Bienvenido a Agents Hotel',
    subtitle: 'Tu oficina virtual de agentes IA',
    text: 'Esta es tu oficina. Está vacía porque <b>recién empezás</b>.<br>Vamos a configurar todo paso a paso.',
    hint: null,
    color: '#00ff88'
  },
  {
    icon: '🤖',
    title: 'Paso 1: Importá tus Agentes',
    subtitle: 'Sin agentes no hay negocio',
    text: 'Usá el botón <b>📂 Importar</b> en la barra de abajo para cargar tu archivo <b>agents.json</b>.',
    hint: '💡 Cada agente necesita: nombre, rol, skills y stats.<br>Podés crear el JSON o exportarlo desde tu sistema.',
    color: '#00aaff'
  },
  {
    icon: '💰',
    title: 'Paso 2: Economía de Trabajo',
    subtitle: 'Tus agentes generan monedas',
    text: 'Los agentes ganan <span class="coin">🪙 3 monedas</span> cada <b>15 minutos</b> de trabajo.<br>Los agentes <b style="color:#ff4444">IDLE no generan nada</b>.',
    hint: '💡 Subir de nivel da bonus de monedas.<br>Mantené a tus agentes activos para ganar más rápido.',
    color: '#ffcc00'
  },
  {
    icon: '🛍️',
    title: 'Paso 3: La Tienda',
    subtitle: 'Personalizá tu oficina',
    text: 'Con las monedas comprá muebles en la <b>🛍️ Tienda</b>.<br>Arrastrá muebles con el modo <b>🛋️ Editor</b>.<br>Activá <b>🪑 Habbo Furni</b> para sprites reales.',
    hint: '💡 Hay +100 muebles: sillas, mesas, computadoras,<br>estanterías, plantas, lámparas y más.',
    color: '#ff66ff'
  },
  {
    icon: '🌍',
    title: 'Mostrá tu Proyecto',
    subtitle: 'Tu oficina es tu vitrina',
    text: 'Otros usuarios van a poder ver cómo trabajan<br>tus agentes, tu equipo y tu proyecto.<br><b>¡Armá la mejor oficina!</b>',
    hint: '🚀 Próximamente: salas públicas, marketplace<br>de agentes IA y networking entre usuarios.',
    color: '#00ff88'
  }
];

let onboardStep = 0;
let onboardActive = false;

function showOnboarding() {
  console.log('[AH] showOnboarding called');
  var _obCheck = document.getElementById('onboard-body');
  if (!_obCheck) { console.error('[AH] onboard-body not found!'); return; }
  onboardStep = 0;
  onboardActive = true;
  try { renderOnboardStep(); } catch(e) { console.error("[AH] onboard render error:", e); }
  const _ob=document.getElementById('onboard-overlay');_ob.classList.add('open');_ob.style.display='flex';
}

function renderOnboardStep() {
  const s = ONBOARD_STEPS[onboardStep];
  const total = ONBOARD_STEPS.length;

  document.getElementById('onboard-counter').textContent = 'PASO ' + (onboardStep + 1) + ' / ' + total;
  document.getElementById('onboard-counter').style.borderColor = s.color + '55';
  document.getElementById('onboard-counter').style.color = s.color;
  document.getElementById('onboard-title').textContent = s.title;
  document.getElementById('onboard-title').style.color = s.color;
  document.getElementById('onboard-subtitle').textContent = s.subtitle;

  let bodyHtml = '<div class="onboard-icon">' + s.icon + '</div>';
  bodyHtml += '<div class="onboard-text">' + s.text + '</div>';
  if (s.hint) bodyHtml += '<div class="onboard-hint">' + s.hint + '</div>';
  document.getElementById('onboard-body').innerHTML = bodyHtml;

  // Dots
  let dots = '';
  for (let i = 0; i < total; i++) {
    const cls = i === onboardStep ? ' active' : (i < onboardStep ? ' done' : '');
    dots += '<div class="onboard-dot' + cls + '"></div>';
  }
  document.getElementById('onboard-dots').innerHTML = dots;

  // Buttons — NO hay "Saltar", hay que completar todos los pasos
  const isLast = onboardStep === total - 1;
  const isFirst = onboardStep === 0;
  let btns = '';
  if (!isFirst) btns += '<button class="onboard-btn secondary" onclick="onboardPrev()">← Atrás</button>';
  if (isLast) {
    btns += '<button class="onboard-btn primary" onclick="onboardDone()">¡Empezar! 🚀</button>';
  } else {
    btns += '<button class="onboard-btn primary" onclick="onboardNext()">Siguiente →</button>';
  }
  document.getElementById('onboard-actions').innerHTML = btns;
}

function onboardNext() { if (onboardStep < ONBOARD_STEPS.length - 1) { onboardStep++; renderOnboardStep(); } }
function onboardPrev() { if (onboardStep > 0) { onboardStep--; renderOnboardStep(); } }
function onboardDone() {
  var _obEl=document.getElementById('onboard-overlay');_obEl.classList.remove('open');_obEl.style.display='none';
  onboardActive = false;
  if (currentUser && currentUser.username) {
    localStorage.setItem('agentsHotel_onboard_' + currentUser.username, '1');
  }
}

// ====== RPG SHEET + AGENT CARDS + INFO ======
// =============================================
// UI (RPG Sheet)
// =============================================
function openSheet(a){
  sheetAgent=a;
  hideAgentInfo();
  document.getElementById('rpg-modal').classList.add('open');
  renderSheet(a,'stats');
}
function closeSheet(){document.getElementById('rpg-modal').classList.remove('open');sheetAgent=null}
function switchTab(t){if(sheetAgent)renderSheet(sheetAgent,t)}
function renderSheet(a,at){const se=Object.entries(a.stats);document.getElementById('rps').innerHTML=`
<div class="sh"><div class="sa" style="background:${a.color}15;border-color:${a.color}">${a.emoji}<div class="lb">Lv.${a.level}</div></div>
<div class="si"><div class="sn" style="color:${a.color}">${a.name}</div><div class="sc">${a.class}</div>
<div class="xc"><div class="xl"><span>EXP</span><span>${a.xp}/${a.xpMax}</span></div><div class="xb"><div class="xf" style="width:${(a.xp/a.xpMax)*100}%;background:linear-gradient(90deg,${a.color},${lgt(a.color,40)})"></div></div></div></div>
<button class="cbx" onclick="closeSheet()">X</button></div>
<div class="tabs"><div class="tab ${at==='stats'?'a':''}" onclick="switchTab('stats')">Stats</div><div class="tab ${at==='skills'?'a':''}" onclick="switchTab('skills')">Skills</div><div class="tab ${at==='equip'?'a':''}" onclick="switchTab('equip')">Equip</div><div class="tab ${at==='log'?'a':''}" onclick="switchTab('log')">Log</div></div>
<div class="sb2">
<div class="tc ${at==='stats'?'a':''}"><div class="cs"><div class="ct">MISION ACTUAL</div><div class="ck">${a.currentTask.name}</div><div class="cd">${a.currentTask.detail}</div><div style="margin-top:8px"><div class="xl"><span>Progreso</span><span>${a.currentTask.progress}%</span></div><div class="xb"><div class="xf" style="width:${a.currentTask.progress}%;background:${a.color}"></div></div></div></div>
<div class="sg">${se.map(([k,s2])=>`<div class="stb"><div class="hd"><span class="la">${s2.label}</span><span class="va" style="color:${s2.color}">${s2.val}</span></div><div class="bb"><div class="bf" style="width:${s2.val}%;background:${s2.color}"></div></div></div>`).join('')}</div></div>
<div class="tc ${at==='skills'?'a':''}">${a.skills.map(c=>`<div class="sca"><div class="sct">${c.cat}</div><div class="sl">${c.items.map(sk=>`<div class="sr"><div class="ski" style="background:${sk.color}10;border-color:${sk.color}40">${sk.icon}</div><div style="flex:1"><div class="skn">${sk.name}</div><div class="skd">${sk.desc}</div></div><div class="skl">${Array.from({length:sk.max},(_,i)=>`<div class="pip ${i<sk.lvl?'f':''}" style="--pc:${sk.color}"></div>`).join('')}</div></div>`).join('')}</div></div>`).join('')}</div>
<div class="tc ${at==='equip'?'a':''}"><div class="eg">${a.equipment.map(eq=>`<div class="es"><div class="ei" style="border-color:${RC[eq.rarity]}40;background:${RC[eq.rarity]}08">${eq.icon}</div><div style="flex:1"><div class="esn">${eq.slot}</div><div class="ein r${eq.rarity[0]}">${eq.name}</div><div class="eid">${eq.desc}</div></div></div>`).join('')}</div></div>
<div class="tc ${at==='log'?'a':''}"><div class="ll">${a.log.map(l=>`<div class="li t${l.type}"><div class="lt">${l.time}</div><div class="lx">${l.text}</div></div>`).join('')}</div></div>
</div>`}

function updCards(){
  document.getElementById('panel').innerHTML=AGENTS.map(a=>`
  <div class="pc" style="--ac:${a.color}" onclick="showAgentInfo(AGENTS.find(x=>x.id==='${a.id}'))">
    <div class="av" style="background:${a.color}15;border-color:${a.color}40">${a.emoji}</div>
    <div style="flex:1;min-width:0">
      <div class="nm">${a.name}</div>
      <div class="st"><span class="sd" style="background:${SC[a.status]}"></span>${a.statusText}${(!isTestWorld&&a.status==="idle")?"<span class=idle-tag style=margin-left:4px>IDLE</span>":""}</div>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <div class="lv">${a.level}</div>
      <button onclick="event.stopPropagation();openAppEditor(AGENTS.find(x=>x.id==='${a.id}'))" style="background:none;border:1px solid #222;color:#444;font-size:10px;width:22px;height:22px;border-radius:4px;cursor:pointer;flex-shrink:0;padding:0;transition:all .15s" onmouseover="this.style.borderColor='#00ff88';this.style.color='#00ff88'" onmouseout="this.style.borderColor='#222';this.style.color='#444'">E</button>
    </div>
  </div>`).join('')
}

function addLog(a){const log=document.getElementById('al'),t=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});const e=document.createElement('div');e.className='ae';e.innerHTML=`<span class="at">${t}</span> <span class="an" style="color:${a.color}">${a.name}</span> - ${a.statusText}`;log.prepend(e);while(log.children.length>15)log.removeChild(log.lastChild)}

function showAgentInfo(a){
  infoAgent=a;
  hideFurnInfo();
  const el=document.getElementById('agent-info');
  el.classList.add('open');
  // Habbo avatar URL for card preview
  const _fig=a.figureCode||HABBO_FIGURES[a.id]||'hd-180-1.hr-110-61.ch-255-82.lg-280-82.sh-300-91';
  const _avatarUrl='https://www.habbo.com/habbo-imaging/avatarimage?figure='+_fig+'&direction=2&action=std&size=l';
  el.innerHTML=`<div class="ai-card">
    <div class="ai-top" style="padding:12px 14px;gap:12px">
      <div style="width:64px;height:90px;background:#0c0c1a;border:2px solid ${a.color};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
        <img src="${_avatarUrl}" style="width:56px;height:80px;object-fit:contain;image-rendering:pixelated" alt="${a.name}">
      </div>
      <div class="ai-info" style="flex:1">
        <div class="ai-name" style="color:${a.color};font-size:14px">${a.name}</div>
        <div class="ai-class" style="font-size:11px;margin-top:2px">${a.class}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <div class="ai-lvl" style="font-size:12px">Lv.${a.level}</div>
          <div class="sd" style="background:${SC[a.status]};width:8px;height:8px"></div>
          <span style="font-size:11px;color:#888">${a.status==='idle'?'Disponible':a.status==='working'?'Trabajando':a.status==='thinking'?'Pensando':'Leyendo'}</span>
        </div>
      </div>
      <button onclick="hideAgentInfo()" style="background:none;border:1px solid #333;color:#666;font-size:12px;width:24px;height:24px;border-radius:4px;cursor:pointer;padding:0;align-self:flex-start" onmouseover="this.style.borderColor='#ff4444';this.style.color='#ff4444'" onmouseout="this.style.borderColor='#333';this.style.color='#666'">✕</button>
    </div>
    <div class="ai-body" style="padding:10px 14px">
      <div class="ai-task" style="font-size:11px;margin-bottom:6px">${a.currentTask.name} — ${a.currentTask.detail}</div>
      <div class="ai-progress"><div class="ai-progress-fill" style="width:${a.currentTask.progress}%;background:${a.color}"></div></div>
    </div>
    <div class="ai-actions" style="padding:8px 14px;gap:6px">
      <div class="ai-act-btn" onclick="openAgentConfig('${a.id}')">⚙️ Config</div>
      <div class="ai-act-btn" onclick="renameAgent('${a.id}')">✏️ Nombre</div>
      <div class="ai-act-btn" onclick="openSheet(AGENTS.find(x=>x.id==='${a.id}'))">📋 Ficha</div>
      <div class="ai-act-btn" onclick="openAppEditor(AGENTS.find(x=>x.id==='${a.id}'))">👤 Avatar</div>
    </div>
  </div>`;
}
function hideAgentInfo(){document.getElementById('agent-info').classList.remove('open');infoAgent=null}

// ====== CONTEXT MENU + ACTIONS ======
let ctxMenuAgent=null;
function showCtxMenu(a,screenX,screenY){
  ctxMenuAgent=a;
  showAgentInfo(a);
  const el=document.getElementById('ctx-menu');
  el.classList.add('open');
  const menuW=150,menuH=180;
  // Position above agent's head (not where clicked)
  var _aIso=isoXY(a.pos.x,a.pos.y);
  var _aSc=w2s(_aIso.x,_aIso.y);
  var _aS=zm*0.72;
  var _headY=_aSc.y-50*_aS; // well above agent head + bubbles
  let mx=_aSc.x-menuW/2;
  let my=_headY-menuH-20;
  if(mx<8)mx=8;if(mx+menuW>W-8)mx=W-menuW-8;
  if(my<8)my=_headY+20;
  el.style.left=mx+'px';el.style.top=my+'px';
  const aid=a.id;
  el.innerHTML=`<div class="cm-box">
    <div class="cm-name" style="color:${a.color}">${a.name}</div>
    <div class="cm-item" onclick="closeCtxMenu();openAgentConfig('${aid}')">⚙️ Configurar</div>
    <div class="cm-item" onclick="closeCtxMenu();openSheet(AGENTS.find(x=>x.id==='${aid}'))">📋 Ver Ficha RPG</div>
    <div class="cm-item" onclick="closeCtxMenu();openAppEditor(AGENTS.find(x=>x.id==='${aid}'))">👤 Avatar</div>
    <div class="cm-sep"></div>
    <div class="cm-item" onclick="closeCtxMenu();triggerAction(AGENTS.find(x=>x.id==='${aid}'),'wave')">👋 Saludar</div>
    <div class="cm-item" onclick="closeCtxMenu();triggerAction(AGENTS.find(x=>x.id==='${aid}'),'dance')">💃 Bailar</div>
    <div class="cm-item" onclick="closeCtxMenu();triggerAction(AGENTS.find(x=>x.id==='${aid}'),'coffee')">☕ Ir al Café</div>
    <div class="cm-arrow"></div>
  </div>`;
}
function closeCtxMenu(){document.getElementById('ctx-menu').classList.remove('open');ctxMenuAgent=null}
function triggerAction(a,action){
  if(action==='wave'){a.actionAnim={type:'wave',frame:0,maxFrames:90};a.statusText='Saludando!';a.status='idle'}
  else if(action==='dance'){a.actionAnim={type:'dance',frame:0,maxFrames:120};a.statusText='Bailando!';a.status='idle'}
  else if(action==='coffee'){a.state='walking';a.targetPos={x:14,y:7};a.status='idle';a.statusText='Yendo al cafe'}
  updCards();addLog(a);
}

// ====== HIT DETECTION ======
function getAt(mx,my){for(let i=AGENTS.length-1;i>=0;i--){const a=AGENTS[i];if(a._sx===undefined)continue;if(Math.abs(mx-a._sx)<15*a._z&&my>a._sy-25*a._z&&my<a._sy+30*a._z)return a}return null}

function getFurnAt(mx,my){
  for(let i=FURN.length-1;i>=0;i--){
    const f=FURN[i];
    if(f.t==='rug')continue;
    const fi=isoXY(f.x,f.y),fs=w2s(fi.x,fi.y);
    if(Math.abs(mx-fs.x)<15*zm&&Math.abs(my-fs.y)<25*zm)return f;
  }
  return null;
}

// ====== EDIT MODE + CONTROLS ======
// =============================================
// EDIT MODE (Furniture Drag)
// =============================================
function toggleEditMode(){
  editMode=!editMode;
  const eb=document.getElementById('editBtn');
  if(eb)eb.classList.toggle('active',editMode);
  dragFurn=null;
}

// =============================================
// CONTROLS
// =============================================
C.addEventListener('mousedown',e=>{
  closeCtxMenu();
  if(editMode){
    const f=getFurnAt(e.clientX,e.clientY);
    if(f){
      dragFurn=f;
      drag=false;
      return;
    }
  }
  drag=true;dm=false;dsx=e.clientX;dsy=e.clientY;csx=cx;csy=cy;
});
C.addEventListener('mousemove',e=>{
  hovTile=screenToTile(e.clientX,e.clientY);
  if(editMode&&dragFurn){
    const t=screenToTile(e.clientX,e.clientY);
    if(MAP[t.y]?.[t.x]>0){
      dragFurn.x=t.x;dragFurn.y=t.y;
    }
    return;
  }
  if(drag){const dx=e.clientX-dsx,dy=e.clientY-dsy;if(Math.abs(dx)>3||Math.abs(dy)>3)dm=true;cx=csx+dx/zm;cy=csy+dy/zm}
  hov=getAt(e.clientX,e.clientY);
  C.style.cursor=editMode?(getFurnAt(e.clientX,e.clientY)?'move':'default'):(hov?'pointer':'grab');
});
let selectedAgent=null; // agente seleccionado para mover
C.addEventListener('mouseup',e=>{
  if(editMode&&dragFurn){dragFurn=null;editMode=false;C.style.cursor='grab';return}
  if(!dm){
    const a=getAt(e.clientX,e.clientY);
    if(a){
      showCtxMenu(a,e.clientX,e.clientY);hideFurnInfo();
      // Seleccionar agente para moverlo
      selectedAgent=a;
    }
    else{
      const f=getFurnAt(e.clientX,e.clientY);
      if(f&&f.t!=='rug'){showFurnInfo(f);closeCtxMenu();hideAgentInfo()}
      else{
        // Click en tile vacío: si hay agente seleccionado idle, moverlo ahí
        const tile=screenToTile(e.clientX,e.clientY);
        if(selectedAgent && (selectedAgent.status==='idle'||selectedAgent.state==='standing') && MAP[tile.y]?.[tile.x]>0){
          selectedAgent.state='walking';
          selectedAgent.targetPos={x:tile.x,y:tile.y};
          showToast('🚶 '+selectedAgent.name+' se mueve','#00ccff');
          closeCtxMenu();hideAgentInfo();
        } else {
          closeCtxMenu();hideAgentInfo();hideFurnInfo();
          selectedAgent=null;
        }
      }
    }
  }drag=false;dm=false;
});
C.addEventListener('mouseleave',()=>{drag=false;hov=null;hovTile=null;if(editMode)dragFurn=null});
C.addEventListener('wheel',e=>{e.preventDefault();e.deltaY<0?zoomIn():zoomOut()},{passive:false});
C.addEventListener('touchstart',e=>{if(e.touches.length===1){drag=true;dm=false;dsx=e.touches[0].clientX;dsy=e.touches[0].clientY;csx=cx;csy=cy}});
C.addEventListener('touchmove',e=>{e.preventDefault();if(e.touches.length===1&&drag){const dx=e.touches[0].clientX-dsx,dy=e.touches[0].clientY-dsy;if(Math.abs(dx)>3||Math.abs(dy)>3)dm=true;cx=csx+dx/zm;cy=csy+dy/zm}},{passive:false});
C.addEventListener('touchend',e=>{if(!dm&&e.changedTouches.length===1){const t=e.changedTouches[0];const a=getAt(t.clientX,t.clientY);if(a){showCtxMenu(a,t.clientX,t.clientY)}else{closeCtxMenu();hideAgentInfo()}}drag=false;dm=false});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(onboardActive)return;if(configAgent){closeAgentConfig();return;}if(document.getElementById('agent-market').classList.contains('open')){closeMarket();return;}if(navOpen){closeNavigator();return;}closeShop();if(document.getElementById('inv-modal').classList.contains('open'))closeInventory();else if(appEditorOpen)closeAppEditor();else if(document.getElementById('rpg-modal').classList.contains('open'))closeSheet();else if(document.getElementById('ctx-menu').classList.contains('open'))closeCtxMenu();else{hideAgentInfo();hideFurnInfo()}}
  if(e.key>='1'&&e.key<='5'){const a=AGENTS[parseInt(e.key)-1];if(a)showAgentInfo(a)}
  if(e.key==='Delete'&&editMode&&dragFurn){
    const idx=FURN.indexOf(dragFurn);
    if(idx>-1)FURN.splice(idx,1);
    dragFurn=null;
  }
});

// ====== TOOLBAR ACTIONS ======
// Toolbar actions
function quickAppearance(){
  const a=infoAgent||AGENTS[0];
  openAppEditor(a);
}
let panelVisible=true;
function togglePanel(){
  panelVisible=!panelVisible;
  document.getElementById('panel').style.display=panelVisible?'flex':'none';
  document.querySelector('#toolbar .tb-btn:nth-child(3)').classList.toggle('active',!panelVisible);
}

