import fs from 'node:fs';
import {readFile,safePath,revision,writeVersioned} from './storage.js';
import {validSlug} from './core.js';
import type {BlogConfig} from './config.js';
type Review = {reviewedAt:string;nextReviewAt:string};
export function readReviews(root:string,config:BlogConfig) {
 const relative=`${config.contentPath}/reviews.json`;
 if(!fs.existsSync(safePath(root,relative))) return {reviews:{} as Record<string,Review>,revision:null as string|null};
 const source=readFile(root,relative),reviews=JSON.parse(source);
 if(!reviews||typeof reviews!=='object'||Array.isArray(reviews)||Object.keys(reviews).some(s=>!validSlug(s))) throw new Error('Invalid review file');
 return {reviews:reviews as Record<string,Review>,revision:revision(source)};
}
export function saveReview(root:string,config:BlogConfig,slug:string,markReviewed:unknown,nextReviewAt:unknown,expectedRevision:string|null) {
 if(!validSlug(slug)||typeof markReviewed!=='boolean'||typeof nextReviewAt!=='string'||(nextReviewAt!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(nextReviewAt)||!Number.isFinite(Date.parse(nextReviewAt))))) throw new Error('Invalid review');
 if(nextReviewAt && new Date(nextReviewAt).toISOString().slice(0,10)!==nextReviewAt) throw new Error('Invalid calendar date');
 const snapshot=readReviews(root,config);
 const review={reviewedAt:markReviewed?new Date().toISOString().slice(0,10):snapshot.reviews[slug]?.reviewedAt||'',nextReviewAt};
 const source=JSON.stringify({...snapshot.reviews,[slug]:review},null,2)+'\n';
 if(Buffer.byteLength(source)>1024*1024) throw new Error('Too many reviews');
 return {review,revision:writeVersioned(root,`${config.contentPath}/reviews.json`,source,expectedRevision)};
}
