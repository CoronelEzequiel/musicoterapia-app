import { useState, useRef } from 'react';
import { Users, RotateCcw, Trophy, UserPlus, XCircle } from 'lucide-react';

const COLORS = [
  { id: 'red', hex: '#ef4444', freq: 261.63 },    // C4
  { id: 'blue', hex: '#3b82f6', freq: 329.63 },   // E4
  { id: 'green', hex: '#10b981', freq: 392.00 },  // G4
  { id: 'yellow', hex: '#eab308', freq: 523.25 }  // C5
];

export default function MemoryGame() {
  const [gamePhase, setGamePhase] = useState('SETUP'); // SETUP, PLAYING, GAME_OVER
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jugador 1', active: true },
    { id: 2, name: 'Jugador 2', active: true }
  ]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  
  const [litButton, setLitButton] = useState(null);
  const [showingError, setShowingError] = useState(false);
  
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const playErrorSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // ---- SETUP LOGIC ----
  const addPlayer = () => {
    const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    setPlayers([...players, { id: newId, name: `Jugador ${newId}`, active: true }]);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerName = (id, newName) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const startGame = () => {
    if (players.length < 2) return;
    const initialPlayers = players.map(p => ({ ...p, active: true }));
    setPlayers(initialPlayers);
    setTurnIndex(0);
    setSequence([]);
    setPlaybackIndex(0);
    setGamePhase('PLAYING');
  };

  // ---- GAMEPLAY LOGIC ----
  const handleColorClick = (colorId, freq) => {
    if (gamePhase !== 'PLAYING' || showingError) return;

    // Feedback visual y auditivo
    setLitButton(colorId);
    setTimeout(() => setLitButton(null), 300);

    // Si la secuencia está vacía, es el primer movimiento del juego (o tras un error)
    if (sequence.length === 0) {
      playTone(freq);
      setSequence([colorId]);
      passTurn();
      return;
    }

    // El jugador debe repetir la secuencia
    if (playbackIndex < sequence.length) {
      if (colorId === sequence[playbackIndex]) {
        // Correcto!
        playTone(freq);
        setPlaybackIndex(playbackIndex + 1);
      } else {
        // EQUIVOCACIÓN!
        handleElimination();
      }
    } 
    // El jugador ya repitió y ahora está agregando uno nuevo
    else if (playbackIndex === sequence.length) {
      playTone(freq);
      setSequence([...sequence, colorId]);
      passTurn();
    }
  };

  const passTurn = () => {
    setPlaybackIndex(0);
    
    // Find next active player
    let nextIndex = turnIndex;
    let found = false;
    for (let i = 1; i <= players.length; i++) {
      const idx = (turnIndex + i) % players.length;
      if (players[idx].active) {
        nextIndex = idx;
        found = true;
        break;
      }
    }
    setTurnIndex(nextIndex);
  };

  const handleElimination = () => {
    playErrorSound();
    setShowingError(true);
    
    setTimeout(() => {
      setShowingError(false);
      
      const newPlayers = [...players];
      newPlayers[turnIndex].active = false;
      setPlayers(newPlayers);
      
      const activePlayers = newPlayers.filter(p => p.active);
      
      if (activePlayers.length <= 1) {
        setGamePhase('GAME_OVER');
      } else {
        // Buscar al siguiente activo para reiniciar la secuencia
        let nextIndex = turnIndex;
        for (let i = 1; i <= newPlayers.length; i++) {
          const idx = (turnIndex + i) % newPlayers.length;
          if (newPlayers[idx].active) {
            nextIndex = idx;
            break;
          }
        }
        setTurnIndex(nextIndex);
        setSequence([]);
        setPlaybackIndex(0);
      }
    }, 1500);
  };

  const currentPlayer = players[turnIndex];
  const activePlayers = players.filter(p => p.active);
  const winner = activePlayers.length === 1 ? activePlayers[0] : null;

  // ---- RENDER ----
  if (gamePhase === 'SETUP') {
    return (
      <div className="memory-setup">
        <h2><Users size={28} /> Configurar Partida</h2>
        <p>Agrega los jugadores y pónganles sus nombres.</p>
        
        <div className="player-list">
          {players.map((p, index) => (
            <div key={p.id} className="player-input-row">
              <span className="player-number">{index + 1}</span>
              <input 
                type="text" 
                value={p.name}
                onChange={(e) => updatePlayerName(p.id, e.target.value)}
                maxLength={20}
              />
              <button className="remove-btn" onClick={() => removePlayer(p.id)} disabled={players.length <= 2}>
                <XCircle size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="setup-actions">
          <button className="add-player-btn" onClick={addPlayer} disabled={players.length >= 8}>
            <UserPlus size={20} /> Agregar Jugador
          </button>
          <button className="start-game-btn" onClick={startGame} disabled={players.length < 2}>
            ¡Empezar Juego!
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'GAME_OVER') {
    return (
      <div className="memory-setup">
        <Trophy size={80} color="#eab308" />
        <h2 style={{ fontSize: '2.5rem', color: '#eab308' }}>¡Tenemos un Ganador!</h2>
        <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          Felicitaciones <strong>{winner?.name}</strong>, ¡tienes una memoria increíble!
        </p>
        <button className="start-game-btn" onClick={() => setGamePhase('SETUP')}>
          Jugar Otra Vez
        </button>
      </div>
    );
  }

  return (
    <div className={`memory-game-container ${showingError ? 'error-bg' : ''}`}>
      <div className="game-status">
        <div className="current-turn">
          <h3>Turno de: <strong>{currentPlayer?.name}</strong></h3>
          <p className="instruction">
            {sequence.length === 0 
              ? "Toca cualquier color para iniciar la secuencia." 
              : playbackIndex < sequence.length 
                ? `Repite la secuencia... (Faltan ${sequence.length - playbackIndex})` 
                : "¡Perfecto! Ahora inventa uno nuevo."}
          </p>
        </div>
        
        <div className="players-status">
          {players.map(p => (
            <div 
              key={p.id} 
              className={`player-badge ${p.active ? 'active' : 'eliminated'} ${p.id === currentPlayer?.id ? 'current' : ''}`}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <div className="simon-board">
        {COLORS.map(c => (
          <button
            key={c.id}
            className={`simon-btn ${c.id} ${litButton === c.id ? 'lit' : ''}`}
            style={{ backgroundColor: c.hex }}
            onPointerDown={() => handleColorClick(c.id, c.freq)}
            disabled={showingError}
          />
        ))}
      </div>
      
      <div className="sequence-counter">
        Secuencia actual: {sequence.length} colores
      </div>
    </div>
  );
}
