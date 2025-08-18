"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  REVENUE_BAND_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
} from "@/lib/guestOptions";
import { removePhoneMask } from "@/lib/phoneUtils";

type GuestForConfirm = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
};

interface ConfirmGuestFormProps {
  guest: GuestForConfirm;
  onClose: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}


export default function ConfirmGuestForm({ guest, onClose, showSnackbar }: ConfirmGuestFormProps) {
  const [formData, setFormData] = useState({
    nome_preferido: "",
    linkedin_url: "",
    tamanho_empresa: "",
    setor_atuacao: "",
    produtos_servicos: "",
    faturamento_anual: "",
    modelo_negocio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1) Atualiza campos opcionais no cadastro do convidado (mantendo os demais dados)
      const cleanTelefone = removePhoneMask(guest.telefone);
      const updateRes = await fetch(`/api/convidados/${encodeURIComponent(String(guest.id))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: guest.nome,
          email: guest.email,
          telefone: cleanTelefone,
          empresa: guest.empresa,
          cargo: guest.cargo,
          convidado_por: guest.convidado_por,
          ...formData,
        }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json().catch(() => ({}));
        showSnackbar(data.error || "Falha ao atualizar dados do convidado.", "error");
        return;
      }

      // 2) Confirma presença (preferir confirmar por ID para evitar divergências de formatação do telefone)
      const confirmRes = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guest.id, telefone: cleanTelefone }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.success) {
        showSnackbar(confirmData.error || "Falha ao confirmar convidado.", "error");
        return;
      }

      showSnackbar("Convidado confirmado e dados atualizados!", "success");
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro de conexão. Tente novamente.", "error");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <Alert severity="warning">
          Esses dados ajudam no matchmaking. Se confirmar sem preencher, não poderemos personalizar a experiência do convidado.
        </Alert>

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

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Confirmar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}


