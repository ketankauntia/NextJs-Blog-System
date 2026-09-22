export function getAuthor(name:string) {
 return {name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),initials:name.split(/\s+/).map(p=>p[0]).join('').slice(0,2).toUpperCase(),role:'',bio:''};
}
