/*
 *   Copyright (c) 2024-2025. caoccao.com Sam Cao
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/grep-it')) return '/grep-it';
    if (location.pathname.includes('/srt-sync')) return '/srt-sync';
    return '/grep-it';
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <>
      <Container maxWidth="xl">
        <Box component="header" sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Typography variant="h3">web-tools</Typography>
        </Box>
      </Container>
      <Container maxWidth="xl">
        <Tabs value={getTabValue()} onChange={handleTabChange} centered>
          <Tab label="Grep It" value="/grep-it" sx={{ textTransform: 'none' }} />
          <Tab label="Srt Sync" value="/srt-sync" sx={{ textTransform: 'none' }} />
        </Tabs>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Container>
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Box component="footer" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">
            © Copyright 2024-2025 Sam Cao <a href="https://www.caoccao.com/">caoccao.com</a>
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Layout;
