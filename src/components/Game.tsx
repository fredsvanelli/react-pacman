import { useCallback, useEffect, useRef, useState } from 'react'
import { GameMap, Position, Direction, GhostType } from '../types/game'
import { useGameLoop } from '../hooks/useGameLoop'
import { INITIAL_MAP } from '../constants/map'
import './Game.css'
import Player from './Player'
import Ghost from './Ghost'
import { hasReachedHouse } from '../utils/ghostBehaviors'
import PacmanIcon from './PacmanIcon'

const INITIAL_GHOSTS: GhostType[] = [
    { id: 1, position: { x: 8, y: 10 }, color: '#FF0000', behavior: 'chase' },   // Blinky: y de 9 para 10
    { id: 2, position: { x: 9, y: 9 }, color: '#FFB8FF', behavior: 'scatter' },   // Pinky: y de 8 para 9
    { id: 3, position: { x: 9, y: 10 }, color: '#00FFFF', behavior: 'scatter' },   // Inky: y de 9 para 10
    { id: 4, position: { x: 10, y: 10 }, color: '#FFB852', behavior: 'scatter' }   // Clyde: y de 9 para 10
]

interface GameProps {
    onScoreChange: (score: number) => void
    lives: number
    onLifeLost: () => void
    onResetLives: () => void
    restartGame?: () => void
}

const INVINCIBLE_TIME = 3000 // 3 segundos
const BLINK_INTERVAL = 200 // Intervalo de piscada em ms

