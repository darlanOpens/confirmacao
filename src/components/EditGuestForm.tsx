"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { tokens } from '@/theme/designSystem';

type GuestEditType = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
  status: string;
  data_cadastro: Date;
  data_confirmacao: Date | null;
  // Novos campos opcionais (compatível com GuestUI)
  nome_preferido?: string | null | undefined;
  linkedin_url?: string | null | undefined;
  tamanho_empresa?: string | null | undefined;
  setor_atuacao?: string | null | undefined;
  produtos_servicos?: string | null | undefined;
  faturamento_anual?: string | null | undefined;
  modelo_negocio?: string | null | undefined;
};

interface EditGuestFormProps {
  guest: GuestEditType;
  onClose: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function EditGuestForm({ guest, onClose, showSnackbar }: EditGuestFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cargo: "",
    convidado_por: "",
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        nome: guest.nome,
        email: guest.email || "",
        telefone: guest.telefone,
        empresa: guest.empresa,
        cargo: guest.cargo,
        convidado_por: guest.convidado_por,
      });
    }
  }, [guest]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/convidados/${guest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      showSnackbar("Convidado atualizado com sucesso!", "success");
      onClose(); // Fecha o modal
      // Force a complete page reload to refresh server-side data
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Delay to show the success message
    } else {
      showSnackbar(result.error || "Ocorreu um erro.", "error");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 2,
        p: 3,
        background: tokens.alphaWhite05,
        border: `1px solid ${tokens.borderGlass}`,
        borderRadius: '16px',
        backdropFilter: `blur(${tokens.blurBackdropLg})`,
        boxShadow: tokens.shadowGlassInnerWeak,
      }}
    >
      <Stack spacing={2}>
        <TextField name="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} fullWidth required />
        <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth />
        <TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} fullWidth required />
        <TextField name="empresa" label="Empresa" value={formData.empresa} onChange={handleChange} fullWidth required />
        <TextField name="cargo" label="Cargo" value={formData.cargo} onChange={handleChange} fullWidth required />
        <TextField name="convidado_por" label="Convidado Por" value={formData.convidado_por} onChange={handleChange} fullWidth required />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.5 }}
        >
          Salvar Alterações
        </Button>
      </Stack>
    </Box>
  );
}