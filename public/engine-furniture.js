// =============================================
// ENGINE-FURNITURE.JS — Shop, Inventory, Furni Rendering, Economy
// =============================================

// ====== SHOP SYSTEM ======
let COINS = 500;
let shopFilter = 'all';

const SHOP_ITEMS = [
  // ── Sillas & Sofás ──
  {id:'hf-cosysofa',     t:'couch', name:'Cosy Sofa',             desc:'Sofá clásico y cómodo',                price:150, cat:'seating', habboClass:'hygge_c25_sofa',         badge:'habbo'},
  {id:'hf-cosyarm',      t:'chair', name:'Cosy Armchair',         desc:'Sillón acogedor',                      price:90,  cat:'seating', habboClass:'hygge_c25_armchair',      badge:'habbo'},
  {id:'hf-compchair',    t:'chair', name:'Computer Chair',        desc:'Silla giratoria de oficina',           price:75,  cat:'seating', habboClass:'waasa_chair',             badge:'habbo'},
  {id:'hf-gamerchair',   t:'chair', name:'Gamer Chair',           desc:'Silla gamer retro Polyfon',            price:120, cat:'seating', habboClass:'nft_h26_drpgamingchair',  badge:'habbo'},
  {id:'hf-coffeechair',  t:'chair', name:'Coffee Chair',          desc:'Silla de cafetería parisina',          price:65,  cat:'seating', habboClass:'paris_c15_chair',         badge:'habbo'},
  {id:'hf-goldchair',    t:'chair', name:'Gold Dining Chair',     desc:'Silla dorada de lujo',                 price:200, cat:'seating', habboClass:'mode_gold_diningchair',   badge:'habbo'},
  {id:'hf-directorchair',t:'chair', name:'Director Chair',        desc:'Silla de director de cine',            price:110, cat:'seating', habboClass:'nft_cine_starchair',      badge:'habbo'},
  {id:'hf-rattanblue',   t:'chair', name:'Rattan Blue',           desc:'Silla de ratán azul',                  price:55,  cat:'seating', habboClass:'recycler_chairblue',      badge:'habbo'},
  {id:'hf-rattanpink',   t:'chair', name:'Rattan Pink',           desc:'Silla de ratán rosa',                  price:55,  cat:'seating', habboClass:'recycler_chairpink',      badge:'habbo'},
  {id:'hf-hangchair',    t:'chair', name:'Hanging Lounger',       desc:'Silla colgante para relax',            price:140, cat:'seating', habboClass:'hygge_c25_hangingchair',  badge:'habbo'},
  {id:'hf-palmchair',    t:'chair', name:'Palm Chair',            desc:'Silla tropical de palmera',            price:80,  cat:'seating', habboClass:'nft_rclr_chair',          badge:'habbo'},
  {id:'hf-gardenchair',  t:'chair', name:'Garden Chair',          desc:'Silla de jardín exterior',             price:50,  cat:'seating', habboClass:'ducket_c25_brchair',      badge:'habbo'},
  {id:'hf-clubsofa',     t:'couch', name:'Club Sofa',             desc:'Sofá de club nocturno',                price:130, cat:'seating', habboClass:'nft_a0club_sofa',         badge:'habbo'},
  {id:'hf-comfycouch',   t:'couch', name:'Comfy Couch',           desc:'Sofá super cómodo para lobby',         price:160, cat:'seating', habboClass:'ads_aftv_sofa',           badge:'habbo'},
  {id:'hf-pillowsofa',   t:'couch', name:'Pillow Sofa',           desc:'Sofá de almohadones apilados',         price:170, cat:'seating', habboClass:'nft_h26_pillowssofa',     badge:'habbo'},
  {id:'hf-patchorange',  t:'couch', name:'Patchwork Orange',      desc:'Sofá patchwork naranja vintage',       price:95,  cat:'seating', habboClass:'recycler_patchsofaorange',badge:'habbo'},
  {id:'hf-patchpink',    t:'couch', name:'Patchwork Pink',        desc:'Sofá patchwork rosa vintage',          price:95,  cat:'seating', habboClass:'recycler_patchsofapink',  badge:'habbo'},
  {id:'hf-checksofa',    t:'couch', name:'Checkered Sofa',        desc:'Sofá a cuadros retro navideño',        price:115, cat:'seating', habboClass:'xmas_c24_doublesofa',     badge:'habbo'},
  {id:'hf-hcsofa',       t:'couch', name:'HC Ultra Modern Sofa',  desc:'Sofá exclusivo HC ultra moderno',      price:250, cat:'seating', habboClass:'hc26_5',                  badge:'habbo'},
  {id:'hf-polarsofa',    t:'couch', name:'Polar Sofa',            desc:'Sofá polar invernal',                  price:140, cat:'seating', habboClass:'nft_rclr_sofa',           badge:'habbo'},
  {id:'hf-throne',       t:'chair', name:'Throne Sofa',           desc:'Trono majestuoso para el jefe',        price:300, cat:'seating', habboClass:'nft_hcsohva',             badge:'habbo'},
  {id:'hf-redcouch',     t:'couch', name:'Red Couch',             desc:'Sofá rojo pixel clásico',              price:80,  cat:'seating', habboClass:'pixel_couch_red',         badge:'habbo'},
  {id:'hf-lipsofa',      t:'couch', name:'Lip Sofa',              desc:'Sofá HC con forma de labios',          price:220, cat:'seating', habboClass:'hc24_12',                 badge:'habbo'},

  // ── Mesas ──
  {id:'hf-coffeetable',  t:'table', name:'Marble Coffee Table',   desc:'Mesa de café con tapa de mármol',      price:85,  cat:'tables',  habboClass:'hygge_c25_coffeetable',   badge:'habbo'},
  {id:'hf-sidetable',    t:'table', name:'Oval Side Table',       desc:'Mesita auxiliar ovalada',               price:45,  cat:'tables',  habboClass:'hygge_c25_sidetable',     badge:'habbo'},
  {id:'hf-goldcoffee',   t:'table', name:'Gold Coffee Table',     desc:'Mesa de café dorada de lujo',          price:180, cat:'tables',  habboClass:'mode_gold_largecoffeetable',badge:'habbo'},
  {id:'hf-cybertable',   t:'table', name:'Cyber Table',           desc:'Mesa futurista cyberpunk',             price:100, cat:'tables',  habboClass:'cpunk_c15_table',         badge:'habbo'},
  {id:'hf-ecotable',     t:'table', name:'Eco Coffee Table',      desc:'Mesa ecológica reciclada',             price:60,  cat:'tables',  habboClass:'eco_table1',              badge:'habbo'},
  {id:'hf-darklodgetbl', t:'table', name:'Dark Lodge Table',      desc:'Mesa de lodge oscuro',                 price:75,  cat:'tables',  habboClass:'lodge_dark_endtable',     badge:'habbo'},
  {id:'hf-elvensquare',  t:'table', name:'Elven Square Table',    desc:'Mesa élfica cuadrada',                 price:90,  cat:'tables',  habboClass:'easter_c26_elvensquaretable',badge:'habbo'},
  {id:'hf-gamingtable',  t:'table', name:'Gaming Table',          desc:'Mesa de juegos de mesa',               price:120, cat:'tables',  habboClass:'hobbies_c26_gamingtable', badge:'habbo'},
  {id:'hf-hccoffee',     t:'table', name:'HC Coffee Table',       desc:'Mesa exclusiva HC moderna',            price:200, cat:'tables',  habboClass:'hc26_3',                  badge:'habbo'},
  {id:'hf-gardentable',  t:'table', name:'Garden Table',          desc:'Mesa de jardín exterior',              price:55,  cat:'tables',  habboClass:'ducket_c25_brtable',      badge:'habbo'},
  {id:'hf-dungeontable', t:'table', name:'Dungeon Table',         desc:'Mesa de mazmorra oscura',              price:95,  cat:'tables',  habboClass:'nft_h26_dngtable',        badge:'habbo'},

  // ── Oficina ──
  {id:'hf-wrkdesk',      t:'desk',  name:'Work Desk',             desc:'Escritorio de trabajo profesional',    price:150, cat:'office',  habboClass:'exe_wrkdesk',             badge:'habbo'},
  {id:'hf-laptopdesk',   t:'desk',  name:'Laptop Desk',           desc:'Escritorio con laptop integrada',      price:130, cat:'office',  habboClass:'laptopdesk',              badge:'habbo'},
  {id:'hf-lodgedesk',    t:'desk',  name:'Lodge Executive Desk',  desc:'Escritorio ejecutivo de lodge',        price:200, cat:'office',  habboClass:'lodge_desk',              badge:'habbo'},
  {id:'hf-smartdesk',    t:'desk',  name:'Smart Desk',            desc:'Escritorio inteligente HC',            price:220, cat:'office',  habboClass:'hc21_6',                  badge:'habbo'},
  {id:'hf-chilldesk',    t:'desk',  name:'Chill Modern Desk',     desc:'Escritorio moderno minimalista',       price:160, cat:'office',  habboClass:'darkmodern_c20_desk',     badge:'habbo'},
  {id:'hf-vintdesk',     t:'desk',  name:'Vintaque Desk',         desc:'Escritorio vintage con carácter',      price:170, cat:'office',  habboClass:'nft_h23_vintaque_desk',   badge:'habbo'},
  {id:'hf-ruggedlaptop', t:'desk',  name:'Rugged Laptop',         desc:'Laptop militar resistente',            price:140, cat:'office',  habboClass:'army_c15_deskcomp',       badge:'habbo'},
  {id:'hf-flatscreen',   t:'mon',   name:'Desktop Computer',      desc:'Computadora de escritorio completa',   price:180, cat:'office',  habboClass:'computer_flatscreen',     badge:'habbo'},
  {id:'hf-laptop2',      t:'mon',   name:'Laptop',                desc:'Laptop portátil moderna',              price:140, cat:'office',  habboClass:'computer_laptop',         badge:'habbo'},
  {id:'hf-oldpc',        t:'mon',   name:'Nostalgic Computer',    desc:'Computadora retro nostálgica',         price:100, cat:'office',  habboClass:'computer_old',            badge:'habbo'},
  {id:'hf-solarpunk',    t:'mon',   name:'Solarpunk Computer',    desc:'Computadora ecológica solarpunk',      price:190, cat:'office',  habboClass:'easter_c23_solarpunkcomputer',badge:'habbo'},
  {id:'hf-steampunkpc',  t:'mon',   name:'Steampunk Computer',    desc:'Computadora steampunk con engranajes', price:210, cat:'office',  habboClass:'steampunk_computer',      badge:'habbo'},
  {id:'hf-habbook',      t:'mon',   name:'HabBook Pro',           desc:'Laptop premium HabBook',              price:160, cat:'office',  habboClass:'uni_laptop',              badge:'habbo'},
  {id:'hf-stagetv',      t:'screen',name:'Stage Screen',          desc:'Pantalla de escenario grande',         price:200, cat:'office',  habboClass:'studio_tv',               badge:'habbo'},
  {id:'hf-bigtv',        t:'screen',name:'Non-Portable TV',       desc:'TV grande no portátil',                price:250, cat:'office',  habboClass:'nft_h26_bigtv',           badge:'habbo'},
  {id:'hf-whiteboard',   t:'screen',name:'Planning Board',        desc:'Pizarra de planificación',             price:120, cat:'office',  habboClass:'uni_c23_whiteboard',      badge:'habbo'},
  {id:'hf-chalkboard',   t:'screen',name:'Chalkboard',            desc:'Pizarra de tiza clásica',              price:90,  cat:'office',  habboClass:'school_c22_chalkboard',   badge:'habbo'},

  // ── Decoración ──
  {id:'hf-norja',        t:'shelf', name:'Beige Bookcase',        desc:'Estantería clásica Norja',             price:90,  cat:'deco',    habboClass:'shelves_norja',           badge:'habbo'},
  {id:'hf-polyfon',      t:'shelf', name:'Bookcase Polyfon',      desc:'Estantería Polyfon',                   price:85,  cat:'deco',    habboClass:'shelves_polyfon',         badge:'habbo'},
  {id:'hf-hipbook',      t:'shelf', name:'Hipster Bookcase',      desc:'Estantería hipster con estilo',        price:100, cat:'deco',    habboClass:'uni_hipbookcase',         badge:'habbo'},
  {id:'hf-goldbookcase', t:'shelf', name:'Gold Bookcase',         desc:'Estantería dorada de lujo',            price:250, cat:'deco',    habboClass:'mode_gold_bookcase',      badge:'habbo'},
  {id:'hf-gothicshelf',  t:'shelf', name:'Gothic Shelf',          desc:'Estantería gótica oscura',             price:110, cat:'deco',    habboClass:'uni_c23_coffinbookcase',  badge:'habbo'},
  {id:'hf-darkbookcase', t:'shelf', name:'Dark Lodge Bookcase',   desc:'Estantería de lodge oscuro',           price:95,  cat:'deco',    habboClass:'lodge_dark_bookcase',     badge:'habbo'},
  {id:'hf-librarybook',  t:'shelf', name:'Library Bookcase',      desc:'Librería clásica llena de libros',     price:105, cat:'deco',    habboClass:'classic9_bookshelf',      badge:'habbo'},
  {id:'hf-desklamp',     t:'lamp',  name:'Desk Lamp',             desc:'Lámpara de escritorio',                price:35,  cat:'deco',    habboClass:'hygge_c25_desklamp',      badge:'habbo'},
  {id:'hf-darklamp',     t:'lamp',  name:'Dark Lodge Lamp',       desc:'Lámpara oscura de lodge',              price:45,  cat:'deco',    habboClass:'lodge_dark_lamp',         badge:'habbo'},
  {id:'hf-modernlamp',   t:'lamp',  name:'Modern Desk Lamp',      desc:'Lámpara moderna minimalista',          price:50,  cat:'deco',    habboClass:'darkmodern_c20_lamp',     badge:'habbo'},
  {id:'hf-elvenfloor',   t:'lamp',  name:'Elven Floor Lamp',      desc:'Lámpara de pie élfica',                price:65,  cat:'deco',    habboClass:'easter_c26_elvenfloorlamp',badge:'habbo'},
  {id:'hf-streetlight',  t:'lamp',  name:'Victorian Street Light', desc:'Farola victoriana elegante',          price:120, cat:'deco',    habboClass:'nft_hc_lmpst',            badge:'habbo'},
  {id:'hf-elegantlamp',  t:'lamp',  name:'Elegant Lamp',          desc:'Lámpara elegante decorativa',          price:80,  cat:'deco',    habboClass:'nft_val14_lamp',          badge:'habbo'},
  {id:'hf-nightduck',    t:'lamp',  name:'Duck Night Light',      desc:'Luz nocturna de patito',               price:40,  cat:'deco',    habboClass:'pj_c26_nightlightduck',   badge:'habbo'},
  {id:'hf-nightcat',     t:'lamp',  name:'Cat Night Light',       desc:'Luz nocturna de gatito',               price:40,  cat:'deco',    habboClass:'pj_c26_nightlightcat',    badge:'habbo'},
  {id:'hf-ornaplant',    t:'plant', name:'Ornamental Plant',      desc:'Planta ornamental en maceta',          price:35,  cat:'deco',    habboClass:'ducket_c25_plantpot',     badge:'habbo'},
  {id:'hf-basketplant',  t:'plant', name:'Basket Plant',          desc:'Planta en canasta decorativa',         price:30,  cat:'deco',    habboClass:'recycler_basketplant',    badge:'habbo'},
  {id:'hf-bottleplant',  t:'plant', name:'Bottle Planter',        desc:'Planta en botella reciclada',          price:25,  cat:'deco',    habboClass:'recycler_bottleplant',    badge:'habbo'},
  {id:'hf-cactus',       t:'plant', name:'Small Cactus',          desc:'Cactus pequeño para el escritorio',    price:15,  cat:'deco',    habboClass:'plant_small_cactus',      badge:'habbo'},
  {id:'hf-bigcactus',    t:'plant', name:'Mature Cactus',         desc:'Cactus maduro grande',                 price:40,  cat:'deco',    habboClass:'plant_big_cactus',        badge:'habbo'},
  {id:'hf-aloe',         t:'plant', name:'Aloe Vera',             desc:'Aloe vera purificador',                price:20,  cat:'deco',    habboClass:'nft_plant_cruddy',        badge:'habbo'},
  {id:'hf-orchid',       t:'plant', name:'Orchid Plant',          desc:'Orquídea exótica elegante',            price:50,  cat:'deco',    habboClass:'br_c25_orchids',          badge:'habbo'},
  {id:'hf-sunflower',    t:'plant', name:'Sunflower Plant',       desc:'Girasol alegre para la ventana',       price:35,  cat:'deco',    habboClass:'nft_sc25_sunflowers',     badge:'habbo'},
  {id:'hf-neutralrug',   t:'rug',   name:'Neutral Rug',           desc:'Alfombra neutra elegante',             price:60,  cat:'deco',    habboClass:'hygge_c25_carpet',        badge:'habbo'},
  {id:'hf-autumnrug',    t:'rug',   name:'Autumn Rug',            desc:'Alfombra otoñal acogedora',            price:55,  cat:'deco',    habboClass:'ducket_c25_autumnrug',    badge:'habbo'},
  {id:'hf-beachrug',     t:'rug',   name:'Beach Rug',             desc:'Alfombra tropical de playa',           price:70,  cat:'deco',    habboClass:'nft_sandrug',             badge:'habbo'},
  {id:'hf-duckrug',      t:'rug',   name:'Cottage Duck Rug',      desc:'Alfombra con patito adorable',         price:65,  cat:'deco',    habboClass:'ducket_c25_cottageduckrug',badge:'habbo'},
  {id:'hf-brightwin',    t:'window',name:'Bright Window',         desc:'Ventana luminosa con vista',           price:80,  cat:'deco',    habboClass:'hygge_c25_window1',       badge:'habbo'},
  {id:'hf-longwin',      t:'window',name:'Long Window',           desc:'Ventana larga panorámica',             price:90,  cat:'deco',    habboClass:'hygge_c25_window2',       badge:'habbo'},
  {id:'hf-gothicwin',    t:'window',name:'Gothic Windows',        desc:'Vitrales góticos decorativos',         price:150, cat:'deco',    habboClass:'hween_c22_gothicwindow',  badge:'habbo'},
  {id:'hf-dormwin',      t:'window',name:'Dorm Window',           desc:'Ventana de dormitorio universitario',  price:70,  cat:'deco',    habboClass:'uni_c23_window',          badge:'habbo'},
  {id:'hf-cupboard',     t:'shelf', name:'Storage Cupboard',      desc:'Armario de almacenamiento',            price:80,  cat:'deco',    habboClass:'hygge_c25_cupboard',      badge:'habbo'},
  {id:'hf-wardrobe',     t:'shelf', name:'Duck Wardrobe',         desc:'Armario de patitos adorable',          price:90,  cat:'deco',    habboClass:'ducket_c25_wardrobe',     badge:'habbo'},
  {id:'hf-coffeemachine',t:'coffee',name:'Coffee Machine',        desc:'Máquina de café espresso',             price:95,  cat:'deco',    habboClass:'ktchn15_coffeemaker',     badge:'habbo'},
  {id:'hf-coffeecup',    t:'table', name:'Cup of Coffee',         desc:'Taza de café calentita',               price:10,  cat:'deco',    habboClass:'coffee_cup',              badge:'habbo'},
  {id:'hf-vending',      t:'watercooler',name:'Vending Machine',  desc:'Máquina expendedora de snacks',        price:130, cat:'deco',    habboClass:'val_c21_vendingmachine',  badge:'habbo'},
  {id:'hf-espresso',     t:'coffee',name:'Espresso Machine',      desc:'Espresso HC premium',                  price:110, cat:'deco',    habboClass:'hc2_coffee',              badge:'habbo'},
  {id:'hf-fireplace',    t:'lamp',  name:'Gold Fireplace',        desc:'Chimenea dorada lujosa',               price:300, cat:'deco',    habboClass:'mode_gold_fireplace',     badge:'habbo'},
  {id:'hf-cosybooks',    t:'shelf', name:'Cosy Reads',            desc:'Pila de libros acogedora',             price:25,  cat:'deco',    habboClass:'hygge_c25_books',         badge:'habbo'},
];

