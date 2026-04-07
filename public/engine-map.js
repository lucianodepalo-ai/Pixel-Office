// =============================================
// ENGINE-MAP.JS — Map Data, Tiles, Walls
// =============================================

// ====== MAP DATA ======
const MAP=[
[0,0,0,0,0,0,0,0,0,0,0,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,1,1,1,1,1,1,1,1,1,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0]
];
const MW=12,MH=10;

// ====== TILE RENDERING ======
function dTile(tx,ty){
  const t=MAP[ty]?.[tx];if(!t)return;
  const i=isoXY(tx,ty),s=w2s(i.x,i.y),tw=TW*zm,th=TH*zm;
  const even=(tx+ty)%2===0;
  const z=zm;

  // Clip to diamond shape
  X.save();
  X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x,s.y+th);X.lineTo(s.x-tw/2,s.y+th/2);X.closePath();
  X.clip();

  if(t===1){
    // === WOOD FLOOR (Habbo parquet style) ===
    const baseCol=even?'#5a422e':'#4e3824';
    X.fillStyle=baseCol;X.fillRect(s.x-tw/2,s.y,tw,th);
    const plankCount=5;
    for(let p=0;p<plankCount;p++){
      const ratio=p/plankCount;
      const nextRatio=(p+1)/plankCount;
      const plankCol=p%2===0?lgt(baseCol,6):drk(baseCol,4);
      const y1=s.y+th*ratio, y2=s.y+th*nextRatio;
      X.fillStyle=plankCol;
      X.fillRect(s.x-tw/2,y1,tw,y2-y1);
      X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.5;
      X.beginPath();X.moveTo(s.x-tw/2,y2);X.lineTo(s.x+tw/2,y2);X.stroke();
      X.strokeStyle='rgba(255,220,160,0.04)';X.lineWidth=0.3;
      const grainY=y1+(y2-y1)*0.5;
      X.beginPath();X.moveTo(s.x-tw/3,grainY);
      X.quadraticCurveTo(s.x,grainY+z*0.3,s.x+tw/3,grainY-z*0.2);X.stroke();
    }
    X.strokeStyle='rgba(255,220,160,0.06)';X.lineWidth=0.6;
    X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x-tw/2,s.y+th/2);X.stroke();
    X.strokeStyle='rgba(0,0,0,0.08)';X.lineWidth=0.6;
    X.beginPath();X.moveTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x,s.y+th);X.stroke();
  }
  else if(t===2){
    // === CERAMIC TILE (Habbo modern style) ===
    const baseCol=even?'#263a5a':'#1e3250';
    X.fillStyle=baseCol;X.fillRect(s.x-tw/2,s.y,tw,th);
    const tGrad=X.createLinearGradient(s.x-tw/4,s.y,s.x+tw/4,s.y+th);
    tGrad.addColorStop(0,'rgba(255,255,255,0.04)');
    tGrad.addColorStop(0.3,'rgba(255,255,255,0)');
    tGrad.addColorStop(1,'rgba(0,0,0,0.03)');
    X.fillStyle=tGrad;X.fillRect(s.x-tw/2,s.y,tw,th);
    X.strokeStyle='rgba(100,140,180,0.12)';X.lineWidth=0.8;
    X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x,s.y+th);X.stroke();
    X.beginPath();X.moveTo(s.x-tw/2,s.y+th/2);X.lineTo(s.x+tw/2,s.y+th/2);X.stroke();
    X.fillStyle='rgba(180,210,255,0.025)';
    X.beginPath();X.arc(s.x-tw*0.12,s.y+th*0.35,tw*0.15,0,Math.PI*2);X.fill();
    X.strokeStyle='rgba(0,0,20,0.08)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x,s.y+th);X.lineTo(s.x-tw/2,s.y+th/2);X.stroke();
  }
  else{
    // === CARPET (Habbo luxury style) ===
    const baseCol=even?'#3a2048':'#34194a';
    X.fillStyle=baseCol;X.fillRect(s.x-tw/2,s.y,tw,th);
    X.fillStyle='rgba(200,120,220,0.03)';
    for(let d=0;d<6;d++){
      const dx2=(Math.sin(tx*7+d*3.7)*0.3)*tw;
      const dy2=(Math.cos(ty*5+d*2.3)*0.3)*th;
      X.beginPath();X.arc(s.x+dx2,s.y+th/2+dy2,z*1.2,0,Math.PI*2);X.fill();
    }
    const m=2.5*z;
    X.strokeStyle='rgba(220,160,255,0.12)';X.lineWidth=0.8;
    X.beginPath();X.moveTo(s.x,s.y+m);X.lineTo(s.x+tw/2-m,s.y+th/2);X.lineTo(s.x,s.y+th-m);X.lineTo(s.x-tw/2+m,s.y+th/2);X.closePath();X.stroke();
    const m2=4.5*z;
    X.strokeStyle='rgba(180,100,220,0.07)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(s.x,s.y+m2);X.lineTo(s.x+tw/2-m2,s.y+th/2);X.lineTo(s.x,s.y+th-m2);X.lineTo(s.x-tw/2+m2,s.y+th/2);X.closePath();X.stroke();
    const m3=tw*0.28;
    X.fillStyle='rgba(180,100,220,0.04)';
    X.beginPath();X.moveTo(s.x,s.y+th/2-m3/2);X.lineTo(s.x+m3/2,s.y+th/2);X.lineTo(s.x,s.y+th/2+m3/2);X.lineTo(s.x-m3/2,s.y+th/2);X.closePath();X.fill();
  }

  X.restore();

  // Tile outline
  X.strokeStyle=t===1?'#2a1a10bb':t===2?'#0f1a30bb':'#1a0a2abb';X.lineWidth=0.4;
  X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x,s.y+th);X.lineTo(s.x-tw/2,s.y+th/2);X.closePath();X.stroke();

  // Floor edge elevation (3D depth)
  const edgeH=4*z;
  if(!MAP[ty+1]?.[tx]||MAP[ty+1][tx]===0){
    const eGrad=X.createLinearGradient(s.x,s.y+th,s.x,s.y+th+edgeH);
    eGrad.addColorStop(0,'#12101e');eGrad.addColorStop(1,'#08060e');
    X.fillStyle=eGrad;
    X.beginPath();X.moveTo(s.x,s.y+th);X.lineTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x+tw/2,s.y+th/2+edgeH);X.lineTo(s.x,s.y+th+edgeH);X.closePath();X.fill();
    X.strokeStyle='rgba(0,0,0,0.3)';X.lineWidth=0.3;X.stroke();
  }
  if(!MAP[ty]?.[tx+1]||MAP[ty][tx+1]===0){
    const eGrad2=X.createLinearGradient(s.x,s.y+th,s.x,s.y+th+edgeH);
    eGrad2.addColorStop(0,'#0e0c18');eGrad2.addColorStop(1,'#06040a');
    X.fillStyle=eGrad2;
    X.beginPath();X.moveTo(s.x+tw/2,s.y+th/2);X.lineTo(s.x,s.y+th);X.lineTo(s.x,s.y+th+edgeH);X.lineTo(s.x+tw/2,s.y+th/2+edgeH);X.closePath();X.fill();
    X.strokeStyle='rgba(0,0,0,0.3)';X.lineWidth=0.3;X.stroke();
  }
}

