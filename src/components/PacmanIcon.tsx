interface PacmanIconProps {
    size?: number
}

const PacmanIcon = ({ size = 24 }: PacmanIconProps) => {
    // Convertendo os ângulos do jogo para o formato do SVG
    const startAngle = 0.25 * Math.PI
    const endAngle = 1.75 * Math.PI
    const radius = 35

    // Calculando os pontos do arco
    const startX = 50 + radius * Math.cos(startAngle)
    const startY = 50 + radius * Math.sin(startAngle)
    const endX = 50 + radius * Math.cos(endAngle)
    const endY = 50 + radius * Math.sin(endAngle)

    // Criando o path usando os mesmos ângulos do jogo
    const pathData = `
        M 50 50
        L ${startX} ${startY}
        A ${radius} ${radius} 0 1 1 ${endX} ${endY}
        Z
    `

    return (
        <div className="pacman-icon">
            <svg width={size} height={size} viewBox="0 0 100 100">
                <path
                    d={pathData}
                    fill="yellow"
                />
            </svg>
        </div>
    )
}

export default PacmanIcon 