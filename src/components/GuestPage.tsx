"use client";

import { useState } from "react";
import * as React from 'react';
import {
  Chip,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
  Alert,
  Container,
  Tooltip,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Autocomplete,
  Stack,
} from "@mui/material";
import Grid from '@mui/material/Grid'; // Direct import for Grid
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Guest } from "@prisma/client";
import { buildInviteUrl, buildTrackingUrl } from "@/lib/invite";
import { useConfig } from "@/hooks/useConfig";
import AddGuestForm from "./AddGuestForm";
import CsvImport from "./CsvImport";
import EditGuestForm from "./EditGuestForm";

import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Image from 'next/image';
import LinkIcon from '@mui/icons-material/Link';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConfirmGuestForm from "./ConfirmGuestForm";

// UI type: torna novos campos opcionais (podem vir nulos ou ausentes)
type GuestUI = Omit<
  Guest,
  | "nome_preferido"
  | "linkedin_url"
  | "tamanho_empresa"
  | "setor_atuacao"
  | "produtos_servicos"
  | "faturamento_anual"
  | "modelo_negocio"
> & {
  convite_url?: string;
  nome_preferido?: string | null;
  linkedin_url?: string | null;
  tamanho_empresa?: string | null;
  setor_atuacao?: string | null;
  produtos_servicos?: string | null;
  faturamento_anual?: string | null;
  modelo_negocio?: string | null;
};
type GuestLike = {
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
};

interface GuestPageProps {
  guests: GuestUI[];
  hideAppBar?: boolean;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'rgba(30, 30, 30, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  color: 'white',
} as const;

