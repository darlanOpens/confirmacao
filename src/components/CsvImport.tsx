"use client";

import { useRef } from "react";
import { Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import Papa from "papaparse";
import { tokens } from '@/theme/designSystem';

interface CsvImportProps {
    showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function CsvImport({ showSnackbar }: CsvImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const response = await fetch("/api/convidados/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ convidados: results.data }),
          });
          const result = await response.json();
          if (result.success) {
            showSnackbar(`${result.importedCount} convidados importados com sucesso!`, "success");
            // Force a complete page reload to refresh server-side data
            setTimeout(() => {
              window.location.reload();
            }, 1500); // Delay to show the success message
          } else {
            showSnackbar(result.error || "Falha na importação.", "error");
          }
        },
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{
      mt: 2,
      p: 3,
      background: tokens.alphaWhite05,
      border: `1px solid ${tokens.borderGlass}`,
      borderRadius: '16px',
      backdropFilter: `blur(${tokens.blurBackdropLg})`,
      boxShadow: tokens.shadowGlassInnerWeak,
      textAlign: 'center'
    }}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        variant="contained"
        onClick={handleButtonClick}
        sx={{ py: 1.5, px: 4, mb: 3 }}
      >
        Selecionar Arquivo CSV
      </Button>
      <Box sx={{ textAlign: 'left' }}>
        <Typography 
          variant="subtitle2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            mb: 1
          }}
        >
          Instruções para o arquivo CSV:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2
          }}
        >
          O arquivo deve conter as seguintes colunas como cabeçalho, na ordem exata:
        </Typography>
        <Box sx={{
          background: tokens.alphaWhite10,
          borderRadius: '16px',
          p: 2
        }}>
                     <List dense>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="nome" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="email" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="telefone" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="empresa" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="cargo" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
             <ListItem sx={{ py: 0.5 }}>
               <ListItemText 
                 primary="convidado_por" 
                 sx={{ 
                   '& .MuiTypography-root': { 
                     fontFamily: 'monospace',
                     fontSize: '0.9rem'
                   }
                 }} 
               />
             </ListItem>
           </List>
        </Box>
      </Box>
    </Box>
  );
}