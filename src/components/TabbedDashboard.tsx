"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import Image from 'next/image';
import LinkIcon from '@mui/icons-material/Link';
import GuestPage from "./GuestPage";
import PreselectionPage from "./PreselectionPage";
import CheckinPage from "./CheckinPage";
import { Guest } from "@prisma/client";
import { preselection } from "@prisma/client";

// UI types - compatível com GuestPage.tsx
type GuestUI = {
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
  // Novos campos opcionais vindos da API
  nome_preferido?: string | null;
  linkedin_url?: string | null;
  tamanho_empresa?: string | null;
  setor_atuacao?: string | null;
  produtos_servicos?: string | null;
  faturamento_anual?: string | null;
  modelo_negocio?: string | null;
};

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

type PreselectionUI = preselection & { convite_url?: string };

interface TabbedDashboardProps {
  guests: GuestUI[];
  preselections: PreselectionUI[];
}

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
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabbedDashboard({ guests, preselections }: TabbedDashboardProps) {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Converte GuestUI[] para GuestWithCheckin[] com apenas os campos essenciais
  const guestsForCheckin: GuestWithCheckin[] = guests.map(guest => ({
    id: guest.id,
    nome: guest.nome,
    email: guest.email,
    telefone: guest.telefone,
    empresa: guest.empresa,
    cargo: guest.cargo,
    convidado_por: guest.convidado_por,
    status: guest.status,
    data_cadastro: guest.data_cadastro,
    data_confirmacao: guest.data_confirmacao,
    convite_url: guest.convite_url,
    data_checkin: guest.data_checkin,
    checkin_realizado: guest.checkin_realizado,
    checkin_por: guest.checkin_por,
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {/* AppBar unificada */}
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
              size="small"
            >
              Seu link de rastreamento
            </Button>
          </Box>
        </Toolbar>
        
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
              label={`Check-in (${guests.filter(g => g.data_confirmacao !== null).length})`} 
              {...a11yProps(2)} 
            />
          </Tabs>
        </Box>
      </AppBar>

      {/* Conteúdo das abas */}
      <TabPanel value={value} index={0}>
        <GuestPage guests={guests} hideAppBar={true} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PreselectionPage preselections={preselections} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CheckinPage guests={guestsForCheckin} />
      </TabPanel>
    </Box>
  );
}
