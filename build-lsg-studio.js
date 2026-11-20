/* LSG Game Studio 360 — build for both original O Gaúcho games */
'use strict';
const fs=require('fs'),path=require('path');
const root=__dirname,web=path.join(root,'www');
const generateIcons=require('./generate-gaucho-icons.js');
function once(source,oldText,newText,label){
 const n=source.split(oldText).length-1;
 if(n!==1)throw Error('Unsafe patch '+label+' — expected 1, got '+n);
 return source.replace(oldText,newText);
}
function boot(kind){
 return [
 'var lsgMusicLevel=1,lsgEffectsLevel=1;',
 'try{var lsgSaved=JSON.parse(localStorage.getItem("lsg_gaucho_'+kind+'_volumes_v1")||"{}");',
 'if(typeof lsgSaved.music==="number")lsgMusicLevel=Math.max(0,Math.min(1,lsgSaved.music));',
 'if(typeof lsgSaved.fx==="number")lsgEffectsLevel=Math.max(0,Math.min(1,lsgSaved.fx));}catch(e){}'
 ].join('\n');
}
function tacas(s){
 s=once(s,'let audioCtx = null;','let audioCtx = null, lsgMusicBus=null, lsgEffectsBus=null;','Taças audio state');
 s=once(s,'function ensureAudio(){',
 'window.lsgApplyAudio=function(){if(lsgMusicBus)lsgMusicBus.gain.value=lsgMusicLevel;if(lsgEffectsBus)lsgEffectsBus.gain.value=lsgEffectsLevel;};\nfunction ensureAudio(){',
 'Taças audio settings');
 s=once(s,"if(audioCtx.state==='suspended') audioCtx.resume();",
 "if(audioCtx.state==='suspended') audioCtx.resume();"+
 " if(!lsgMusicBus&&audioCtx){lsgMusicBus=audioCtx.createGain();lsgMusicBus.connect(audioCtx.destination);}"+
 " if(!lsgEffectsBus&&audioCtx){lsgEffectsBus=audioCtx.createGain();lsgEffectsBus.connect(audioCtx.destination);}"+
 " window.lsgApplyAudio();",'Taças audio buses');
 const n=s.split('o.connect(g).connect(audioCtx.destination)').length-1;
 if(n!==4)throw Error('Taças audio destinations changed: '+n);
 s=s.replaceAll('o.connect(g).connect(audioCtx.destination)','o.connect(g).connect(lsgEffectsBus||audioCtx.destination)');
 s=once(s,'src.connect(f).connect(g).connect(audioCtx.destination)','src.connect(f).connect(g).connect(lsgEffectsBus||audioCtx.destination)','Taças wine pour');
 const a=s.indexOf('function musicNote('),b=s.indexOf('function startArcadeMusic()',a);
 if(a<0||b<a)throw Error('Music function missing');
 let section=s.slice(a,b);
 section=once(section,'o.connect(g).connect(lsgEffectsBus||audioCtx.destination)','o.connect(g).connect(lsgMusicBus||audioCtx.destination)','Taças music bus');
 return s.slice(0,a)+section+s.slice(b);
}
function limite(s){
 s=once(s,'let audioCtx=null, musicMaster=null, musicTimer=null, musicStep=0;',
 'let audioCtx=null, musicMaster=null, musicTimer=null, musicStep=0, lsgSfxBus=null;'+
 '\nfunction lsgEffectsRoute(){if(!audioCtx)return null;'+
 'if(!lsgSfxBus){lsgSfxBus=audioCtx.createGain();lsgSfxBus.connect(audioCtx.destination);}'+
 'lsgSfxBus.gain.value=lsgEffectsLevel;return lsgSfxBus;}'+
 '\nwindow.lsgApplyAudio=function(){if(musicMaster)musicMaster.gain.value=.52*lsgMusicLevel;'+
 'if(resultMaster)resultMaster.gain.value=.34*lsgEffectsLevel;'+
 'if(lsgSfxBus)lsgSfxBus.gain.value=lsgEffectsLevel;};',
 'No Limite audio init');
 s=once(s,'musicMaster.gain.value=.52;','musicMaster.gain.value=.52*lsgMusicLevel;','No Limite music');
 s=once(s,'resultMaster.gain.value=.34;','resultMaster.gain.value=.34*lsgEffectsLevel;','No Limite results');
 const n=s.split('master.connect(audioCtx.destination);').length-1;
 if(n!==2)throw Error('No Limite masters changed: '+n);
 s=s.replaceAll('master.connect(audioCtx.destination);','master.connect(lsgEffectsRoute()||audioCtx.destination);');
 s=once(s,'gain.connect(audioCtx.destination);','gain.connect(lsgEffectsRoute()||audioCtx.destination);','No Limite liquid effect');
 return s;
}
const assets=path.join(web,'assets');fs.mkdirSync(assets,{recursive:true});
fs.copyFileSync(path.join(root,'lsg-gaucho-addon.js'),path.join(assets,'lsg-gaucho-addon.js'));
for(const kind of ['tacas','limite']){
 const dir=kind==='tacas'?web:path.join(web,'no-limite');
 const file=path.join(dir,'index.html');
 let s=fs.readFileSync(file,'utf8');
 if(!s.includes(kind==='tacas'?'O Gaúcho — Desafio das Taças':'O Gaúcho — No Limite'))throw Error('Wrong game HTML '+kind);
 s=once(s,'<script>','<script>\n'+boot(kind)+'\n','Game script '+kind);
 s=kind==='tacas'?tacas(s):limite(s);
 const prefix=kind==='tacas'?'':'/no-limite';
 const h='<meta name="application-name" content="O Gaúcho '+(kind==='tacas'?'Desafio das Taças':'No Limite')+'">'+
 '<link rel="manifest" href="'+prefix+'/manifest.webmanifest">'+
 '<link rel="icon" href="'+prefix+'/icon-192.png" type="image/png" sizes="192x192">'+
 '<link rel="apple-touch-icon" href="'+prefix+'/apple-touch-icon.png">';
 s=once(s,'</head>',h+'</head>','Game head '+kind);
 s=once(s,'<html lang="pt-BR"','<html data-lsg-game="'+kind+'" lang="pt-BR"','Game ID '+kind);
 s=once(s,'</body>','<script src="/assets/lsg-gaucho-addon.js"></script></body>','Addon loader '+kind);
 fs.writeFileSync(file,s);
 generateIcons(path.join(root,'assets/app-icon.png'),dir,kind);
 const manifest={name:kind==='tacas'?'O Gaúcho — Desafio das Taças':'O Gaúcho — No Limite',
 short_name:kind==='tacas'?'Gaúcho Taças':'Gaúcho Limite',start_url:prefix+'/',scope:prefix+'/',
 display:'standalone',background_color:'#291018',theme_color:'#7d0e1c',
 icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]};
 fs.writeFileSync(path.join(dir,'manifest.webmanifest'),JSON.stringify(manifest));
 console.log('LSG Game Studio ready '+kind+' bytes '+Buffer.byteLength(s));
}
