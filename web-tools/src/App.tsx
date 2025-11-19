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
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { TabStateProvider } from './contexts/TabStateContext';
import Layout from './components/Layout';
import GrepIt from './components/GrepIt';
import SrtSync from './components/SrtSync';
import Base64Decode from './components/Base64Decode';
import Base64Encode from './components/Base64Encode';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TabStateProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/grep-it" replace />} />
              <Route path="/grep-it" element={<GrepIt />} />
              <Route path="/srt-sync" element={<SrtSync />} />
              <Route path="/base64-decode" element={<Base64Decode />} />
              <Route path="/base64-encode" element={<Base64Encode />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TabStateProvider>
    </ThemeProvider>
  );
}

export default App;
