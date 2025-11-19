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
import { useState, useEffect, useRef, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const fontFamily = '"Courier New", Courier, monospace';

const GrepIt = () => {
  const [caseSensitiveChecked, setCaseSensitiveChecked] = useState(false);
  const [modalChangeTemplateOpened, setModalChangeTemplateOpened] = useState(false);
  const [modalHelpOpened, setModalHelpOpened] = useState(false);
  const [multilineChecked, setMultilineChecked] = useState(false);
  const [removeDuplicatedChecked, setRemoveDuplicatedChecked] = useState(false);
  const [sortChecked, setSortChecked] = useState(false);

  const [changeTemplateValue, setChangeTemplateValue] = useState('_');
  const [inputValue, setInputValue] = useState('');
  const [patternValue, setPatternValue] = useState('[^\\r\\n]+');
  const [templateValue, setTemplateValue] = useState('');

  const [errorMessageCode, setErrorMessageCode] = useState('');
  const [errorMessageInput, setErrorMessageInput] = useState('');

  const textAreaTemplateRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  // Set font family on mount and when modal opens
  useEffect(() => {
    const setFontFamily = () => {
      document.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
        input.style.fontFamily = fontFamily;
      });
      document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
        textarea.style.fontFamily = fontFamily;
      });
    };
    setFontFamily();
  }, [modalChangeTemplateOpened]);

  // Restore textarea selection
  useEffect(() => {
    if (selectionStart !== null && selectionEnd !== null && textAreaTemplateRef.current) {
      textAreaTemplateRef.current.selectionStart = selectionStart;
      textAreaTemplateRef.current.selectionEnd = selectionEnd;
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [selectionStart, selectionEnd]);

  const evaluateTemplate = (code: string, _: RegExpExecArray, i: number): string => {
    return eval(code);
  };

  const evaluateChangeTemplate = (code: string, _: string): string => {
    return eval(code);
  };

  // Compute output value
  const outputValue = useMemo(() => {
    setErrorMessageInput('');
    if (patternValue === '' || inputValue === '') {
      return '';
    }

    try {
      let flags = 'g';
      if (!caseSensitiveChecked) {
        flags += 'i';
      }
      if (multilineChecked) {
        flags += 'm';
      }
      const regex = new RegExp(patternValue, flags);
      let lines: Array<string> = [];
      let index = 0;
      for (const match of inputValue.matchAll(regex)) {
        const escapedTemplateValue =
          templateValue && templateValue !== '' ? templateValue : '${_[0]}';
        const line = evaluateTemplate('`' + escapedTemplateValue + '`', match, index);
        lines.push(line);
        ++index;
      }
      if (removeDuplicatedChecked) {
        const uniqueLines: Array<string> = [];
        const lineSet = new Set();
        lines.forEach((line) => {
          if (!lineSet.has(line)) {
            lineSet.add(line);
            uniqueLines.push(line);
          }
        });
        lines = uniqueLines;
      }
      if (sortChecked) {
        lines.sort();
      }
      return lines.length > 0 ? lines.map((line) => `${line}\n`).join('') : '';
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessageInput(error.message);
      } else {
        setErrorMessageInput(`Unknown error ${error}.`);
      }
      return '';
    }
  }, [
    patternValue,
    inputValue,
    templateValue,
    caseSensitiveChecked,
    multilineChecked,
    removeDuplicatedChecked,
    sortChecked
  ]);

  const onClickChangeTemplate = () => {
    setModalChangeTemplateOpened(true);
  };

  const onClickCopy = () => {
    setErrorMessageInput('');
    navigator.clipboard.writeText(outputValue).catch((error) => {
      setErrorMessageInput(error.message);
    });
  };

  const onClickEscapeDollar = () => {
    setErrorMessageInput('');
    setTemplateValue(templateValue.replaceAll('$', '\\$'));
  };

  const onClickEscapeBackSlash = () => {
    setErrorMessageInput('');
    setTemplateValue(templateValue.replaceAll('\\', '\\\\'));
  };

  const onClickEscapeBackQuote = () => {
    setErrorMessageInput('');
    setTemplateValue(templateValue.replaceAll('`', '\\`'));
  };

  const onClickInputLabel = (event: React.MouseEvent) => {
    if (event.ctrlKey) {
      setInputValue('');
    }
  };

  const onClickModalChangeTemplateExecute = () => {
    setErrorMessageCode('');
    try {
      setTemplateValue(evaluateChangeTemplate(changeTemplateValue, templateValue));
      setModalChangeTemplateOpened(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessageCode(error.message);
      } else {
        setErrorMessageCode(`Unknown error ${error}.`);
      }
    }
  };

  const onClickModalHelp = () => {
    setModalHelpOpened(true);
  };

  const onClickPaste = () => {
    setErrorMessageInput('');
    navigator.clipboard
      .readText()
      .then((text) => {
        setInputValue(text);
      })
      .catch((error) => {
        setErrorMessageInput(error.message);
      });
  };

  const onClickPatternLabel = (event: React.MouseEvent) => {
    if (event.ctrlKey) {
      setPatternValue('');
    }
  };

  const onClickTemplateLabel = (event: React.MouseEvent) => {
    if (event.ctrlKey) {
      setTemplateValue('');
    }
  };

  const onCloseModalChangeTemplate = () => {
    setErrorMessageCode('');
    setModalChangeTemplateOpened(false);
  };

  const onCloseModalHelp = () => {
    setModalHelpOpened(false);
  };

  const onKeyupTemplate = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.altKey) && textAreaTemplateRef.current) {
      const key = event.key;
      if (/^[0-9]$/.test(key)) {
        const start = textAreaTemplateRef.current.selectionStart;
        const end = textAreaTemplateRef.current.selectionEnd;
        const prefix = templateValue.slice(0, start);
        const suffix = templateValue.slice(end);
        setTemplateValue(`${prefix}\${_[${key}]}${suffix}`);
        const newPosition = start + 7;
        setSelectionStart(newPosition);
        setSelectionEnd(newPosition);
      }
    }
  };

  return (
    <>
      <Stack spacing={2} alignItems="stretch">
        <TextField
          label="Pattern *"
          value={patternValue}
          onChange={(e) => setPatternValue(e.target.value)}
          onClick={onClickPatternLabel}
          fullWidth
        />
        <TextField
          label="Template"
          multiline
          rows={5}
          value={templateValue}
          onChange={(e) => setTemplateValue(e.target.value)}
          onKeyUp={onKeyupTemplate}
          onClick={onClickTemplateLabel}
          inputRef={textAreaTemplateRef}
          fullWidth
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={caseSensitiveChecked}
                onChange={(e) => setCaseSensitiveChecked(e.target.checked)}
              />
            }
            label="Case Sensitive"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={multilineChecked}
                onChange={(e) => setMultilineChecked(e.target.checked)}
              />
            }
            label="Multiline"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={removeDuplicatedChecked}
                onChange={(e) => setRemoveDuplicatedChecked(e.target.checked)}
              />
            }
            label="Remove Duplicated"
          />
          <FormControlLabel
            control={
              <Checkbox checked={sortChecked} onChange={(e) => setSortChecked(e.target.checked)} />
            }
            label="Sort"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" color="info" size="small" onClick={onClickEscapeBackSlash}>
            Escape \
          </Button>
          <Button variant="contained" color="info" size="small" onClick={onClickEscapeBackQuote}>
            Escape `
          </Button>
          <Button variant="contained" color="info" size="small" onClick={onClickEscapeDollar}>
            Escape $
          </Button>
          <Button variant="contained" color="info" size="small" onClick={onClickChangeTemplate}>
            Change Template
          </Button>
          <Button variant="contained" size="small" onClick={onClickPaste}>
            Paste
          </Button>
          <Button variant="contained" size="small" onClick={onClickCopy}>
            Copy
          </Button>
        </Box>
        <TextField
          label="Input *"
          multiline
          rows={10}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onClick={onClickInputLabel}
          error={!!errorMessageInput}
          helperText={errorMessageInput}
          fullWidth
        />
        <TextField
          label="Output"
          multiline
          rows={10}
          value={outputValue}
          InputProps={{
            readOnly: true
          }}
          fullWidth
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton color="warning" onClick={onClickModalHelp} size="large">
            <HelpOutlineIcon fontSize="large" />
          </IconButton>
        </Box>
      </Stack>

      <Dialog
        open={modalChangeTemplateOpened}
        onClose={onCloseModalChangeTemplate}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Change Template by JavaScript Code</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="JavaScript Code *"
              multiline
              rows={10}
              value={changeTemplateValue}
              onChange={(e) => setChangeTemplateValue(e.target.value)}
              error={!!errorMessageCode}
              helperText={errorMessageCode}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="error" onClick={onCloseModalChangeTemplate}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onClickModalChangeTemplateExecute}>
                Execute
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={modalHelpOpened} onClose={onCloseModalHelp} maxWidth="lg" fullWidth>
        <DialogTitle>Help</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="h5">Template</Typography>
            <Typography variant="h6">Variables</Typography>
            <ul>
              <li>
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  _
                </Typography>{' '}
                - is the match result.
              </li>
              <li>
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  i
                </Typography>{' '}
                - is the index of the match result.
              </li>
            </ul>
            <Typography variant="h6">Keyboard Shortcuts</Typography>
            <ul>
              <li>
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  Ctrl/Alt+0
                </Typography>{' '}
                -{' '}
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  Ctrl/Alt+9
                </Typography>{' '}
                - inserts{' '}
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  {'${_[0]}'}
                </Typography>{' '}
                -{' '}
                <Typography
                  component="code"
                  sx={{ backgroundColor: 'lightgray', px: 0.5, py: 0.2 }}
                >
                  {'${_[9]}'}
                </Typography>{' '}
                to the template.
              </li>
            </ul>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GrepIt;
