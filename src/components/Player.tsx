import { useEffect } from 'react'
import { Position } from '../types/game'

export type Direction = 'left' | 'right' | 'up' | 'down'

interface PlayerProps {
    position: Position
    onMove: (newPos: Position, direction: Direction) => void
}

const Player = ({ position, onMove }: PlayerProps) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const newPos = { ...position }
            let newDirection: Direction

            switch (e.key) {
                case 'ArrowUp':
                    newPos.y -= 1
                    newDirection = 'up'
                    break
                case 'ArrowDown':
                    newPos.y += 1
                    newDirection = 'down'
                    break
                case 'ArrowLeft':
                    newPos.x -= 1
                    newDirection = 'left'
                    break
                case 'ArrowRight':
                    newPos.x += 1
                    newDirection = 'right'
                    break
                default:
                    return
            }

            onMove(newPos, newDirection)
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [position, onMove])

    return null
}

export default Player 