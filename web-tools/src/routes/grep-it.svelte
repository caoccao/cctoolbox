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
  import { Button, Checkbox, Flex, Stack, Textarea, TextInput } from '@svelteuidev/core';

  const fontFamily = '"Courier New", Courier, monospace';

  let caseSensitiveChecked = false;
  let multilineChecked = false;
  let removeDuplicatedChecked = false;
  let sortChecked = false;

  let patternValue = '[^\\r\\n]+';
  let templateValue = '';
  let inputValue = '';
  let outputValue = '';

  let errorMessage = '';

  let timerGrep: number | null = null;

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
  });

  onMount(() => {
    for (const input of document.getElementsByTagName('input')) {
      input.style.fontFamily = fontFamily;
    }
    for (const input of document.getElementsByTagName('textarea')) {
      input.style.fontFamily = fontFamily;
    }
    textAreaTemplate = document.getElementById('textAreaTemplate') as HTMLTextAreaElement;
  });

  function evaluateTemplate(code: string, $: RegExpExecArray, index: number): string {
    return eval(code);
  }

  function grep() {
    errorMessage = '';
    if (patternValue === '' || inputValue === '') {
      return;
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
          templateValue && templateValue !== '' ? templateValue : '${$[0]}';
        lines.push(evaluateTemplate('`' + escapedTemplateValue + '`', match, index));
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
      outputValue = lines.map((line) => `${line}\n`).join('');
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = `Unknown error ${error}.`;
      }
    }
  }

  function onChangeGrep() {
    if (timerGrep) {
      clearTimeout(timerGrep);
    }
    timerGrep = setTimeout(grep, 100);
  }

  function onClickCopy() {
    errorMessage = '';
    navigator.clipboard.writeText(outputValue).catch((error) => {
      errorMessage = error.message;
    });
  }

  function onClickEscapeDollar() {
    errorMessage = '';
    templateValue = templateValue.replaceAll('$', '\\$');
  }

  function onClickEscapeBackSlash() {
    errorMessage = '';
    templateValue = templateValue.replaceAll('\\', '\\\\');
  }

  function onClickEscapeBackQuote() {
    errorMessage = '';
    templateValue = templateValue.replaceAll('`', '\\`');
  }

  function onClickPaste() {
    errorMessage = '';
    navigator.clipboard
      .readText()
      .then((text) => {
        inputValue = text;
        onChangeGrep();
      })
      .catch((error) => {
        errorMessage = error.message;
      });
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
          templateValue = `${prefix}\${\$[${event.key}]}${suffix}`;
          textAreaTemplateSelectionEnd = textAreaTemplateSelectionStart + 7;
          break;
      }
    }
    onChangeGrep();
  }
</script>

<Stack align="stretch" justify="flex-start">
  <TextInput
    label="Pattern *"
    bind:value={patternValue}
    on:change={onChangeGrep}
    on:keyup={onChangeGrep}
  />
  <Textarea
    id="textAreaTemplate"
    label="Template"
    rows="5"
    required={false}
    bind:value={templateValue}
    on:change={onChangeGrep}
    on:keyup={onKeyupTemplate}
  />
  <Flex justify="center" gap="lg">
    <Checkbox label="Case Sensitive" bind:checked={caseSensitiveChecked} on:change={onChangeGrep} />
    <Checkbox label="Multiline" bind:checked={multilineChecked} on:change={onChangeGrep} />
    <Checkbox
      label="Remove Duplicated"
      bind:checked={removeDuplicatedChecked}
      on:change={onChangeGrep}
    />
    <Checkbox label="Sort" bind:checked={sortChecked} on:change={onChangeGrep} />
  </Flex>
  <Flex justify="center" gap="lg">
    <Button color="cyan" on:click={onClickEscapeBackSlash}>Escape \</Button>
    <Button color="cyan" on:click={onClickEscapeBackQuote}>Escape `</Button>
    <Button color="cyan" on:click={onClickEscapeDollar}>Escape $</Button>
    <Button on:click={onClickPaste}>Paste</Button>
    <Button on:click={onClickCopy}>Copy</Button>
  </Flex>
  <Textarea
    label="Input *"
    rows="10"
    error={errorMessage}
    bind:value={inputValue}
    on:change={onChangeGrep}
    on:keyup={onChangeGrep}
  />
  <Textarea
    label="Output"
    rows="10"
    readonly={true}
    required={false}
    variant="filled"
    value={outputValue}
  />
</Stack>
