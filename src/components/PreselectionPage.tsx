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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import PromoteIcon from '@mui/icons-material/TrendingUp';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StarIcon from '@mui/icons-material/Star';
import { preselection } from "@prisma/client";

type PreselectionUI = preselection & { convite_url?: string };

interface PreselectionPageProps {
  preselections: PreselectionUI[];
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'rgba(30, 30, 30, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
  color: 'white',
} as const;

export default function PreselectionPage({ preselections: initialPreselections }: PreselectionPageProps) {
  const [preselections, setPreselections] = useState<PreselectionUI[]>(initialPreselections);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedPreselection, setSelectedPreselection] = useState<PreselectionUI | null>(null);
  const [promoteForm, setPromoteForm] = useState({ convidado_por: "" });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  const handleOpenDeleteModal = (preselection: PreselectionUI) => {
    setSelectedPreselection(preselection);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPreselection(null);
  };

  const handleOpenPromoteModal = (preselection: PreselectionUI) => {
    setSelectedPreselection(preselection);
    setPromoteModalOpen(true);
  };

  const handleClosePromoteModal = () => {
    setPromoteModalOpen(false);
    setSelectedPreselection(null);
    setPromoteForm({ convidado_por: "" });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPreselection) return;
    try {
      const response = await fetch(`/api/preselecao/${selectedPreselection.id}`, { method: 'DELETE' });
      if (response.ok) {
        showSnackbar("Pré-seleção excluída com sucesso!", "success");
        setPreselections(prev => prev.filter(p => p.id !== selectedPreselection.id));
        handleCloseDeleteModal();
      } else {
        showSnackbar("Falha ao excluir a pré-seleção.", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao excluir a pré-seleção.", "error");
    }
  };

  const handlePromoteConfirm = async () => {
    if (!selectedPreselection || !promoteForm.convidado_por) {
      showSnackbar("Campo 'Convidado por' é obrigatório.", "error");
      return;
    }
    
    try {
      const response = await fetch(`/api/preselecao/promote/${selectedPreselection.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoteForm),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar("Contato promovido com sucesso para convidados!", "success");
        setPreselections(prev => prev.filter(p => p.id !== selectedPreselection.id));
        handleClosePromoteModal();
      } else {
        showSnackbar(result.error || "Falha ao promover o contato.", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao promover o contato.", "error");
    }
  };

  const getPriorityColor = (prioridade?: string | null) => {
    switch (prioridade) {
      case "alta": return "error";
      case "media": return "warning";  
      case "baixa": return "info";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospecto": return "default";
      case "qualificado": return "info";
      case "aprovado": return "success";
      case "rejeitado": return "error";
      default: return "default";
    }
  };

  // Filtro de pesquisa
  const filteredPreselections = preselections.filter(preselection =>
    preselection.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preselection.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preselection.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preselection.fonte.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPreselections = preselections.length;
  const qualifiedCount = preselections.filter(p => p.status === "qualificado").length;
  const approvedCount = preselections.filter(p => p.status === "aprovado").length;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Pré-seleção de Contatos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie contatos em processo de pré-seleção e promova os qualificados para convidados.
          </Typography>
        </Box>
        
        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Pré-seleção
                </Typography>
                <Typography variant="h5" component="div">
                  {totalPreselections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Qualificados
                </Typography>
                <Typography variant="h5" component="div">
                  {qualifiedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Aprovados
                </Typography>
                <Typography variant="h5" component="div">
                  {approvedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          
        {/* Barra de Pesquisa */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <TextField 
            variant="outlined"
            size="small"
            placeholder="Procurar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        {/* Modal de Exclusão */}
        {selectedPreselection && (
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
                Tem certeza que deseja excluir o contato &quot;{selectedPreselection.nome}&quot; da pré-seleção?
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
                <Button onClick={handleDeleteConfirm} color="error" sx={{ ml: 2 }}>Excluir</Button>
              </Box>
            </Box>
          </Modal>
        )}

        {/* Modal de Promoção */}
        {selectedPreselection && (
          <Dialog 
            open={promoteModalOpen} 
            onClose={handleClosePromoteModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Promover para Convidados
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2 }}>
                Promover &quot;{selectedPreselection.nome}&quot; para a lista de convidados.
              </Typography>
              <TextField
                fullWidth
                label="Convidado por"
                value={promoteForm.convidado_por}
                onChange={(e) => setPromoteForm({ convidado_por: e.target.value })}
                required
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePromoteModal}>Cancelar</Button>
              <Button onClick={handlePromoteConfirm} variant="contained" color="primary">
                Promover
              </Button>
            </DialogActions>
          </Dialog>
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

        {/* Lista de Pré-seleções */}
        <Box sx={{ mt: 4 }}>
          {filteredPreselections.map((preselection) => (
            <Accordion key={preselection.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${preselection.id}-content`}
                id={`panel-${preselection.id}-header`}
              >
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{preselection.nome}</Typography>
                        {preselection.prioridade && (
                          <Chip
                            icon={<PriorityHighIcon />}
                            label={preselection.prioridade}
                            color={getPriorityColor(preselection.prioridade)}
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography color="text.secondary">{preselection.empresa}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography color="text.secondary">{preselection.fonte}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={preselection.status}
                          color={getStatusColor(preselection.status)}
                          size="small"
                        />
                        {preselection.score && (
                          <Chip
                            icon={<StarIcon />}
                            label={preselection.score}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                <Box>
                  <Tooltip title="Promover para Convidados">
                    <IconButton
                      aria-label="promote"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenPromoteModal(preselection);
                      }}
                      sx={{ color: 'success.main' }}
                    >
                      <PromoteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenDeleteModal(preselection);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography><strong>Email:</strong> {preselection.email}</Typography>
                  <Typography><strong>Telefone:</strong> {preselection.telefone}</Typography>
                  <Typography><strong>Cargo:</strong> {preselection.cargo}</Typography>
                  <Typography><strong>Fonte:</strong> {preselection.fonte}</Typography>
                  
                  {preselection.responsavel && (
                    <Typography><strong>Responsável:</strong> {preselection.responsavel}</Typography>
                  )}
                  {preselection.observacoes && (
                    <Typography><strong>Observações:</strong> {preselection.observacoes}</Typography>
                  )}
                  
                  {/* Campos de negócio */}
                  {preselection.nome_preferido && (
                    <Typography><strong>Nome preferido:</strong> {preselection.nome_preferido}</Typography>
                  )}
                  {preselection.linkedin_url && (
                    <Typography>
                      <strong>LinkedIn:</strong>{' '}
                      <a href={preselection.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                        {preselection.linkedin_url}
                      </a>
                    </Typography>
                  )}
                  {preselection.tamanho_empresa && (
                    <Typography><strong>Tamanho da empresa:</strong> {preselection.tamanho_empresa}</Typography>
                  )}
                  {preselection.setor_atuacao && (
                    <Typography><strong>Setor de atuação:</strong> {preselection.setor_atuacao}</Typography>
                  )}
                  {preselection.produtos_servicos && (
                    <Typography><strong>Produtos/Serviços:</strong> {preselection.produtos_servicos}</Typography>
                  )}
                  {preselection.faturamento_anual && (
                    <Typography><strong>Faturamento anual:</strong> {preselection.faturamento_anual}</Typography>
                  )}
                  {preselection.modelo_negocio && (
                    <Typography><strong>Modelo de negócio:</strong> {preselection.modelo_negocio}</Typography>
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
