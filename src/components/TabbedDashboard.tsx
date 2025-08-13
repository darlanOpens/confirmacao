"use client";

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
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

      {/* Conteúdo das abas */}
      <TabPanel value={value} index={0}>
        <GuestPage guests={guests} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PreselectionPage preselections={preselections} />
      </TabPanel>
    </Box>
  );
}
