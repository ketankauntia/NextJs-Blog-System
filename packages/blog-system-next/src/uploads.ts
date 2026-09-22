import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {safePath} from './storage.js';
export function saveUpload(root:string,basePath:string,input:{data?:unknown}) {
 if(typeof input.data!=='string'||input.data.length>11200000||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.data)) throw new Error('Use PNG, JPG, WebP or GIF up to 8 MB.');
 const bytes=Buffer.from(input.data.slice(input.data.indexOf(',')+1),'base64');
 if(bytes.length>8*1024*1024) throw new Error('Image too large');
 const ext=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString())?'gif':bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP'?'webp':null;
 if(!ext) throw new Error('Unsupported image');
 const relative=`public/blog-system-next/${randomUUID()}.${ext}`;
 const target=safePath(root,relative);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(safePath(root,relative),bytes,{flag:'wx',mode:0o644});
 return {path:basePath+'/'+relative.slice('public/'.length)};
}
