import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App smoke test', () => {
  it('renderiza a casca inicial da aplicacao sem erros', () => {
    render(<App />);
    expect(
      screen.getByText('github-contribution-wallpaper-generator')
    ).toBeInTheDocument();
  });

  it('exibe informacoes sobre a operacao local no navegador', () => {
    render(<App />);
    expect(
      screen.getByText('Fundacao Tecnica Ativa')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Esta aplicacao executa 100% no cliente/i)
    ).toBeInTheDocument();
  });

  it('apresenta os pilares dos 3 modelos generativos e privacidade', () => {
    render(<App />);
    expect(screen.getByText('3 Modelos')).toBeInTheDocument();
    expect(screen.getByText('Privacidade Total')).toBeInTheDocument();
    expect(screen.getByText('Canvas 2D Puro')).toBeInTheDocument();
  });
});
