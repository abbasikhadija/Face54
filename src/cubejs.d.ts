declare module 'cubejs' {
 export default class Cube {
  static initSolver():void;
  static fromString(state:string):Cube;
  move(algorithm:string):this;
  asString():string;
  solve():string;
  isSolved():boolean;
 }
}
