import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { registrarToken } from './notifications';

const DOMINIO_FICTICIO = '@perritaapp.local';

type AuthContextType = {
  user: User | null;
  username: string | null;
  loading: boolean;
  registrar: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  loading: true,
  registrar: async () => {},
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email) {
        setUsername(u.email.replace(DOMINIO_FICTICIO, ''));
      } else {
        setUsername(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Registrar el token de notificaciones cuando el usuario inicia sesión
  useEffect(() => {
    if (user && username) {
      registrarToken(username).catch((err) =>
        console.log('Error registrando token:', err)
      );
    }
  }, [user, username]);

  const registrar = async (nombreUsuario: string, password: string) => {
    const usuario = nombreUsuario.trim().toLowerCase();
    const email = `${usuario}${DOMINIO_FICTICIO}`;
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (nombreUsuario: string, password: string) => {
    const usuario = nombreUsuario.trim().toLowerCase();
    const email = `${usuario}${DOMINIO_FICTICIO}`;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, username, loading, registrar, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);