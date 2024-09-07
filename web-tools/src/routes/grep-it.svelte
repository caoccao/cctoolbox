<script lang="ts">
  /*
    *   Copyright (c) 2024. caoccao.com Sam Cao
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
  import { afterUpdate, onMount } from 'svelte';
  import {
    ActionIcon,
    Button,
    Checkbox,
    Group,
    Modal,
    Stack,
    Textarea,
    TextInput,
    Title
  } from '@svelteuidev/core';
  import { QuestionMarkCircled } from 'radix-icons-svelte';

  const fontFamily = '"Courier New", Courier, monospace';

  let caseSensitiveChecked = false;
  let modalChangeTemplateOpened = false;
  let modalHelpOpened = false;
  let multilineChecked = false;
  let removeDuplicatedChecked = false;
  let sortChecked = false;

  let changeTemplateValue = '_';
  let inputValue = '';
  let outputValue = '';
  let patternValue = '[^\\r\\n]+';
  let templateValue = '';

  let errorMessageCode = '';
  let errorMessageInput = '';

  let textAreaTemplate: HTMLTextAreaElement;
  let textAreaTemplateSelectionStart: number | null = null;
  let textAreaTemplateSelectionEnd: number | null = null;

  afterUpdate(() => {
    if (textAreaTemplateSelectionStart !== null && textAreaTemplateSelectionEnd !== null) {
      textAreaTemplate.selectionStart = textAreaTemplateSelectionStart;
      textAreaTemplate.selectionEnd = textAreaTemplateSelectionEnd;
      textAreaTemplateSelectionStart = null;
      textAreaTemplateSelectionEnd = null;
    }
    if (modalChangeTemplateOpened) {
      setFontFamily();
    }
  });

  onMount(() => {
    setFontFamily();
    textAreaTemplate = document.getElementById('textAreaTemplate') as HTMLTextAreaElement;
  });

  function evaluateChangeTemplate(code: string, _: string): string {
    return eval(code);
  }

  function evaluateTemplate(code: string, _: RegExpExecArray, i: number): string {
    return eval(code);
  }

  $: {
    errorMessageInput = '';
    if (patternValue === '' || inputValue === '') {
      outputValue = '';
    } else {
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
        outputValue = lines.length > 0 ? lines.map((line) => `${line}\n`).join('') : '';
      } catch (error) {
        outputValue = '';
        if (error instanceof Error) {
          errorMessageInput = error.message;
        } else {
          errorMessageInput = `Unknown error ${error}.`;
        }
      }
    }
  }

  function onClickChangeTemplate() {
    modalChangeTemplateOpened = true;
  }

  function onClickCopy() {
    errorMessageInput = '';
    navigator.clipboard.writeText(outputValue).catch((error) => {
      errorMessageInput = error.message;
    });
  }

  function onClickEscapeDollar() {
    errorMessageInput = '';
    templateValue = templateValue.replaceAll('$', '\\$');
  }

  function onClickEscapeBackSlash() {
    errorMessageInput = '';
    templateValue = templateValue.replaceAll('\\', '\\\\');
  }

  function onClickEscapeBackQuote() {
    errorMessageInput = '';
    templateValue = templateValue.replaceAll('`', '\\`');
  }

  function onClickInputLabel(event: CustomEvent<PointerEvent>) {
    if ((event as unknown as PointerEvent).ctrlKey) {
      inputValue = '';
    }
  }

  function onClickModalChangeTemplateExecute() {
    errorMessageCode = '';
    try {
      templateValue = evaluateChangeTemplate(changeTemplateValue, templateValue);
      modalChangeTemplateOpened = false;
    } catch (error) {
      if (error instanceof Error) {
        errorMessageCode = error.message;
      } else {
        errorMessageCode = `Unknown error ${error}.`;
      }
    }
  }

  function onClickModalHelp() {
    modalHelpOpened = true;
  }

  function onClickPaste() {
    errorMessageInput = '';
    navigator.clipboard
      .readText()
      .then((text) => {
        inputValue = text;
      })
      .catch((error) => {
        errorMessageInput = error.message;
      });
  }

  function onClickPatternLabel(event: CustomEvent<PointerEvent>) {
    if ((event as unknown as PointerEvent).ctrlKey) {
      patternValue = '';
    }
  }

  function onClickTemplateLabel(event: CustomEvent<PointerEvent>) {
    if ((event as unknown as PointerEvent).ctrlKey) {
      templateValue = '';
    }
  }

  function onCloseModalChangeTemplate() {
    errorMessageCode = '';
    modalChangeTemplateOpened = false;
  }

  function onCloseModalHelp() {
    modalHelpOpened = false;
  }

  function onKeyupTemplate(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey) {
      switch (event.key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          textAreaTemplateSelectionStart = textAreaTemplate.selectionStart;
          textAreaTemplateSelectionEnd = textAreaTemplate.selectionEnd;
          const prefix = templateValue.slice(0, textAreaTemplateSelectionStart);
          const suffix = templateValue.slice(textAreaTemplateSelectionEnd);
          templateValue = `${prefix}\${_[${event.key}]}${suffix}`;
          const newPosition = textAreaTemplateSelectionStart + 7;
          textAreaTemplateSelectionStart = newPosition;
          textAreaTemplateSelectionEnd = newPosition;
          break;
      }
    }
  }

  function setFontFamily() {
    for (const input of document.getElementsByTagName('input')) {
      input.style.fontFamily = fontFamily;
    }
    for (const input of document.getElementsByTagName('textarea')) {
      input.style.fontFamily = fontFamily;
    }
  }
</script>

<Stack align="stretch" justify="flex-start">
  <TextInput label="Pattern *" bind:value={patternValue} on:click={onClickPatternLabel} />
  <Textarea
    id="textAreaTemplate"
    label="Template"
    rows="5"
    required={false}
    bind:value={templateValue}
    on:keyup={onKeyupTemplate}
    on:click={onClickTemplateLabel}
  />
  <Group position="center" spacing="md">
    <Checkbox label="Case Sensitive" bind:checked={caseSensitiveChecked} />
    <Checkbox label="Multiline" bind:checked={multilineChecked} />
    <Checkbox label="Remove Duplicated" bind:checked={removeDuplicatedChecked} />
    <Checkbox label="Sort" bind:checked={sortChecked} />
  </Group>
  <Group position="center" spacing="md">
    <Button color="cyan" on:click={onClickEscapeBackSlash} size="sm">Escape \</Button>
    <Button color="cyan" on:click={onClickEscapeBackQuote} size="sm">Escape `</Button>
    <Button color="cyan" on:click={onClickEscapeDollar} size="sm">Escape $</Button>
    <Button color="cyan" on:click={onClickChangeTemplate} size="sm">Change Template</Button>
    <Button on:click={onClickPaste} size="sm">Paste</Button>
    <Button on:click={onClickCopy} size="sm">Copy</Button>
  </Group>
  <Textarea
    label="Input *"
    rows="10"
    error={errorMessageInput}
    bind:value={inputValue}
    on:click={onClickInputLabel}
  />
  <Textarea
    label="Output"
    rows="10"
    readonly={true}
    required={false}
    variant="filled"
    value={outputValue}
  />
  <Group position="center" spacing="md">
    <ActionIcon color="yellow" variant="outline" size={36} on:click={onClickModalHelp}>
      <QuestionMarkCircled size={24} />
    </ActionIcon>
  </Group>
</Stack>
<Modal
  title="Change Template by JavaScript Code"
  centered={true}
  size="lg"
  opened={modalChangeTemplateOpened}
  on:close={onCloseModalChangeTemplate}
>
  <Stack align="stretch" justify="flex-start">
    <Textarea
      label="JavaScript Code *"
      rows="10"
      bind:value={changeTemplateValue}
      error={errorMessageCode}
    />
    <Group position="center" spacing="md">
      <Button color="red" on:click={onCloseModalChangeTemplate}>Cancel</Button>
      <Button on:click={onClickModalChangeTemplateExecute}>Execute</Button>
    </Group>
  </Stack>
</Modal>
<Modal title="Help" centered={true} size="xl" opened={modalHelpOpened} on:close={onCloseModalHelp}>
  <Stack align="stretch" justify="flex-start">
    <Title order={3}>Template</Title>
    <Title order={4}>Variables</Title>
    <ul>
      <li>
        <code>_</code> - is the match result.
      </li>
      <li>
        <code>i</code> - is the index of the match result.
      </li>
    </ul>
    <Title order={4}>Keyboard Shortcuts</Title>
    <ul>
      <li>
        <code>Ctrl/Alt+0</code> - <code>Ctrl/Alt+9</code> - inserts
        <code>&#36;&#123;_[0]}</code> - <code>&#36;&#123;_[9]}</code> to the template.
      </li>
    </ul>
  </Stack>
</Modal>

<style>
  code {
    background-color: lightgray;
    padding: 0.1em 0.2em;
  }
</style>
