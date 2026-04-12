declare module 'cubejs' {
  export default class Cube {
    constructor()
    static fromString(s: string): Cube
    static random(): Cube
    static scramble(): string
    static initSolver(): void
    asString(): string
    solve(maxDepth?: number): string | null
    move(alg: string): Cube
    isSolved(): boolean
    clone(): Cube
  }
}
