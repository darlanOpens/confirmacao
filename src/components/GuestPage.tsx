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
import { useRouter } from "next/navigation";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Image from 'next/image';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTheme } from '@mui/material/styles';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { ColorModeContext } from './ThemeRegistry';

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
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
} as const;

export default function GuestPage({ guests }: GuestPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);
  const router = useRouter();

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
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
        router.refresh();
    } else {
        showSnackbar("Falha ao excluir o convidado.", "error");
    }
    handleCloseDeleteModal();
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.status === 'confirmado').length;
  
  // Lógica de filtro (a ser aplicada depois)
  const filteredGuests = guests.filter(guest => 
    guest.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.empresa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Image 
              src="/elga-logo.png" 
              alt="ELGA Logo" 
              width={150} 
              height={40} 
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Central de Confirmações – ELGA
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
              <AddGuestForm showSnackbar={showSnackbar} />
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
              <Accordion key={guest.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${guest.id}-content`}
                  id={`panel-${guest.id}-header`}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle1">{guest.nome}</Typography>
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
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography><strong>Telefone:</strong> {guest.telefone}</Typography>
                    <Typography><strong>Cargo:</strong> {guest.cargo}</Typography>
                    <Typography><strong>Convidado por:</strong> {guest.convidado_por}</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
    </>
  );
} 