import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Error capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                ⚠
              </div>
              <div>
                <h1 className="text-base font-bold text-white uppercase tracking-wider">
                  Constructora Del Valle S.A.
                </h1>
                <p className="text-xs text-slate-400">
                  Control de Inventario · Notificación de Error
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-rose-500/40 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-rose-400 mb-1">
                Se detectó una discrepancia en el entorno:
              </p>
              <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap break-all">
                {this.state.error?.message || String(this.state.error)}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Restablecer datos y reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </StrictMode>,
  );
}
