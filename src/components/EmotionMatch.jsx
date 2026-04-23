import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const PAIRS = [
  { id: 'contento', emotion: '😀 Contento', music: '🎤 Pop Alegre (Ej: Lali)' },
  { id: 'tranquilo', emotion: '😌 Tranquilo', music: '🎸 Acústico (Ej: Abel Pintos)' },
  { id: 'bailar', emotion: '💃 Ganas de bailar', music: '🪗 Cumbia/Cuarteto (Ej: La K\'onga)' },
  { id: 'enojado', emotion: '😠 Enojado', music: '🥁 Rock Fuerte (Ej: Divididos)' } // Agregamos una cuarta para mantener formato 4x4 o 2x4
];

export default function EmotionMatch() {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);

  useEffect(() => {
    const left = PAIRS.map(p => ({ id: p.id, label: p.emotion }));
    const right = PAIRS.map(p => ({ id: p.id, label: p.music }));
    
    setLeftItems(left.sort(() => Math.random() - 0.5));
    setRightItems(right.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        setMatchedPairs(prev => [...prev, selectedLeft]);
        playSuccessSound();
      }
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  }, [selectedLeft, selectedRight]);

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {
      console.error(e);
    }
  };

  const isCompleted = matchedPairs.length === PAIRS.length;

  return (
    <div className="match-game-container">
      <div className="module-header">
        <h2>¿Qué música me hace sentir...?</h2>
        <p>Une cómo te sientes con el estilo de música que más te ayude.</p>
      </div>

      {isCompleted ? (
        <div className="success-message">
          <CheckCircle2 size={64} color="#10b981" />
          <h3>¡Muy bien!</h3>
          <p>Has encontrado la música perfecta para cada emoción.</p>
          <button 
            className="reset-btn"
            onClick={() => {
              setMatchedPairs([]);
              setLeftItems([...leftItems].sort(() => Math.random() - 0.5));
              setRightItems([...rightItems].sort(() => Math.random() - 0.5));
            }}
          >
            Jugar de nuevo
          </button>
        </div>
      ) : (
        <div className="match-columns">
          <div className="column">
            {leftItems.map(item => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selectedLeft === item.id;
              return (
                <button
                  key={`left-${item.id}`}
                  className={`match-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                  onClick={() => !isMatched && setSelectedLeft(item.id)}
                  disabled={isMatched}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="column">
            {rightItems.map(item => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selectedRight === item.id;
              return (
                <button
                  key={`right-${item.id}`}
                  className={`match-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                  onClick={() => !isMatched && setSelectedRight(item.id)}
                  disabled={isMatched}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
