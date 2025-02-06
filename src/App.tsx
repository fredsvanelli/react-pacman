import { useState, useEffect } from 'react'
import './App.css'
import Game from './components/Game'

function App() {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pacman-high-score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [lives, setLives] = useState(3)
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('pacman-high-score', score.toString())
    }
  }, [score, highScore])

  const resetLives = () => {
    setLives(3)
  }

  const handleLifeLost = () => {
    setLives(prev => prev - 1)
  }

  return (
    <div className="app-container">
      <div className="game-wrapper">
        <header className="game-header">
          <div className="score-container">
            <span>SCORE</span>
            <span className="score">{score}</span>
          </div>
          <div className="high-score-container">
            <span>HIGH SCORE</span>
            <span className="high-score">{highScore}</span>
          </div>
        </header>

        <main className="game-container">
          <Game
            key={gameKey}
            onScoreChange={setScore}
            lives={lives}
            onLifeLost={handleLifeLost}
            onResetLives={resetLives}
            restartGame={() => setGameKey(prev => prev + 1)}
          />
        </main>
      </div>
    </div>
  )
}

export default App
