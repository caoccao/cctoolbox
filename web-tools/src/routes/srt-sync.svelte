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
    markerIndex: number;
    start: string;
    end: string;
    text: string;
    type: SrtLineType;
    constructor(index: number, type: SrtLineType) {
      this.index = index;
      this.markerIndex = -1;
      this.start = '';
      this.end = '';
      this.text = '';
      this.type = type;
    }
  }

  class SrtMarker {
    left: SrtLine | null;
    right: SrtLine | null;
    constructor() {
      this.left = null;
      this.right = null;
    }
    clear() {
      this.setMarkerIndex(-1);
    }
    setMarkerIndex(index: number) {
      if (this.left) {
        this.left.markerIndex = index;
      }
      if (this.right) {
        this.right.markerIndex = index;
      }
    }
  }

  let srtMarkers: SrtMarker[] = [];

  let leftSrtLines: SrtLine[] = [];
  let rightSrtLines: SrtLine[] = [];

  function onClickLeftPaste() {
    navigator.clipboard.readText().then((text) => {
      leftSrtLines = srtTextToSrtLines(text, SrtLineType.Left);
    });
  }

  function onClickMarker(srtLine: SrtLine) {
    let markers = srtMarkers;
    if (srtLine.markerIndex >= 0) {
      const index = srtLine.markerIndex;
      markers[index].clear();
      markers = markers.filter((_marker, i) => i !== index);
    } else {
      if (srtLine.type === SrtLineType.Left) {
        if (
          !markers.find((marker, i) => {
            if (marker.left === null) {
              srtLine.markerIndex = i;
              marker.left = srtLine;
              return true;
            }
            return false;
          })
        ) {
          const marker = new SrtMarker();
          marker.left = srtLine;
          markers.push(marker);
        }
      } else {
        if (
          !markers.find((marker, i) => {
            if (marker.right === null) {
              srtLine.markerIndex = i;
              marker.right = srtLine;
              return true;
            }
            return false;
          })
        ) {
          const marker = new SrtMarker();
          marker.right = srtLine;
          markers.push(marker);
        }
      }
    }
    markers
      .sort((a, b) => {
        if (a.left && b.left) {
          return a.left.index - b.left.index;
        }
        if (a.left) {
          return -1;
        }
        if (b.left) {
          return 1;
        }
        return 0;
      })
      .forEach((marker, i) => {
        marker.setMarkerIndex(i);
      });
    srtMarkers = markers;
    leftSrtLines = leftSrtLines;
    rightSrtLines = rightSrtLines;
  }

  function onClickRightPaste() {
    navigator.clipboard.readText().then((text) => {
      rightSrtLines = srtTextToSrtLines(text, SrtLineType.Right);
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
                  onClickMarker(srtLine);
                }
              }}
              class={srtLine.markerIndex >= 0 && srtLine.markerIndex < srtMarkers.length
                ? 'data-table-row-marked'
                : ''}
            >
              <td class="data-table-cell-index">
                {#if srtLine.markerIndex >= 0 && srtLine.markerIndex < srtMarkers.length}
                  <span class="badge-marker">{`${srtLine.markerIndex + 1}`}</span>
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
                  onClickMarker(srtLine);
                }
              }}
              class={srtLine.markerIndex >= 0 && srtLine.markerIndex < srtMarkers.length
                ? 'data-table-row-marked'
                : ''}
            >
              <td class="data-table-cell-index">
                {#if srtLine.markerIndex >= 0 && srtLine.markerIndex < srtMarkers.length}
                  <span class="badge-marker">{`${srtLine.markerIndex + 1}`}</span>
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
    <Text align="center" color="dimmed">Ctrl + Click to mark or unmark.</Text>
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
  .badge-marker {
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
