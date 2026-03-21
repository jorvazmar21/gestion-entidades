/**
 * @module useAuthStore
 * @description Gestor maestro de Seguridad y Autenticación del usuario (State manager).
 * @inputs Cadenas de credenciales en bruto provistas desde la UI.
 * @actions Establece conexión criptográfica con `/api/login`, retiene la credencial JWT de sesión temporalmente y ordena la posterior descarga de datos PSet.
 * @files src/store/useAuthStore.ts
 */
import { create } from 'zustand';
import { useDataStore } from './useDataStore';

type AppMode = 'ADMIN' | 'ZEUS';

interface AuthState {
  activeUser: string | null;
  userRole: AppMode | null;
  loginError: string | undefined;
  
  // Acciones
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// "useAuthStore": El Portero de la Discoteca
export const useAuthStore = create<AuthState>((set) => ({
  activeUser: null,
  userRole: null,
  loginError: undefined,

  login: async (username, pass) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password: pass })
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        const role: AppMode = data.role === 'admin' ? 'ADMIN' : 'ZEUS';
        
        // Actualizamos el estado global de Seguridad
        set({ activeUser: data.user, userRole: role, loginError: undefined });
        
        // Disparamos la carga inicial masiva (comunicación con el cerebro de Datos)
        await useDataStore.getState().init();
        return true;
      } else {
        set({ loginError: data.error || 'Usuario o contraseña no válidos.' });
        return false;
      }
    } catch (e: any) {
      console.error(e);
      set({ loginError: 'Error de red al intentar validar la credencial con el servidor.' });
      return false;
    }
  },

  logout: () => {
    set({ activeUser: null, userRole: null, loginError: undefined });
  },
  
  clearError: () => set({ loginError: undefined })
}));
