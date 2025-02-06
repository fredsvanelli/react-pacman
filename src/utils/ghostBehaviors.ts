import { Position } from '../types/game'

export type GhostBehavior = 'chase' | 'scatter' | 'frightened' | 'eyes'

// Posição da casinha dos fantasmas
const GHOST_HOUSE = {
    x: 9,
    y: 9,  // Posição central da casinha
    entrance: { x: 9, y: 7 } // Porta da casinha
}

// Função para ajustar posição com teleporte
const adjustPosition = (pos: Position, gameMap: string[][]): Position => {
    if (pos.x < 0) {
        return { ...pos, x: gameMap[0].length - 1 }
    }
    if (pos.x >= gameMap[0].length) {
        return { ...pos, x: 0 }
    }
    return pos
}

// Função para obter movimentos possíveis
const getValidMoves = (pos: Position, gameMap: string[][]): Position[] => {
    const moves = [
        { x: pos.x, y: pos.y - 1 }, // up
        { x: pos.x + 1, y: pos.y }, // right
        { x: pos.x, y: pos.y + 1 }, // down
        { x: pos.x - 1, y: pos.y }  // left
    ]

    return moves
        .map(move => adjustPosition(move, gameMap))
        .filter(move =>
            move.y >= 0 &&
            move.y < gameMap.length &&
            gameMap[move.y][move.x] !== 'wall'
        )
}

// Função para criar uma chave única para uma posição
const posToKey = (pos: Position): string => `${pos.x},${pos.y}`

// Calcula a distância Manhattan entre duas posições
const getManhattanDistance = (pos1: Position, pos2: Position): number => {
    return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y)
}

// Implementação de BFS para encontrar o melhor caminho
const findPath = (start: Position, target: Position, gameMap: string[][]): Position[] => {
    const queue: Position[] = [start]
    const visited = new Set<string>()
    const parent = new Map<string, Position>()

    visited.add(posToKey(start))

    while (queue.length > 0) {
        const current = queue.shift()!

        // Se chegou ao destino, reconstrói o caminho
        if (current.x === target.x && current.y === target.y) {
            const path: Position[] = []
            let pos: Position | undefined = current

            while (pos) {
                path.unshift(pos)
                const parentPos = parent.get(posToKey(pos))
                pos = parentPos
            }

            return path
        }

        // Explora os vizinhos
        const moves = getValidMoves(current, gameMap)
        for (const move of moves) {
            const key = posToKey(move)
            if (!visited.has(key)) {
                visited.add(key)
                parent.set(key, current)
                queue.push(move)
            }
        }
    }

    // Se não encontrou caminho, retorna apenas a posição atual
    return [start]
}

// Calcula a posição alvo do Pinky baseado na direção do Pac-Man
const getPinkyTarget = (playerPos: Position, playerDirection: string, gameMap: string[][]): Position => {
    const LOOK_AHEAD = 4 // Número de posições à frente
    const targetPos = { ...playerPos }

    switch (playerDirection) {
        case 'up':
            targetPos.y = Math.max(0, playerPos.y - LOOK_AHEAD)
            break
        case 'down':
            targetPos.y = Math.min(gameMap.length - 1, playerPos.y + LOOK_AHEAD)
            break
        case 'left':
            targetPos.x = Math.max(0, playerPos.x - LOOK_AHEAD)
            break
        case 'right':
            targetPos.x = Math.min(gameMap[0].length - 1, playerPos.x + LOOK_AHEAD)
            break
        default:
            return playerPos
    }

    // Se a posição alvo for uma parede, ajusta para a última posição válida
    while (
        targetPos.y >= 0 &&
        targetPos.y < gameMap.length &&
        targetPos.x >= 0 &&
        targetPos.x < gameMap[0].length &&
        gameMap[targetPos.y][targetPos.x] === 'wall'
    ) {
        switch (playerDirection) {
            case 'up':
                targetPos.y++
                break
            case 'down':
                targetPos.y--
                break
            case 'left':
                targetPos.x++
                break
            case 'right':
                targetPos.x--
                break
        }
    }

    return targetPos
}

// Calcula a posição alvo do Inky baseado no Pac-Man e no Blinky
const getInkyTarget = (playerPos: Position, blinkyPos: Position, playerDirection: string, gameMap: string[][]): Position => {
    // Primeiro, pega um ponto 2 posições à frente do Pac-Man
    const intermediatePos = { ...playerPos }

    switch (playerDirection) {
        case 'up':
            intermediatePos.y = Math.max(0, playerPos.y - 2)
            break
        case 'down':
            intermediatePos.y = Math.min(gameMap.length - 1, playerPos.y + 2)
            break
        case 'left':
            intermediatePos.x = Math.max(0, playerPos.x - 2)
            break
        case 'right':
            intermediatePos.x = Math.min(gameMap[0].length - 1, playerPos.x + 2)
            break
    }

    // Calcula o vetor do Blinky até o ponto intermediário
    const vectorX = intermediatePos.x - blinkyPos.x
    const vectorY = intermediatePos.y - blinkyPos.y

    // Dobra o vetor para obter a posição alvo
    const targetPos = {
        x: Math.min(Math.max(blinkyPos.x + (vectorX * 2), 0), gameMap[0].length - 1),
        y: Math.min(Math.max(blinkyPos.y + (vectorY * 2), 0), gameMap.length - 1)
    }

    // Ajusta se a posição alvo for uma parede
    while (
        targetPos.y >= 0 &&
        targetPos.y < gameMap.length &&
        targetPos.x >= 0 &&
        targetPos.x < gameMap[0].length &&
        gameMap[targetPos.y][targetPos.x] === 'wall'
    ) {
        // Move em direção ao centro do mapa
        if (targetPos.x > gameMap[0].length / 2) targetPos.x--
        else targetPos.x++
        if (targetPos.y > gameMap.length / 2) targetPos.y--
        else targetPos.y++
    }

    return targetPos
}

