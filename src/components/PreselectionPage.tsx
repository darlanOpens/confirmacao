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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import PromoteIcon from '@mui/icons-material/TrendingUp';
import { preselection } from "@prisma/client";
import { Autocomplete, createFilterOptions } from "@mui/material";

type PreselectionUI = preselection;

interface PreselectionPageProps {
  preselections: PreselectionUI[];
}

const filter = createFilterOptions<string>();

export default function PreselectionPage({ preselections: initialPreselections }: PreselectionPageProps) {
  const [preselections, setPreselections] = useState<PreselectionUI[]>(initialPreselections);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedPreselection, setSelectedPreselection] = useState<PreselectionUI | null>(null);
  const [promoteForm, setPromoteForm] = useState({ convidado_por: "", confirm_directly: false });
  const [tags, setTags] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteClick = (preselection: PreselectionUI) => {
    setSelectedPreselection(preselection);
    setDeleteModalOpen(true);
  };

  const handlePromoteClick = (preselection: PreselectionUI) => {
    setSelectedPreselection(preselection);
    setPromoteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedPreselection(null);
  };

  const handleClosePromoteModal = () => {
    setPromoteModalOpen(false);
    setSelectedPreselection(null);
    setPromoteForm({ convidado_por: "", confirm_directly: false });
  };

  // Carrega tags
  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetch('/api/convidados/tags');
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };
    loadTags();
  }, []);

  // Carrega preferência do localStorage separadamente para evitar problemas de hidratação
  React.useEffect(() => {
    const saved = localStorage.getItem('elga_convidado_por');
    if (saved) {
      setPromoteForm(prev => ({ ...prev, convidado_por: saved }));
    }
  }, []);

  const handleDelete = async () => {
    if (!selectedPreselection) return;

    try {
      const response = await fetch(`/api/preselecao/${selectedPreselection.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar("Contato excluído com sucesso!", "success");
        setPreselections(prev => prev.filter(p => p.id !== selectedPreselection.id));
        handleCloseDeleteModal();
      } else {
        showSnackbar(result.error || "Falha ao excluir o contato.", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao excluir o contato.", "error");
    }
  };

  const handlePromote = async () => {
    if (!selectedPreselection || !promoteForm.convidado_por.trim()) {
      showSnackbar("Por favor, preencha quem está convidando.", "error");
      return;
    }

    try {
      const response = await fetch(`/api/preselecao/promote/${selectedPreselection.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          convidado_por: promoteForm.convidado_por.trim(),
          confirm_directly: promoteForm.confirm_directly,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const successMessage = promoteForm.confirm_directly 
          ? "Contato promovido e confirmado com sucesso!" 
          : "Contato promovido com sucesso para convidados!";
        showSnackbar(successMessage, "success");
        // Atualiza o status localmente
        const newStatus = promoteForm.confirm_directly ? "Confirmado" : "Convidado";
        setPreselections(prev => prev.map(p => p.id === selectedPreselection.id ? { ...p, status: newStatus } : p));
        // Salva preferência no localStorage
        if (typeof window !== 'undefined' && promoteForm.convidado_por) {
          localStorage.setItem('elga_convidado_por', promoteForm.convidado_por);
        }
        handleClosePromoteModal();
      } else {
        showSnackbar(result.error || "Falha ao promover o contato.", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao promover o contato.", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pré Seleção": return "error"; // vermelho claro
      case "Convidado": return "warning"; // amarelo
      case "Confirmado": return "success"; // verde
      default: return "default";
    }
  };

  // Filtro de pesquisa
  const filteredPreselections = preselections.filter(preselection =>
    preselection.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (preselection.email && preselection.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    preselection.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preselection.cargo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPreselections = preselections.length;
  const pendenteCount = preselections.filter(p => p.status === "Pré Seleção").length;
  const convidadoCount = preselections.filter(p => p.status === "Convidado").length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Pré-seleção de Contatos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie contatos em processo de pré-seleção e promova os qualificados para convidados.
        </Typography>
      </Box>
      
      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
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
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h5" component="div">
                {pendenteCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Promovidos
              </Typography>
              <Typography variant="h5" component="div">
                {convidadoCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campo de Pesquisa */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar por nome, email, empresa ou cargo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            }
          }}
        />
      </Box>

      {/* Lista de Pré-seleções */}
      <Box>
        {filteredPreselections.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" textAlign="center">
                {searchQuery ? "Nenhuma pré-seleção encontrada para sua pesquisa." : "Nenhuma pré-seleção cadastrada."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          filteredPreselections.map((preselection) => (
            <Accordion 
              key={preselection.id} 
              sx={{ 
                mb: 2, 
                '&:before': { display: 'none' },
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&.Mui-expanded': { margin: '0 0 16px 0' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: '100%', pr: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{preselection.nome}</Typography>
                      </Box>
                      <Typography color="text.secondary">{preselection.empresa}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography color="text.secondary">{preselection.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={preselection.status}
                          color={getStatusColor(preselection.status)}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title={preselection.status === "Convidado" ? "Já promovido" : "Promover para Convidados"}>
                          <IconButton
                            aria-label="promote"
                            size="small"
                            disabled={preselection.status === "Convidado"}
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePromoteClick(preselection);
                            }}
                            sx={{ color: 'success.main' }}
                          >
                            <PromoteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            aria-label="delete"
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteClick(preselection);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={3}>
                    {/* Informações Pessoais */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Informações Pessoais
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Nome</Typography>
                            <Typography variant="body1">{preselection.nome}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Email</Typography>
                            <Typography variant="body1">{preselection.email}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Telefone</Typography>
                            <Typography variant="body1">{preselection.telefone}</Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                    
                    {/* Informações Profissionais */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Informações Profissionais
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Empresa</Typography>
                            <Typography variant="body1">{preselection.empresa}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Cargo</Typography>
                            <Typography variant="body1">{preselection.cargo}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Status</Typography>
                            <Chip
                              label={preselection.status}
                              color={getStatusColor(preselection.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                    
                    {/* Informações do Sistema */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Informações do Sistema
                        </Typography>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Data de cadastro</Typography>
                          <Typography variant="body1">
                            {new Date(preselection.data_cadastro).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Modal de Exclusão */}
      {selectedPreselection && (
        <Dialog 
          open={deleteModalOpen} 
          onClose={handleCloseDeleteModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirmar Exclusão
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Tem certeza que deseja excluir &quot;{selectedPreselection.nome}&quot; da pré-seleção?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{
                bgcolor: 'error.main',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
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
            <Autocomplete
              value={promoteForm.convidado_por}
              onChange={(event, newValue: string | null) => {
                let finalValue = newValue;
                if (newValue && newValue.startsWith('Adicionar "')) {
                  finalValue = newValue.substring('Adicionar "'.length, newValue.length - 1);
                }
                setPromoteForm(prev => ({ ...prev, convidado_por: finalValue || "" }));
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting) {
                  filtered.push(`Adicionar "${inputValue}"`);
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="convidado-por-autocomplete-preselection"
              options={tags}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return '';
              }}
              renderOption={(props, option) => <li {...props}>{option}</li>}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Convidado Por" required sx={{ mt: 2 }} />
              )}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={promoteForm.confirm_directly}
                  onChange={(e) => setPromoteForm(prev => ({ ...prev, confirm_directly: e.target.checked }))}
                  color="primary"
                />
              }
              label="Confirmar convidado diretamente"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePromoteModal}>Cancelar</Button>
            <Button 
              onClick={handlePromote} 
              color="success" 
              variant="contained"
              disabled={!promoteForm.convidado_por.trim()}
            >
              Promover
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}