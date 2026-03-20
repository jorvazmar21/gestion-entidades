import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, pass: string) => void;
  errorMsg?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, errorMsg }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    } else {
      alert('Por favor introduzca credenciales.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-4 relative font-['Inter']">
      
      {/* Fondo ajustado a toda la pantalla (cover) con 90% transparencia (10% opacidad) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/Fondo Logueo 01.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.10
        }}
      ></div>

      {/* Tarjeta: De nuevo, escalada al 75% sobre los 420px (aprox max-width 315px) */}
      <div className="w-full max-w-[315px] bg-white p-6 shadow-[0_24px_64px_-16px_rgba(127,29,29,0.15)] relative z-10 rounded-[10px] border-[1.5px] border-[#7f1d1d]">
        
        {/* Cabecera con Logo Topográfico al 75% sobre logo previo (70px) */}
        <div className="flex flex-col items-center justify-center" style={{ marginBottom: '40px' }}>
          <img 
            src="/logo-fractales.svg" 
            alt="Logo Fractales" 
            className="w-[70px] h-[70px] mb-2 object-contain"
            onError={(e) => { 
              // Fallback automático por si el usuario lo guarda como PNG en vez de SVG
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('.png')) {
                target.src = '/logo-fractales.png';
              }
            }}
          />
          <div className="text-center text-[25px] font-bold text-[#7f1d1d] font-['Manrope'] tracking-widest uppercase mt-0 sm:mt-1 leading-none">
            FRACTALES 1.0
          </div>
          <p className="text-[14px] font-semibold text-[#8a716f] tracking-[0.1em] uppercase mt-1">
            By NORTUNEL, S.A.
          </p>
        </div>

        {errorMsg && (
            <div className="text-[10px] text-center text-[#ba1a1a] mb-4 font-bold px-2 py-1.5 bg-[#ffdad6] rounded-sm">
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-[14px]">
          {/* Input de Email */}
          <div className="flex rounded-sm border border-[#cbd5e1] overflow-hidden focus-within:border-[#7f1d1d] transition-colors">
            <input
              type="text"
              autoComplete="off"
              className="w-full bg-[#edf2fc] px-3 py-2 outline-none text-gray-800 text-[11px] placeholder-[#94a3b8]"
              placeholder="jvazquez@nortunel.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="bg-white flex items-center justify-center px-3 border-l border-[#cbd5e1]">
              <Mail className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            </div>
          </div>

          {/* Input de Contraseña */}
          <div className="flex rounded-sm border border-[#cbd5e1] overflow-hidden focus-within:border-[#7f1d1d] transition-colors">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#edf2fc] px-3 py-2 outline-none text-gray-800 text-[11px] placeholder-[#94a3b8]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="bg-[#edf2fc] flex items-center justify-center px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <div className="bg-white flex items-center justify-center px-3 border-l border-[#cbd5e1]">
              <Lock className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            </div>
          </div>

          {/* Controles de Formulario */}
          <div className="flex flex-col gap-4 pt-1 pb-1">
            
            {/* Checkbox flotante arriba */}
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-3 h-3 border-gray-300 rounded-sm text-[#7f1d1d] focus:ring-[#7f1d1d] cursor-pointer" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-[#4b5563] text-[10px] font-medium group-hover:text-[#1f2937] transition-colors">
                Recordarme
              </span>
            </label>
            
            {/* Fila de Botones Centrados */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                type="button"
                className="bg-white text-[#7f1d1d] border-[1px] border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white px-7 py-1.5 rounded-[4px] font-['Manrope'] font-semibold text-[11px] transition-colors shadow-sm"
                onClick={() => {
                  setUsername('');
                  setPassword('');
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-white text-[#7f1d1d] border-[1px] border-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white px-7 py-1.5 rounded-[4px] font-['Manrope'] font-semibold text-[11px] transition-colors shadow-sm"
              >
                Entrar
              </button>
            </div>

          </div>
          
          {/* Enlace de contraseña */}
          <div className="pt-0 flex justify-center mt-2">
            <button 
              type="button" 
              className="text-[#7f1d1d] text-[10px] font-['Inter'] font-medium hover:underline focus:outline-none"
            >
              He olvidado mi contraseña
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
