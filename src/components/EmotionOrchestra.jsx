import { useState, useRef, useEffect } from 'react';
import { Play, Square } from 'lucide-react';

const EMOTIONS = [
  { 
    id: 'alegria', 
    name: 'Alegría', 
    color: '#eab308', // Amarillo
    audioUrl: '/audio/alegria.mp3'
  },
  { 
    id: 'tristeza', 
    name: 'Tristeza', 
    color: '#3b82f6', // Azul
    audioUrl: '/audio/tristeza.mp3'
  },
  { 
    id: 'enojo', 
    name: 'Enojo', 
    color: '#ef4444', // Rojo
    audioUrl: '/audio/enojo.mp3' 
  },
  { 
    id: 'calma', 
    name: 'Calma', 
    color: '#10b981', // Verde
    audioUrl: '/audio/calma.mp3'
  }
];

export default function EmotionOrchestra() {
  const [activeEmotion, setActiveEmotion] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  const playEmotion = (emotion) => {
    if (activeEmotion === emotion.id) {
      // Si ya está sonando, lo pausamos
      audioRef.current.pause();
      setActiveEmotion(null);
      return;
    }

    // Detenemos el anterior y cargamos el nuevo
    audioRef.current.pause();
    audioRef.current.src = emotion.audioUrl;
    audioRef.current.play().catch(e => console.error("Error reproduciendo audio: ", e));
    setActiveEmotion(emotion.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>Orquesta de Emociones</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Toca una tarjeta para escuchar cómo suena cada emoción. <br/>
          (Los audios ahora se cargan localmente desde la carpeta <code>public/audio/</code>. 
          Podés reemplazarlos por temas de Lali, Tini, etc., conservando esos mismos nombres de archivo).
        </p>
      </div>

      <div className="emotions-grid">
        {EMOTIONS.map((emo) => {
          const isPlaying = activeEmotion === emo.id;
          return (
            <button
              key={emo.id}
              className={`emotion-card ${isPlaying ? 'playing' : ''}`}
              style={{ backgroundColor: isPlaying ? emo.color : 'var(--surface-color)' }}
              onClick={() => playEmotion(emo)}
            >
              <div style={{ 
                color: isPlaying ? '#fff' : emo.color, 
                fontSize: '2rem', 
                marginBottom: '10px' 
              }}>
                {isPlaying ? <Square size={40} /> : <Play size={40} />}
              </div>
              <span style={{ color: isPlaying ? '#fff' : 'var(--text-primary)' }}>
                {emo.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
