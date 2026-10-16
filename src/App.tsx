import React from 'react';
import { Terminal, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col justify-between">
      <header className="border-b border-oled-surface bg-oled-deep/80 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-oled-surface border border-oled-border flex items-center justify-center text-neon-emerald">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white">
                github-contribution-wallpaper-generator
              </h1>
              <p className="text-xs text-oled-muted">
                Arte generativa e papeis de parede OLED a partir de contribuicoes publicas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-oled-surface border border-oled-border text-neon-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
              v0.1.0-alpha
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="p-3 rounded-2xl bg-oled-dark border border-oled-border mb-6">
          <div className="p-4 rounded-xl bg-oled-surface/50 border border-oled-border/50 text-neon-emerald">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
          Fundacao Tecnica Ativa
        </h2>
        <p className="text-sm text-oled-muted max-w-lg mb-8 leading-relaxed">
          Esta aplicacao executa 100% no cliente sem intermediacao de servidores ou bancos de dados em nuvem. Os wallpapers sao processados e renderizados diretamente no navegador atraves de Canvas 2D nativo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
          <div className="p-4 rounded-xl bg-oled-dark/60 border border-oled-border">
            <div className="flex items-center gap-2 text-neon-emerald mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">3 Modelos</span>
            </div>
            <p className="text-xs text-oled-muted leading-normal">
              Matrix Stream, Topographic Wave 3D e Fibonacci Spiral projetados para telas OLED.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-oled-dark/60 border border-oled-border">
            <div className="flex items-center gap-2 text-neon-emerald mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Privacidade Total</span>
            </div>
            <p className="text-xs text-oled-muted leading-normal">
              Nenhum dado pessoal, token ou historico sai do dispositivo do usuario.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-oled-dark/60 border border-oled-border">
            <div className="flex items-center gap-2 text-neon-emerald mb-2">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Canvas 2D Puro</span>
            </div>
            <p className="text-xs text-oled-muted leading-normal">
              Zero overhead de frameworks 3D pesados. Algoritmos matematicos nativos de alta fidelidade.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-oled-surface bg-oled-deep/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-oled-muted gap-2">
          <span>Operacao local no navegador via Canvas 2D nativo</span>
          <span>Dark OLED #000000 | Neon Accent #00ff59</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
