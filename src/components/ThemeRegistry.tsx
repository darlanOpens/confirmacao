'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import { tokens } from '@/theme/designSystem';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.red600,
      light: tokens.red600,
      dark: tokens.purple700,
    },
    background: {
      default: tokens.backgroundApp,
      paper: tokens.alphaWhite05,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
  },
  typography: {
    fontFamily: "'Work Sans', var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    h1: { 
      fontFamily: "var(--font-butler), var(--font-playfair-display), Butler, serif",
      fontWeight: 300,
      color: tokens.alphaWhite80,
    },
    h2: { 
      fontFamily: "var(--font-butler), var(--font-playfair-display), Butler, serif",
      fontWeight: 300,
      color: tokens.alphaWhite80,
    },
    h3: { 
      fontFamily: "var(--font-butler), var(--font-playfair-display), Butler, serif",
      fontWeight: 300,
      color: tokens.alphaWhite80,
    },
    h4: { fontFamily: "var(--font-butler), Butler, serif", fontWeight: 300, color: tokens.alphaWhite80 },
    h5: { fontFamily: "var(--font-butler), Butler, serif", fontWeight: 300, color: tokens.alphaWhite80 },
    h6: { fontFamily: "var(--font-butler), Butler, serif", fontWeight: 300, color: tokens.alphaWhite80 },
    body1: {
      color: tokens.textPrimary,
    },
    caption: {
      color: tokens.textSecondary,
    },
    button: { 
      textTransform: 'none', // removendo uppercase conforme design mais moderno
      fontWeight: 600, 
      letterSpacing: '0.02em' 
    },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    // Remover arredondamento do AppBar (herda de Paper por padrão)
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        }
      }
    },
    // Customizações para botões seguindo o design system
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          transition: '150ms ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          }
        },
        contained: {
          background: tokens.primaryGradient,
          '&:hover': {
            background: tokens.primaryHoverGradient,
          },
          '&:active': {
            background: tokens.red600,
            boxShadow: 'none',
          },
          '&:disabled': {
            background: tokens.primaryGradient,
            opacity: 0.5,
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: tokens.focusRing,
          }
        }
      }
    },
    // Customizações para cards seguindo o design system
    MuiPaper: {
      styleOverrides: {
        root: {
          background: tokens.alphaWhite05,
          border: `1px solid ${tokens.borderGlass}`,
          borderRadius: 16,
          backdropFilter: `blur(${tokens.blurBackdropLg})`,
          boxShadow: tokens.shadowGlassInnerWeak,
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
            backgroundColor: tokens.alphaWhite05,
            borderRadius: '16px',
            '& fieldset': {
              borderColor: tokens.alphaWhite25,
            },
            '&:hover fieldset': {
              borderColor: tokens.borderGlassStrong,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.borderGlassStrong,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: tokens.alphaWhite80,
          },
          '& .MuiOutlinedInput-input': {
            color: tokens.textPrimary,
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