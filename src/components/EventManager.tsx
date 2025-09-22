"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import Grid from '@mui/material/Grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArchiveIcon from '@mui/icons-material/Archive';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface EventEdition {
  id: number;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  arquivado: boolean;
  criado_em: string;
  _count?: {
    guests: number;
    preselections: number;
  };
}

export default function EventManager() {
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [activeEdition, setActiveEdition] = useState<EventEdition | null>(null);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [archiveData, setArchiveData] = useState<{
    guestsCsv: string;
    preselectionsCsv: string;
    guestsCount: number;
    preselectionsCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carregar edições ao montar o componente
  useEffect(() => {
    loadEditions();
    loadActiveEdition();
  }, []);

  const loadEditions = async () => {
    try {
      const response = await fetch('/api/events/list');
      const data = await response.json();
      if (data.success) {
        setEditions(data.editions);
      }
    } catch (error) {
      console.error('Erro ao carregar edições:', error);
      setError('Erro ao carregar edições');
    }
  };

  const loadActiveEdition = async () => {
    try {
      const response = await fetch('/api/events/active');
      const data = await response.json();
      if (data.success) {
        setActiveEdition(data.edition);
      }
    } catch (error) {
      console.error('Erro ao carregar edição ativa:', error);
      setError('Erro ao carregar edição ativa');
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) {
      setError('Nome do evento é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: newEventName,
          descricao: newEventDescription
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Nova edição criada com sucesso!');
        setCreateDialogOpen(false);
        setNewEventName('');
        setNewEventDescription('');
        loadEditions();
        setActiveEdition(data.edition);
      } else {
        setError(data.error || 'Erro ao criar edição');
      }
    } catch (error) {
      console.error('Erro ao criar edição:', error);
      setError('Erro ao criar nova edição');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveEvent = async () => {
    if (!activeEdition) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/events/archive/${activeEdition.id}`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setArchiveData(data.exports);
        setSuccess('Evento arquivado com sucesso! Uma nova edição foi criada.');
        setArchiveDialogOpen(true);
        loadEditions();
        setActiveEdition(data.newEdition);
      } else {
        setError(data.error || 'Erro ao arquivar edição');
      }
    } catch (error) {
      console.error('Erro ao arquivar edição:', error);
      setError('Erro ao arquivar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchEdition = async (editionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/switch/${editionId}`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Edição ativada com sucesso!');
        loadEditions();
        setActiveEdition(data.edition);
        // Recarregar a página para atualizar os dados
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Erro ao trocar edição');
      }
    } catch (error) {
      console.error('Erro ao trocar edição:', error);
      setError('Erro ao trocar de edição');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-gerar nome do próximo evento
  useEffect(() => {
    if (createDialogOpen) {
      const now = new Date();
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      // Se existe uma edição ativa, sugerir o próximo mês
      if (activeEdition) {
        const activeDate = new Date(activeEdition.data_inicio);
        const nextMonth = new Date(activeDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthName = monthNames[nextMonth.getMonth()];
        const year = nextMonth.getFullYear();
        setNewEventName(`${monthName} ${year}`);
      } else {
        const monthName = monthNames[now.getMonth()];
        const year = now.getFullYear();
        setNewEventName(`${monthName} ${year}`);
      }
    }
  }, [createDialogOpen, activeEdition]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventIcon />
        Gerenciamento de Eventos
      </Typography>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Card da Edição Ativa */}
      {activeEdition && (
        <Card sx={{ mb: 3, backgroundColor: '#f0f7ff' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" gutterBottom>
                  Evento Atual: {activeEdition.nome}
                </Typography>
                <Typography color="text.secondary">
                  Iniciado em: {new Date(activeEdition.data_inicio).toLocaleDateString('pt-BR')}
                </Typography>
                {activeEdition._count && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${activeEdition._count.guests} convidados`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      icon={<ListAltIcon />}
                      label={`${activeEdition._count.preselections} pré-seleções`}
                      size="small"
                    />
                  </Stack>
                )}
              </Box>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Finalizar evento e arquivar dados">
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<ArchiveIcon />}
                    onClick={handleArchiveEvent}
                    disabled={loading}
                  >
                    Finalizar e Arquivar
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={loading}
        >
          Novo Evento
        </Button>
      </Stack>

      {/* Lista de Edições */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Histórico de Eventos
      </Typography>

      <Grid container spacing={2}>
        {editions.map((edition) => (
          <Grid item xs={12} md={6} lg={4} key={edition.id}>
            <Card
              sx={{
                opacity: edition.arquivado ? 0.7 : 1,
                border: edition.ativo ? '2px solid #1976d2' : 'none',
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {edition.nome}
                  </Typography>
                  {edition.ativo && (
                    <Chip
                      label="Ativo"
                      color="primary"
                      size="small"
                      icon={<CheckCircleIcon />}
                    />
                  )}
                  {edition.arquivado && (
                    <Chip
                      label="Arquivado"
                      size="small"
                    />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {edition.descricao}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Início: {new Date(edition.data_inicio).toLocaleDateString('pt-BR')}
                </Typography>

                {edition.data_fim && (
                  <Typography variant="body2">
                    Fim: {new Date(edition.data_fim).toLocaleDateString('pt-BR')}
                  </Typography>
                )}

                {edition._count && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                      size="small"
                      label={`${edition._count.guests} convidados`}
                    />
                    <Chip
                      size="small"
                      label={`${edition._count.preselections} pré-seleções`}
                      variant="outlined"
                    />
                  </Stack>
                )}
              </CardContent>

              {!edition.ativo && !edition.arquivado && (
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => handleSwitchEdition(edition.id)}
                    disabled={loading}
                  >
                    Ativar
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para criar novo evento */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Criar Novo Evento</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Evento"
            fullWidth
            variant="outlined"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newEventDescription}
            onChange={(e) => setNewEventDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCreateEvent} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para arquivamento */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <DialogTitle>Evento Arquivado com Sucesso!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            O evento foi arquivado e os dados exportados.
          </Typography>

          {archiveData && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Resumo do Arquivamento:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={`${archiveData.guestsCount} convidados exportados`}
                  />
                  {archiveData.guestsCsv && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => downloadCSV(archiveData.guestsCsv, 'convidados_arquivo.csv')}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${archiveData.preselectionsCount} pré-seleções exportadas`}
                  />
                  {archiveData.preselectionsCsv && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => downloadCSV(archiveData.preselectionsCsv, 'preselecoes_arquivo.csv')}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveDialogOpen(false)} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}