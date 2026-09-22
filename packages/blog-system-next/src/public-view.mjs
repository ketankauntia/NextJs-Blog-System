"use client";
import {createElement as h} from 'react';
import {StudioProvider} from './studio-runtime.js';
import {BlogListing} from './oss/components/blog/templates/blog-listing.js';
import {PublishedPost} from './oss/app/blog/post/[slug]/page.js';
function postData(p){return {...p,authorSlug:p.author,coverTone:p.coverTone||'primary'};}
export function PublicationView({post,posts=[],template,blogHref,homeHref,name,isFirstPage=true}) {
 return h(StudioProvider,{initial:[],settingsRevision:null,endpoint:'',token:'',studioHref:'',blogHref,homeHref,name},post?h(PublishedPost,{post:postData(post),postTemplate:template,related:[]}):h(BlogListing,{template,posts:posts.map(postData),isFirstPage}));
}