export default function GuestPage({ guests: initialGuests, hideAppBar = false }: GuestPageProps) {
  const [guests, setGuests] = useState<GuestUI[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestUI | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingConvidadoPor, setTrackingConvidadoPor] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  
  // Hook para carregar configuração do servidor
  const { config, loading: configLoading } = useConfig();

  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch('/api/convidados/tags');
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
        const saved = typeof window !== 'undefined' ? localStorage.getItem('elga_convidado_por') : null;
        if (saved) setTrackingConvidadoPor(saved);
      } catch (e) {
        console.error(e);
      }
    };
    loadTags();
  }, []);
  

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleGuestAdded = (newGuest: GuestLike) => {
    const guestWithUrl: GuestUI = {
      ...newGuest,
      convite_url: newGuest.convite_url || buildInviteUrl(newGuest.email, newGuest.convidado_por, config?.INVITE_BASE_URL),
    };
    setGuests(prevGuests => [guestWithUrl, ...prevGuests]);
    setAddModalOpen(false);
  };

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);

  const handleOpenImportModal = () => setImportModalOpen(true);
  const handleCloseImportModal = () => setImportModalOpen(false);

  const handleOpenEditModal = (guest: GuestUI) => {
    setSelectedGuest(guest);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedGuest(null);
  };

  const handleOpenConfirmModal = (guest: GuestUI) => {
    setSelectedGuest(guest);
    setConfirmModalOpen(true);
  };
  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedGuest(null);
  };

  const handleOpenDeleteModal = (guest: GuestUI) => {
    setSelectedGuest(guest);
    setDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedGuest(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGuest) return;
    const response = await fetch(`/api/convidados/${selectedGuest.id}`, { method: 'DELETE' });
    if (response.ok) {
        showSnackbar("Convidado excluído com sucesso!", "success");
        handleCloseDeleteModal();
        // Force a complete page reload to refresh server-side data
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay to show the success message
    } else {
        showSnackbar("Falha ao excluir o convidado.", "error");
        handleCloseDeleteModal();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/convidados/download');
      if (!response.ok) {
        throw new Error('Falha ao baixar o arquivo.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'convidados.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar("Download iniciado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao iniciar o download.", "error");
    }
  };

  const trackingUrl = buildTrackingUrl(trackingConvidadoPor || null, config?.INVITE_BASE_URL);
  const handleCopyTrackingUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      showSnackbar("Link de rastreamento copiado!", "success");
      if (typeof window !== 'undefined' && trackingConvidadoPor) {
        localStorage.setItem('elga_convidado_por', trackingConvidadoPor);
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao copiar link de rastreamento.", "error");
    }
  };

  const handleCopyInviteUrl = async (guest: GuestUI) => {
    const base = guest.convite_url || buildInviteUrl(guest.telefone, guest.convidado_por, config?.INVITE_BASE_URL);
    const url = new URL(base);
    if (guest.convidado_por && String(guest.convidado_por).trim() !== '') {
      url.searchParams.set('utm_source', String(guest.convidado_por));
    }
    const inviteUrl = url.toString();
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showSnackbar("Link do convite copiado!", "success");
      if (typeof window !== 'undefined' && guest.convidado_por) {
        localStorage.setItem('elga_convidado_por', guest.convidado_por);
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao copiar link.", "error");
    }
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => String(g.status || '').toLowerCase() === 'confirmado').length;
  
  // Lógica de filtro (a ser aplicada depois)
  const filteredGuests = guests.filter(guest => 
    guest.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    guest.empresa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {!hideAppBar && (
        <AppBar position="static" color="default" elevation={1} sx={{ borderRadius: 0 }}>
          <Toolbar sx={{ justifyContent: 'center', py: 1, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <Image 
                src="/brunch-experience.png" 
                alt="Brunch Experience Logo" 
                width={150} 
                height={40} 
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ position: 'absolute', right: 8 }}>
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setTrackingModalOpen(true)}
                size="small"
              >
                Seu link de rastreamento
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Central de Confirmações – Brunch Experience
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie facilmente a lista de convidados e acompanhe confirmações em tempo real.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">O que você pode fazer aqui:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AddCircleOutlineIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Adicionar convidados individuais" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><UploadFileIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Importar lista em massa (CSV)" />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Editar ou remover registros" />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><SearchIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Pesquisar e filtrar convidados" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Boas práticas:</Typography>
              <List dense>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText primary="Preencha tudo com atenção para garantir a confirmação." />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText primary="Mantenha os dados sempre atualizados." />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
        
        {/* Cards de Estatísticas */}
           <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Convidados
                  </Typography>
                  <Typography variant="h5" component="div">
                    {totalGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Confirmados
                  </Typography>
                  <Typography variant="h5" component="div">
                    {confirmedGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Barra de Ações */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <TextField 
              variant="outlined"
              size="small"
              placeholder="Procurar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }}
            />
            <Button variant="contained" onClick={handleOpenAddModal} size="large" sx={{ height: '40px' }}>
              Adicionar convidado
            </Button>
            <Tooltip title="Importar CSV">
              <Button 
                variant="outlined" 
                onClick={handleOpenImportModal}
                sx={{ 
                  ml: 1,
                  minWidth: '40px', // Largura para um botão de ícone quadrado
                  height: '40px', // Altura para corresponder ao botão 'large'
                  padding: '0'
                }}
              >
                <FileUploadIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Baixar CSV">
              <Button 
                variant="outlined" 
                onClick={handleDownload}
                sx={{ 
                  ml: 1,
                  minWidth: '40px',
                  height: '40px',
                  padding: '0'
                }}
              >
                <DownloadIcon />
              </Button>
            </Tooltip>
          </Box>

          <Modal
            open={trackingModalOpen}
            onClose={() => setTrackingModalOpen(false)}
            aria-labelledby="tracking-modal-title"
            sx={{
              '& .MuiBackdrop-root': {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            <Box sx={style}>
              <IconButton
                aria-label="close"
                onClick={() => setTrackingModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography id="tracking-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                Seu link de rastreamento
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  freeSolo
                  options={tags}
                  value={trackingConvidadoPor}
                  onChange={(event, newValue) => setTrackingConvidadoPor(newValue ?? "")}
                  onInputChange={(event, newInputValue) => setTrackingConvidadoPor(newInputValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Convidado por" fullWidth />
                  )}
                />
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {trackingUrl}
                </Typography>
                <Button variant="contained" onClick={handleCopyTrackingUrl} startIcon={<ContentCopyIcon />}>Copiar link</Button>
              </Stack>
            </Box>
          </Modal>

          <Modal
            open={addModalOpen}
            onClose={handleCloseAddModal}
            aria-labelledby="add-guest-modal-title"
            sx={{
              '& .MuiBackdrop-root': {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            <Box sx={{
              ...style,
              maxHeight: '80vh',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.25) transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
                marginTop: '12px',
                marginBottom: '12px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                border: '2px solid transparent',
                backgroundClip: 'content-box',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              },
            }}>
              <IconButton
                aria-label="close"
                onClick={handleCloseAddModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography id="add-guest-modal-title" variant="h6" component="h2">
                Adicionar novo convite
              </Typography>
              <AddGuestForm showSnackbar={showSnackbar} onGuestAdded={handleGuestAdded} />
            </Box>
          </Modal>

          <Modal
            open={importModalOpen}
            onClose={handleCloseImportModal}
            aria-labelledby="import-csv-modal-title"
            sx={{
              '& .MuiBackdrop-root': {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            <Box sx={style}>
              <IconButton
                aria-label="close"
                onClick={handleCloseImportModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography id="import-csv-modal-title" variant="h6" component="h2">
                Importar Convidados de CSV
              </Typography>
              <CsvImport showSnackbar={showSnackbar} />
            </Box>
          </Modal>

          {selectedGuest && (
            <Modal 
              open={confirmModalOpen} 
              onClose={handleCloseConfirmModal}
              sx={{
                '& .MuiBackdrop-root': {
                  backdropFilter: 'blur(5px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <Box sx={style}>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseConfirmModal}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" component="h2">
                  Confirmar Convidado
                </Typography>
                <ConfirmGuestForm guest={selectedGuest} onClose={handleCloseConfirmModal} showSnackbar={showSnackbar} />
              </Box>
            </Modal>
          )}

          {selectedGuest && (
            <Modal 
              open={editModalOpen} 
              onClose={handleCloseEditModal}
              sx={{
                '& .MuiBackdrop-root': {
                  backdropFilter: 'blur(5px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <Box sx={style}>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseEditModal}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" component="h2">
                  Editar Convidado
                </Typography>
                <EditGuestForm guest={selectedGuest} onClose={handleCloseEditModal} showSnackbar={showSnackbar} />
              </Box>
            </Modal>
          )}

          {selectedGuest && (
            <Modal 
              open={deleteModalOpen} 
              onClose={handleCloseDeleteModal}
              sx={{
                '& .MuiBackdrop-root': {
                  backdropFilter: 'blur(5px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Confirmar Exclusão
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Tem certeza que deseja excluir o convidado &quot;{selectedGuest.nome}&quot;?
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
                  <Button onClick={handleDeleteConfirm} color="error" sx={{ ml: 2 }}>Excluir</Button>
                </Box>
              </Box>
            </Modal>
          )}

          <Snackbar
            open={!!snackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar?.severity || 'success'}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar?.message}
            </Alert>
          </Snackbar>

          {/* Lista de Convidados com Accordion */}
          <Box sx={{ mt: 4 }}>
            {filteredGuests.map((guest) => (
              <Accordion key={guest.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${guest.id}-content`}
                  id={`panel-${guest.id}-header`}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{guest.nome}</Typography>
                          <Tooltip title="Copiar link do convite">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCopyInviteUrl(guest);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main'
                                }
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography color="text.secondary">{guest.empresa}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography color="text.secondary">{guest.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={guest.status}
                          color={String(guest.status || '').toLowerCase() === "confirmado" ? "success" : "warning"}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  {/* Usar span wrappers e desabilitar pointer events para evitar <button> dentro de <button> em AccordionSummary */}
                  <Box component="span" sx={{ display: 'inline-flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <span>
                      <IconButton
                        aria-label="edit"
                        size="small"
                        onClick={() => {
                          handleOpenEditModal(guest);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                    <Tooltip title={String(guest.status || '').toLowerCase() === 'confirmado' ? 'Confirmado' : 'Confirmar'}>
                      <span>
                        <IconButton
                          aria-label="confirm"
                          size="small"
                          onClick={() => {
                            if (String(guest.status || '').toLowerCase() !== 'confirmado') {
                              handleOpenConfirmModal(guest);
                            }
                          }}
                          disabled={String(guest.status || '').toLowerCase() === 'confirmado'}
                          sx={{ color: String(guest.status || '').toLowerCase() === 'confirmado' ? 'success.main' : 'inherit' }}
                        >
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <span>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => {
                          handleOpenDeleteModal(guest);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography><strong>Telefone:</strong> {guest.telefone}</Typography>
                    <Typography><strong>Cargo:</strong> {guest.cargo}</Typography>
                    <Typography><strong>Convidado por:</strong> {guest.convidado_por}</Typography>
                    
                    {/* Novos campos opcionais - só aparecem quando preenchidos */}
                    {guest.nome_preferido && (
                      <Typography><strong>Nome preferido:</strong> {guest.nome_preferido}</Typography>
                    )}
                    {guest.linkedin_url && (
                      <Typography>
                        <strong>LinkedIn:</strong>{' '}
                        <a href={guest.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                          {guest.linkedin_url}
                        </a>
                      </Typography>
                    )}
                    {guest.tamanho_empresa && (
                      <Typography><strong>Tamanho da empresa:</strong> {guest.tamanho_empresa}</Typography>
                    )}
                    {guest.setor_atuacao && (
                      <Typography><strong>Setor de atuação:</strong> {guest.setor_atuacao}</Typography>
                    )}
                    {guest.produtos_servicos && (
                      <Typography><strong>Produtos/Serviços:</strong> {guest.produtos_servicos}</Typography>
                    )}
                    {guest.faturamento_anual && (
                      <Typography><strong>Faturamento anual:</strong> {guest.faturamento_anual}</Typography>
                    )}
                    {guest.modelo_negocio && (
                      <Typography><strong>Modelo de negócio:</strong> {guest.modelo_negocio}</Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
    </>
  );
}