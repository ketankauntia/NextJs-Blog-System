export const buildTitle=(parts:string[])=>parts.filter(Boolean).join(' | ').slice(0,60);
export const buildDescription=(value:string)=>value.slice(0,158);
