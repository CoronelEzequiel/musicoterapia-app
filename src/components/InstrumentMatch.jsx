import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const PAIRS = [
  { id: 'tambor', inst: '🥁 Tambor', action: '🤲 Golpear con las manos' },
  { id: 'guitarra', inst: '🎸 Guitarra', action: '👆 Rasguear con los dedos' },
  { id: 'pandereta', inst: '🔔 Pandereta', action: '👋 Sacudir con una mano' },
  { id: 'maracas', inst: '🪇 Maracas', action: '💪 Agitar con el brazo' }
];

export default function InstrumentMatch() {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);

  // Shuffle logic on mount
  useEffect(() => {
    const left = PAIRS.map(p => ({ id: p.id, label: p.inst }));
    const right = PAIRS.map(p => ({ id: p.id, label: p.action }));
    
    // Simple shuffle
    setLeftItems(left.sort(() => Math.random() - 0.5));
    setRightItems(right.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        // Match!
        setMatchedPairs(prev => [...prev, selectedLeft]);
        // Play success sound
        playSuccessSound();
      }
      // Reset selection after a short delay
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {
      console.error(e);
    }
  };

  const playInstrumentSound = (id) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (id === 'tambor') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (id === 'guitarra') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      } else if (id === 'pandereta' || id === 'maracas') {
        const bufferSize = ctx.sampleRate * 0.1; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = id === 'pandereta' ? 'highpass' : 'bandpass';
        filter.frequency.value = id === 'pandereta' ? 5000 : 3000;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        noise.start();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const isCompleted = matchedPairs.length === PAIRS.length;

  return (
    <div className="match-game-container">
      <div className="module-header">
        <h2>Unir Instrumento con Acción</h2>
        <p>Toca un instrumento y luego toca cómo se juega. ¡Busca las parejas correctas!</p>
      </div>

      {isCompleted ? (
        <div className="success-message">
          <CheckCircle2 size={64} color="#10b981" />
          <h3>¡Excelente trabajo!</h3>
          <p>Uniste todos los instrumentos correctamente.</p>
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
                  onClick={() => {
                    if (!isMatched) {
                      playInstrumentSound(item.id);
                      setSelectedLeft(item.id);
                    }
                  }}
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
