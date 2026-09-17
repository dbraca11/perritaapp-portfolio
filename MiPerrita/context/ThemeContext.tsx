import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    primary: string;
    primaryLight: string;
    border: string;
  };
  isReady: boolean;
};

const lightColors = {
  background: '#FFF0F5',
  card: '#FFFFFF',
  text: '#4A1F2E',
  subtext: '#8B5A6B',
  primary: '#E91E63',
  primaryLight: '#F8BBD0',
  border: '#F8BBD0',
};

const darkColors = {
  background: '#1A0F14',
  card: '#2D1B22',
  text: '#FFE4EC',
  subtext: '#C9A0AE',
  primary: '#F06292',
  primaryLight: '#4A1F2E',
  border: '#4A1F2E',
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
  isReady: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((value) => {
      if (value !== null) setIsDark(value === 'dark');
      setIsReady(true);
    });
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    AsyncStorage.setItem('theme', newValue ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);