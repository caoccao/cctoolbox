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
  import { Button, Grid, Group } from '@svelteuidev/core';

  const SRT_LINE_SEPARATOR_PATTERN = /[\r\n]/;
  const SRT_INDEX_PATTERN = /^\s*\d+\s*$/;
  const SRT_TIME_PATTERN =
    /^\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\-{2}\>\s*(\d{2}:\d{2}:\d{2},\d{3})\s*$/;

  class SrtLine {
    index: number;
    start: string;
    end: string;
    text: string;
    constructor(index: number) {
      this.index = index;
      this.start = '';
      this.end = '';
      this.text = '';
    }
  }

  let leftSrtText: string | null = null;
  let rightSrtText: string | null = null;

  $: leftSrtLines = srtTextToSrtLines(leftSrtText);
  $: rightSrtLines = srtTextToSrtLines(rightSrtText);

  function onClickLeftPaste() {
    navigator.clipboard.readText().then((text) => {
      leftSrtText = text;
    });
  }

  function onClickRightPaste() {
    navigator.clipboard.readText().then((text) => {
      rightSrtText = text;
    });
  }

  function srtTextToSrtLines(srtText: string | null): SrtLine[] {
    const srtLines: SrtLine[] = [];
    if (srtText) {
      srtText = srtText.replace(/\r/g, '');
      const lines = srtText.split(SRT_LINE_SEPARATOR_PATTERN);
      let srtLine: SrtLine | null = null;
      for (const line of lines) {
        if (srtLine) {
          if (line === '') {
            srtLine.text = srtLine.text.trimEnd();
            srtLines.push(srtLine);
            srtLine = null;
          } else {
            const matcher = line.match(SRT_TIME_PATTERN);
            if (matcher) {
              srtLine.start = matcher[1];
              srtLine.end = matcher[2];
            } else {
              srtLine.text += line + '\n';
            }
          }
        } else {
          const matcher = line.match(SRT_INDEX_PATTERN);
          if (matcher) {
            srtLine = new SrtLine(parseInt(matcher[0]));
          } else {
            console.warn(`Ignored line: ${line}`);
            continue;
          }
        }
      }
      if (srtLine) {
        srtLine.text = srtLine.text.trimEnd();
        srtLines.push(srtLine);
      }
    }
    return srtLines;
  }
</script>

<Grid>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm" on:click={onClickLeftPaste}>Paste</Button>
      <Button size="sm">Copy</Button>
      <Button size="sm">Sync ⇨</Button>
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm" on:click={onClickRightPaste}>Paste</Button>
      <Button size="sm">Copy</Button>
      <Button size="sm">⇦ Sync</Button>
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="data-table-header-index">Index</th>
            <th class="data-table-header-start">Start</th>
            <th class="data-table-header-end">End</th>
            <th class="data-table-header-text">Text</th>
          </tr>
        </thead>
        <tbody>
          {#each leftSrtLines as srtLine}
            <tr>
              <td class="data-table-cell-index"><pre>{srtLine.index}</pre></td>
              <td class="data-table-cell-start"><pre>{srtLine.start}</pre></td>
              <td class="data-table-cell-end"><pre>{srtLine.end}</pre></td>
              <td class="data-table-cell-text"><pre>{srtLine.text}</pre></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Grid.Col>
  <Grid.Col span={6}>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="data-table-header-index">Index</th>
            <th class="data-table-header-start">Start</th>
            <th class="data-table-header-end">End</th>
            <th class="data-table-header-text">Text</th>
          </tr>
        </thead>
        <tbody>
          {#each rightSrtLines as srtLine}
            <tr>
              <td class="data-table-cell-index"><pre>{srtLine.index}</pre></td>
              <td class="data-table-cell-start"><pre>{srtLine.start}</pre></td>
              <td class="data-table-cell-end"><pre>{srtLine.end}</pre></td>
              <td class="data-table-cell-text"><pre>{srtLine.text}</pre></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Grid.Col>
</Grid>

<style>
  .data-table-container {
    max-height: 80vh;
    overflow: auto;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, Helvetica, sans-serif;
  }
  .data-table thead tr th {
    background-color: lightblue;
  }
  .data-table thead tr th,
  .data-table tbody tr td {
    padding: 2px;
    border: 1px solid lightgray;
  }
  .data-table-header-index,
  .data-table-cell-index {
    text-align: center;
    width: 4em;
    max-width: 4em;
  }
  .data-table-header-start,
  .data-table-header-end,
  .data-table-cell-start,
  .data-table-cell-end {
    text-align: center;
    width: 7em;
    max-width: 7em;
  }
  .data-table-header-text {
    text-align: left;
  }
  pre {
    padding: 0px;
    margin: 0px;
    font-family: Arial, Helvetica, sans-serif;
  }
</style>
