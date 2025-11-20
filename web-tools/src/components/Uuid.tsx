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
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, v6 as uuidv6, v7 as uuidv7 } from 'uuid';
import { useTabState } from '../contexts/TabStateContext';

const UUID_VERSIONS = [
  { value: 'v1', label: 'Version 1 (Timestamp)' },
  { value: 'v3', label: 'Version 3 (MD5)' },
  { value: 'v4', label: 'Version 4 (Random)' },
  { value: 'v5', label: 'Version 5 (SHA-1)' },
  { value: 'v6', label: 'Version 6 (Timestamp, Ordered)' },
  { value: 'v7', label: 'Version 7 (Unix Epoch)' }
];

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard DNS namespace

const Uuid = () => {
  const {
    uuidVersion,
    setUuidVersion,
    uuidCount,
    setUuidCount,
    uuidHistory,
    setUuidHistory
  } = useTabState();

  const [namespace, setNamespace] = useState(DNS_NAMESPACE);
  const [name, setName] = useState('example.com');

  const handleVersionChange = (event: SelectChangeEvent) => {
    setUuidVersion(event.target.value);
  };

  const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setUuidCount(value);
    }
  };

  const generateUuid = (): string => {
    switch (uuidVersion) {
      case 'v1':
        return uuidv1();
      case 'v3':
        return uuidv3(name, namespace);
      case 'v4':
        return uuidv4();
      case 'v5':
        return uuidv5(name, namespace);
      case 'v6':
        return uuidv6();
      case 'v7':
        return uuidv7();
      default:
        return uuidv4();
    }
  };

  const handleGenerate = () => {
    const newUuid = generateUuid();
    const updatedHistory = [newUuid, ...uuidHistory];

    // Keep only the last 'uuidCount' items
    if (updatedHistory.length > uuidCount) {
      updatedHistory.splice(uuidCount);
    }

    setUuidHistory(updatedHistory);
  };

  const handleCopyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  };

  const handleClear = () => {
    setUuidHistory([]);
  };

  const showNamespaceFields = uuidVersion === 'v3' || uuidVersion === 'v5';

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="uuid-version-label">Version</InputLabel>
          <Select
            labelId="uuid-version-label"
            value={uuidVersion}
            label="Version"
            onChange={handleVersionChange}
          >
            {UUID_VERSIONS.map((version) => (
              <MenuItem key={version.value} value={version.value}>
                {version.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Count"
          type="number"
          value={uuidCount}
          onChange={handleCountChange}
          sx={{ width: 100 }}
          slotProps={{
            input: {
              inputProps: { min: 1, max: 100 }
            }
          }}
        />

        <Button variant="contained" onClick={handleGenerate}>
          Generate
        </Button>

        <Button variant="contained" onClick={handleClear}>
          Clear
        </Button>
      </Box>

      {showNamespaceFields && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <TextField
            label="Namespace UUID"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            sx={{ flex: 1, minWidth: 300, maxWidth: 400 }}
          />
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ flex: 1, minWidth: 200, maxWidth: 300 }}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, alignItems: 'center' }}>
        {uuidHistory.map((uuid, index) => (
          <Box key={`${uuid}-${index}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ minWidth: 30, textAlign: 'right' }}>{index + 1}.</Box>
            <Button
              variant="outlined"
              onClick={() => handleCopyUuid(uuid)}
              sx={{
                fontFamily: 'monospace',
                textTransform: 'none'
              }}
            >
              {uuid}
            </Button>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default Uuid;
