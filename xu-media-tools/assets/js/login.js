const canvas=document.getElementById('rainCanvas'),ctx=canvas.getContext('2d');
let drops=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);drops=Array.from({length:Math.min(260,Math.floor(innerWidth/5))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,l:8+Math.random()*28,s:6+Math.random()*12,o:.08+Math.random()*.3}))}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);ctx.lineWidth=1;for(const d of drops){ctx.strokeStyle=`rgba(112,195,255,${d.o})`;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-3,d.y+d.l);ctx.stroke();d.y+=d.s;d.x-=.8;if(d.y>innerHeight+30){d.y=-30;d.x=Math.random()*innerWidth}}requestAnimationFrame(draw)}
addEventListener('resize',resize);resize();draw();
document.getElementById('togglePass').onclick=()=>{const p=document.getElementById('password');p.type=p.type==='password'?'text':'password'};
