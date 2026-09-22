"use client";
import type { ComponentProps } from 'react';
import {useStudioRuntime} from './studio-runtime.js';
export default function StudioLink(props:ComponentProps<'a'>){const runtime=useStudioRuntime();return <a {...props} href={props.href?runtime.href(props.href):props.href}/>;}
