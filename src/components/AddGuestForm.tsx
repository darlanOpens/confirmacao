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

interface Guest {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
  status: string;
  data_cadastro: Date;
  data_confirmacao: Date | null;
  convite_url?: string;
  // Novos campos opcionais vindos da API
  nome_preferido?: string | null;
  linkedin_url?: string | null;
  tamanho_empresa?: string | null;
  setor_atuacao?: string | null;
  produtos_servicos?: string | null;
  faturamento_anual?: string | null;
  modelo_negocio?: string | null;
}

interface AddGuestFormProps {
    showSnackbar: (message: string, severity: "success" | "error") => void;
    onGuestAdded?: (newGuest: Guest) => void;
}

const filter = createFilterOptions<string>();

export default function AddGuestForm({ showSnackbar, onGuestAdded }: AddGuestFormProps) {
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
        // Inclui possível preferido salvo em localStorage (com fallback da chave legada)
        const saved = typeof window !== 'undefined'
          ? (localStorage.getItem('elga_convidado_por') ?? localStorage.getItem('convidado_por'))
          : null;
        const merged = Array.from(new Set([...(Array.isArray(data) ? data : []), ...(saved ? [saved] : [])]));
        setTags(merged as string[]);
      } catch (error) {
        console.error('Failed to fetch tags', error);
      }
    };

    fetchTags();

    // Prefill do campo a partir do localStorage (com fallback da chave legada)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elga_convidado_por') ?? localStorage.getItem('convidado_por');
      if (saved) {
        setFormData((prev) => ({ ...prev, convidado_por: saved }));
      }
    }
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
    console.log("Formulário sendo enviado...", formData);
    
    try {
      const response = await fetch("/api/convidados/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Resposta da API:", response.status);
      const result = await response.json();
      console.log("Resultado:", result);

      if (result.success) {
        showSnackbar("Convidado adicionado com sucesso!", "success");

        // Add the new tag to the list if it's not already there
        if (formData.convidado_por && !tags.includes(formData.convidado_por)) {
          setTags([...tags, formData.convidado_por]);
        }

        // Salva preferência no localStorage com a chave padronizada
        if (typeof window !== 'undefined' && formData.convidado_por) {
          localStorage.setItem('elga_convidado_por', formData.convidado_por);
        }

        // Call the callback to update the parent component
        if (onGuestAdded && result.guest) {
          onGuestAdded(result.guest);
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
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      showSnackbar("Erro de conexão. Tente novamente.", "error");
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