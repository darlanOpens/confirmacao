"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { useRouter } from "next/navigation";
import { Guest } from "@prisma/client";

interface EditGuestFormProps {
  guest: Guest;
  onClose: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

export default function EditGuestForm({ guest, onClose, showSnackbar }: EditGuestFormProps) {
  const router = useRouter();
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
      router.refresh();
      onClose(); // Fecha o modal
    } else {
      showSnackbar(result.error || "Ocorreu um erro.", "error");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <TextField name="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField name="empresa" label="Empresa" value={formData.empresa} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField name="cargo" label="Cargo" value={formData.cargo} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField name="convidado_por" label="Convidado Por" value={formData.convidado_por} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>Salvar Alterações</Button>
        </Grid>
      </Grid>
    </Box>
  );
} 