import { useState, useEffect } from 'react';
import { Trophy, Play, RotateCcw, ChevronRight, CheckCircle2, AlertCircle, User, Wrench, ClipboardList } from 'lucide-react';
import gameData from './data.json';

type Question = {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

type Level = {
  id: number;
  title: string;
  description: string;
  questions: Question[];
};

type GameState = 'HOME' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT' | 'SUMMARY';

export default function App() {
  const [screen, setScreen] = useState<GameState>('HOME');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('bengkel_unlocked_level');
    const savedScore = localStorage.getItem('bengkel_high_score');
    if (savedLevel) setUnlockedLevel(parseInt(savedLevel));
    if (savedScore) setHighScore(parseInt(savedScore));
  }, []);

  const saveProgress = (level: number, currentScore: number) => {
    if (level > unlockedLevel) {
      setUnlockedLevel(level);
      localStorage.setItem('bengkel_unlocked_level', level.toString());
    }
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('bengkel_high_score', currentScore.toString());
    }
  };

  const resetGame = () => {
    if (confirm('Apakah Anda yakin ingin meriset semua progres?')) {
      setUnlockedLevel(1);
      setHighScore(0);
      setScore(0);
      localStorage.removeItem('bengkel_unlocked_level');
      localStorage.removeItem('bengkel_high_score');
      setScreen('HOME');
    }
  };

  const startLevel = (idx: number) => {
    setCurrentLevelIdx(idx);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScreen('PLAYING');
  };

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    
    const currentLevel = gameData.levels[currentLevelIdx];
    const currentQuestion = currentLevel.questions[currentQuestionIdx];
    
    if (optionIdx === currentQuestion.correct) {
      setScore(prev => prev + 10);
    }
  };

  const nextQuestion = () => {
    const currentLevel = gameData.levels[currentLevelIdx];
    if (currentQuestionIdx < currentLevel.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Level finished
      saveProgress(currentLevel.id + 1, score);
      setScreen('RESULT');
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-slide">
      <div className="mb-2 border-b border-zinc-200 pb-4 w-full max-w-lg">
        <h2 className="text-3xl font-black tracking-[0.2em] text-zinc-800">GASPOL 4.0</h2>
        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Gerakan Akselerasi Smart Problem-Oriented Learning Otomotif 4.0</p>
      </div>
      <div className="ascii-box max-w-lg w-full">
        <pre className="text-[10px] leading-none mb-4 text-zinc-600 overflow-x-auto">
{`
   ____________________________________
  /                                    \\
 |    BENGKEL MANAGER SMART v1.0       |
 |    [========================]       |
 |                                     |
 |       [O]        [O]        [O]     |
 |      --|--      --|--      --|--    |
 |       / \\        / \\        / \\     |
  \\____________________________________/
`}
        </pre>
        <h1 className="text-3xl font-bold mb-2">Bengkel Manager Smart</h1>
        <p className="text-zinc-600">Fase F - Elemen Proses Pelayanan dan Manajemen Bengkel Kendaraan Ringan</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => setScreen('LEVEL_SELECT')} className="btn-pixel flex items-center justify-center gap-2 text-lg font-bold">
          <Play size={20} /> MULAI GAME
        </button>
        <button onClick={resetGame} className="btn-pixel flex items-center justify-center gap-2 text-zinc-500">
          <RotateCcw size={18} /> RESET PROGRES
        </button>
      </div>

      <div className="text-sm text-zinc-400 mt-12">
        Copyright © 2026 Kalimmustofa Automotive Education
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="max-w-2xl mx-auto py-8 animate-slide">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Pilih Level</h2>
        <button onClick={() => setScreen('HOME')} className="text-sm underline">Kembali</button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {gameData.levels.map((level, idx) => {
          const isLocked = level.id > unlockedLevel;
          return (
            <button
              key={level.id}
              disabled={isLocked}
              onClick={() => startLevel(idx)}
              className={`ascii-box flex items-center justify-between text-left transition-all ${isLocked ? 'opacity-50 grayscale' : 'hover:bg-zinc-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center border-2 border-zinc-800 font-bold">
                  {level.id}
                </div>
                <div>
                  <h3 className="font-bold">{level.title}</h3>
                  <p className="text-xs text-zinc-500">{level.description}</p>
                </div>
              </div>
              {isLocked ? <AlertCircle size={20} /> : <ChevronRight size={20} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPlaying = () => {
    const level = gameData.levels[currentLevelIdx];
    const question = level.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / level.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto py-8 animate-slide">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Level {level.id}</span>
              <h2 className="text-xl font-bold">{level.title}</h2>
            </div>
            <span className="text-sm font-bold">Skor: {score}</span>
          </div>
          <div className="h-2 w-full bg-zinc-200 border border-zinc-800">
            <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="ascii-box mb-8 min-h-[120px] flex flex-col justify-center">
          <p className="text-lg leading-relaxed">{question.text}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, idx) => {
            let style = "btn-pixel text-left py-4";
            if (isAnswered) {
              if (idx === question.correct) style += " bg-emerald-100 border-emerald-600 text-emerald-900";
              else if (idx === selectedOption) style += " bg-rose-100 border-rose-600 text-rose-900";
              else style += " opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={style}
              >
                <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-slide">
            <div className={`p-4 border-2 mb-4 ${selectedOption === question.correct ? 'border-emerald-800 bg-emerald-50' : 'border-rose-800 bg-rose-50'}`}>
              <div className="flex items-center gap-2 mb-2 font-bold">
                {selectedOption === question.correct ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {selectedOption === question.correct ? 'Jawaban Benar!' : 'Jawaban Salah'}
              </div>
              <p className="text-sm">{question.explanation}</p>
            </div>
            <button onClick={nextQuestion} className="btn-pixel w-full font-bold py-3 flex items-center justify-center gap-2">
              LANJUT <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    const level = gameData.levels[currentLevelIdx];
    const isLastLevel = currentLevelIdx === gameData.levels.length - 1;

    return (
      <div className="max-w-md mx-auto py-12 text-center animate-slide">
        <div className="ascii-box mb-8">
          <Trophy className="mx-auto mb-4 text-amber-500" size={64} />
          <h2 className="text-2xl font-bold mb-2">Level Selesai!</h2>
          <p className="text-zinc-600 mb-4">Anda telah menyelesaikan tantangan di {level.title}</p>
          <div className="text-4xl font-black mb-2">{score}</div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">Total Skor Saat Ini</p>
        </div>

        <div className="flex flex-col gap-3">
          {!isLastLevel ? (
            <button onClick={() => setScreen('LEVEL_SELECT')} className="btn-pixel font-bold py-3">
              PILIH LEVEL BERIKUTNYA
            </button>
          ) : (
            <button onClick={() => setScreen('SUMMARY')} className="btn-pixel font-bold py-3">
              LIHAT HASIL AKHIR
            </button>
          )}
          <button onClick={() => setScreen('HOME')} className="text-sm underline">Kembali ke Menu Utama</button>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="max-w-md mx-auto py-12 text-center animate-slide">
      <div className="ascii-box mb-8">
        <h2 className="text-2xl font-bold mb-6">Sertifikat Kelulusan</h2>
        <div className="border-t border-b border-zinc-200 py-6 my-4">
          <p className="text-sm text-zinc-500 mb-1">Diberikan kepada:</p>
          <p className="text-xl font-bold uppercase tracking-widest">Service Advisor Muda</p>
          <p className="text-xs text-zinc-400 mt-4 italic">Telah menyelesaikan pelatihan manajemen bengkel</p>
        </div>
        <div className="flex justify-around mt-6">
          <div className="text-center">
            <p className="text-xs text-zinc-400 uppercase">Skor Akhir</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-400 uppercase">Status</p>
            <p className="text-2xl font-bold text-emerald-600">KOMPETEN</p>
          </div>
        </div>
      </div>

      <button onClick={() => setScreen('HOME')} className="btn-pixel w-full font-bold py-3">
        MAIN LAGI
      </button>
      
      <div className="mt-8 text-xs text-zinc-400">
        Kalimmustofa Automotive Education
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 border-b-2 border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Wrench size={24} />
          <span className="font-black text-lg tracking-tighter">BMS v1.0</span>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <div className="flex items-center gap-1"><User size={14} /> SA_SMK</div>
          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> ONLINE</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {screen === 'HOME' && renderHome()}
        {screen === 'LEVEL_SELECT' && renderLevelSelect()}
        {screen === 'PLAYING' && renderPlaying()}
        {screen === 'RESULT' && renderResult()}
        {screen === 'SUMMARY' && renderSummary()}
      </main>

      {screen !== 'HOME' && (
        <footer className="max-w-4xl mx-auto mt-12 pt-8 border-t border-zinc-200 text-center text-[10px] text-zinc-400 uppercase tracking-widest">
          Bengkel Manager Smart • SMK Teknik Kendaraan Ringan • Kalimmustofa Automotive Education
        </footer>
      )}
    </div>
  );
}