// ====== WALLS ======
// =============================================
// WALLS — Habbo-style wallpaper with depth
// =============================================
function drawWallSegment(s1,s2,wallH,isNorth,tileIdx){
  const z=zm;
  const dx=s2.x-s1.x, dy=s2.y-s1.y;
  const len=Math.sqrt(dx*dx+dy*dy);

  // Base wall fill with vertical gradient (darker at bottom = depth)
  const baseColor=isNorth?'#2e2e48':'#282840';
  const wGrad=X.createLinearGradient(s1.x,(s1.y+s2.y)/2-wallH,s1.x,(s1.y+s2.y)/2);
  wGrad.addColorStop(0,lgt(baseColor,12));
  wGrad.addColorStop(0.6,baseColor);
  wGrad.addColorStop(1,drk(baseColor,10));
  X.fillStyle=wGrad;
  X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-wallH);X.lineTo(s1.x,s1.y-wallH);X.closePath();X.fill();

  // Wallpaper pattern: vertical stripes (Habbo style)
  const stripeW=len/6;
  const nx=dx/len, ny=dy/len;
  for(let i=0;i<6;i++){
    const even=i%2===0;
    const sx1=s1.x+nx*stripeW*i, sy1=s1.y+ny*stripeW*i;
    const sx2=s1.x+nx*stripeW*(i+1), sy2=s1.y+ny*stripeW*(i+1);
    X.fillStyle=even?'rgba(255,255,255,0.018)':'rgba(0,0,0,0.015)';
    X.beginPath();X.moveTo(sx1,sy1);X.lineTo(sx2,sy2);X.lineTo(sx2,sy2-wallH);X.lineTo(sx1,sy1-wallH);X.closePath();X.fill();
  }

  // Horizontal wallpaper lines (subtle texture)
  const lineSpacing=5*z;
  X.strokeStyle='rgba(255,255,255,0.025)';X.lineWidth=0.5;
  for(let h=lineSpacing;h<wallH;h+=lineSpacing){
    X.beginPath();X.moveTo(s1.x,s1.y-h);X.lineTo(s2.x,s2.y-h);X.stroke();
  }

  // Decorative wallpaper band at 1/3 height (chair rail / dado)
  const bandY=wallH*0.35;
  const bandH=2.5*z;
  X.fillStyle=isNorth?'rgba(80,70,120,0.3)':'rgba(60,55,100,0.3)';
  X.beginPath();
  X.moveTo(s1.x,s1.y-bandY);X.lineTo(s2.x,s2.y-bandY);
  X.lineTo(s2.x,s2.y-bandY-bandH);X.lineTo(s1.x,s1.y-bandY-bandH);
  X.closePath();X.fill();
  X.strokeStyle='rgba(255,255,255,0.04)';X.lineWidth=0.5;
  X.beginPath();X.moveTo(s1.x,s1.y-bandY-bandH);X.lineTo(s2.x,s2.y-bandY-bandH);X.stroke();

  // Crown molding at top
  const crownH=3*z;
  const crownGrad=X.createLinearGradient(s1.x,(s1.y+s2.y)/2-wallH,s1.x,(s1.y+s2.y)/2-wallH+crownH);
  crownGrad.addColorStop(0,isNorth?'#4a4a6a':'#424260');
  crownGrad.addColorStop(1,isNorth?'#35354e':'#2e2e45');
  X.fillStyle=crownGrad;
  X.beginPath();
  X.moveTo(s1.x,s1.y-wallH);X.lineTo(s2.x,s2.y-wallH);
  X.lineTo(s2.x,s2.y-wallH+crownH);X.lineTo(s1.x,s1.y-wallH+crownH);
  X.closePath();X.fill();
  X.strokeStyle='rgba(255,255,255,0.06)';X.lineWidth=0.6;
  X.beginPath();X.moveTo(s1.x,s1.y-wallH);X.lineTo(s2.x,s2.y-wallH);X.stroke();

  // Tile border lines
  X.strokeStyle='rgba(20,18,40,0.6)';X.lineWidth=0.8;
  X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-wallH);X.lineTo(s1.x,s1.y-wallH);X.closePath();X.stroke();
}

