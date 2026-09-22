import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {configDefaults} from '../bin/installer.mjs';
import {readReviews,saveReview} from '../dist/reviews.js';
import {saveUpload} from '../dist/uploads.js';
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'bsn-dashboard-'));t.after(()=>{assert.equal(path.dirname(root),path.resolve(os.tmpdir()));assert.ok(path.basename(root).startsWith('bsn-dashboard-'));fs.rmSync(root,{recursive:true,force:true});});return root;}
test('review updates reject stale writers and traversal',t=>{
 const root=fixture(t),config=configDefaults({},root);
 assert.deepEqual(readReviews(root,config).reviews,{});
 const saved=saveReview(root,config,'first',true,'2030-01-01',null);
 assert.equal(readReviews(root,config).reviews.first.nextReviewAt,'2030-01-01');
 assert.throws(()=>saveReview(root,config,'first',false,'',null),/Conflict/);
 assert.throws(()=>saveReview(root,config,'../outside',false,'',saved.revision));
 assert.throws(()=>saveReview(root,config,'first',false,'not-a-date',saved.revision));
 saveReview(root,config,'first',false,'',saved.revision);
});
test('uploads use generated names and reject active content and oversize input',t=>{
 const root=fixture(t);
 const data='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
 const upload=saveUpload(root,'/docs',{data});
 assert.match(upload.path,/^\/docs\/blog-system-next\/[a-f0-9-]+\.png$/);
 assert.ok(fs.existsSync(path.join(root,'public',upload.path.slice('/docs/'.length))));
 assert.throws(()=>saveUpload(root,'',{data:'data:image/svg+xml;base64,'+Buffer.from('<svg onload="alert(1)"/>').toString('base64')}));
 assert.throws(()=>saveUpload(root,'',{data:'data:image/png;base64,'+Buffer.from('<script>alert(1)</script>').toString('base64')}));
 assert.throws(()=>saveUpload(root,'',{data:'data:image/png;base64,'+'A'.repeat(11200004)}));
});
