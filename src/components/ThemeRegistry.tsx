'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#ED7414', // orange-500 do design system
      dark: '#C95F0C', // orange-600 do design system
      light: '#F08D0D' // orange-400 do design system
    },
    secondary: {
      main: '#33B6E5', // blue-500 do design system
      light: '#4AC0EC' // blue-200 do design system
    },
    background: { 
      default: '#463888', // purple-700 do design system
      paper: '#564C9B' // purple-600 do design system para modais/cards
    },
    text: { 
      primary: '#FFFFFF', // white do design system
      secondary: 'rgba(255,255,255,0.80)' // white-80 do design system
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { 
      fontFamily: "'Inter', sans-serif", 
      fontWeight: 700,
      color: '#ED7414' // orange-500 para h1 conforme design system
    },
    h2: { 
      fontFamily: "'Inter', sans-serif", 
      fontWeight: 700,
      color: '#FFFFFF' // white para h2 conforme design system
    },
    h3: { 
      fontFamily: "'Inter', sans-serif", 
      fontWeight: 700,
      color: '#33B6E5' // blue-500 para h3 conforme design system
    },
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    body1: {
      color: '#FFFFFF' // white para body conforme design system
    },
    caption: {
      color: 'rgba(255,255,255,0.80)' // white-80 para caption conforme design system
    },
    button: { 
      textTransform: 'none', // removendo uppercase conforme design mais moderno
      fontWeight: 600, 
      letterSpacing: '0.02em' 
    },
  },
  shape: {
    borderRadius: 24, // radii.lg do design system como padrão
  },
  components: {
    // Customizações para botões seguindo o design system
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, // radii.pill para botões
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // elevation-sm
          transition: '150ms ease-in-out', // hover-transition
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)', // elevation-md no hover
          }
        },
        contained: {
          background: 'linear-gradient(90deg, #ED7414 0%, #F08D0D 100%)', // button-orange
          '&:hover': {
            background: 'linear-gradient(90deg, #F08D0D 0%, #ED7414 100%)', // button-orange-hover
          },
          '&:active': {
            background: '#C95F0C', // orange-600
            boxShadow: 'none',
          },
          '&:disabled': {
            background: '#F08D0D', // orange-400
            opacity: 0.5,
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: '0 0 0 2px #33B6E5', // blue-500
          }
        }
      }
    },
    // Customizações para cards seguindo o design system
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)', // brand-purple
          borderRadius: 24, // radii.lg
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)', // elevation-md
          '&:hover': {
            boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
            transform: 'translateY(-2px)',
            transition: '150ms ease-in-out',
          }
        }
      }
    },
    // Customizações para campos de input
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '16px', // radii.md
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#33B6E5', // blue-500
            },
            '&.Mui-focused fieldset': {
              borderColor: '#33B6E5', // blue-500
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.80)', // white-80
          },
          '& .MuiOutlinedInput-input': {
            color: '#FFFFFF', // white
          },
        }
      }
    }
  }
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