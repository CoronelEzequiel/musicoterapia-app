import { useState, useEffect } from 'react';
import { Activity, Music, Wind, Maximize, Minimize } from 'lucide-react';
import './App.css';
import RhythmicPad from './components/RhythmicPad';
import EmotionOrchestra from './components/EmotionOrchestra';
import Breathing from './components/Breathing';
import InstrumentMatch from './components/InstrumentMatch';
import EmotionMatch from './components/EmotionMatch';
import KaraokeSequence from './components/KaraokeSequence';
import MemoryGame from './components/MemoryGame';

function App() {
  const [activeTab, setActiveTab] = useState('pad');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pad':
        return <RhythmicPad />;
      case 'emotions':
        return <EmotionOrchestra />;
      case 'breathing':
        return <Breathing />;
      case 'instrument-match':
        return <InstrumentMatch />;
      case 'emotion-match':
        return <EmotionMatch />;
      case 'karaoke-seq':
        return <KaraokeSequence />;
      case 'memory':
        return <MemoryGame />;
      default:
        return <RhythmicPad />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="fullscreen-controls">
          <button 
            onClick={toggleFullscreen} 
            className="fullscreen-btn" 
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
        <h1>Musicoterapia Interactiva</h1>
        <p>Módulos de estimulación y regulación emocional</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pad' ? 'active' : ''}`}
          onClick={() => setActiveTab('pad')}
        >
          <Activity size={20} />
          Pad Rítmico
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emotions' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotions')}
        >
          <Music size={20} />
          Orquesta Emociones
        </button>
        <button 
          className={`tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={20} />
          Respiración
        </button>
        <button 
          className={`tab-btn ${activeTab === 'instrument-match' ? 'active' : ''}`}
          onClick={() => setActiveTab('instrument-match')}
        >
          🎸 Unir Instrumentos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emotion-match' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotion-match')}
        >
          😀 Unir Emociones
        </button>
        <button 
          className={`tab-btn ${activeTab === 'karaoke-seq' ? 'active' : ''}`}
          onClick={() => setActiveTab('karaoke-seq')}
        >
          🎤 Paso a Paso Karaoke
        </button>
        <button 
          className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
          onClick={() => setActiveTab('memory')}
        >
          🧠 Memoria Multijugador
        </button>
      </nav>

      <main className="module-container">
        {renderContent()}
      </main>
    </div>
  );
}

export default App; // Force commit