function drawWalls(){
  const z=zm;
  const wallH=80*z;

  // North wall
  for(let tx=1;tx<=14;tx++){
    if(!MAP[1]?.[tx])continue;
    const i1=isoXY(tx,1),i2=isoXY(tx+1,1);
    const s1=w2s(i1.x,i1.y),s2=w2s(i2.x,i2.y);
    drawWallSegment(s1,s2,wallH,true,tx);
  }

  // West wall
  for(let ty=1;ty<=11;ty++){
    if(!MAP[ty]?.[1])continue;
    const i1=isoXY(1,ty),i2=isoXY(1,ty+1);
    const s1=w2s(i1.x,i1.y),s2=w2s(i2.x,i2.y);
    drawWallSegment(s1,s2,wallH,false,ty);
  }

  // North baseboard (thicker, with gradient)
  for(let tx=1;tx<=14;tx++){
    if(!MAP[1]?.[tx])continue;
    const i1=isoXY(tx,1),i2=isoXY(tx+1,1);
    const s1=w2s(i1.x,i1.y),s2=w2s(i2.x,i2.y);
    const bh=5*z;
    const bGrad=X.createLinearGradient(s1.x,(s1.y+s2.y)/2-bh,s1.x,(s1.y+s2.y)/2);
    bGrad.addColorStop(0,'#2a2238');bGrad.addColorStop(0.5,'#1e1a2e');bGrad.addColorStop(1,'#141020');
    X.fillStyle=bGrad;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-bh);X.lineTo(s1.x,s1.y-bh);X.closePath();X.fill();
    X.strokeStyle='rgba(255,255,255,0.05)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(s1.x,s1.y-bh);X.lineTo(s2.x,s2.y-bh);X.stroke();
    X.strokeStyle='rgba(0,0,0,0.3)';X.lineWidth=0.6;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.stroke();
    X.strokeStyle='#0a0a18';X.lineWidth=.4;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-bh);X.lineTo(s1.x,s1.y-bh);X.closePath();X.stroke();
  }
  // West baseboard
  for(let ty=1;ty<=11;ty++){
    if(!MAP[ty]?.[1])continue;
    const i1=isoXY(1,ty),i2=isoXY(1,ty+1);
    const s1=w2s(i1.x,i1.y),s2=w2s(i2.x,i2.y);
    const bh=5*z;
    const bGrad=X.createLinearGradient(s1.x,(s1.y+s2.y)/2-bh,s1.x,(s1.y+s2.y)/2);
    bGrad.addColorStop(0,'#262034');bGrad.addColorStop(0.5,'#1c182a');bGrad.addColorStop(1,'#120e1e');
    X.fillStyle=bGrad;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-bh);X.lineTo(s1.x,s1.y-bh);X.closePath();X.fill();
    X.strokeStyle='rgba(255,255,255,0.04)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(s1.x,s1.y-bh);X.lineTo(s2.x,s2.y-bh);X.stroke();
    X.strokeStyle='rgba(0,0,0,0.3)';X.lineWidth=0.6;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.stroke();
    X.strokeStyle='#0a0a18';X.lineWidth=.4;
    X.beginPath();X.moveTo(s1.x,s1.y);X.lineTo(s2.x,s2.y);X.lineTo(s2.x,s2.y-bh);X.lineTo(s1.x,s1.y-bh);X.closePath();X.stroke();
  }

  // Corner pillar
  const corner=isoXY(1,1);
  const cs2=w2s(corner.x,corner.y);
  const pillarW=2*z;
  const pGrad=X.createLinearGradient(cs2.x-pillarW,cs2.y-wallH,cs2.x+pillarW,cs2.y-wallH);
  pGrad.addColorStop(0,'#3a3a55');pGrad.addColorStop(0.5,'#2a2a42');pGrad.addColorStop(1,'#1a1a30');
  X.fillStyle=pGrad;
  X.beginPath();X.moveTo(cs2.x-pillarW,cs2.y);X.lineTo(cs2.x+pillarW,cs2.y);X.lineTo(cs2.x+pillarW,cs2.y-wallH);X.lineTo(cs2.x-pillarW,cs2.y-wallH);X.closePath();X.fill();
  X.strokeStyle='rgba(255,255,255,0.04)';X.lineWidth=0.4;
  X.beginPath();X.moveTo(cs2.x-pillarW,cs2.y-wallH);X.lineTo(cs2.x-pillarW,cs2.y);X.stroke();
}

