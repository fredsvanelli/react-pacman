import { useEffect, useRef } from 'react'
import { Position, GhostBehavior, GameMap } from '../types/game'
import { ghostBehaviors } from '../utils/ghostBehaviors'

interface GhostProps {
    id: number
    position: Position
    behavior: GhostBehavior
    playerPos: Position
    playerDirection: string
    blinkyPos: Position
    gameMap: GameMap
    onMove: (newPos: Position) => void
}

const Ghost = ({
    id,
    position,
    behavior,
    playerPos,
    playerDirection,
    blinkyPos,
    gameMap,
    onMove
}: GhostProps): null => {
    const moveIntervalRef = useRef<number | null>(null)
    const isVulnerable = behavior === 'frightened'
    const isEyes = behavior === 'eyes'

    useEffect(() => {
        if (id !== 1 && id !== 2 && id !== 3 && id !== 4) return

        const moveGhost = () => {
            let newPos: Position

            if (isEyes) {
                newPos = ghostBehaviors.eyes(position, gameMap)
            } else {
                switch (id) {
                    case 1:
                        newPos = ghostBehaviors.blinky(position, playerPos, gameMap, isVulnerable)
                        break
                    case 2:
                        newPos = ghostBehaviors.pinky(position, playerPos, playerDirection, gameMap, isVulnerable)
                        break
                    case 3:
                        newPos = ghostBehaviors.inky(
                            position,
                            playerPos,
                            playerDirection,
                            blinkyPos,
                            gameMap,
                            isVulnerable
                        )
                        break
                    case 4:
                        newPos = ghostBehaviors.clyde(position, playerPos, gameMap, isVulnerable)
                        break
                    default:
                        newPos = position
                }
            }

            if (newPos.x !== position.x || newPos.y !== position.y) {
                onMove(newPos)
            }
        }

        const interval = isEyes ? 150 : 250
        moveIntervalRef.current = window.setInterval(moveGhost, interval)

        return () => {
            if (moveIntervalRef.current) {
                clearInterval(moveIntervalRef.current)
            }
        }
    }, [id, position, playerPos, playerDirection, blinkyPos, gameMap, onMove, isVulnerable, isEyes])

    return null
}

export default Ghost 