import { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const STEPS = [
  { id: '1', label: '📺 Elegir la canción en la pantalla' },
  { id: '2', label: '🎤 Agarrar el micrófono' },
  { id: '3', label: '🎶 Cantar con muchas ganas' },
  { id: '4', label: '👏 Aplaudir al terminar' }
];

export default function KaraokeSequence() {
  const [availableItems, setAvailableItems] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setSequence([]);
    setHasError(false);
    // Mezclar las opciones
    setAvailableItems([...STEPS].sort(() => Math.random() - 0.5));
  };

  const handleSelect = (item) => {
    // Si ya está completo, no hacer nada
    if (sequence.length >= 4) return;
    
    // Agregar a la secuencia
    const newSequence = [...sequence, item];
    setSequence(newSequence);
    
    // Quitar de los disponibles
    setAvailableItems(prev => prev.filter(i => i.id !== item.id));

    // Validar si completó los 4
    if (newSequence.length === 4) {
      validateSequence(newSequence);
    }
  };

  const handleRemove = (item) => {
    // Si ya completó exitosamente, no puede remover
    if (sequence.length === 4 && !hasError) return;
    
    // Quitar de la secuencia
    setSequence(prev => prev.filter(i => i.id !== item.id));
    setHasError(false);
    
    // Volver a agregar a disponibles
    setAvailableItems(prev => [...prev, item]);
  };

  const validateSequence = (seq) => {
    const isCorrect = seq.every((item, index) => item.id === (index + 1).toString());
    
    if (isCorrect) {
      playSuccessSound();
    } else {
      setHasError(true);
      playErrorSound();
    }
  };

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

  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {
      console.error(e);
    }
  };

  const isSuccess = sequence.length === 4 && !hasError;

  return (
    <div className="sequence-game-container">
      <div className="module-header">
        <h2>Paso a Paso: Karaoke</h2>
        <p>¿En qué orden hacemos las cosas para cantar? Toca los pasos en orden (del 1 al 4).</p>
      </div>

      <div className={`sequence-slots ${hasError ? 'error-shake' : ''}`}>
        {[0, 1, 2, 3].map(index => {
          const item = sequence[index];
          return (
            <div key={`slot-${index}`} className={`sequence-slot ${item ? 'filled' : ''}`}>
              <div className="slot-number">{index + 1}</div>
              {item && (
                <button 
                  className="sequence-item-btn in-slot"
                  onClick={() => handleRemove(item)}
                  disabled={isSuccess}
                >
                  {item.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isSuccess ? (
        <div className="success-message" style={{ marginTop: '20px' }}>
          <CheckCircle2 size={64} color="#10b981" />
          <h3>¡Perfecto!</h3>
          <p>Ese es el orden correcto para cantar en el Karaoke.</p>
          <button className="reset-btn" onClick={resetGame}>
            Volver a armar
          </button>
        </div>
      ) : hasError ? (
        <div className="error-message">
          <p>Mmm... parece que ese no es el orden correcto. Toca los casilleros para desarmarlos e intenta de nuevo.</p>
          <button className="reset-btn retry" onClick={resetGame}>
            <RotateCcw size={20} /> Empezar de cero
          </button>
        </div>
      ) : (
        <div className="available-items">
          <h3>Opciones disponibles:</h3>
          <div className="items-row">
            {availableItems.map(item => (
              <button
                key={`avail-${item.id}`}
                className="sequence-item-btn"
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
