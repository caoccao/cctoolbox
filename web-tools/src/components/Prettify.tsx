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
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useTabState } from '../contexts/TabStateContext';

const FORMAT_TYPES = [
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' }
];

const Prettify = () => {
  const {
    prettifyFormat,
    setPrettifyFormat,
    prettifyIndent,
    setPrettifyIndent,
    prettifyInput,
    setPrettifyInput
  } = useTabState();

  const handleFormatChange = (event: SelectChangeEvent) => {
    setPrettifyFormat(event.target.value);
  };

  const handleIndentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setPrettifyIndent(value);
    }
  };

  const handlePaste = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setPrettifyInput(text);
      })
      .catch((error) => {
        console.error('Failed to read clipboard:', error);
      });
  };

  const formatJson = (text: string, indent: number): string => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Error: ${String(error)}`;
    }
  };

  const formatXml = (text: string, indent: number): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        return `Error: ${parserError.textContent}`;
      }

      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(xmlDoc);

      // Format XML with indentation
      const formatted = xmlString.replace(/></g, '>\n<');
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const indentStr = ' '.repeat(indent);

      return lines
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          const indented = indentStr.repeat(indentLevel) + trimmed;

          if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
            indentLevel++;
          }

          return indented;
        })
        .join('\n');
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Error: ${String(error)}`;
    }
  };

  const handleFormat = () => {
    if (prettifyInput.trim() === '') {
      return;
    }

    let formatted: string;
    if (prettifyFormat === 'json') {
      formatted = formatJson(prettifyInput, prettifyIndent);
    } else {
      formatted = formatXml(prettifyInput, prettifyIndent);
    }

    setPrettifyInput(formatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prettifyInput).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
  };

  return (
    <Stack spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="format-type-label">Format</InputLabel>
          <Select
            labelId="format-type-label"
            value={prettifyFormat}
            label="Format"
            onChange={handleFormatChange}
          >
            {FORMAT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Indent"
          type="number"
          value={prettifyIndent}
          onChange={handleIndentChange}
          sx={{ width: 100 }}
          slotProps={{
            input: {
              inputProps: { min: 0, max: 10 }
            }
          }}
        />

        <Button variant="contained" onClick={handlePaste}>
          Paste
        </Button>

        <Button variant="contained" onClick={handleFormat}>
          Format
        </Button>

        <Button variant="contained" onClick={handleCopy}>
          Copy
        </Button>
      </Box>

      <TextField
        label="Input"
        multiline
        rows={25}
        value={prettifyInput}
        onChange={(e) => setPrettifyInput(e.target.value)}
        sx={{ height: '80%' }}
        slotProps={{
          input: {
            sx: { fontFamily: 'monospace' }
          }
        }}
        fullWidth
      />
    </Stack>
  );
};

export default Prettify;