// Verifica se o jogador está na posição inicial
const isPlayerAtStart = (playerPos: Position): boolean => {
    const PLAYER_START = { x: 9, y: 15 } // Posição inicial do Pac-Man
    return playerPos.x === PLAYER_START.x && playerPos.y === PLAYER_START.y
}

// Comportamento comum de fuga para todos os fantasmas
const fleeFromPlayer = (ghostPos: Position, playerPos: Position, gameMap: string[][]): Position => {
    // Pega todos os movimentos possíveis
    const validMoves = getValidMoves(ghostPos, gameMap)

    if (validMoves.length === 0) {
        return ghostPos
    }

    // Escolhe o movimento que maximiza a distância do jogador
    return validMoves.reduce((bestMove, currentMove) => {
        const currentDistance = getManhattanDistance(currentMove, playerPos)
        const bestDistance = getManhattanDistance(bestMove, playerPos)
        return currentDistance > bestDistance ? currentMove : bestMove
    }, validMoves[0])
}

// Comportamento comum para todos os fantasmas quando são "olhos"
const returnToHouse = (ghostPos: Position, gameMap: string[][]): Position => {
    // Primeiro vai até a entrada da casinha
    if (ghostPos.y < GHOST_HOUSE.entrance.y) {
        const pathToEntrance = findPath(ghostPos, GHOST_HOUSE.entrance, gameMap)
        if (pathToEntrance.length > 1) {
            return pathToEntrance[1]
        }
    }

    // Depois entra na casinha
    const pathToCenter = findPath(ghostPos, GHOST_HOUSE, gameMap)
    if (pathToCenter.length > 1) {
        return pathToCenter[1]
    }

    return ghostPos
}

export const ghostBehaviors = {
    // Blinky: persegue diretamente ou foge quando vulnerável
    blinky: (ghostPos: Position, playerPos: Position, gameMap: string[][], isVulnerable?: boolean): Position => {
        // Primeiro verifica se o jogo começou
        if (isPlayerAtStart(playerPos)) {
            return ghostPos
        }

        // Depois verifica se está vulnerável - esta condição precisa vir antes da perseguição
        if (isVulnerable) {
            return fleeFromPlayer(ghostPos, playerPos, gameMap)
        }

        // Se não estiver vulnerável, persegue normalmente
        const path = findPath(ghostPos, playerPos, gameMap)
        if (path.length > 1) {
            return path[1]
        }
        return ghostPos
    },

    // Clyde: alterna entre perseguir e fugir, sempre foge quando vulnerável
    clyde: (ghostPos: Position, playerPos: Position, gameMap: string[][], isVulnerable?: boolean): Position => {
        if (isPlayerAtStart(playerPos)) return ghostPos

        if (isVulnerable) {
            return fleeFromPlayer(ghostPos, playerPos, gameMap)
        }

        const distance = getManhattanDistance(ghostPos, playerPos)
        if (distance < 5) {
            return fleeFromPlayer(ghostPos, playerPos, gameMap)
        }

        const path = findPath(ghostPos, playerPos, gameMap)
        if (path.length > 1) {
            return path[1]
        }
        return ghostPos
    },

    // Pinky: intercepta ou foge quando vulnerável
    pinky: (ghostPos: Position, playerPos: Position, playerDirection: string, gameMap: string[][], isVulnerable?: boolean): Position => {
        if (isPlayerAtStart(playerPos)) return ghostPos

        if (isVulnerable) {
            return fleeFromPlayer(ghostPos, playerPos, gameMap)
        }

        const interceptPos = getPinkyTarget(playerPos, playerDirection, gameMap)
        const path = findPath(ghostPos, interceptPos, gameMap)
        if (path.length > 1) {
            return path[1]
        }
        return ghostPos
    },

    // Inky: movimento baseado no Blinky ou foge quando vulnerável
    inky: (ghostPos: Position, playerPos: Position, playerDirection: string, blinkyPos: Position, gameMap: string[][], isVulnerable?: boolean): Position => {
        if (isPlayerAtStart(playerPos)) return ghostPos

        if (isVulnerable) {
            return fleeFromPlayer(ghostPos, playerPos, gameMap)
        }

        if (!blinkyPos) {
            return ghostBehaviors.blinky(ghostPos, playerPos, gameMap, isVulnerable)
        }

        const targetPos = getInkyTarget(playerPos, blinkyPos, playerDirection, gameMap)
        const path = findPath(ghostPos, targetPos, gameMap)
        if (path.length > 1) {
            return path[1]
        }
        return ghostPos
    },

    // Comportamento comum para todos os fantasmas quando são "olhos"
    eyes: (ghostPos: Position, gameMap: string[][]): Position => {
        return returnToHouse(ghostPos, gameMap)
    }
}

// Verifica se o fantasma chegou na casinha
export const hasReachedHouse = (ghostPos: Position): boolean => {
    return ghostPos.x === GHOST_HOUSE.x && ghostPos.y === GHOST_HOUSE.y
}
