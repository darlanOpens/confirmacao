'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#CF8F36', dark: '#B3772B', light: '#E4B654' },
    background: { default: '#0c0a07', paper: '#33271a' },
    text: { primary: '#FFFFFF', secondary: '#C4B096' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h4: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h5: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h6: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    button: { textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' },
  },
  shape: {
    borderRadius: 8,
  },
});

export const ColorModeContext = React.createContext({
    toggleColorMode: () => {},
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}