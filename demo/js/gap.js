// GAP Analysis module - handles GAP analysis generation and rendering

function generateGap() {
  const dims = ['Academics','Activities','Projects','Leadership','Standardized'];
  return dims.map(name => ({ name, current: rand(40,75), target: rand(70,95) }));
}

function drawRadar(canvas, data){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height; 
  ctx.clearRect(0,0,w,h);
  const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 30;
  const n = data.length;
  ctx.strokeStyle = '#2a3450';
  ctx.lineWidth = 1;
  for (let level=1; level<=4; level++){
    const rr = (r * level)/4;
    ctx.beginPath();
    for (let i=0;i<n;i++){
      const ang = (Math.PI*2*i)/n - Math.PI/2;
      const x = cx + rr*Math.cos(ang);
      const y = cy + rr*Math.sin(ang);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle = '#9aa4b2';
  ctx.font = '12px system-ui';
  for (let i=0;i<n;i++){
    const ang = (Math.PI*2*i)/n - Math.PI/2;
    const x = cx + (r+10)*Math.cos(ang);
    const y = cy + (r+10)*Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx + r*Math.cos(ang), cy + r*Math.sin(ang));
    ctx.stroke();
    ctx.fillText(data[i].name, x-12, y+4);
  }
  function poly(color, key){
    ctx.beginPath();
    for (let i=0;i<n;i++){
      const val = data[i][key];
      const rr = r * (val/100);
      const ang = (Math.PI*2*i)/n - Math.PI/2;
      const x = cx + rr*Math.cos(ang);
      const y = cy + rr*Math.sin(ang);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.25; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.stroke();
  }
  poly('#6ea8fe','current');
  poly('#7ee787','target');
}

