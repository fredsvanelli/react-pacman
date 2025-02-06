import { useEffect, useRef } from 'react'

export const useGameLoop = (callback: () => void) => {
    const requestRef = useRef<number | null>(null)
    const previousTimeRef = useRef<number | null>(null)
    const callbackRef = useRef(callback)
    // Atualiza o ref com o callback mais recente
    callbackRef.current = callback

    const animate = (time: number) => {
        if (previousTimeRef.current !== null) {
            callbackRef.current() // Usa a versão mais recente do callback
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
