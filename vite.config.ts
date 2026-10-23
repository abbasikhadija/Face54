import {defineConfig,type Plugin} from 'vite';
// cubejs 1.3.2 assumes top-level `this` is defined before falling back to CJS.
// Module workers have undefined top-level this. Use the existing CJS branch.
function cubejsWorkerCompatibility():Plugin {
 return {name:'cubejs-commonjs-worker',enforce:'pre',transform(code,id){
  if(!id.replaceAll('\\','/').endsWith('/cubejs/lib/solve.js')) return;
  const before="Cube = this.Cube || require('./cube');";
  if(!code.includes(before)) throw Error('cubejs compatibility guard changed; re-evaluate adapter');
  return code.replace(before,"Cube = require('./cube');");
 }};
}
export default defineConfig({base:'/Face54/',plugins:[cubejsWorkerCompatibility()],worker:{plugins:()=>[cubejsWorkerCompatibility()]}});
