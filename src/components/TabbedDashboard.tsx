"use client";

import { useState } from "react";
import { Box, Tabs, Tab, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Guest } from "@prisma/client";
import { preselection } from "@prisma/client";
import GuestPage from "./GuestPage";
import PreselectionPage from "./PreselectionPage";

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

interface TabbedDashboardProps {
  guests: Guest[];
  preselections: preselection[];
}

export default function TabbedDashboard({ guests, preselections }: TabbedDashboardProps) {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            flexGrow: 1 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2 
            }}>
              <Box
                component="img"
                src="/assets/figma/brunch-experience-logo.png"
                alt="Brunch Experience"
                sx={{
                  height: 40,
                  width: 'auto',
                }}
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Brunch Experience
              </Typography>
            </Box>
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
    </Box>
  );
}
