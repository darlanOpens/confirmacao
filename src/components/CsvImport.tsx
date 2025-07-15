"use client";

import { useRef } from "react";
import { Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

interface CsvImportProps {
    showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function CsvImport({ showSnackbar }: CsvImportProps) {
  const router = useRouter();
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
            router.refresh();
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
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button variant="contained" onClick={handleButtonClick}>
        Selecionar Arquivo CSV
      </Button>
      <Box sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="subtitle2" gutterBottom>
          Instruções para o arquivo CSV:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O arquivo deve conter as seguintes colunas como cabeçalho, na ordem exata:
        </Typography>
        <List dense>
          <ListItem><ListItemText primary="nome" /></ListItem>
          <ListItem><ListItemText primary="email" /></ListItem>
          <ListItem><ListItemText primary="telefone" /></ListItem>
          <ListItem><ListItemText primary="empresa" /></ListItem>
          <ListItem><ListItemText primary="cargo" /></ListItem>
          <ListItem><ListItemText primary="convidado_por" /></ListItem>
        </List>
      </Box>
    </Box>
  );
} 