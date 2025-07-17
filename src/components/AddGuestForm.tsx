"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";

interface AddGuestFormProps {
    showSnackbar: (message: string, severity: "success" | "error") => void;
}

const filter = createFilterOptions<string>();

export default function AddGuestForm({ showSnackbar }: AddGuestFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cargo: "",
    convidado_por: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/convidados/tags');
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Failed to fetch tags', error);
      }
    };

    fetchTags();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConvidadoPorChange = (event: React.SyntheticEvent, newValue: string | null) => {
    let finalValue = newValue;
    if (newValue && newValue.startsWith('Adicionar "')) {
      finalValue = newValue.substring('Adicionar "'.length, newValue.length - 1);
    }
    setFormData({ ...formData, convidado_por: finalValue || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/convidados/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      showSnackbar("Convidado adicionado com sucesso!", "success");

      // Add the new tag to the list if it's not already there
      if (formData.convidado_por && !tags.includes(formData.convidado_por)) {
        setTags([...tags, formData.convidado_por]);
      }

      setFormData({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        cargo: "",
        convidado_por: "",
      });
    } else {
      showSnackbar(result.error || "Ocorreu um erro.", "error");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <TextField name="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} fullWidth required />
        <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
        <TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} fullWidth required />
        <TextField name="empresa" label="Empresa" value={formData.empresa} onChange={handleChange} fullWidth required />
        <TextField name="cargo" label="Cargo" value={formData.cargo} onChange={handleChange} fullWidth required />
        <Autocomplete
          value={formData.convidado_por}
          onChange={handleConvidadoPorChange}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            const { inputValue } = params;
            const isExisting = options.some((option) => inputValue === option);
            if (inputValue !== '' && !isExisting) {
              filtered.push(`Adicionar "${inputValue}"`);
            }
            return filtered;
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="convidado-por-autocomplete"
          options={tags}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return '';
          }}
          renderOption={(props, option) => <li {...props}>{option}</li>}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label="Convidado Por" required />
          )}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Adicionar Convidado
        </Button>
      </Stack>
    </Box>
  );
} 