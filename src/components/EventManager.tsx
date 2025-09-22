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
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
  const [eventsListOpen, setEventsListOpen] = useState(false);
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
    <Box sx={{ p: 2 }}>
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

      {/* Botões de ação simples */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={loading}
        >
          Novo Evento
        </Button>

        {activeEdition && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<ArchiveIcon />}
            onClick={handleArchiveEvent}
            disabled={loading}
          >
            Arquivar Evento Atual
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setEventsListOpen(true)}
          disabled={loading}
        >
          Ver Todos os Eventos
        </Button>
      </Stack>

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

      {/* Dialog para listar todos os eventos */}
      <Dialog
        open={eventsListOpen}
        onClose={() => setEventsListOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Histórico de Eventos</DialogTitle>
        <DialogContent dividers>
          {editions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Nenhum evento encontrado
            </Typography>
          ) : (
            <List>
              {editions.map((edition) => (
                <ListItem
                  key={edition.id}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={edition.ativo ? 'bold' : 'normal'}>
                          {edition.nome}
                        </Typography>
                        {edition.ativo && (
                          <Chip label="ATIVO" color="success" size="small" />
                        )}
                        {edition.arquivado && (
                          <Chip label="ARQUIVADO" size="small" variant="outlined" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {new Date(edition.data_inicio).toLocaleDateString('pt-BR')} •
                        {edition._count && ` ${edition._count.guests} convidados`}
                      </Typography>
                    }
                  />
                  {!edition.ativo && !edition.arquivado && (
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => {
                          handleSwitchEdition(edition.id);
                          setEventsListOpen(false);
                        }}
                      >
                        Ativar
                      </Button>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventsListOpen(false)}>
            Fechar
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