/* Resize the original O Gaúcho brand icon with Node builtins only */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const table=Array.from({length:256},(_,v)=>{let c=v;for(let n=0;n<8;n++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function chunk(t,data){
 const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length,0);out.write(t,4);data.copy(out,8);
 let c=0xffffffff;for(const b of out.subarray(4,8+data.length))c=table[(c^b)&255]^(c>>>8);
 out.writeUInt32BE((c^0xffffffff)>>>0,8+data.length);return out;
}
function decode(png){
 if(png.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Not PNG');
 let offset=8,w,h,depth,ct,plte,trans,parts=[];
 while(offset<png.length){const len=png.readUInt32BE(offset),kind=png.toString('ascii',offset+4,offset+8),p=png.subarray(offset+8,offset+8+len);offset+=len+12;
  if(kind==='IHDR'){w=p.readUInt32BE(0);h=p.readUInt32BE(4);depth=p[8];ct=p[9];if(p[12])throw Error('Interlaced PNG not supported')}
  if(kind==='PLTE')plte=p;if(kind==='tRNS')trans=p;if(kind==='IDAT')parts.push(p);
  if(kind==='IEND')break;
 }
 if(depth!==8||![3,2,6].includes(ct))throw Error('Unsupported icon PNG type');
 const bpp=ct===3?1:ct===2?3:4,stride=w*bpp,raw=zlib.inflateSync(Buffer.concat(parts)),data=Buffer.alloc(w*h*4);
 let k=0,previous=Buffer.alloc(stride);
 for(let y=0;y<h;y++){
  const filter=raw[k++],row=Buffer.from(raw.subarray(k,k+stride));k+=stride;
  for(let j=0;j<stride;j++){
   const a=j>=bpp?row[j-bpp]:0,b=previous[j],c=j>=bpp?previous[j-bpp]:0;let v=0;
   if(filter===1)v=a;if(filter===2)v=b;if(filter===3)v=Math.floor((a+b)/2);
   if(filter===4){let p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);v=aa<=bb&&aa<=cc?a:bb<=cc?b:c}
   row[j]=(row[j]+v)&255;
  }
  for(let x=0;x<w;x++){
   const j=x*bpp,d=(y*w+x)*4;
   if(ct===3){const p=row[j];data[d]=plte[p*3];data[d+1]=plte[p*3+1];data[d+2]=plte[p*3+2];data[d+3]=trans&&p<trans.length?trans[p]:255}
   else {data[d]=row[j];data[d+1]=row[j+1];data[d+2]=row[j+2];data[d+3]=ct===6?row[j+3]:255}
  }
  previous=row;
 }
 return {width:w,height:h,data};
}
function encode(w,h,rgba){
 const hdr=Buffer.alloc(13);hdr.writeUInt32BE(w,0);hdr.writeUInt32BE(h,4);hdr[8]=8;hdr[9]=6;
 const scan=Buffer.alloc(h*(w*4+1));for(let y=0;y<h;y++)rgba.copy(scan,y*(1+w*4)+1,y*w*4,(y+1)*w*4);
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
function make(img,size,kind){
 const result=Buffer.alloc(size*size*4),border=Math.max(4,Math.round(size*.055));
 const outer=kind==='tacas'?[207,168,91]:[117,27,48];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const d=(y*size+x)*4,edge=x<border||y<border||x>=size-border||y>=size-border;
  if(edge){result[d]=outer[0];result[d+1]=outer[1];result[d+2]=outer[2];result[d+3]=255}
  else{
   const sx=Math.min(img.width-1,Math.floor((x-border)/(size-2*border)*img.width));
   const sy=Math.min(img.height-1,Math.floor((y-border)/(size-2*border)*img.height));
   img.data.copy(result,d,(sy*img.width+sx)*4,(sy*img.width+sx)*4+4);
  }
 }
 return encode(size,size,result);
}
module.exports=function(base,dir,kind){
 const src=decode(fs.readFileSync(base));
 for(const [size,name] of [[192,'icon-192.png'],[512,'icon-512.png'],[180,'apple-touch-icon.png']]){
  fs.writeFileSync(path.join(dir,name),make(src,size,kind));
 }
 const small=make(src,32,kind),ico=Buffer.alloc(22);
 ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=32;ico[7]=32;ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(small.length,14);ico.writeUInt32LE(22,18);
 fs.writeFileSync(path.join(dir,'favicon.ico'),Buffer.concat([ico,small]));
};
