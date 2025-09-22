"use client";

import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Chip, Stack, Typography } from "@mui/material";
import { Guest } from "@prisma/client";
import { preselection } from "@prisma/client";
import GuestPage from "./GuestPage";
import PreselectionPage from "./PreselectionPage";
import EventManager from "./EventManager";
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface EventEdition {
  id: number;
  nome: string;
  descricao: string | null;
  data_inicio: string;
  ativo: boolean;
  arquivado: boolean;
}

interface TabbedDashboardProps {
  guests: Guest[];
  preselections: preselection[];
}

export default function TabbedDashboard({ guests, preselections }: TabbedDashboardProps) {
  const [value, setValue] = useState(0);
  const [activeEdition, setActiveEdition] = useState<EventEdition | null>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Carregar edição ativa ao montar o componente
  useEffect(() => {
    loadActiveEdition();
  }, []);

  const loadActiveEdition = async () => {
    try {
      const response = await fetch('/api/events/active');
      const data = await response.json();
      if (data.success) {
        setActiveEdition(data.edition);
      }
    } catch (error) {
      console.error('Erro ao carregar edição ativa:', error);
    } finally {
      // Loading completed
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Banner da Edição Ativa - Minimalista */}
      {activeEdition && (
        <Box sx={{
          px: 3,
          py: 1,
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Chip
              icon={<CheckCircleIcon />}
              label={activeEdition.nome}
              color="primary"
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Iniciado em {new Date(activeEdition.data_inicio).toLocaleDateString('pt-BR')}
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Tabs de navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="dashboard tabs"
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab
            label={`Convidados (${guests.length})`}
            {...a11yProps(0)}
          />
          <Tab
            label={`Pré-seleção (${preselections.length})`}
            {...a11yProps(1)}
          />
          <Tab
            label="Gerenciar Eventos"
            icon={<EventIcon />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      {/* Conteúdo das abas */}
      <TabPanel value={value} index={0}>
        <GuestPage guests={guests} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PreselectionPage preselections={preselections} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <EventManager />
      </TabPanel>
    </Box>
  );
}
