export type V = [number, number, number];
export const faces = ['U','R','F','D','L','B'] as const;
export const solved = faces.map(f => f.repeat(9)).join('');
// Right-handed world: x right, y up, z front. Each grid viewed from outside.
export const frames: {n:V; up:V; right:V}[] = [
 {n:[0,1,0],up:[0,0,-1],right:[1,0,0]},
 {n:[1,0,0],up:[0,1,0],right:[0,0,-1]},
 {n:[0,0,1],up:[0,1,0],right:[1,0,0]},
 {n:[0,-1,0],up:[0,0,1],right:[1,0,0]},
 {n:[-1,0,0],up:[0,1,0],right:[0,0,1]},
 {n:[0,0,-1],up:[0,1,0],right:[-1,0,0]},
];
export type Sticker = {p:V;n:V;color:string};
export const dot = (a:V,b:V) => a.reduce((s,v,i)=>s+v*b[i],0);
export function stickers(state:string):Sticker[] {
 if(state.length!==54 || /[^URFDLB]/.test(state)) throw Error('Expected 54 URFDLB facelets');
 return [...state].map((color,i)=>{
  const f=frames[Math.floor(i/9)], r=Math.floor(i%9/3),c=i%3;
  return {color,n:[...f.n],p:f.n.map((v,k)=>v+(c-1)*f.right[k]+(1-r)*f.up[k]) as V};
 });
}
export function serialize(items:Sticker[]):string {
 const out=Array<string>(54);
 for(const s of items){
  const face=frames.findIndex(f=>dot(f.n,s.n)===1);
  if(face<0) throw Error('Invalid normal');
  const f=frames[face], index=face*9+(1-dot(s.p,f.up))*3+dot(s.p,f.right)+1;
  if(out[index]) throw Error('Duplicate sticker');
  out[index]=s.color;
 }
 if(out.filter(Boolean).length!==54) throw Error('Missing sticker');
 return out.join('');
}
// Clockwise viewed from outside = -90 degrees around outward normal.
export function apply(state:string,alg:string):string {
 let items=stickers(state);
 for(const move of alg.trim().split(/\s+/).filter(Boolean)){
  if(!/^[URFDLB](2|')?$/.test(move)) throw Error(`Unsupported move ${move}`);
  const n=frames[faces.indexOf(move[0] as typeof faces[number])].n;
  const count=move.endsWith('2')?2:move.endsWith("'")?3:1;
  const rotate=(v:V):V=>[
   n[2]*v[1]-n[1]*v[2]+n[0]*dot(n,v),
   n[0]*v[2]-n[2]*v[0]+n[1]*dot(n,v),
   n[1]*v[0]-n[0]*v[1]+n[2]*dot(n,v),
  ];
  for(let t=0;t<count;t++) items=items.map(s=>dot(s.p,n)===1?{...s,p:rotate(s.p),n:rotate(s.n)}:s);
 }
 return serialize(items);
}
export const scramble = "R U2 F' L2 D B2 R' U F2 D' L B U2 R2 F D2";
