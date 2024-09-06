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
  import { Button, Grid, Group, Text } from '@svelteuidev/core';

  const SRT_LINE_SEPARATOR_PATTERN = /[\r\n]/;
  const SRT_INDEX_PATTERN = /^\s*\d+\s*$/;
  const SRT_TIME_PATTERN =
    /^\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\-{2}\>\s*(\d{2}:\d{2}:\d{2},\d{3})\s*$/;

  enum SrtLineType {
    Left,
    Right
  }

  class SrtLine {
    index: number;
    mark: number;
    start: string;
    end: string;
    text: string;
    type: SrtLineType;
    constructor(index: number, type: SrtLineType) {
      this.index = index;
      this.mark = -1;
      this.start = '';
      this.end = '';
      this.text = '';
      this.type = type;
    }
  }

  class SrtMark {
    left: SrtLine | null;
    right: SrtLine | null;
    constructor() {
      this.left = null;
      this.right = null;
    }
    clear() {
      this.setMark(-1);
    }
    setMark(mark: number) {
      if (this.left) {
        this.left.mark = mark;
      }
      if (this.right) {
        this.right.mark = mark;
      }
    }
  }

  let leftSrtText: string | null = null;
  let rightSrtText: string | null = null;
  let srtMarks: SrtMark[] = [];

  $: leftSrtLines = srtTextToSrtLines(leftSrtText, SrtLineType.Left);
  $: rightSrtLines = srtTextToSrtLines(rightSrtText, SrtLineType.Right);

  function onClickLeftPaste() {
    navigator.clipboard.readText().then((text) => {
      leftSrtText = text;
    });
  }

  function onClickMark(srtLine: SrtLine) {
    let marks = srtMarks;
    if (srtLine.mark >= 0) {
      const index = srtLine.mark;
      marks[index].clear();
      marks = marks.filter((_mark, i) => i !== index);
    } else {
      if (srtLine.type === SrtLineType.Left) {
        if (
          !marks.find((mark, i) => {
            if (mark.left === null) {
              srtLine.mark = i;
              mark.left = srtLine;
              return true;
            }
            return false;
          })
        ) {
          const mark = new SrtMark();
          mark.left = srtLine;
          marks.push(mark);
        }
      } else {
        if (
          !marks.find((mark, i) => {
            if (mark.right === null) {
              srtLine.mark = i;
              mark.right = srtLine;
              return true;
            }
            return false;
          })
        ) {
          const mark = new SrtMark();
          mark.right = srtLine;
          marks.push(mark);
        }
      }
    }
    marks.forEach((mark, i) => {
      mark.setMark(i);
    });
    srtMarks = marks;
    leftSrtLines = leftSrtLines;
    rightSrtLines = rightSrtLines;
  }

  function onClickRightPaste() {
    navigator.clipboard.readText().then((text) => {
      rightSrtText = text;
    });
  }

  function srtTextToSrtLines(text: string | null, type: SrtLineType): SrtLine[] {
    const srtLines: SrtLine[] = [];
    if (text) {
      text = text.replace(/\r/g, '');
      const lines = text.split(SRT_LINE_SEPARATOR_PATTERN);
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
            srtLine = new SrtLine(parseInt(matcher[0]), type);
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
            <tr
              on:click={(event) => {
                if (event.ctrlKey) {
                  onClickMark(srtLine);
                }
              }}
              class={srtLine.mark >= 0 && srtLine.mark < srtMarks.length
                ? 'data-table-row-marked'
                : ''}
            >
              <td class="data-table-cell-index">
                {#if srtLine.mark >= 0 && srtLine.mark < srtMarks.length}
                  <span class="badge-mark">{`${srtLine.mark + 1}`}</span>
                  {srtLine.index}
                {:else}
                  <pre>{srtLine.index}</pre>
                {/if}
              </td>
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
            <tr
              on:click={(event) => {
                if (event.ctrlKey) {
                  onClickMark(srtLine);
                }
              }}
              class={srtLine.mark >= 0 && srtLine.mark < srtMarks.length
                ? 'data-table-row-marked'
                : ''}
            >
              <td class="data-table-cell-index">
                {#if srtLine.mark >= 0 && srtLine.mark < srtMarks.length}
                  <span class="badge-mark">{`${srtLine.mark + 1}`}</span>
                  {srtLine.index}
                {:else}
                  <pre>{srtLine.index}</pre>
                {/if}
              </td>
              <td class="data-table-cell-start"><pre>{srtLine.start}</pre></td>
              <td class="data-table-cell-end"><pre>{srtLine.end}</pre></td>
              <td class="data-table-cell-text"><pre>{srtLine.text}</pre></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Grid.Col>
  <Grid.Col span={12}>
    <Text align="center">Ctrl + Click to mark or unmark.</Text>
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
  .data-table-row-marked {
    background-color: #eeeeff;
  }
  pre {
    padding: 0px;
    margin: 0px;
    font-family: Arial, Helvetica, sans-serif;
  }
  .badge-mark {
    position: relative;
    top: -0.5em;
    display: inline-block;
    background-color: darkorange;
    color: white;
    font-size: x-small;
    text-align: center;
    padding: 0px 3px 0px 3px;
    border-radius: 5px;
  }
</style>
