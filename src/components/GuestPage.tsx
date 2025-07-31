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

import FileUploadIcon from '@mui/icons-material/FileUpload';
import Image from 'next/image';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface GuestPageProps {
  guests: Guest[];
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
  p: 4,
} as const;

export default function GuestPage({ guests: initialGuests }: GuestPageProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState("");
  const [convidadoPorFilter, setConvidadoPorFilter] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);
  

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleGuestAdded = (newGuest: Guest) => {
    setGuests(prevGuests => [newGuest, ...prevGuests]);
    setAddModalOpen(false);
  };

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);

  const handleOpenImportModal = () => setImportModalOpen(true);
  const handleCloseImportModal = () => setImportModalOpen(false);

  const handleOpenEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedGuest(null);
  };

  const handleOpenDeleteModal = (guest: Guest) => {
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
    <Box sx={{ minHeight: '100vh', background: '#463888' }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)'
      }}>
        <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Image 
              src="/logo-esquenta.png" 
              alt="Esquenta Logo" 
              width={150} 
              height={40} 
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
          color: 'white'
        }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: '#ED7414' }}>
            Central de Confirmações – Esquenta Startup Summit
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.80)' }}>
            Gerencie facilmente a lista de convidados e acompanhe confirmações em tempo real.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: 'white' }}>O que você pode fazer aqui:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AddCircleOutlineIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Adicionar convidados individuais" sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><UploadFileIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Importar lista em massa (CSV)" sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><EditIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Editar ou remover registros" sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><SearchIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Pesquisar e filtrar convidados" sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: 'white' }}>Boas práticas:</Typography>
              <List dense>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Preencha tudo com atenção para garantir a confirmação." sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
                 <ListItem>
                  <ListItemIcon><CheckCircleOutlineIcon fontSize="small" sx={{ color: '#33B6E5' }} /></ListItemIcon>
                  <ListItemText primary="Mantenha os dados sempre atualizados." sx={{ color: 'rgba(255,255,255,0.80)' }} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
        
        {/* Cards de Estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
                borderRadius: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Typography sx={{ color: 'rgba(255,255,255,0.80)' }} gutterBottom>
                    Convidados
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ color: 'white' }}>
                    {totalGuests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
                borderRadius: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 18px rgba(0,0,0,0.14)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent>
                  <Typography sx={{ color: 'rgba(255,255,255,0.80)' }} gutterBottom>
                    Confirmados
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ color: 'white' }}>
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
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#33B6E5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#33B6E5',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
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
              sx={{ 
                height: '40px',
                background: 'linear-gradient(90deg, #ED7414 0%, #F08D0D 100%)',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                color: 'white',
                transition: 'all 150ms ease-in-out',
                '&:hover': {
                  background: 'linear-gradient(90deg, #F08D0D 0%, #ED7414 100%)'
                },
                '&:active': {
                  background: '#C95F0C',
                  boxShadow: 'none'
                },
                '&:focus': {
                  outline: '2px solid #33B6E5'
                }
              }}
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
                  background: 'white',
                  color: '#564C9B',
                  border: '1px solid #564C9B',
                  borderRadius: '999px',
                  transition: 'all 150ms ease-in-out',
                  '&:hover': {
                    background: 'white',
                    color: '#ED7414',
                    border: '1px solid #ED7414'
                  }
                }}
              >
                <FileUploadIcon />
              </Button>
            </Tooltip>
          </Box>

          <Modal
            open={addModalOpen}
            onClose={handleCloseAddModal}
            aria-labelledby="add-guest-modal-title"
          >
            <Box sx={style}>
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
            <Modal open={editModalOpen} onClose={handleCloseEditModal}>
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
            <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
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
              <Accordion 
                key={guest.id}
                sx={{
                  background: 'linear-gradient(145deg, #6E5BC7 0%, #564C9B 100%)',
                  borderRadius: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
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
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                  aria-controls={`panel-${guest.id}-content`}
                  id={`panel-${guest.id}-header`}
                  sx={{ color: 'white' }}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle1" sx={{ color: 'white' }}>{guest.nome}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}>{guest.empresa}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}>{guest.email}</Typography>
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
                        color: 'white',
                        background: '#33B6E5',
                        borderRadius: '8px',
                        transition: 'all 150ms ease-in-out',
                        '&:hover': {
                          background: '#ED7414'
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
                        color: 'white',
                        background: '#33B6E5',
                        borderRadius: '8px',
                        ml: 1,
                        transition: 'all 150ms ease-in-out',
                        '&:hover': {
                          background: '#ED7414'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ background: 'rgba(0,0,0,0.10)', borderRadius: '0 0 24px 24px' }}>
                  <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}><strong style={{ color: 'white' }}>Telefone:</strong> {guest.telefone}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}><strong style={{ color: 'white' }}>Cargo:</strong> {guest.cargo}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.80)' }}><strong style={{ color: 'white' }}>Convidado por:</strong> {guest.convidado_por}</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
    </Box>
  );
}