"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  Stack,
  Avatar,
  Divider,
  CircularProgress,
  Badge,
  LinearProgress,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Guest } from "@prisma/client";

// Tipo simplificado para check-in - apenas dados essenciais
type GuestWithCheckin = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
  status: string;
  data_cadastro: Date;
  data_confirmacao: Date | null;
  convite_url?: string;
  // Campos de check-in
  data_checkin?: Date | null;
  checkin_realizado?: boolean;
  checkin_por?: string | null;
};

interface CheckinPageProps {
  guests: GuestWithCheckin[];
}

interface OfflineCheckin {
  guestId: number;
  timestamp: string;
  synced: boolean;
}

export default function CheckinPage({ guests: initialGuests }: CheckinPageProps) {
  const [guests, setGuests] = useState<GuestWithCheckin[]>(initialGuests);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [offlineCheckins, setOfflineCheckins] = useState<OfflineCheckin[]>([]);

  // Carregar check-ins offline do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offline-checkins');
    if (stored) {
      setOfflineCheckins(JSON.parse(stored));
    }
  }, []);

  // Filtrar apenas participantes confirmados
  const confirmedGuests = useMemo(() => {
    return guests.filter(guest => 
      guest.status && String(guest.status).toLowerCase() === 'confirmado'
    );
  }, [guests]);

  // Filtrar participantes baseado na busca
  const filteredGuests = useMemo(() => {
    if (!searchTerm.trim()) return confirmedGuests;
    
    const term = searchTerm.toLowerCase();
    return confirmedGuests.filter(guest => 
      guest.nome.toLowerCase().includes(term) ||
      guest.email?.toLowerCase().includes(term) ||
      guest.telefone.toLowerCase().includes(term) ||
      guest.empresa.toLowerCase().includes(term)
    );
  }, [confirmedGuests, searchTerm]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = confirmedGuests.length;
    const checkedIn = confirmedGuests.filter(g => g.checkin_realizado || 
      offlineCheckins.some(oc => oc.guestId === g.id)).length;
    const pending = total - checkedIn;
    
    return { total, checkedIn, pending };
  }, [confirmedGuests, offlineCheckins]);

  const handleCheckin = async (guest: GuestWithCheckin) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestId: guest.id }),
      });

      if (response.ok) {
        const updatedGuest = await response.json();
        setGuests(prev => prev.map(g => 
          g.id === guest.id ? { ...g, checkin_realizado: true, data_checkin: new Date() } : g
        ));
        setSnackbar({
          open: true,
          message: `Check-in realizado com sucesso para ${guest.nome}!`,
          severity: "success"
        });
      } else {
        throw new Error('Erro no servidor');
      }
    } catch (error) {
      // Modo offline - salvar no localStorage
      const offlineCheckin: OfflineCheckin = {
        guestId: guest.id,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      const newOfflineCheckins = [...offlineCheckins, offlineCheckin];
      setOfflineCheckins(newOfflineCheckins);
      localStorage.setItem('offline-checkins', JSON.stringify(newOfflineCheckins));
      
      setSnackbar({
        open: true,
        message: `Check-in salvo offline para ${guest.nome}. Será sincronizado quando a conexão for restabelecida.`,
        severity: "success"
      });
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = (guest: GuestWithCheckin) => {
    return guest.checkin_realizado || offlineCheckins.some(oc => oc.guestId === guest.id);
  };

  const getCheckinTime = (guest: GuestWithCheckin) => {
    if (guest.data_checkin) {
      return new Date(guest.data_checkin).toLocaleString('pt-BR');
    }
    
    const offlineCheckin = offlineCheckins.find(oc => oc.guestId === guest.id);
    if (offlineCheckin) {
      return new Date(offlineCheckin.timestamp).toLocaleString('pt-BR') + ' (offline)';
    }
    
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header com estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Check-in do Evento
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Confirmados */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { 
                borderColor: 'primary.light',
                transform: 'translateY(-2px)',
                boxShadow: 3 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Total Confirmados
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ 
                      fontWeight: 700, 
                      color: 'text.primary',
                      lineHeight: 1
                    }}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Participantes confirmados no evento
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Check-in Realizados */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'success.50',
              border: '2px solid',
              borderColor: 'success.200',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { 
                borderColor: 'success.main',
                transform: 'translateY(-2px)',
                boxShadow: 3 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', color: 'white' }}>
                    <CheckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="success.dark" sx={{ fontWeight: 600 }}>
                      Check-in Feito
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ 
                      fontWeight: 700, 
                      color: 'success.dark',
                      lineHeight: 1
                    }}>
                      {stats.checkedIn}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="success.dark">
                  Participantes que já fizeram check-in
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pendentes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'warning.50',
              border: '2px solid',
              borderColor: 'warning.200',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { 
                borderColor: 'warning.main',
                transform: 'translateY(-2px)',
                boxShadow: 3 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', color: 'white' }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="warning.dark" sx={{ fontWeight: 600 }}>
                      Aguardando
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ 
                      fontWeight: 700, 
                      color: 'warning.dark',
                      lineHeight: 1
                    }}>
                      {stats.pending}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="warning.dark">
                  Ainda não fizeram check-in
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Taxa de Check-in */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'info.50',
              border: '2px solid',
              borderColor: 'info.200',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { 
                borderColor: 'info.main',
                transform: 'translateY(-2px)',
                boxShadow: 3 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', color: 'white' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="overline" color="info.dark" sx={{ fontWeight: 600 }}>
                      Taxa de Presença
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ 
                      fontWeight: 700, 
                      color: 'info.dark',
                      lineHeight: 1
                    }}>
                      {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'info.100',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'info.main',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" color="info.dark" sx={{ mt: 0.5, display: 'block' }}>
                    {stats.checkedIn} de {stats.total} participantes
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Campo de busca */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, email, telefone ou empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {/* Lista de participantes */}
      <Grid container spacing={2}>
        {filteredGuests.map((guest) => (
          <Grid item xs={12} md={6} lg={4} key={guest.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: isCheckedIn(guest) ? '2px solid' : '1px solid',
                borderColor: isCheckedIn(guest) ? 'success.main' : 'divider',
                bgcolor: isCheckedIn(guest) ? 'success.50' : 'background.paper'
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Header do card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Avatar sx={{ bgcolor: isCheckedIn(guest) ? 'success.main' : 'primary.main' }}>
                      {isCheckedIn(guest) ? <CheckCircleIcon /> : <PersonIcon />}
                    </Avatar>
                    {isCheckedIn(guest) && (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Check-in Realizado" 
                        color="success" 
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Informações do participante */}
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {guest.nome}
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {guest.empresa}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {guest.cargo}
                        </Typography>
                      </Box>
                      
                      {guest.email && (
                        <Typography variant="body2" color="text.secondary">
                          {guest.email}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" color="text.secondary">
                        {guest.telefone}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Informações de check-in */}
                  {isCheckedIn(guest) && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                          Check-in: {getCheckinTime(guest)}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {/* Botão de check-in */}
                  {!isCheckedIn(guest) && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleCheckin(guest)}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Realizar Check-in'}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há resultados */}
      {filteredGuests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'Nenhum participante encontrado com os critérios de busca.' : 'Nenhum participante confirmado encontrado.'}
          </Typography>
        </Box>
      )}

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}