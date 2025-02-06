export interface Position {
    x: number
    y: number
}

export type CellType = 'wall' | 'empty' | 'dot' | 'powerPellet'
export type GameMap = CellType[][]
export type Direction = 'up' | 'down' | 'left' | 'right' 