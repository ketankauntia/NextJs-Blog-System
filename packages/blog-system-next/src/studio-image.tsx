"use client";
/* eslint-disable @next/next/no-img-element -- Host applications need no image loader or remote-pattern setup. */
import type {ComponentProps} from 'react';
import {safeUrl} from './config.js';
export default function StudioImage({fill,preload,priority,...props}:ComponentProps<'img'>&{fill?:boolean;preload?:boolean;priority?:boolean}){return typeof props.src==='string'&&!safeUrl(props.src,true)?null:<img {...props} alt={props.alt??''} loading={preload||priority?'eager':'lazy'} style={{...props.style,...(fill?{position:'absolute',inset:0,width:'100%',height:'100%'}:{})}}/>;}