function updateCoinsDisplay(){
  const v1=document.getElementById('coins-val');
  const v2=document.getElementById('shop-coins-val');
  if(v1)v1.textContent=COINS;
  if(v2)v2.textContent=COINS;
}

function openShop(){
  if(typeof playSound==='function')playSound('open');
  document.getElementById('shop-modal').classList.add('open');
  filterShop(shopFilter, document.querySelector('.shop-cat.active'));
  updateCoinsDisplay();
}
function closeShop(){if(typeof playSound==='function')playSound('close');document.getElementById('shop-modal').classList.remove('open')}

function filterShop(cat, el){
  shopFilter=cat;
  document.querySelectorAll('.shop-cat').forEach(c=>c.classList.remove('active'));
  if(el)el.classList.add('active');
  renderShop();
}

function renderShop(){
  const grid=document.getElementById('shop-grid');
  const items=shopFilter==='all'?SHOP_ITEMS:SHOP_ITEMS.filter(i=>i.cat===shopFilter);
  if(!items.length){grid.innerHTML='<div class="shop-empty">Nada por aqui...</div>';return;}
  grid.innerHTML=items.map(item=>{
    const canBuy=COINS>=item.price;
    let previewHtml;
    if(item.habboClass && typeof HABBO_FURNI_IMAGES!=='undefined' && HABBO_FURNI_IMAGES[item.habboClass]){
      previewHtml='<img src="'+HABBO_FURNI_IMAGES[item.habboClass].meta.src+'" alt="'+item.name+'">';
    } else {
      previewHtml='<div class="sp-emoji">'+(item.emoji||'📦')+'</div>';
    }
    const badgeHtml=item.badge?'<div class="sp-badge '+item.badge+'">'+item.badge.toUpperCase()+'</div>':'';
    return `<div class="shop-item">
      <div class="shop-preview">${previewHtml}${badgeHtml}</div>
      <div class="shop-info">
        <div class="shop-iname">${item.name}</div>
        <div class="shop-idesc">${item.desc}</div>
        <div class="shop-ibuy">
          <div class="shop-price">🪙 ${item.price}</div>
          <button class="shop-btn ${canBuy?'can-buy':'no-coins'}" onclick="buyItem('${item.id}')">${canBuy?'Comprar':'Sin monedas'}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function buyItem(itemId){
  const item=SHOP_ITEMS.find(i=>i.id===itemId);
  if(!item)return;
  if(COINS<item.price){if(typeof playSound==='function')playSound('error');showToast('No tenes suficientes monedas 🪙','#ff4444');return;}
  COINS-=item.price;
  updateCoinsDisplay();
  // Add to inventory
  const inv={t:item.t,name:item.name,icon:item.emoji||(item.sprite?'🪑':'📦')};
  if(item.habboClass)inv.habboClass=item.habboClass;
  if(item.variant)inv.variant=item.variant;
  inventory.push(inv);
  if(typeof playSound==='function')playSound('purchase');
  showToast('✓ '+item.name+' comprado! Revisá tu inventario 📦','#00ff88');
  renderShop(); // refresh prices
  if(!isTestWorld) saveUserState();
}

// Passive coin income: +1 coin cada 4 segundos por agente activo
function tickCoins(){
  if(isTestWorld){
    // Test world: dinero gratis
    if(tk%240===0){COINS+=AGENTS.length;updateCoinsDisplay();}
  } else {
    // Live: economía real basada en trabajo
    tickEconomy();
  }
  // Auto-save cada ~30 segundos
  if(!isTestWorld && tk%1800===0) saveUserState();
}

// Toast notification
function showToast(msg,color='#00ff88'){
  let t=document.getElementById('toast-notif');
  if(!t){t=document.createElement('div');t.id='toast-notif';t.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);z-index:3000;font-family:Inter,sans-serif;font-weight:500;font-size:12px;padding:8px 18px;border-radius:20px;background:rgba(8,8,18,0.95);border:1px solid #1a1a2e;pointer-events:none;transition:opacity .3s;white-space:nowrap';document.body.appendChild(t);}
  t.style.color=color;t.style.borderColor=color+'44';t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._to);t._to=setTimeout(()=>t.style.opacity='0',2500);
}




// ====== HABBO FURNI SYSTEM ======
const useHabboFurni = true;

// Mapeo: tipo de mueble del juego → classname Habbo (principal + alternativa)
const HABBO_FURNI_MAP = {
  desk:        ['exe_wrkdesk','lodge_desk','darkmodern_c20_desk','laptopdesk','antique_c21_desk'],
  mon:         ['computer_flatscreen','computer_old','easter_c23_solarpunkcomputer','computer_laptop'],
  plant:       ['ducket_c25_plantpot','recycler_basketplant','recycler_bottleplant','plant_small_cactus','plant_big_cactus'],
  shelf:       ['shelves_norja','darkmodern_c20_shelf','uni_hipbookcase','mode_gold_bookcase','classic9_bookshelf'],
  couch:       ['hygge_c25_sofa','hygge_c25_armchair','nft_h25_collsofa','xmas_c24_doublesofa','ads_aftv_sofa'],
  chair:       ['waasa_chair','paris_c15_chair','hygge_c25_armchair','nft_h26_drpgamingchair','recycler_chairblue'],
  table:       ['hygge_c25_coffeetable','darkmodern_c20_lowtable','hygge_c25_sidetable','ducket_c25_brtable'],
  coffee:      ['ktchn15_coffeemaker','sunsetcafe_c20_coffeemachine','smiley_c23_coffee','coffee_cup'],
  screen:      ['studio_tv','nft_h26_bigtv','studio_monitor'],
  ctable:      ['easter_c26_elventable','mode_gold_largetable','lodge_dark_diningtable'],
  lamp:        ['hygge_c25_desklamp','darkmodern_c20_lamp','lodge_dark_lamp','nft_val14_lamp','easter_c26_elvenfloorlamp'],
  watercooler: ['val_c21_vendingmachine','ads_fanta_vendingmachine'],
  rug:         ['hygge_c25_carpet','ducket_c25_autumnrug','ducket_c25_cottageduckrug'],
  window:      ['hygge_c25_window1','hygge_c25_window2','uni_c23_window'],
};

function getHabboFurniImg(furnType, specificClass) {
  if(typeof HABBO_FURNI_IMAGES === 'undefined') return null;
  // If furniture has a specific habboClass, use that exact sprite
  if(specificClass){
    const entry = HABBO_FURNI_IMAGES[specificClass];
    if(entry && entry.img && entry.img.complete && entry.img.naturalWidth > 0) return entry;
  }
  // Fallback: generic type mapping
  const candidates = HABBO_FURNI_MAP[furnType];
  if(!candidates) return null;
  for(const cn of candidates) {
    const entry = HABBO_FURNI_IMAGES[cn];
    if(entry && entry.img && entry.img.complete && entry.img.naturalWidth > 0) return entry;
  }
  return null;
}

// ====== LIVE MODE ECONOMY ======
// ====== LIVE MODE ECONOMY ======
// En Live: agentes empiezan nivel 1, 0 XP. Ganan monedas por trabajar.
// 15 min trabajo = ~5400 ticks a 60fps. Pagamos cada 5400 ticks (~15min).
// Agentes idle NO generan monedas ni XP.

const WORK_PAY_INTERVAL = 5400; // ~15 minutos a 60fps (90 seg = 5400 ticks)
const WORK_PAY_AMOUNT = 3;     // monedas por pago (pocas, que cueste)
const WORK_XP_INTERVAL = 600;  // XP cada ~10 segundos
const WORK_XP_AMOUNT = 2;      // XP por tick de trabajo

function tickEconomy() {
  if (isTestWorld) return; // Test world usa el sistema viejo

  AGENTS.forEach(a => {
    if (!a.workTicks) a.workTicks = 0;

    // Solo agentes trabajando acumulan ticks
    if (a.status === 'working' || a.status === 'thinking' || a.status === 'reading') {
      a.workTicks++;

      // Pago cada 15 minutos de trabajo
      if (a.workTicks % WORK_PAY_INTERVAL === 0) {
        const earned = WORK_PAY_AMOUNT + Math.floor(a.level / 10); // bonus por nivel
        COINS += earned;
        a.totalEarned = (a.totalEarned || 0) + earned;
        updateCoinsDisplay();
        if(typeof playSound==='function')playSound('coins');
        showToast('🪙 +' + earned + ' de ' + a.name, '#ffcc00');
      }

      // XP por trabajo (reemplaza el sistema viejo en Live)
      if (a.workTicks % WORK_XP_INTERVAL === 0) {
        a.xp += WORK_XP_AMOUNT;
        if (a.xp >= a.xpMax) {
          a.level++;
          a.xp = a.xp - a.xpMax;
          a.xpMax = Math.floor(a.xpMax * 1.2);
          a.levelUpEffect = 60;
          if(typeof playSound==='function')playSound('levelup');
          showToast('⬆️ ' + a.name + ' subió a nivel ' + a.level + '!', '#00ff88');
          updCards();
        }
      }
    }
    // Idle: no gana nada
  });
}

// ====== FURNITURE DATA ======
const DEFAULT_FURN=[
  // === Escritorios (5 agentes) ===
  {t:'desk',x:2,y:2,habboClass:'exe_wrkdesk'},{t:'mon',x:2,y:2,habboClass:'computer_flatscreen'},
  {t:'desk',x:4,y:2,habboClass:'laptopdesk'},{t:'mon',x:4,y:2,habboClass:'computer_laptop'},
  {t:'desk',x:6,y:2,habboClass:'darkmodern_c20_desk'},
  {t:'desk',x:2,y:4,habboClass:'lodge_desk'},{t:'mon',x:2,y:4,habboClass:'computer_old'},
  {t:'desk',x:4,y:4,habboClass:'exe_wrkdesk'},{t:'mon',x:4,y:4,habboClass:'computer_flatscreen'},
  // === Decoracion ===
  {t:'plant',x:1,y:1,habboClass:'ducket_c25_plantpot'},
  {t:'plant',x:1,y:5,habboClass:'recycler_basketplant'},
  {t:'plant',x:7,y:1,habboClass:'plant_big_cactus'},
  {t:'shelf',x:1,y:3,habboClass:'shelves_norja'},
  {t:'lamp',x:7,y:3,habboClass:'hygge_c25_desklamp'},
  // === Lounge ===
  {t:'couch',x:8,y:6,habboClass:'hygge_c25_sofa'},
  {t:'chair',x:7,y:7,habboClass:'waasa_chair'},
  {t:'chair',x:9,y:5,habboClass:'paris_c15_chair'},
  {t:'table',x:8,y:7,habboClass:'hygge_c25_coffeetable'},
  {t:'coffee',x:9,y:8,habboClass:'ktchn15_coffeemaker'},
  // === Pared ===
  {t:'window',x:4,y:1,habboClass:'hygge_c25_window1'},
  {t:'rug',x:5,y:4,habboClass:'hygge_c25_carpet'}
];
let FURN=DEFAULT_FURN.map(f=>Object.assign({},f));

function drawFurnShadow(f){
  const i=isoXY(f.x,f.y),s=w2s(i.x,i.y),z=zm;
  const sw=12*z,sh=6*z;
  const sg=X.createRadialGradient(s.x,s.y,0,s.x,s.y,sw*0.7);
  sg.addColorStop(0,'rgba(0,0,0,0.18)');
  sg.addColorStop(0.6,'rgba(0,0,0,0.08)');
  sg.addColorStop(1,'rgba(0,0,0,0)');
  X.save();
  X.scale(1,sh/sw);
  const scaledY=s.y*sw/sh;
  X.fillStyle=sg;
  X.beginPath();X.arc(s.x,scaledY,sw*0.7,0,Math.PI*2);X.fill();
  X.restore();
}

// Helper: draw a rectangle on the north wall in isometric perspective
// tx = tile X position, wo = offset along wall, wh = height above floor base
// ww = width along wall, hh = height of object, color = fill color
function drawOnNorthWall(tx, wo, wh, ww, hh, color){
  const z=zm;
  const i1=isoXY(tx,1), i2=isoXY(tx+1,1);
  const s1=w2s(i1.x,i1.y), s2=w2s(i2.x,i2.y);
  const dx=(s2.x-s1.x), dy=(s2.y-s1.y);
  const len=Math.sqrt(dx*dx+dy*dy);
  const nx=dx/len, ny=dy/len;
  const startX=s1.x+nx*wo*z, startY=s1.y+ny*wo*z;
  const p1x=startX, p1y=startY-wh*z;
  const p2x=startX+nx*ww*z, p2y=startY+ny*ww*z-wh*z;
  const p3x=startX+nx*ww*z, p3y=startY+ny*ww*z-(wh-hh)*z;
  const p4x=startX, p4y=startY-(wh-hh)*z;
  X.fillStyle=color;
  X.beginPath();X.moveTo(p1x,p1y);X.lineTo(p2x,p2y);X.lineTo(p3x,p3y);X.lineTo(p4x,p4y);X.closePath();X.fill();
  X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
  return {p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y,nx,ny,startX,startY};
}

// ====== FURNITURE RENDERING ======
function dFurn(f){
  const i=isoXY(f.x,f.y),s=w2s(i.x,i.y),z=zm;
  function fp(x,y,w,h,c){fp2(x,y,w,h,c)}

  // Edit mode highlight
  if(editMode&&dragFurn===f){
    X.strokeStyle='#ffaa00';X.lineWidth=2;
    X.beginPath();X.ellipse(s.x,s.y,14*z,7*z,0,0,Math.PI*2);X.stroke();
  }

  // ── Habbo Furni mode ──
  if(useHabboFurni){
    const _hf=getHabboFurniImg(f.t, f.habboClass);
    if(_hf){
      const _img=_hf.img;
      // Scale: use a fixed target width per tile, capped
      const _xdim=_hf.meta.xdim||1, _ydim=_hf.meta.ydim||1;
      const _tileW=TW*zm*0.6;  // ~60% of one tile width
      const _dimFactor=Math.max(_xdim,_ydim);
      const _targetW=_tileW*Math.min(_dimFactor,2);
      let _sc=_targetW/_img.naturalWidth;
      // Don't upscale beyond pixel density
      if(_sc>zm*0.5) _sc=zm*0.5;
      const _w=_img.naturalWidth*_sc, _h=_img.naturalHeight*_sc;
      const _rot2=(f.rot||0)%4;
      const _wallItem2=f.t==='window'||f.t==='rug';
      const _flip2=!_wallItem2&&(_rot2===1||_rot2===3);
      X.save();
      if(_flip2){X.translate(s.x,0);X.scale(-1,1);X.translate(-s.x,0);}
      // Isometric shadow at ground level
      X.fillStyle='rgba(0,0,0,0.13)';
      X.beginPath();
      X.ellipse(s.x,s.y+3*z,_w*0.35,_w*0.14,0,0,Math.PI*2);
      X.fill();
      // High quality smoothing
      X.imageSmoothingEnabled=true;
      X.imageSmoothingQuality='high';
      // Anchor: sprite bottom sits at fixed offset below tile center
      // This ensures tall items extend UP, not down (preventing z-order clipping)
      const _groundY=s.y+3*z;
      X.drawImage(_img,s.x-_w/2,_groundY-_h,_w,_h);
      X.restore();
      return;
    }
  }

  // ── Rotation transform ──
  const _rot=(f.rot||0)%4;
  const _wallItem=f.t==='window'||f.t==='clock'||f.t==='poster'||f.t==='rug'||f.t==='whiteboard';
  const _flipH=!_wallItem&&(_rot===1||_rot===3);
  if(_flipH){
    X.save();
    X.translate(s.x,0);
    X.scale(-1,1);
    X.translate(-s.x,0);
  }

  switch(f.t){
    case'desk':{
      // Thinner elegant legs using isoBox
      isoBox(s.x-8*z,s.y+4*z,1.8*z,6*z,1.8*z,'#5a4010');
      isoBox(s.x+8*z,s.y+4*z,1.8*z,6*z,1.8*z,'#4a3508');
      isoBox(s.x-8*z,s.y+1*z,1.8*z,6*z,1.8*z,'#5a4010');
      isoBox(s.x+8*z,s.y+1*z,1.8*z,6*z,1.8*z,'#4a3508');
      // Desktop surface
      isoBox(s.x,s.y-2*z,22*z,2.5*z,8*z,'#9B7924');
      // Drawer on right side
      isoBox(s.x+6*z,s.y+1*z,6*z,4*z,4*z,'#8a6a1a');
      fp(s.x+4.5*z,s.y-.8*z,2.2*z,.5*z,'#bba040');
      // Keyboard
      fp(s.x-4*z,s.y-5*z,7*z,2.2*z,'#1a1a1a');
      X.fillStyle='#333';for(let r=0;r<2;r++)for(let k2=0;k2<6;k2++)X.fillRect(s.x-3.5*z+k2*1.1*z,s.y-4.6*z+r*.8*z,.7*z,.5*z);
      // Mouse
      fp(s.x+5*z,s.y-4.8*z,1.8*z,1.8*z,'#2a2a2a');
      break;
    }
    case'mon':{
      // Stand base — sits on desk
      isoBox(s.x,s.y-4.5*z,4*z,1*z,2.5*z,'#3a3a3a');
      // Stand pole
      fp(s.x-.5*z,s.y-7.5*z,1*z,2.5*z,'#444');
      // Screen frame
      isoBox(s.x,s.y-14*z,11*z,5.5*z,1.8*z,'#1a1a1a');
      // Screen content
      X.fillStyle='#0a1525';X.fillRect(s.x-4.5*z,s.y-14*z,9*z,4.5*z);
      const hue=(tk*1.5+f.x*60)%360;
      for(let l=0;l<3;l++){const lw=(1.5+Math.sin(tk*.06+l*1.3)*2)*z;X.fillStyle=`hsla(${hue+l*15},65%,55%,${.35+l*.06})`;X.fillRect(s.x-3.5*z,s.y-13.5*z+l*1.2*z,lw,.5*z)}
      // Monitor glow
      X.fillStyle=`hsla(${hue},60%,50%,0.1)`;X.beginPath();X.arc(s.x,s.y-11.5*z,6*z,0,Math.PI*2);X.fill();
      // Power LED
      X.fillStyle='#00ff44';X.beginPath();X.arc(s.x+4*z,s.y-9*z,.4*z,0,Math.PI*2);X.fill();
      // Brand bar
      X.fillStyle='#333';X.fillRect(s.x-1*z,s.y-9*z,2*z,.5*z);
      break;
    }
    case'plant':{
      // Pot as isoBox
      isoBox(s.x,s.y-3*z,5*z,5*z,4*z,'#7a3a10');
      // Pot rim
      isoBox(s.x,s.y-8*z,6*z,1*z,5*z,'#9a5520');
      // Soil
      X.fillStyle='#3a2510';
      X.beginPath();X.moveTo(s.x,s.y-9*z);X.lineTo(s.x+2.5*z,s.y-8.3*z);X.lineTo(s.x,s.y-7.6*z);X.lineTo(s.x-2.5*z,s.y-8.3*z);X.closePath();X.fill();
      // Stem — slightly taller
      const sw=Math.sin(tk*.025+f.x)*1.5;
      X.strokeStyle='#2a6a1a';X.lineWidth=1.8*z;
      X.beginPath();X.moveTo(s.x,s.y-8.5*z);X.quadraticCurveTo(s.x+sw*z*.4,s.y-11*z,s.x+sw*z*.7,s.y-14*z);X.stroke();
      // More leaves
      const leaves=[{x:0,y:-14,r:3.5,c:'#228B22'},{x:-2,y:-15.5,r:2.8,c:'#2a9a2a'},{x:2.5,y:-13,r:2.5,c:'#1e7e1e'},{x:.7,y:-16,r:2.2,c:'#33aa33'},{x:-1,y:-12,r:2,c:'#2a8a2a'}];
      leaves.forEach(l=>{X.fillStyle=l.c;X.beginPath();X.arc(s.x+l.x*z+sw*z,s.y+l.y*z,l.r*z,0,Math.PI*2);X.fill();X.strokeStyle=OL;X.lineWidth=.5;X.stroke();X.fillStyle=lgt(l.c,25);X.beginPath();X.arc(s.x+l.x*z+sw*z-l.r*.3*z,s.y+l.y*z-l.r*.3*z,l.r*.4*z,0,Math.PI*2);X.fill()});
      break;
    }
    case'shelf':{
      // Back panel
      isoBox(s.x,s.y-12*z,10*z,24*z,3*z,'#3a1a00');
      // Shelves
      for(let sh=0;sh<3;sh++){
        const sy=s.y-8*z-sh*7*z;
        isoBox(s.x,sy+.5*z,12*z,1.5*z,4*z,'#6a4a2a');
      }
      isoBox(s.x,s.y-28*z,12*z,1.5*z,4*z,'#6a4a2a');
      // Books
      const bc=['#cc3333','#3366cc','#33aa33','#ccaa33','#aa33cc','#33aacc','#cc6633','#6633cc'];
      for(let r=0;r<3;r++){const sby=s.y-14*z-r*7*z;for(let j=0;j<4;j++){const bh=(4+Math.sin(j+r)*1.5)*z;fp(s.x-4*z+j*2*z,sby-bh,1.8*z,bh,bc[(j+r*3)%bc.length])}}
      break;
    }
    case'couch':{
      // Sprite isométrico (con fallback procedural)
      const _cspr=f.variant==='wide'?SPRITES.spr_armchair_wide:SPRITES.spr_armchair;
      if(SPRITES_READY&&_cspr&&_cspr.naturalWidth>0){
        const _sw=30*z,_sh=_sw*(_cspr.naturalHeight/_cspr.naturalWidth);
        X.drawImage(_cspr,s.x-_sw/2,s.y-_sh+4*z,_sw,_sh);
      }else{
        isoBox(s.x,s.y-3*z,18*z,5*z,8*z,'#7B1A42');
        isoBox(s.x,s.y-12*z,18*z,7*z,3*z,'#6B1238');
        isoBox(s.x-8*z,s.y-6*z,3*z,5*z,6*z,'#5B0A2E');
        isoBox(s.x+8*z,s.y-6*z,3*z,5*z,6*z,'#5B0A2E');
        fp(s.x-8*z,s.y-10*z,7*z,3.5*z,'#aa3868');
        fp(s.x+1*z,s.y-10*z,7*z,3.5*z,'#aa3868');
        fp(s.x-8*z,s.y+1*z,1.5*z,2*z,'#333');fp(s.x+6.5*z,s.y+1*z,1.5*z,2*z,'#333');
      }
      break;
    }
    case'chair':{
      // Silla individual con sprite
      const _chspr=f.variant==='natural'?SPRITES.spr_chair_natural:SPRITES.spr_chair_blue;
      if(SPRITES_READY&&_chspr&&_chspr.naturalWidth>0){
        const _cw=20*z,_ch=_cw*(_chspr.naturalHeight/_chspr.naturalWidth);
        X.drawImage(_chspr,s.x-_cw/2,s.y-_ch+3*z,_cw,_ch);
      }else{
        isoBox(s.x,s.y-3*z,10*z,4*z,6*z,'#7B5EA7');
        isoBox(s.x,s.y-10*z,10*z,5*z,2*z,'#6B4E97');
        fp(s.x-4*z,s.y,1.2*z,2*z,'#333');fp(s.x+3*z,s.y,1.2*z,2*z,'#333');
      }
      break;
    }
    case'table':{
      fp(s.x-4*z,s.y-1*z,1.5*z,5*z,'#3a2010');fp(s.x+2.5*z,s.y-1*z,1.5*z,5*z,'#3a2010');
      fp(s.x-5*z,s.y-4*z,10*z,2*z,'#5a4030');
      X.fillStyle='#6a5040';X.fillRect(s.x-5*z,s.y-4*z,10*z,.6*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x-5*z,s.y-4*z,10*z,.6*z);
      fp(s.x-3*z,s.y-5.5*z,4*z,2.5*z,'#cc4444');X.fillStyle='#dd6666';X.fillRect(s.x-2.5*z,s.y-5*z,1*z,1.5*z);
      fp(s.x+1.5*z,s.y-6*z,2.5*z,2.5*z,'#eee');X.fillStyle='#6B3410';X.fillRect(s.x+1.8*z,s.y-5.5*z,1.8*z,1.2*z);
      break;
    }
    case'coffee':{
      // Body as isoBox
      isoBox(s.x,s.y-5*z,7*z,12*z,5*z,'#3a3a3a');
      // Top panel
      isoBox(s.x,s.y-17.5*z,7*z,1*z,5*z,'#2a2a2a');
      // Display panel
      fp(s.x-2*z,s.y-16*z,4*z,2.2*z,'#1a1a1a');
      X.fillStyle='#0a3020';X.fillRect(s.x-1.8*z,s.y-15.5*z,3.6*z,1.5*z);
      // Button row
      X.fillStyle='#555';
      for(let b=0;b<3;b++){X.beginPath();X.arc(s.x-1*z+b*1*z,s.y-13*z,.4*z,0,Math.PI*2);X.fill()}
      // Dispenser nozzle
      fp(s.x-1*z,s.y-9.5*z,2*z,1.5*z,'#222');
      fp(s.x-.6*z,s.y-8*z,1.2*z,1.2*z,'#1a1a1a');
      // Drip tray
      isoBox(s.x,s.y-1*z,6*z,1*z,4*z,'#444');
      // Cup under nozzle
      fp(s.x-.9*z,s.y-4*z,1.8*z,2.2*z,'#f0f0f0');
      X.fillStyle='#6B3410';X.fillRect(s.x-.6*z,s.y-3.2*z,1.2*z,1*z);
      // Cup handle
      X.strokeStyle='#ddd';X.lineWidth=.4*z;
      X.beginPath();X.arc(s.x+1.3*z,s.y-2.8*z,.6*z,-.5,Math.PI+.5);X.stroke();
      // Status LED
      const on=Math.sin(tk*.1)>0;
      X.fillStyle=on?'#00ff44':'#003300';X.beginPath();X.arc(s.x+2.5*z,s.y-16.5*z,.5*z,0,Math.PI*2);X.fill();
      if(on){X.fillStyle='#00ff4422';X.beginPath();X.arc(s.x+2.5*z,s.y-16.5*z,1.5*z,0,Math.PI*2);X.fill()}
      // Steam animation
      X.strokeStyle='rgba(255,255,255,0.1)';X.lineWidth=.3*z;
      for(let st=0;st<3;st++){X.beginPath();X.moveTo(s.x+(st-1)*.8*z,s.y-6*z);X.quadraticCurveTo(s.x+Math.sin(tk*.07+st)*1.2*z,s.y-7.5*z,s.x+(st-1)*.6*z,s.y-9*z);X.stroke()}
      break;
    }
    case'screen':{
      // Stand base as isoBox
      isoBox(s.x,s.y-1*z,6*z,1.5*z,4*z,'#3a3a3a');
      // Stand pole
      fp(s.x-.6*z,s.y-14*z,1.2*z,12*z,'#444');
      // Screen frame as isoBox
      isoBox(s.x,s.y-26*z,18*z,14*z,2.5*z,'#1a1a1a');
      // Screen content
      X.fillStyle='#0a1525';X.fillRect(s.x-7.5*z,s.y-26*z,15*z,12*z);X.strokeStyle='#0a0a0a';X.lineWidth=.3;X.strokeRect(s.x-7.5*z,s.y-26*z,15*z,12*z);
      // Animated chart line
      X.strokeStyle='#00ff88';X.lineWidth=1*z;X.beginPath();
      for(let p=0;p<8;p++){const px=s.x-6.5*z+p*1.8*z,py=s.y-21*z-Math.sin(tk*.04+p*.8)*3*z;p===0?X.moveTo(px,py):X.lineTo(px,py)}X.stroke();
      // Grid lines
      X.strokeStyle='#ffffff08';X.lineWidth=.3;
      for(let g=0;g<3;g++){X.beginPath();X.moveTo(s.x-7*z,s.y-25*z+g*3.5*z);X.lineTo(s.x+7*z,s.y-25*z+g*3.5*z);X.stroke()}
      // Title bar
      X.fillStyle='#ffffff33';X.fillRect(s.x-4.5*z,s.y-26*z,6*z,.8*z);
      break;
    }
    case'ctable':{
      fp(s.x-7*z,s.y-1*z,1.5*z,5.5*z,'#3a2a1a');fp(s.x+5.5*z,s.y-1*z,1.5*z,5.5*z,'#3a2a1a');
      fp(s.x-8.5*z,s.y-3.5*z,17*z,2.8*z,'#5a4a3a');
      X.fillStyle='#6a5a4a';X.fillRect(s.x-8.5*z,s.y-3.5*z,17*z,.6*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x-8.5*z,s.y-3.5*z,17*z,.6*z);
      fp(s.x-4*z,s.y-5.2*z,4*z,2.5*z,'#e8e8e8');
      X.fillStyle='#bbb';for(let ln=0;ln<3;ln++)X.fillRect(s.x-3.5*z,s.y-4.8*z+ln*.8*z,2.8*z,.25*z);
      fp(s.x+1.5*z,s.y-5.5*z,4*z,2.8*z,'#2a2a2a');X.fillStyle='#0a2040';X.fillRect(s.x+2*z,s.y-5*z,3*z,2*z);
      X.fillStyle='#00aaff08';X.fillRect(s.x+.5*z,s.y-6*z,5.5*z,4*z);
      break;
    }
    case'rug':{
      const tw=TW*zm*2.2,th=TH*zm*2.2;
      X.beginPath();X.moveTo(s.x,s.y+th*.15);X.lineTo(s.x+tw/2,s.y+th*.4);X.lineTo(s.x,s.y+th*.65);X.lineTo(s.x-tw/2,s.y+th*.4);X.closePath();
      X.fillStyle='rgba(100,50,20,0.28)';X.fill();X.strokeStyle='rgba(160,90,40,0.5)';X.lineWidth=1.5;X.stroke();
      const tw2=tw*.8,th2=th*.8;
      X.beginPath();X.moveTo(s.x,s.y+th*.2);X.lineTo(s.x+tw2/2,s.y+th*.4);X.lineTo(s.x,s.y+th*.6);X.lineTo(s.x-tw2/2,s.y+th*.4);X.closePath();
      X.fillStyle='rgba(130,65,30,0.15)';X.fill();X.strokeStyle='rgba(200,140,60,0.25)';X.lineWidth=.8;X.stroke();
      const tw3=tw*.5,th3=th*.5;
      X.beginPath();X.moveTo(s.x,s.y+th*.25);X.lineTo(s.x+tw3/2,s.y+th*.4);X.lineTo(s.x,s.y+th*.55);X.lineTo(s.x-tw3/2,s.y+th*.4);X.closePath();
      X.fillStyle='rgba(180,100,40,0.12)';X.fill();X.strokeStyle='rgba(220,160,80,0.2)';X.lineWidth=.5;X.stroke();
      X.fillStyle='rgba(200,130,50,0.18)';
      X.beginPath();X.moveTo(s.x,s.y+th*.33);X.lineTo(s.x+tw*.08,s.y+th*.4);X.lineTo(s.x,s.y+th*.47);X.lineTo(s.x-tw*.08,s.y+th*.4);X.closePath();X.fill();
      break;
    }
    case'window':{
      // Window on north wall using drawOnNorthWall
      const tx=f.x;
      // Outer frame
      drawOnNorthWall(tx, 2, 42, 28, 30, '#d4c8a8');
      // Inner frame
      drawOnNorthWall(tx, 4, 40, 24, 26, '#c8bba0');
      // Glass pane — night sky
      const glass=drawOnNorthWall(tx, 5, 39, 22, 24, '#06091a');
      // Sky gradient overlay using the glass corners
      X.save();
      X.beginPath();X.moveTo(glass.p1x,glass.p1y);X.lineTo(glass.p2x,glass.p2y);X.lineTo(glass.p3x,glass.p3y);X.lineTo(glass.p4x,glass.p4y);X.closePath();X.clip();
      // Sky gradient
      const skyg=X.createLinearGradient(glass.p1x,glass.p1y,glass.p4x,glass.p4y);
      skyg.addColorStop(0,'#04061a');skyg.addColorStop(1,'#0a1530');
      X.fillStyle=skyg;X.fill();
      // Stars
      X.fillStyle='rgba(255,255,255,0.8)';
      const starSeed=[[.1,.1],[.7,.05],[.4,.15],[.85,.08],[.2,.22],[.6,.18],[.9,.25],[.15,.3],[.5,.05],[.75,.3]];
      starSeed.forEach(([sx2,sy2])=>{
        const bri=Math.sin(tk*.05+sx2*10)*.3+.7;
        X.globalAlpha=bri*.8;
        const stx=glass.p4x+(glass.p3x-glass.p4x)*sx2+(glass.p1x-glass.p4x)*sy2;
        const sty=glass.p4y+(glass.p3y-glass.p4y)*sx2+(glass.p1y-glass.p4y)*sy2;
        X.beginPath();X.arc(stx,sty,.5*z,0,Math.PI*2);X.fill();
      });
      X.globalAlpha=1;
      // Buildings silhouette along bottom of glass
      const bldgs=[{p:0,w:.15,h:.35,c:'#0e1520'},{p:.15,w:.2,h:.6,c:'#0c1018'},{p:.35,w:.15,h:.45,c:'#0f1825'},{p:.5,w:.15,h:.25,c:'#0a1015'},{p:.65,w:.1,h:.5,c:'#0d1520'},{p:.75,w:.15,h:.35,c:'#0c1218'}];
      bldgs.forEach(b=>{
        const blx=glass.p4x+(glass.p3x-glass.p4x)*b.p;
        const bly=glass.p4y+(glass.p3y-glass.p4y)*b.p;
        const brx=glass.p4x+(glass.p3x-glass.p4x)*(b.p+b.w);
        const bry=glass.p4y+(glass.p3y-glass.p4y)*(b.p+b.w);
        const tlx=blx+(glass.p1x-glass.p4x)*b.h;
        const tly=bly+(glass.p1y-glass.p4y)*b.h;
        const trx=brx+(glass.p2x-glass.p3x)*b.h;
        const try2=bry+(glass.p2y-glass.p3y)*b.h;
        X.fillStyle=b.c;
        X.beginPath();X.moveTo(tlx,tly);X.lineTo(trx,try2);X.lineTo(brx,bry);X.lineTo(blx,bly);X.closePath();X.fill();
        // Lit windows on buildings
        for(let wr=0;wr<Math.floor(b.h*6);wr++)for(let wc=0;wc<Math.floor(b.w*8);wc++){
          if(Math.sin(b.p*10+wr*7+wc*3)>.3){
            const wp=(wc+.3)/(b.w*8)*b.w+b.p;
            const hp=(wr+.3)/(b.h*6)*b.h;
            const wx=glass.p4x+(glass.p3x-glass.p4x)*wp+(glass.p1x-glass.p4x)*hp;
            const wy=glass.p4y+(glass.p3y-glass.p4y)*wp+(glass.p1y-glass.p4y)*hp;
            X.fillStyle='rgba(255,220,100,0.5)';
            X.beginPath();X.arc(wx,wy,.3*z,0,Math.PI*2);X.fill();
          }
        }
      });
      X.restore();
      // Cross bars on window (in wall perspective)
      drawOnNorthWall(tx, 15, 39, 2, 24, '#c8bba0');
      drawOnNorthWall(tx, 5, 27, 22, 2, '#c8bba0');
      // Glass reflection highlight
      X.save();
      X.beginPath();X.moveTo(glass.p1x,glass.p1y);X.lineTo(glass.p2x,glass.p2y);X.lineTo(glass.p3x,glass.p3y);X.lineTo(glass.p4x,glass.p4y);X.closePath();X.clip();
      X.fillStyle='rgba(255,255,255,0.03)';
      const rx=(glass.p1x+glass.p2x)/2, ry=(glass.p1y+glass.p2y)/2;
      X.beginPath();X.moveTo(glass.p1x,glass.p1y);X.lineTo(rx,ry);X.lineTo(glass.p4x+(glass.p1x-glass.p4x)*.3,glass.p4y+(glass.p1y-glass.p4y)*.3);X.closePath();X.fill();
      X.restore();
      break;
    }
    case'lamp':{
      fp(s.x-2.5*z,s.y-1*z,5*z,1.2*z,'#3a3a3a');
      fp(s.x-1.5*z,s.y-2.2*z,3*z,1.2*z,'#444');
      X.fillStyle='#555';X.fillRect(s.x-.5*z,s.y-16*z,1*z,14*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x-.5*z,s.y-16*z,1*z,14*z);
      const shadeg=X.createLinearGradient(s.x-4*z,s.y-16*z,s.x+4*z,s.y-16*z);
      shadeg.addColorStop(0,'#554422');shadeg.addColorStop(.4,'#aa8844');shadeg.addColorStop(1,'#443322');
      X.fillStyle=shadeg;
      X.beginPath();X.moveTo(s.x-3.5*z,s.y-12*z);X.lineTo(s.x+3.5*z,s.y-12*z);X.lineTo(s.x+2.5*z,s.y-17*z);X.lineTo(s.x-2.5*z,s.y-17*z);X.closePath();X.fill();
      X.strokeStyle=OL;X.lineWidth=.5;X.stroke();
      X.fillStyle='#886644';X.fillRect(s.x-2.5*z,s.y-17.5*z,5*z,.8*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x-2.5*z,s.y-17.5*z,5*z,.8*z);
      X.fillStyle='#886644';X.fillRect(s.x-3.5*z,s.y-12.5*z,7*z,.8*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x-3.5*z,s.y-12.5*z,7*z,.8*z);
      // Warm glow
      const glow=X.createRadialGradient(s.x,s.y-12*z,1,s.x,s.y-12*z,14*z);
      glow.addColorStop(0,'rgba(255,200,80,0.18)');glow.addColorStop(1,'rgba(255,200,80,0)');
      X.fillStyle=glow;X.beginPath();X.arc(s.x,s.y-12*z,14*z,0,Math.PI*2);X.fill();
      X.fillStyle='rgba(255,220,100,0.6)';X.beginPath();X.arc(s.x,s.y-13*z,1*z,0,Math.PI*2);X.fill();
      break;
    }
    case'whiteboard':{
      fp(s.x-10*z,s.y-26*z,20*z,17*z,'#555');
      X.fillStyle='#f5f5f0';X.fillRect(s.x-9*z,s.y-25*z,18*z,15*z);X.strokeStyle='#ccc';X.lineWidth=.3;X.strokeRect(s.x-9*z,s.y-25*z,18*z,15*z);
      X.fillStyle='#1a3a8a';X.font=`bold ${2*z}px 'Inter'`;X.textAlign='center';
      X.fillText('SPRINT #14',s.x,s.y-21*z);X.textAlign='left';
      X.strokeStyle='rgba(100,140,200,0.25)';X.lineWidth=.4;
      for(let ln=0;ln<3;ln++){X.beginPath();X.moveTo(s.x-8*z,s.y-19*z+ln*2.5*z);X.lineTo(s.x+8*z,s.y-19*z+ln*2.5*z);X.stroke()}
      X.strokeStyle='#2244aa';X.lineWidth=.6*z;
      X.strokeRect(s.x-7.5*z,s.y-24*z,4*z,2.5*z);
      X.strokeRect(s.x-2.5*z,s.y-24*z,4*z,2.5*z);
      X.strokeRect(s.x+2.5*z,s.y-24*z,4*z,2.5*z);
      X.beginPath();X.moveTo(s.x-4*z,s.y-22.5*z);X.lineTo(s.x-2.5*z,s.y-22.5*z);X.stroke();
      X.beginPath();X.moveTo(s.x+1*z,s.y-22.5*z);X.lineTo(s.x+2.5*z,s.y-22.5*z);X.stroke();
      X.fillStyle='rgba(0,200,100,0.2)';X.fillRect(s.x-7.5*z,s.y-24*z,4*z,2.5*z);
      X.strokeStyle='rgba(40,60,160,0.4)';X.lineWidth=.4*z;
      X.beginPath();X.moveTo(s.x-8*z,s.y-18*z);X.lineTo(s.x-4*z,s.y-18*z);X.stroke();
      X.beginPath();X.moveTo(s.x-8*z,s.y-16.5*z);X.lineTo(s.x-2*z,s.y-16.5*z);X.stroke();
      fp(s.x-4*z,s.y-10*z,8*z,.8*z,'#aaa');
      X.fillStyle='#ffccaa';X.fillRect(s.x+4.5*z,s.y-11*z,2.2*z,1.2*z);X.strokeStyle=OL;X.lineWidth=.3;X.strokeRect(s.x+4.5*z,s.y-11*z,2.2*z,1.2*z);
      break;
    }
    case'clock':{
      // Wall clock drawn on north wall in isometric perspective
      const tx=f.x;
      // Clock body — circular background on wall
      const cBg=drawOnNorthWall(tx, 10, 34, 12, 12, '#3a3a4a');
      // Clock face (slightly smaller, lighter)
      const cFace=drawOnNorthWall(tx, 11, 33, 10, 10, '#f0f0e8');
      // Center of clock face
      const fcx=(cFace.p1x+cFace.p2x+cFace.p3x+cFace.p4x)/4;
      const fcy=(cFace.p1y+cFace.p2y+cFace.p3y+cFace.p4y)/4;
      // Wall direction for stretching marks
      const wnx=cFace.nx, wny=cFace.ny;
      const cr=5*z;
      // Hour marks — placed as dots around an ellipse squeezed to wall perspective
      for(let h=0;h<12;h++){
        const ang=Math.PI*2*h/12-Math.PI/2;
        const mx=fcx+Math.cos(ang)*cr*.75*wnx*1.1+Math.sin(ang)*0;
        const my=fcy+Math.cos(ang)*cr*.75*wny*1.1-Math.sin(ang)*cr*.75;
        X.fillStyle='#333';
        X.beginPath();X.arc(mx,my,.4*z,0,Math.PI*2);X.fill();
      }
      // Animated hands
      const sec=(tk*0.02)%(Math.PI*2);
      const mnt=sec/60;
      const hr=mnt/12;
      X.lineCap='round';
      // Hour hand
      X.strokeStyle='#222';X.lineWidth=1*z;
      X.beginPath();X.moveTo(fcx,fcy);
      X.lineTo(fcx+Math.cos(hr-Math.PI/2)*cr*.4*wnx,fcy+Math.cos(hr-Math.PI/2)*cr*.4*wny-Math.sin(hr-Math.PI/2)*cr*.4);X.stroke();
      // Minute hand
      X.strokeStyle='#333';X.lineWidth=.6*z;
      X.beginPath();X.moveTo(fcx,fcy);
      X.lineTo(fcx+Math.cos(mnt-Math.PI/2)*cr*.6*wnx,fcy+Math.cos(mnt-Math.PI/2)*cr*.6*wny-Math.sin(mnt-Math.PI/2)*cr*.6);X.stroke();
      // Second hand
      X.strokeStyle='#cc2222';X.lineWidth=.3*z;
      X.beginPath();X.moveTo(fcx,fcy);
      X.lineTo(fcx+Math.cos(sec-Math.PI/2)*cr*.65*wnx,fcy+Math.cos(sec-Math.PI/2)*cr*.65*wny-Math.sin(sec-Math.PI/2)*cr*.65);X.stroke();
      X.lineCap='butt';
      // Center dot
      X.fillStyle='#222';X.beginPath();X.arc(fcx,fcy,.7*z,0,Math.PI*2);X.fill();
      break;
    }
    case'poster':{
      // Poster on north wall using drawOnNorthWall
      const tx=f.x;
      // Outer frame
      drawOnNorthWall(tx, 6, 38, 20, 18, '#2a2a3a');
      // Inner canvas
      const pInner=drawOnNorthWall(tx, 8, 36, 16, 14, '#1a1a2e');
      // Abstract art circles — positioned within the poster parallelogram
      const pcx=(pInner.p1x+pInner.p2x+pInner.p3x+pInner.p4x)/4;
      const pcy2=(pInner.p1y+pInner.p2y+pInner.p3y+pInner.p4y)/4;
      const pc=['rgba(255,68,102,0.5)','rgba(68,255,102,0.5)','rgba(68,102,255,0.5)','rgba(255,170,0,0.5)'];
      pc.forEach((c,idx)=>{
        const offX=(idx-1.5)*3*z*pInner.nx;
        const offY=(idx-1.5)*3*z*pInner.ny+Math.sin(idx*2)*1.5*z;
        X.fillStyle=c;
        X.beginPath();X.arc(pcx+offX,pcy2+offY,(2+idx*.4)*z,0,Math.PI*2);X.fill();
      });
      // Title text — at bottom of poster area
      const btx=(pInner.p3x+pInner.p4x)/2;
      const bty=(pInner.p3y+pInner.p4y)/2;
      X.fillStyle='rgba(255,255,255,0.25)';X.font=`${1.5*z}px 'Inter'`;X.textAlign='center';
      X.fillText('SHIP IT',btx,bty-1*z);X.textAlign='left';
      break;
    }
    case'bin':{
      // Wastebasket — slightly larger
      isoBox(s.x,s.y-3*z,6*z,8*z,5*z,'#555');
      // Rim
      X.fillStyle='#666';
      X.beginPath();X.ellipse(s.x,s.y-11*z,3.5*z,1.8*z,0,0,Math.PI*2);X.fill();
      X.strokeStyle=OL;X.lineWidth=.4;X.stroke();
      // Crumpled papers
      X.fillStyle='#ddd';
      X.beginPath();X.arc(s.x-.5*z,s.y-11.5*z,1.2*z,0,Math.PI*2);X.fill();
      X.fillStyle='#ccc';
      X.beginPath();X.arc(s.x+1*z,s.y-12*z,1*z,0,Math.PI*2);X.fill();
      X.fillStyle='#e0e0e0';
      X.beginPath();X.arc(s.x-.8*z,s.y-12.5*z,.7*z,0,Math.PI*2);X.fill();
      break;
    }
    case'watercooler':{
      // Base as isoBox
      isoBox(s.x,s.y-1*z,6*z,9*z,5*z,'#ddd');
      // Front panel detail
      isoBox(s.x,s.y-4*z,4.5*z,3*z,3.5*z,'#ccc');
      // Water bottle body
      X.fillStyle='rgba(100,180,255,0.35)';
      rr(X,s.x-2*z,s.y-16*z,4*z,5.5*z,1*z);X.fill();
      X.strokeStyle='rgba(80,150,220,0.5)';X.lineWidth=.4;
      rr(X,s.x-2*z,s.y-16*z,4*z,5.5*z,1*z);X.stroke();
      // Bottle cap
      isoBox(s.x,s.y-16.5*z,3*z,.8*z,2.5*z,'rgba(80,150,220,0.6)');
      // Water bubbles animation
      const bubT=tk*.08;
      for(let b=0;b<3;b++){
        const by=((bubT+b*2.1)%5.5);
        const bx=Math.sin(b*3+tk*.03)*.6;
        X.fillStyle=`rgba(180,220,255,${.3-by*.04})`;
        X.beginPath();X.arc(s.x+bx*z,s.y-11.5*z-by*z,.35*z,0,Math.PI*2);X.fill();
      }
      // Spigots — two taps (hot/cold)
      fp(s.x-1.5*z,s.y-6*z,1.2*z,1*z,'#cc3333');
      fp(s.x+.3*z,s.y-6*z,1.2*z,1*z,'#3366cc');
      // Cup dispenser on side
      isoBox(s.x+4*z,s.y-6*z,2.5*z,4*z,1.5*z,'#eee');
      // Small cups stacked
      for(let c=0;c<3;c++){
        X.fillStyle='#f8f8f8';X.strokeStyle='#ccc';X.lineWidth=.3;
        X.beginPath();X.ellipse(s.x+4*z,s.y-7.5*z-c*.6*z,.8*z,.4*z,0,0,Math.PI*2);X.fill();X.stroke();
      }
      // Drip tray
      isoBox(s.x,s.y+.5*z,5.5*z,.6*z,4*z,'#888');
      break;
    }
  }
  // ── Close rotation transform ──
  if(_flipH){ X.restore(); }
}

// ====== FURNITURE INFO + INVENTORY ======
// Furniture names for display
const FURN_NAMES={desk:'Escritorio',mon:'Monitor',plant:'Planta',shelf:'Estanteria',couch:'Sofa',chair:'Silla',table:'Mesa',coffee:'Cafetera',screen:'Pantalla',ctable:'Mesa Conf.',rug:'Alfombra',window:'Ventana',lamp:'Lampara',clock:'Reloj',poster:'Poster',bin:'Papelera',watercooler:'Dispensador'};
const FURN_ICONS={desk:'🪑',mon:'🖥️',plant:'🌿',shelf:'📚',couch:'🛋️',chair:'💺',table:'☕',coffee:'☕',screen:'📺',ctable:'📋',rug:'🟫',window:'🪟',lamp:'💡',clock:'🕐',poster:'🖼️',bin:'🗑️',watercooler:'🚰'};
let selectedFurn=null;
const inventory=[];

function showFurnInfo(f){
  selectedFurn=f;
  hideAgentInfo();
  const el=document.getElementById('furn-info');
  el.classList.add('open');
  const name=FURN_NAMES[f.t]||f.t;
  const icon=FURN_ICONS[f.t]||'📦';
  const fi=FURN.indexOf(f);
  el.innerHTML=`<div class="fi-card">
    <div class="fi-top">
      <div class="fi-icon">${icon}</div>
      <div style="flex:1">
        <div class="fi-name">${name}</div>
        <div class="fi-owner">Agents Hotel</div>
      </div>
      <button onclick="hideFurnInfo()" style="background:none;border:1px solid #333;color:#666;font-size:10px;width:20px;height:20px;border-radius:4px;cursor:pointer;padding:0" onmouseover="this.style.borderColor='#ff4444';this.style.color='#ff4444'" onmouseout="this.style.borderColor='#333';this.style.color='#666'">✕</button>
    </div>
    <div class="fi-actions">
      <div class="fi-btn" onclick="startMoveFurn(${fi})"><span class="fi-ico">↔️</span>Mover</div>
      <div class="fi-btn" onclick="rotateFurn(${fi})"><span class="fi-ico">🔄</span>Girar<span style="font-size:7px;color:#00ccff;margin-left:4px">${['↗ 0°','↘ 90°','↙ 180°','↖ 270°'][(f.rot||0)%4]}</span></div>
      <div class="fi-btn" onclick="collectFurn(${fi})"><span class="fi-ico">📦</span>Recoger</div>
    </div>
  </div>`;
}
function hideFurnInfo(){document.getElementById('furn-info').classList.remove('open');selectedFurn=null}

function startMoveFurn(idx){
  if(idx<0||idx>=FURN.length)return;
  editMode=true;
  dragFurn=FURN[idx];
  hideFurnInfo();
}
function rotateFurn(idx){
  if(idx<0||idx>=FURN.length)return;
  const f=FURN[idx];
  // No rotar items de pared
  if(f.t==='window'||f.t==='clock'||f.t==='poster'||f.t==='rug'){
    showToast('Este objeto no se puede girar','#ff8844');
    return;
  }
  f.rot=((f.rot||0)+1)%4;
  showFurnInfo(f);
  const labels=['↗ 0°','↘ 90°','↙ 180°','↖ 270°'];
  showToast('🔄 '+labels[f.rot],'#00ccff');
}
function collectFurn(idx){
  if(idx<0||idx>=FURN.length)return;
  const f=FURN[idx];
  inventory.push({t:f.t,name:FURN_NAMES[f.t]||f.t,icon:FURN_ICONS[f.t]||'📦'});
  FURN.splice(idx,1);
  if(typeof playSound==='function')playSound('place');
  hideFurnInfo();
}

function openInventory(){
  const el=document.getElementById('inv-modal');
  el.classList.add('open');
  renderInventory();
}
function closeInventory(){document.getElementById('inv-modal').classList.remove('open')}
function renderInventory(){
  const body=document.getElementById('inv-body');
  if(inventory.length===0){
    body.innerHTML='<div class="inv-empty">📦 Tu inventario esta vacio.<br><br><span style="font-size:7px;color:#333">Recoge muebles para guardarlos aqui</span></div>';
    return;
  }
  body.innerHTML='<div class="inv-grid">'+inventory.map((item,i)=>`
    <div class="inv-item" onclick="placeFurnFromInventory(${i})">
      <div class="inv-ico">${item.icon}</div>
      <div class="inv-label">${item.name}</div>
    </div>`).join('')+'</div>';
}
function placeFurnFromInventory(idx){
  if(idx<0||idx>=inventory.length)return;
  const item=inventory[idx];
  // Place at center-ish of the map — preserve habboClass so the correct sprite renders
  const fObj={t:item.t,x:4,y:4,rot:0};
  if(item.habboClass) fObj.habboClass=item.habboClass;
  if(item.variant) fObj.variant=item.variant;
  FURN.push(fObj);
  if(typeof playSound==='function')playSound('place');
  inventory.splice(idx,1);
  renderInventory();
  // Enter edit mode to let user position it
  editMode=true;
  document.getElementById('editBtn').classList.add('active');
  dragFurn=FURN[FURN.length-1];
  closeInventory();
  if(!isTestWorld) saveUserState();
}

