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
import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTabState } from '../contexts/TabStateContext';

const Base64Decode = () => {
  const { base64DecodeInput: inputValue, setBase64DecodeInput: setInputValue } = useTabState();

  const outputValue = useMemo(() => {
    if (inputValue === '') {
      return '';
    }

    try {
      const decoded = atob(inputValue.trim());
      return decoded;
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Error: ${String(error)}`;
    }
  }, [inputValue]);

  const onClickPaste = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setInputValue(text);
      })
      .catch((error) => {
        console.error('Failed to read clipboard:', error);
      });
  };

  const onClickCopy = () => {
    navigator.clipboard.writeText(outputValue).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  };

  return (
    <Stack spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" onClick={onClickPaste}>
          Paste
        </Button>
        <Button variant="contained" onClick={onClickCopy}>
          Copy
        </Button>
      </Box>
      <TextField
        label="Base64 Input"
        multiline
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        sx={{ height: '40%' }}
        slotProps={{
          input: {
            sx: { height: '100%', alignItems: 'flex-start' }
          }
        }}
        fullWidth
      />
      <TextField
        label="Decoded Output"
        multiline
        value={outputValue}
        slotProps={{
          input: {
            readOnly: true,
            sx: { height: '100%', alignItems: 'flex-start' }
          }
        }}
        sx={{ height: '40%' }}
        fullWidth
      />
    </Stack>
  );
};

export default Base64Decode;
