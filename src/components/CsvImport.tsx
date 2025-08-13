"use client";

import { useRef } from "react";
import { Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import Papa from "papaparse";

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
          <ListItem><ListItemText primary="nome (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="email (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="telefone (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="empresa (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="cargo (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="convidado_por (obrigatório)" /></ListItem>
          <ListItem><ListItemText primary="nome_preferido (opcional)" /></ListItem>
          <ListItem><ListItemText primary="linkedin_url (opcional)" /></ListItem>
          <ListItem><ListItemText primary="tamanho_empresa (opcional)" /></ListItem>
          <ListItem><ListItemText primary="setor_atuacao (opcional)" /></ListItem>
          <ListItem><ListItemText primary="produtos_servicos (opcional)" /></ListItem>
          <ListItem><ListItemText primary="faturamento_anual (opcional)" /></ListItem>
          <ListItem><ListItemText primary="modelo_negocio (opcional)" /></ListItem>
        </List>
      </Box>
    </Box>
  );
} 