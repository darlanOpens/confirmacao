"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { Guest } from "@prisma/client";
import { tokens } from '@/theme/designSystem';

interface EditGuestFormProps {
  guest: Guest;
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
        email: guest.email,
        telefone: guest.telefone,
        empresa: guest.empresa,
        cargo: guest.cargo,
        convidado_por: guest.convidado_por,
      });
    }
  }, [guest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
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