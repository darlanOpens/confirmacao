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
} from "@mui/material";
import Grid from '@mui/material/Grid'; // Direct import for Grid
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Guest } from "@prisma/client";
import AddGuestForm from "./AddGuestForm";
import CsvImport from "./CsvImport";
import EditGuestForm from "./EditGuestForm";
import { tokens } from '@/theme/designSystem';
import { buildInviteUrl } from "@/lib/invite";

type GuestUI = Guest & { convite_url?: string };
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

import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface GuestPageProps {
  guests: GuestUI[];
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  maxHeight: '90vh',
  overflow: 'auto',
  background: tokens.alphaWhite05,
  border: `1px solid ${tokens.borderGlass}`,
  borderRadius: '16px',
  backdropFilter: `blur(${tokens.blurBackdropLg})`,
  boxShadow: tokens.shadowGlassInnerWeak,
  p: 4,
  color: tokens.textPrimary,
} as const;

export default function GuestPage({ guests: initialGuests }: GuestPageProps) {
  const [guests, setGuests] = useState<GuestUI[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState("");
  const [convidadoPorFilter, setConvidadoPorFilter] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestUI | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);
  

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleGuestAdded = (newGuest: GuestLike) => {
    const guestWithUrl: GuestUI = {
      ...newGuest,
      convite_url: newGuest.convite_url || buildInviteUrl(newGuest.email),
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
      showSnackbar("Erro ao iniciar o download.", "error");
    }
  };

  const handleCopyInviteUrl = async (guest: GuestUI) => {
    const inviteUrl = guest.convite_url || `https://go.opens.com.br/brunch-vip?emailconf=${encodeURIComponent(guest.email)}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showSnackbar("Link do convite copiado!", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao copiar link.", "error");
    }
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.status === 'confirmado').length;
  
  // Obter lista única de pessoas que convidaram
  const uniqueConvidadoPor = Array.from(new Set(guests.map(guest => guest.convidado_por))).filter(Boolean).sort();
  
  // Lógica de filtro
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.empresa.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesConvidadoPor = !convidadoPorFilter || guest.convidado_por === convidadoPorFilter;
    
    return matchesSearch && matchesConvidadoPor;
  });

  return (
    <Box sx={{ minHeight: '100vh', background: tokens.backgroundApp }}>
      <AppBar position="static" sx={{
        background: 'transparent',
        borderBottom: `1px solid ${tokens.borderGlass}`,
        backdropFilter: `blur(${tokens.blurBackdropMd})`,
        boxShadow: 'none'
      }}>
        <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'var(--font-butler), Butler, serif',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: tokens.white,
              }}
            >
              BRUNCH
            </Typography>
            <Box
              sx={{
                width: 1,
                height: { xs: 28, sm: 36 },
                background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.70), rgba(255,255,255,0.10))',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Work Sans', var(--font-inter), system-ui, sans-serif",
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: tokens.alphaWhite70,
              }}
            >
              EXPERIENCE
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{
          mb: 4,
          p: 3,
          background: tokens.alphaWhite05,
          border: `1px solid ${tokens.borderGlass}`,
          borderRadius: '16px',
          backdropFilter: `blur(${tokens.blurBackdropLg})`,
          boxShadow: tokens.shadowGlassInnerWeak,
          color: tokens.textPrimary,
        }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#ED7414' }}>
            Central de Confirmações – Brunch Experience
          </Typography>
          <Typography variant="body1" sx={{ color: tokens.textSecondary }}>
            Gerencie facilmente a lista de convidados e acompanhe confirmações em tempo real.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: tokens.textPrimary }}>O que você pode fazer aqui:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AddCircleOutlineIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Adicionar convidados individuais" sx={{ color: tokens.textSecondary }} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><UploadFileIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Importar lista em massa (CSV)" sx={{ color: tokens.textSecondary }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><EditIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Editar ou remover registros" sx={{ color: tokens.textSecondary }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><SearchIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Pesquisar e filtrar convidados" sx={{ color: tokens.textSecondary }} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: tokens.textPrimary }}>Boas práticas:</Typography>
              <List dense>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Preencha tudo com atenção para garantir a confirmação." sx={{ color: tokens.textSecondary }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" sx={{ color: tokens.textSecondary }} /></ListItemIcon>
                  <ListItemText primary="Mantenha os dados sempre atualizados." sx={{ color: tokens.textSecondary }} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
        
        {/* Cards de Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: tokens.alphaWhite05,
                border: `1px solid ${tokens.borderGlass}`,
                borderRadius: '16px',
                backdropFilter: `blur(${tokens.blurBackdropLg})`,
                boxShadow: tokens.shadowGlassInnerWeak,
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Typography sx={{ color: tokens.textSecondary }} gutterBottom>
                    Convidados
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ color: tokens.textPrimary }}>
                    {totalGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: tokens.alphaWhite05,
                border: `1px solid ${tokens.borderGlass}`,
                borderRadius: '16px',
                backdropFilter: `blur(${tokens.blurBackdropLg})`,
                boxShadow: tokens.shadowGlassInnerWeak,
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Typography sx={{ color: tokens.textSecondary }} gutterBottom>
                    Confirmados
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ color: tokens.textPrimary }}>
                    {confirmedGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Barra de Ações */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <TextField 
              variant="outlined"
              size="small"
              placeholder="Procurar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Autocomplete
              size="small"
              options={uniqueConvidadoPor}
              value={convidadoPorFilter}
              onChange={(event, newValue) => setConvidadoPorFilter(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="convidado por..."
                  variant="outlined"
                  sx={{
                    minWidth: 250,
                    '& .MuiOutlinedInput-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1,
                    },
                  }}
                />
              )}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: '#564C9B',
                  color: 'white',
                },
                '& .MuiAutocomplete-option': {
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleOpenAddModal}
              size="large"
              sx={{ height: '40px' }}
            >
              Adicionar convidado
            </Button>
            <Tooltip title="Importar CSV">
              <Button 
                variant="outlined" 
                onClick={handleOpenImportModal}
                sx={{ 
                  ml: 1,
                  minWidth: '40px',
                  height: '40px',
                  padding: '0',
                  background: tokens.alphaWhite05,
                  color: tokens.textPrimary,
                  border: `1px solid ${tokens.borderGlass}`,
                  borderRadius: '999px',
                  transition: 'all 150ms ease-in-out',
                  '&:hover': {
                    background: tokens.alphaWhite10,
                    border: `1px solid ${tokens.borderGlassStrong}`,
                  }
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
                  padding: '0',
                  background: tokens.alphaWhite05,
                  color: tokens.textPrimary,
                  border: `1px solid ${tokens.borderGlass}`,
                  borderRadius: '999px',
                  transition: 'all 150ms ease-in-out',
                  '&:hover': {
                    background: tokens.alphaWhite10,
                    border: `1px solid ${tokens.borderGlassStrong}`,
                  }
                }}
              >
                <DownloadIcon />
              </Button>
            </Tooltip>
          </Box>

          <Modal
            open={addModalOpen}
            onClose={handleCloseAddModal}
            aria-labelledby="add-guest-modal-title"
          >
            <Box sx={modalStyle}>
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
          >
            <Box sx={modalStyle}>
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
            <Modal open={editModalOpen} onClose={handleCloseEditModal}>
              <Box sx={modalStyle}>
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
            <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
              <Box sx={modalStyle}>
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
              <Accordion 
                key={guest.id}
                sx={{
                  background: tokens.alphaWhite05,
                  border: `1px solid ${tokens.borderGlass}`,
                  borderRadius: '16px',
                  backdropFilter: `blur(${tokens.blurBackdropLg})`,
                  boxShadow: tokens.shadowGlassInnerWeak,
                  mb: 2,
                  transition: 'all 150ms ease-in-out',
                  '&:hover': {
                    boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: tokens.textPrimary }} />}
                  aria-controls={`panel-${guest.id}-content`}
                  id={`panel-${guest.id}-header`}
                  sx={{ color: tokens.textPrimary }}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ color: tokens.textPrimary }}>{guest.nome}</Typography>
                          <Tooltip title="Copiar link do convite">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCopyInviteUrl(guest);
                              }}
                              sx={{
                                color: tokens.textSecondary,
                                '&:hover': {
                                  color: tokens.accentPrimary
                                }
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography sx={{ color: tokens.textSecondary }}>{guest.empresa}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography sx={{ color: tokens.textSecondary }}>{guest.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={guest.status}
                          color={guest.status === "confirmado" ? "success" : "warning"}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Box>
                    <IconButton
                      aria-label="edit"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenEditModal(guest);
                      }}
                      sx={{
                        color: tokens.textPrimary,
                        background: tokens.alphaWhite10,
                        borderRadius: '8px',
                        transition: 'all 150ms ease-in-out',
                        '&:hover': {
                          background: tokens.primaryHoverGradient
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenDeleteModal(guest);
                      }}
                      sx={{
                        color: tokens.textPrimary,
                        background: tokens.alphaWhite10,
                        borderRadius: '8px',
                        ml: 1,
                        transition: 'all 150ms ease-in-out',
                        '&:hover': {
                          background: tokens.primaryHoverGradient
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ background: tokens.alphaWhite10, borderRadius: '0 0 16px 16px' }}>
                  <Box>
                    <Typography sx={{ color: tokens.textSecondary }}><strong style={{ color: tokens.textPrimary }}>Telefone:</strong> {guest.telefone}</Typography>
                    <Typography sx={{ color: tokens.textSecondary }}><strong style={{ color: tokens.textPrimary }}>Cargo:</strong> {guest.cargo}</Typography>
                    <Typography sx={{ color: tokens.textSecondary }}><strong style={{ color: tokens.textPrimary }}>Convidado por:</strong> {guest.convidado_por}</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
    </Box>
  );
}
