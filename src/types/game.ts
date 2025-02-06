export type Direction = 'up' | 'down' | 'left' | 'right'
export type CellType = 'wall' | 'dot' | 'powerPellet' | 'empty'
export type GameMap = CellType[][]

export interface Position {
    x: number
    y: number
}

export interface GhostType {
    id: number
    position: Position
    color: string
    behavior: GhostBehavior
}

export type GhostBehavior = 'chase' | 'scatter' | 'frightened' | 'eyes' 