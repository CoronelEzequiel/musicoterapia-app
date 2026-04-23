import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

const PADS = [
  { id: 'kick', name: 'Bombo', color: '#ef4444', key: 'q' },
  { id: 'snare', name: 'Caja / Tacho', color: '#3b82f6', key: 'w' },
  { id: 'hihat', name: 'Platillo', color: '#eab308', key: 'e' },
  { id: 'shaker', name: 'Shaker', color: '#10b981', key: 'r' },
];

export default function RhythmicPad() {
  const [activePad, setActivePad] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [sequence, setSequence] = useState([]);
  
  const audioCtxRef = useRef(null);
  const recordingStartTime = useRef(0);
  const playbackTimers = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup timeouts al desmontar
      playbackTimers.current.forEach(clearTimeout);
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSound = (type) => {
    initAudio();
    const ctx = audioCtxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'kick') {
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    } else if (type === 'snare') {
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      
      noise.start(t);
    } else if (type === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 7000;
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      
      noise.start(t);
    } else if (type === 'shaker') {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 4000;
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      
      noise.start(t);
    }
  };

  const handleInteract = (id, fromPlayback = false) => {
    setActivePad(id);
    playSound(id);
    setTimeout(() => setActivePad(null), 150);

    if (isRecording && !fromPlayback) {
      const timeOffset = Date.now() - recordingStartTime.current;
      setSequence(prev => [...prev, { id, time: timeOffset }]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setSequence([]); 
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      // Detener si estaba reproduciendo
      stopPlayback();
    }
  };

  const playSequence = () => {
    if (sequence.length === 0 || isRecording || isPlayingSeq) return;
    
    setIsPlayingSeq(true);
    const endTime = Math.max(...sequence.map(s => s.time)) + 500;
    
    sequence.forEach(event => {
      const timer = setTimeout(() => {
        handleInteract(event.id, true);
      }, event.time);
      playbackTimers.current.push(timer);
    });

    const endTimer = setTimeout(() => {
      setIsPlayingSeq(false);
      playbackTimers.current = [];
    }, endTime);
    playbackTimers.current.push(endTimer);
  };

  const stopPlayback = () => {
    playbackTimers.current.forEach(clearTimeout);
    playbackTimers.current = [];
    setIsPlayingSeq(false);
  };

  const clearSequence = () => {
    setSequence([]);
  };

  return (
    <div className="pad-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Pad de Ensamble Rítmico</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Toca los botones para crear ritmos. Ideal para trabajar la motricidad y atención dividida.</p>
        
        {/* Controles de grabación */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            onClick={toggleRecording} 
            className="control-btn-text"
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px', 
              backgroundColor: isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.1)', 
              border: isRecording ? '1px solid #ef4444' : '1px solid var(--glass-border)',
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              animation: isRecording ? 'pulse 2s infinite' : 'none'
            }}
          >
             {isRecording ? <Square size={18} /> : <Mic size={18} />} 
             {isRecording ? 'Grabando...' : 'Grabar Ritmo'}
          </button>

          {sequence.length > 0 && !isRecording && (
            <>
              <button 
                onClick={isPlayingSeq ? stopPlayback : playSequence} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '12px', 
                  backgroundColor: isPlayingSeq ? '#eab308' : '#10b981', 
                  border: '1px solid var(--glass-border)',
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}
              >
                 {isPlayingSeq ? <Square size={18} /> : <Play size={18} />}
                 {isPlayingSeq ? 'Detener' : 'Reproducir Grabación'}
              </button>
              
              <button 
                onClick={clearSequence} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  border: '1px solid var(--glass-border)',
                  color: '#ef4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}
              >
                 <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="pad-grid" style={{ marginTop: '10px' }}>
        {PADS.map((pad) => (
          <button
            key={pad.id}
            className={`drum-pad ${activePad === pad.id ? 'active' : ''}`}
            style={{ 
              borderColor: pad.color,
              boxShadow: activePad === pad.id ? `0 0 20px ${pad.color}80` : 'none',
              backgroundColor: activePad === pad.id ? `${pad.color}30` : 'var(--surface-color)'
            }}
            onMouseDown={() => handleInteract(pad.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleInteract(pad.id);
            }}
          >
            {pad.name}
            <span>{pad.key.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