const Game = ({ onScoreChange, lives, onLifeLost, onResetLives, restartGame }: GameProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [gameMap, setGameMap] = useState<GameMap>(INITIAL_MAP)
    const [score, setScore] = useState(0)
    const [playerPos, setPlayerPos] = useState<Position>({ x: 9, y: 16 })
    const [playerDirection, setPlayerDirection] = useState<Direction>('left')
    const [ghosts, setGhosts] = useState<GhostType[]>(INITIAL_GHOSTS)
    const [currentDirection, setCurrentDirection] = useState<Direction | null>(null)
    const lastValidPosition = useRef(playerPos)
    const lastMoveTime = useRef(0)
    const MOVE_INTERVAL = 300 // 0.3 segundos em milissegundos
    const [isInvincible, setIsInvincible] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isGameOver, setIsGameOver] = useState(false)
    const blinkIntervalRef = useRef<number | null>(null)
    const powerUpTimeoutRef = useRef<number | null>(null)
    const [isWin, setIsWin] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [hasGameStarted, setHasGameStarted] = useState(false)

    const drawMap = useCallback((ctx: CanvasRenderingContext2D, scale: number) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        gameMap.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cellX = x * scale
                const cellY = y * scale

                switch (cell) {
                    case 'wall':
                        ctx.fillStyle = '#2121ff'
                        ctx.fillRect(cellX, cellY, scale, scale)
                        break
                    case 'dot':
                        ctx.fillStyle = 'white'
                        ctx.beginPath()
                        ctx.arc(cellX + scale / 2, cellY + scale / 2, scale / 6, 0, Math.PI * 2)
                        ctx.fill()
                        break
                    case 'powerPellet':
                        ctx.fillStyle = 'white'
                        ctx.beginPath()
                        ctx.arc(cellX + scale / 2, cellY + scale / 2, scale / 3, 0, Math.PI * 2)
                        ctx.fill()
                        break
                }
            })
        })
    }, [gameMap])

    const resetPlayerPosition = () => {
        setPlayerPos({ x: 9, y: 16 })
        setPlayerDirection('left')
        setCurrentDirection(null)
    }

    const startInvincibility = () => {
        setIsInvincible(true)

        // Começa a piscar
        blinkIntervalRef.current = window.setInterval(() => {
            setIsVisible(prev => !prev)
        }, BLINK_INTERVAL)

        // Termina a invencibilidade após 3 segundos
        setTimeout(() => {
            setIsInvincible(false)
            setIsVisible(true)
            if (blinkIntervalRef.current) {
                clearInterval(blinkIntervalRef.current)
            }
        }, INVINCIBLE_TIME)
    }

    const handlePlayerDeath = () => {
        onLifeLost()

        if (lives <= 1) {
            setIsGameOver(true)
            setIsPaused(true) // Pausa o jogo no Game Over
            return
        }

        resetPlayerPosition()
        startInvincibility()
    }

    // Função para verificar colisão entre player e fantasma
    const checkGhostCollision = () => {
        ghosts.forEach(ghost => {
            if (ghost.position.x === playerPos.x &&
                ghost.position.y === playerPos.y &&
                !isInvincible) {
                if (ghost.behavior === 'frightened') {
                    const newScore = score + 200
                    setScore(newScore)
                    onScoreChange(newScore)
                    handleGhostCollision(ghost.id)
                } else if (ghost.behavior !== 'eyes') {
                    handlePlayerDeath()
                }
            }
        })
    }

    // Adicione essa função para verificar vitória
    const checkWin = () => {
        const hasDotsLeft = gameMap.some(row =>
            row.some(cell => cell === 'dot' || cell === 'powerPellet')
        )

        if (!hasDotsLeft) {
            setIsWin(true)
            setIsPaused(true) // Pausa o jogo quando vence
        }
    }

    // Modifique a função movePlayer para verificar se está pausado
    const movePlayer = () => {
        if (!currentDirection || isInvincible || isPaused) return

        const currentTime = Date.now()
        if (currentTime - lastMoveTime.current < MOVE_INTERVAL) {
            return
        }

        const newPos = { ...playerPos }

        switch (currentDirection) {
            case 'up':
                newPos.y -= 1
                break
            case 'down':
                newPos.y += 1
                break
            case 'left':
                newPos.x -= 1
                // Teleporte do lado esquerdo para o direito
                if (newPos.x < 0) {
                    newPos.x = gameMap[0].length - 1
                }
                break
            case 'right':
                newPos.x += 1
                // Teleporte do lado direito para o esquerdo
                if (newPos.x >= gameMap[0].length) {
                    newPos.x = 0
                }
                break
        }

        if (gameMap[newPos.y][newPos.x] !== 'wall') {
            setPlayerPos(newPos)
            lastValidPosition.current = newPos
            lastMoveTime.current = currentTime

            // Coleta pontos
            if (gameMap[newPos.y][newPos.x] === 'dot') {
                const newMap = [...gameMap]
                newMap[newPos.y][newPos.x] = 'empty'
                setGameMap(newMap)
                const newScore = score + 10
                setScore(newScore)
                onScoreChange(newScore)
                checkWin()
            } else if (gameMap[newPos.y][newPos.x] === 'powerPellet') {
                const newMap = [...gameMap]
                newMap[newPos.y][newPos.x] = 'empty'
                setGameMap(newMap)
                const newScore = score + 50
                setScore(newScore)
                onScoreChange(newScore)

                // Limpa o timeout anterior se existir
                if (powerUpTimeoutRef.current) {
                    clearTimeout(powerUpTimeoutRef.current)
                }

                // Atualiza o estado dos fantasmas para frightened
                setGhosts(prev => prev.map(ghost => ({
                    ...ghost,
                    behavior: 'frightened'
                })))

                // Salva a referência do novo timeout
                powerUpTimeoutRef.current = window.setTimeout(() => {
                    // Restaura o estado dos fantasmas para chase
                    setGhosts(prev => prev.map(ghost => ({
                        ...ghost,
                        behavior: ghost.behavior === 'frightened' ? 'chase' : ghost.behavior
                    })))
                    powerUpTimeoutRef.current = null
                }, 10000)
                checkWin()
            }

            // Verifica colisão após o movimento
            checkGhostCollision()
        }
    }

    const handlePlayerMove = (_: Position, newDirection: Direction) => {
        if (isInvincible || isGameOver) return
        if (currentDirection === newDirection) {
            return
        }
        if (!hasGameStarted) {
            setHasGameStarted(true)
        }

        setPlayerDirection(newDirection)
        setCurrentDirection(newDirection)
    }

    const handleGhostCollision = (ghostId: number) => {
        setGhosts(prevGhosts => prevGhosts.map(ghost => {
            if (ghost.id === ghostId) {
                if (ghost.behavior === 'frightened') {
                    // Quando o fantasma é comido, muda para estado de "olhos"
                    return {
                        ...ghost,
                        behavior: 'eyes'
                    }
                }
                // Se não estiver vulnerável, lógica de game over...
            }
            return ghost
        }))
    }

    // Função para verificar se há outro fantasma na posição
    const isGhostInPosition = (position: Position, currentGhostId: number): boolean => {
        return ghosts.some(ghost =>
            ghost.id !== currentGhostId &&
            ghost.position.x === position.x &&
            ghost.position.y === position.y
        )
    }

    // Função para atualizar posição do fantasma
    const handleGhostMove = (ghostId: number, newPos: Position) => {
        if (isPaused || !hasGameStarted) return // Adiciona verificação se o jogo começou
        // Verifica se há outro fantasma na nova posição
        if (isGhostInPosition(newPos, ghostId)) {
            return // Cancela o movimento se houver colisão
        }

        setGhosts(prevGhosts => prevGhosts.map(ghost => {
            if (ghost.id === ghostId) {
                if (ghost.behavior === 'eyes' && hasReachedHouse(newPos)) {
                    return {
                        ...ghost,
                        position: newPos,
                        behavior: 'chase'
                    }
                }
                return {
                    ...ghost,
                    position: newPos
                }
            }
            return ghost
        }))

        checkGhostCollision()
    }

    const drawPlayer = (ctx: CanvasRenderingContext2D, scale: number) => {
        if (!isVisible) return
        ctx.fillStyle = 'yellow'
        ctx.beginPath()

        const centerX = playerPos.x * scale + scale / 2
        const centerY = playerPos.y * scale + scale / 2
        const radius = scale / 2

        let startAngle = 0
        let endAngle = 2 * Math.PI

        // Ajusta o ângulo da boca baseado na direção
        switch (playerDirection) {
            case 'right':
                startAngle = 0.25 * Math.PI
                endAngle = 1.75 * Math.PI
                break
            case 'left':
                startAngle = 1.25 * Math.PI
                endAngle = 0.75 * Math.PI
                break
            case 'up':
                startAngle = 1.75 * Math.PI
                endAngle = 1.25 * Math.PI
                break
            case 'down':
                startAngle = 0.75 * Math.PI
                endAngle = 0.25 * Math.PI
                break
        }

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        )
        ctx.lineTo(centerX, centerY)
        ctx.fill()
    }

    const checkIfGhostsOverlap = (ghost: GhostType, ghosts: GhostType[]): Position => {
        // Check if current position overlaps with other ghosts
        const overlappingGhost = ghosts.find(g =>
            g.id !== ghost.id &&
            g.position.x === ghost.position.x &&
            g.position.y === ghost.position.y
        )

        if (!overlappingGhost) {
            return ghost.position
        }

        // Try adjacent positions in this order: right, left, up, down
        const adjacentPositions = [
            { x: ghost.position.x + 1, y: ghost.position.y },
            { x: ghost.position.x - 1, y: ghost.position.y },
            { x: ghost.position.x, y: ghost.position.y - 1 },
            { x: ghost.position.x, y: ghost.position.y + 1 }
        ]

        // Find first valid position that's not a wall and not occupied
        for (const pos of adjacentPositions) {
            if (pos.x >= 0 && pos.x < gameMap[0].length &&
                pos.y >= 0 && pos.y < gameMap.length &&
                gameMap[pos.y][pos.x] !== 'wall' &&
                !ghosts.some(g => g.id !== ghost.id && g.position.x === pos.x && g.position.y === pos.y)) {
                return pos
            }
        }

        // If no valid position found, return original
        return ghost.position
    }

    const drawGhosts = (ctx: CanvasRenderingContext2D, scale: number) => {
        ghosts.forEach(ghost => {
            // Get adjusted position checking for overlaps
            const drawPosition = checkIfGhostsOverlap(ghost, ghosts)

            // Se estiver no estado 'eyes', desenha apenas os olhos
            if (ghost.behavior === 'eyes') {
                // Olhos
                ctx.fillStyle = 'white'
                ctx.beginPath()
                ctx.arc(
                    drawPosition.x * scale + scale / 3,
                    drawPosition.y * scale + scale / 2,
                    scale / 6,
                    0,
                    Math.PI * 2
                )
                ctx.arc(
                    drawPosition.x * scale + (2 * scale / 3),
                    drawPosition.y * scale + scale / 2,
                    scale / 6,
                    0,
                    Math.PI * 2
                )
                ctx.fill()
                return
            }

            // Caso contrário, desenha o fantasma normal ou azul
            ctx.fillStyle = ghost.behavior === 'frightened' ? '#0000FF' : ghost.color

            // Corpo do fantasma
            ctx.beginPath()
            ctx.arc(
                drawPosition.x * scale + scale / 2,
                drawPosition.y * scale + scale / 2,
                scale / 2,
                Math.PI,
                0
            )

            // Base ondulada
            ctx.lineTo(drawPosition.x * scale + scale, drawPosition.y * scale + scale)
            ctx.lineTo(drawPosition.x * scale, drawPosition.y * scale + scale)
            ctx.closePath()
            ctx.fill()

            // Olhos
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(
                drawPosition.x * scale + scale / 3,
                drawPosition.y * scale + scale / 2,
                scale / 6,
                0,
                Math.PI * 2
            )
            ctx.arc(
                drawPosition.x * scale + (2 * scale / 3),
                drawPosition.y * scale + scale / 2,
                scale / 6,
                0,
                Math.PI * 2
            )
            ctx.fill()
        })
    }

    // Modifique a função handleRestart
    const handleRestart = () => {
        // Limpa o timeout do power-up se existir
        if (powerUpTimeoutRef.current) {
            clearTimeout(powerUpTimeoutRef.current)
            powerUpTimeoutRef.current = null
        }
        onResetLives()
        onScoreChange(0)
        setHasGameStarted(false)
        if (restartGame) restartGame()
    }

    // Modifique a função handleRestartWithScore
    const handleRestartWithScore = () => {
        // Limpa o timeout do power-up se existir
        if (powerUpTimeoutRef.current) {
            clearTimeout(powerUpTimeoutRef.current)
            powerUpTimeoutRef.current = null
        }
        onResetLives()
        setHasGameStarted(false)
        if (restartGame) restartGame()
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            const maxHeight = window.innerHeight * 0.7
            const scale = maxHeight / gameMap.length
            canvas.width = gameMap[0].length * scale
            canvas.height = maxHeight
            drawMap(ctx, scale)
        }

        resize()
        window.addEventListener('resize', resize)

        return () => window.removeEventListener('resize', resize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(gameMap)])

    useGameLoop(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const scale = canvas.height / gameMap.length
        movePlayer()
        checkGhostCollision() // Verifica colisão a cada frame
        drawMap(ctx, scale)
        drawPlayer(ctx, scale)
        drawGhosts(ctx, scale)
    })

    return (
        <div className="game-container">
            <div className="game-board">
                <canvas
                    ref={canvasRef}
                    className="game-canvas"
                />
                <Player
                    position={playerPos}
                    onMove={handlePlayerMove}
                />
                {ghosts.map(ghost => (
                    <Ghost
                        key={ghost.id}
                        id={ghost.id}
                        position={ghost.position}
                        behavior={ghost.behavior}
                        playerPos={playerPos}
                        playerDirection={playerDirection}
                        blinkyPos={ghosts[0].position}
                        gameMap={gameMap}
                        onMove={(newPos) => handleGhostMove(ghost.id, newPos)}
                    />
                ))}
            </div>
            <div className="lives-container">
                {Array(Math.max(0, lives)).fill(0).map((_, index) => (
                    <PacmanIcon key={index} />
                ))}
            </div>
            {(isGameOver || isWin) && (
                <div className="game-over-modal">
                    <h2>{isWin ? "You Win!" : "Game Over"}</h2>
                    <p>Score: {score}</p>
                    {isWin ? (
                        <button
                            className="restart-button"
                            onClick={handleRestartWithScore}
                        >
                            Play Again
                        </button>
                    ) : (
                        <button
                            className="restart-button"
                            onClick={handleRestart}
                        >
                            Restart Game
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Game 