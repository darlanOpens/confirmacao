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
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 2,
        p: 3,
        background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)'
      }}
    >
      <Stack spacing={2}>
        <TextField 
          name="nome" 
          label="Nome Completo" 
          value={formData.nome} 
          onChange={handleChange} 
          fullWidth 
          required 
        />
        <TextField 
          name="email" 
          label="Email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          fullWidth 
          required 
        />
        <TextField 
          name="telefone" 
          label="Telefone" 
          value={formData.telefone} 
          onChange={handleChange} 
          fullWidth 
          required
        />
        <TextField 
          name="empresa" 
          label="Empresa" 
          value={formData.empresa} 
          onChange={handleChange} 
          fullWidth 
          required
        />
        <TextField 
          name="cargo" 
          label="Cargo" 
          value={formData.cargo} 
          onChange={handleChange} 
          fullWidth 
          required
        />
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
            <TextField 
              {...params} 
              label="Convidado Por" 
              required 
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#33B6E5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#33B6E5',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.80)',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#FFFFFF',
                },
                '& .MuiAutocomplete-endAdornment': {
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255,255,255,0.80)',
                  },
                },
              }}
            />
          )}
          sx={{
            '& .MuiAutocomplete-paper': {
              backgroundColor: '#564C9B',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            },
            '& .MuiAutocomplete-option': {
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(51, 182, 229, 0.2)',
              },
            },
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ 
            mt: 2,
            background: 'linear-gradient(90deg, #ED7414 0%, #F08D0D 100%)',
            color: '#FFFFFF',
            borderRadius: '999px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            transition: '150ms ease-in-out',
            '&:hover': {
              background: 'linear-gradient(90deg, #F08D0D 0%, #ED7414 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              background: '#C95F0C',
              boxShadow: 'none',
              transform: 'translateY(0)',
            },
          }}
        >
          ADICIONAR CONVIDADO
        </Button>
      </Stack>
    </Box>
  );
}