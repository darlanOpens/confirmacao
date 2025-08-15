"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Autocomplete,
  createFilterOptions,
  Alert,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  REVENUE_BAND_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
} from "@/lib/guestOptions";
import { removePhoneMask } from "@/lib/phoneUtils";

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
    nome_preferido: "",
    linkedin_url: "",
    tamanho_empresa: "",
    setor_atuacao: "",
    produtos_servicos: "",
    faturamento_anual: "",
    modelo_negocio: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [confirmDirectly, setConfirmDirectly] = useState<boolean>(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/convidados/tags');
        const data = await response.json();
        setTags(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch tags', error);
      }
    };

    fetchTags();

    // Prefill do campo a partir do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elga_convidado_por');
      if (saved) {
        setFormData((prev) => ({ ...prev, convidado_por: saved }));
      }
    }
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (xx) x-xxxx-xxxx
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}-${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      // Remove a máscara do telefone antes de enviar
      const dataToSend = {
        ...formData,
        telefone: removePhoneMask(formData.telefone),
        confirm_directly: confirmDirectly,
      };
      
      const response = await fetch("/api/convidados/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
          nome_preferido: "",
          linkedin_url: "",
          tamanho_empresa: "",
          setor_atuacao: "",
          produtos_servicos: "",
          faturamento_anual: "",
          modelo_negocio: "",
        });
        setConfirmDirectly(false);
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
        <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth />
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

        <FormControlLabel
          control={<Checkbox checked={confirmDirectly} onChange={(e) => setConfirmDirectly(e.target.checked)} />}
          label="Confirmar convidado diretamente"
        />

        {confirmDirectly && (
          <>
            <Alert severity="warning">
              Confirmar sem preencher os campos extras pode prejudicar o matchmaking e a personalização da experiência.
            </Alert>

            <Accordion sx={{ bgcolor: 'background.paper' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Campos extras (opcionais)
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    name="nome_preferido"
                    label="Como você gostaria de ser chamado(a)?"
                    value={formData.nome_preferido}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="linkedin_url"
                    label="Qual seu LinkedIn? (URL)"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="tamanho_empresa"
                    label="Tamanho da Empresa"
                    select
                    value={formData.tamanho_empresa}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">Tamanho da Empresa</MenuItem>
                    {COMPANY_SIZE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    name="setor_atuacao"
                    label="Setor de Atuação"
                    select
                    value={formData.setor_atuacao}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">Setor de Atuação</MenuItem>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    name="produtos_servicos"
                    label="Principais produtos/serviços"
                    value={formData.produtos_servicos}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="faturamento_anual"
                    label="Faixa de faturamento anual"
                    select
                    value={formData.faturamento_anual}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">Qual é a faixa de faturamento anual da empresa?</MenuItem>
                    {REVENUE_BAND_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    name="modelo_negocio"
                    label="Modelo de negócio"
                    select
                    value={formData.modelo_negocio}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">O modelo de negócio da sua empresa é principalmente voltado para</MenuItem>
                    {BUSINESS_MODEL_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Adicionar Convidado
        </Button>
      </Stack>
    </Box>
  );
}