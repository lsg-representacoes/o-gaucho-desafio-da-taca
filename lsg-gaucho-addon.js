/* LSG Game Studio — Gaúcho 2 jogos | controles + tutorial animado gravado como vídeo */
(()=>{'use strict';
const id=document.documentElement.getAttribute('data-lsg-game')==='limite'?'limite':'tacas';
const coverId=id==='tacas'?'cover':'coverScreen', tutorialId=id==='tacas'?'helpModal':'tutorialOverlay';
const $=x=>document.getElementById(x), gameTitle=id==='tacas'?'DESAFIO DAS TAÇAS':'NO LIMITE';
const key='lsg_gaucho_'+id+'_volumes_v1';
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
function safe(fn){try{return fn()}catch(e){return null}}
function init(){
 let css=[
 '#lsgConfig,#lsgVideo{position:fixed;inset:0;z-index:2147483000;background:#10070deD;display:grid;place-items:center;padding:12px;overflow:auto;touch-action:pan-y;font-family:system-ui,Arial,sans-serif}',
 '#lsgConfig.lsgHidden,#lsgVideo.lsgHidden{display:none!important}',
 '.lsgBox{width:min(94vw,420px);max-height:92dvh;overflow:auto;background:linear-gradient(145deg,#fff6dd,#ead5a5);border:3px solid #c59a4d;border-radius:19px;padding:13px;color:#562327;text-align:center;box-shadow:0 12px 35px #0009;touch-action:pan-y}',
 '.lsgBox h2{font-size:clamp(17px,4vw,23px);color:#80223c;margin:3px 0 9px}.lsgBox p{font-size:clamp(12px,3vw,15px);margin:8px 0}',
 '.lsgBox label{display:flex;justify-content:space-between;font-weight:800;font-size:14px}',
 '.lsgBox input[type=range]{width:100%;margin:9px 0 15px;accent-color:#842034;touch-action:pan-x}',
 '.lsgBox button{background:#792238;color:#fff3d5;border:2px solid #d6b172;border-radius:11px;padding:9px 13px;font-weight:800;font-size:14px;min-height:38px;cursor:pointer;touch-action:manipulation}',
 '.lsgGear{position:absolute!important;top:12px!important;right:12px!important;width:43px!important;height:43px!important;border-radius:50%!important;border:2px solid #ffdc8a!important;background:#77233a!important;color:#fff!important;font-size:24px!important;z-index:90!important;display:grid!important;place-items:center!important;padding:0!important;cursor:pointer!important}',
 '#lsgGameGear{top:65px!important;right:10px!important;z-index:65!important}',
 '#lsgDemoCanvas,#lsgDemoVideo{display:block;width:100%;height:auto;aspect-ratio:16/13;border:2px solid #c89f58;border-radius:12px;background:#260f1a}',
 '#lsgDemoVideo.lsgHidden,#lsgDemoCanvas.lsgHidden{display:none!important}',
 '.lsgActions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}',
 '#lsgBarWrap{height:6px;border-radius:7px;background:#d8ba86;overflow:hidden}#lsgBar{height:100%;width:0;background:#8f253c}',
 '@media(max-height:540px){.lsgBox{max-height:97dvh;padding:7px}.lsgBox h2{font-size:16px}.lsgBox p{font-size:11px;margin:4px 0}#lsgDemoCanvas,#lsgDemoVideo{max-height:46dvh;object-fit:contain}}'
 ].join('');
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const cover=$(coverId),game=$('game'),original=$(tutorialId);
 if(!cover||!game||!original)return;
 const config=document.createElement('div');config.id='lsgConfig';config.className='lsgHidden';
 config.innerHTML='<section class="lsgBox" role="dialog" aria-modal="true"><h2>⚙ CONFIGURAÇÕES</h2>'+
 '<p>Áudio do jogo '+gameTitle+'</p>'+
 '<label>MÚSICA ARCADE <output id="lsgMusicPct">100%</output></label><input id="lsgMusicRange" type="range" min="0" max="100" step="5">'+
 '<label>EFEITOS SONOROS <output id="lsgFxPct">100%</output></label><input id="lsgFxRange" type="range" min="0" max="100" step="5">'+
 '<div class="lsgActions"><button id="lsgConfigDone" type="button">VOLTAR AO JOGO</button></div>'+
 '<p style="font-size:11px;opacity:.7">Volumes salvos neste dispositivo.</p></section>';
 document.body.appendChild(config);
 let pausedByPanel=false;
 function openConfig(){
  pausedByPanel=false;
  const pause=$('pauseBtn'),opened=cover.getClientRects().length&&getComputedStyle(cover).display!=='none'&&!cover.classList.contains('hidden');
  const already=id==='tacas'?$('pauseModal')?.classList.contains('show'):$('pauseOverlay')&&!$('pauseOverlay').classList.contains('hidden');
  if(!opened&&!already&&pause&&pause.getClientRects().length){safe(()=>pause.click());pausedByPanel=true;}
  $('lsgMusicRange').value=Math.round(window.lsgMusicLevel*100);$('lsgFxRange').value=Math.round(window.lsgEffectsLevel*100);
  $('lsgMusicPct').textContent=$('lsgMusicRange').value+'%';$('lsgFxPct').textContent=$('lsgFxRange').value+'%';
  config.classList.remove('lsgHidden');
 }
 function closeConfig(){
   config.classList.add('lsgHidden');
   if(pausedByPanel){pausedByPanel=false;safe(()=>$('resumeBtn')?.click());}
 }
 function gear(parent,uid,extra){
  const b=document.createElement('button');b.id=uid;b.className='lsgGear';b.type='button';b.textContent='⚙';b.title='Configurações de som';b.setAttribute('aria-label','Configurações de som');
  if(extra)b.style.setProperty('top','65px','important');
  if(getComputedStyle(parent).position==='static')parent.style.position='relative';
  parent.appendChild(b);b.addEventListener('click',openConfig);
 }
 gear(cover,'lsgCoverGear',false);gear(game,'lsgGameGear',true);
 $('lsgConfigDone').addEventListener('click',closeConfig);
 config.addEventListener('pointerdown',e=>{if(e.target===config)closeConfig()});
 for(const [input,field,out] of [['lsgMusicRange','lsgMusicLevel','lsgMusicPct'],['lsgFxRange','lsgEffectsLevel','lsgFxPct']]){
  $(input).addEventListener('input',e=>{
   window[field]=clamp(Number(e.target.value)/100);
   $(out).textContent=e.target.value+'%';
   safe(()=>localStorage.setItem(key,JSON.stringify({music:window.lsgMusicLevel,fx:window.lsgEffectsLevel})));
   if(typeof window.lsgApplyAudio==='function')window.lsgApplyAudio();
  });
 }
 const videoWrap=document.createElement('div');videoWrap.id='lsgVideo';videoWrap.className='lsgHidden';
 videoWrap.innerHTML='<section class="lsgBox" role="dialog" aria-modal="true"><h2>🎬 VÍDEO-TUTORIAL · 8 SEGUNDOS</h2>'+
 '<canvas id="lsgDemoCanvas" width="640" height="520"></canvas><video id="lsgDemoVideo" class="lsgHidden" muted playsinline preload="none"></video>'+
 '<div id="lsgBarWrap"><div id="lsgBar"></div></div><p id="lsgDemoHint">Veja os movimentos do jogo.</p>'+
 '<div class="lsgActions"><button id="lsgReplay" type="button">↻ REVER</button><button id="lsgContinue" type="button">CONTINUAR</button></div></section>';
 document.body.appendChild(videoWrap);
 const canvas=$('lsgDemoCanvas'),cv=canvas.getContext('2d'),vid=$('lsgDemoVideo');
 let frameId=0,webm=null,rec=null,recording=false,currentlyOpen=false;
 function label(txt,x,y,size=23,color='#ffe9bb'){
  cv.fillStyle=color;cv.font='800 '+size+'px system-ui';cv.textAlign='center';cv.textBaseline='middle';cv.fillText(txt,x,y);
 }
 function glass(x,y,colors){
   cv.beginPath();cv.moveTo(x-59,y-78);cv.lineTo(x+59,y-78);cv.lineTo(x+43,y+64);cv.quadraticCurveTo(x,y+82,x-43,y+64);cv.closePath();
   cv.fillStyle='#ffffff1a';cv.fill();cv.lineWidth=5;cv.strokeStyle='#fff1d5';cv.stroke();
   for(let i=0;i<colors.length;i++){cv.fillStyle=colors[i];cv.fillRect(x-41+i*2,y+58-(i+1)*31,82-i*4,30);}
   cv.lineWidth=4;cv.strokeStyle='#e4b979';cv.beginPath();cv.moveTo(x,y+74);cv.lineTo(x,y+105);cv.moveTo(x-30,y+105);cv.lineTo(x+30,y+105);cv.stroke();
 }
 function paint(t){
   const g=cv.createLinearGradient(0,0,640,520);g.addColorStop(0,'#4d1d25');g.addColorStop(1,'#190911');
   cv.fillStyle=g;cv.fillRect(0,0,640,520);
   cv.lineWidth=7;cv.strokeStyle='#c69b62';cv.strokeRect(12,12,616,496);
   label('O GAÚCHO',320,49,37);label(gameTitle,320,89,20,'#e0bc7d');
   if(id==='tacas'){
     glass(176,250,['#99314a','#522b81','#522b81']);
     glass(462,250,['#522b81']);
     if(t<2000){label('1 · TOQUE NA TAÇA DE ORIGEM',320,444,23);label('👆',176,145,54,'#fff');}
     else if(t<4000){label('2 · ESCOLHA A TAÇA DE DESTINO',320,444,22);label('👆',176+(462-176)*Math.min(1,(t-2000)/2000),145,54,'#fff');}
     else{
       cv.strokeStyle='#9037ac';cv.lineWidth=13;cv.beginPath();cv.moveTo(232,210);cv.quadraticCurveTo(330,170,415,225+Math.min(1,(t-4000)/2000)*42);cv.stroke();
       label('3 · TRANSFIRA O VINHO DA MESMA COR',320,444,19);
       if(t>=6800)label('✔ ORGANIZE AS CORES!',320,480,21,'#b8f2b3');
     }
   }else{
     glass(459,259,['#91213e','#91213e']);
     cv.fillStyle='#5faf46';cv.fillRect(411,222,100,20);label('FAIXA VERDE',459,205,15,'#acf299');
     const p=Math.min(1,Math.max(0,(t-1800)/2700));cv.save();cv.translate(192,257-p*65);cv.rotate(p*.8);
     cv.fillStyle='#233f32';cv.fillRect(-28,-95,56,168);cv.fillRect(-12,-132,24,50);
     cv.fillStyle='#f1dfaa';cv.fillRect(-28,-20,56,59);label('GAÚCHO',0,8,12,'#72253a');cv.restore();
     if(t<1800){label('1 · SEGURE A GARRAFA',320,442,23);label('👆',194,361,54,'#fff');}
     else if(t<4900){label('2 · ARRASTE PARA CIMA',320,442,23);label('👆',194,361-p*85,54,'#fff');}
     else{
       cv.lineWidth=13;cv.strokeStyle='#a52241';cv.beginPath();cv.moveTo(251,171);cv.quadraticCurveTo(341,130,450,227);cv.stroke();
       label('3 · SOLTE NA FAIXA VERDE',320,442,23);
       if(t>=6700)label('🎉 ACERTO PERFEITO!',320,483,22,'#b8f2b3');
     }
   }
   $('lsgBar').style.width=Math.round(t/80)+'%';
   $('lsgDemoHint').textContent=t<7600?'Assista e depois pratique no tutorial.':'Agora é sua vez!';
 }
 function closeVideo(){
  if(frameId)cancelAnimationFrame(frameId);frameId=0;
  safe(()=>vid.pause());videoWrap.classList.add('lsgHidden');
  if(recording&&rec?.state==='recording')safe(()=>rec.stop());
 }
 function canvasPlay(){
   vid.classList.add('lsgHidden');canvas.classList.remove('lsgHidden');
   const start=performance.now();
   if(!webm&&!recording&&window.MediaRecorder&&canvas.captureStream){
    safe(()=>{
     const mime=['video/webm;codecs=vp8','video/webm','video/mp4'].find(x=>MediaRecorder.isTypeSupported(x));
     if(!mime)return;
     const stream=canvas.captureStream(15),chunks=[];rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:260000});recording=true;
     rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
     rec.onstop=()=>{recording=false;stream.getTracks().forEach(x=>x.stop());if(chunks.length&&!webm)webm=URL.createObjectURL(new Blob(chunks,{type:mime}))};rec.start();
    });
   }
   function tick(now){const t=Math.min(8000,Math.max(0,now-start));paint(t);if(t<8000&&!videoWrap.classList.contains('lsgHidden'))frameId=requestAnimationFrame(tick);else closeVideo();}
   frameId=requestAnimationFrame(tick);
 }
 function showVideo(){
   closeVideo();videoWrap.classList.remove('lsgHidden');
   if(webm){canvas.classList.add('lsgHidden');vid.classList.remove('lsgHidden');vid.src=webm;vid.currentTime=0;vid.onended=closeVideo;
     const p=safe(()=>vid.play());if(p?.catch)p.catch(canvasPlay);
   }else canvasPlay();
 }
 $('lsgReplay').addEventListener('click',showVideo);
 $('lsgContinue').addEventListener('click',closeVideo);
 videoWrap.addEventListener('pointerdown',e=>{if(e.target===videoWrap)closeVideo()});
 function tutorialVisible(){return id==='tacas'?original.classList.contains('show'):!original.classList.contains('hidden')}
 const btn=document.createElement('button');btn.type='button';btn.textContent='🎬 REVER VÍDEO (8s)';btn.style.cssText='display:block;margin:7px auto;background:#702038;color:#fff1da;border:2px solid #c39d60;border-radius:10px;padding:7px 12px;font:800 12px system-ui;touch-action:manipulation;cursor:pointer';btn.addEventListener('click',showVideo);
 const h=original.querySelector('h2');if(h)h.insertAdjacentElement('afterend',btn);else original.prepend(btn);
 const observer=new MutationObserver(()=>{const open=tutorialVisible();if(open&&!currentlyOpen)showVideo();if(!open&&!videoWrap.classList.contains('lsgHidden'))closeVideo();currentlyOpen=open;});
 observer.observe(original,{attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
