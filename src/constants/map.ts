import { GameMap } from '../types/game'

export const createInitialMap = (): GameMap => ([
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'powerPellet', 'wall', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'wall', 'powerPellet', 'wall'],
    ['wall', 'dot', 'wall', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'wall', 'dot', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'dot', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'dot', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'wall', 'wall', 'empty', 'wall', 'empty', 'wall', 'wall', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall'],
    ['empty', 'empty', 'empty', 'wall', 'dot', 'wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'dot', 'wall', 'empty', 'empty', 'empty'],
    ['wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'empty', 'wall', 'wall', 'empty', 'wall', 'wall', 'empty', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall'],
    ['empty', 'empty', 'empty', 'empty', 'dot', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall', 'empty', 'empty', 'dot', 'empty', 'empty', 'empty', 'empty'],
    ['wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'empty', 'wall', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall'],
    ['empty', 'empty', 'empty', 'wall', 'dot', 'wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'dot', 'wall', 'empty', 'empty', 'empty'],
    ['wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'empty', 'wall', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'dot', 'wall', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'dot', 'wall', 'wall', 'dot', 'wall'],
    ['wall', 'powerPellet', 'dot', 'wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall', 'dot', 'powerPellet', 'wall'],
    ['wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'wall', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'dot', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'dot', 'wall', 'dot', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'dot', 'wall'],
    ['wall', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'dot', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
])

export const INITIAL_MAP = createInitialMap() 