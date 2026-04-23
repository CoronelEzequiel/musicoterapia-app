import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';

export default function Breathing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('Listo'); // Inhala, Exhala, Listo

  useEffect(() => {
    let interval;
    if (isPlaying) {
      setPhase('Inhala...');
      let isInhaling = true;
      
      interval = setInterval(() => {
        isInhaling = !isInhaling;
        setPhase(isInhaling ? 'Inhala...' : 'Exhala...');
      }, 4000); // 4 segundos por fase
    } else {
      setPhase('Listo');
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="breathing-container">
      <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 10 }}>
        <h2>Respiración Guiada</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Sigue el círculo para regular tu ritmo cardíaco y volver a la calma.</p>
      </div>

      <div className="breathing-circle-wrapper">
        <div 
          className="breathing-ring" 
          style={{
            animation: isPlaying ? 'pulse-ring 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        />
        <div 
          className="breathing-circle"
          style={{
            transform: isPlaying && phase === 'Inhala...' ? 'scale(1.5)' : 'scale(1)'
          }}
        >
          {phase}
        </div>
      </div>

      <div className="controls" style={{ zIndex: 10 }}>
        <button 
          className="play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ backgroundColor: isPlaying ? '#ef4444' : 'var(--primary)' }}
        >
          {isPlaying ? <Square size={24} color="white" /> : <Play size={24} color="white" style={{ marginLeft: '4px' }} />}
        </button>
      </div>
      
      {/* Sonido de fondo relajante generado (ruido rosa filtrado) */}
      {isPlaying && <BackgroundDrone />}
    </div>
  );
}

// Subcomponente para generar un sonido relajante continuo (drone) sin latencia
function BackgroundDrone() {
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear ruido rosa simulado (muy relajante)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate gain
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filtro pasa bajos suave
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Frecuencia muy baja para dar sensación de oleaje
    
    // Animación de volumen (oleaje)
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.2;
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start();

    return () => {
      noise.stop();
      ctx.close();
    };
  }, []);
  
  return null;
}

let lastOut = 0;
