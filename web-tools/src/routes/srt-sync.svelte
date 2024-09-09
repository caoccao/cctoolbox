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
  import { Button, Checkbox, Grid, Group, TextInput, Title } from '@svelteuidev/core';
  import type { ChangeEventHandler } from 'svelte/elements';

  const SRT_LINE_SEPARATOR_PATTERN = /[\r\n]/;
  const SRT_INDEX_PATTERN = /^\s*\d+\s*$/;
  const SRT_TIME_PATTERN =
    /^\s*(\-?)(\d{2}:\d{2}:\d{2},\d{3})\s*\-{2}\>\s*(\-?)(\d{2}:\d{2}:\d{2},\d{3})\s*$/;

  const millisToSrtTime = (millis: number) => {
    millis = Math.round(millis);
    const sign = millis < 0 ? '-' : '';
    millis = Math.abs(millis);
    const millionSeconds = millis % 1000;
    const seconds = ((millis - millionSeconds) / 1000) % 60;
    const minutes = ((millis - millionSeconds - seconds * 1000) / 60000) % 60;
    const hours = (millis - millionSeconds - seconds * 1000 - minutes * 60000) / 360000;
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')},${millionSeconds.toString().padStart(3, '0')}`;
  };

  const srtTimeToMillis = (srtTime: string) => {
    const times = srtTime.split(/[:,]+/g);
    return (
      parseInt(times[0]) * 3600000 +
      parseInt(times[1]) * 60000 +
      parseInt(times[2]) * 1000 +
      parseInt(times[3])
    );
  };

  enum SrtLineType {
    Left,
    Right
  }

  class SrtLine {
    private index: number;
    private markerIndex: number;
    private start: number;
    private end: number;
    private text: string;
    private type: SrtLineType;
    constructor(index: number, type: SrtLineType) {
      this.index = index;
      this.markerIndex = -1;
      this.start = -1;
      this.end = -1;
      this.text = '';
      this.type = type;
    }

    getEnd() {
      return this.end;
    }

    getEndText() {
      return millisToSrtTime(this.end);
    }

    getIndex() {
      return this.index;
    }

    getMarkerIndex() {
      return this.markerIndex;
    }

    getStart() {
      return this.start;
    }

    getStartText() {
      return millisToSrtTime(this.start);
    }

    getText() {
      return this.text;
    }

    getType() {
      return this.type;
    }

    setEnd(millis: number): SrtLine {
      this.end = millis;
      return this;
    }

    setEndText(text: string): SrtLine {
      this.end = srtTimeToMillis(text);
      return this;
    }

    setIndex(index: number): SrtLine {
      this.index = index;
      return this;
    }

    setMarkerIndex(markerIndex: number): SrtLine {
      this.markerIndex = markerIndex;
      return this;
    }

    setStart(millis: number): SrtLine {
      this.start = millis;
      return this;
    }

    setStartText(text: string): SrtLine {
      this.start = srtTimeToMillis(text);
      return this;
    }

    setText(text: string): SrtLine {
      this.text = text;
      return this;
    }

    setType(type: SrtLineType): SrtLine {
      this.type = type;
      return this;
    }

    shiftTime(diffTime: number): SrtLine {
      this.start += diffTime;
      this.end += diffTime;
      return this;
    }

    toClone() {
      return new SrtLine(this.index, this.type)
        .setIndex(this.index)
        .setMarkerIndex(this.markerIndex)
        .setText(this.text)
        .setEnd(this.end)
        .setStart(this.start);
    }

    toString() {
      return `${this.index}\n${this.getStartText()} --> ${this.getEndText()}\n${this.text}\n`;
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
        this.left.setMarkerIndex(index);
      }
      if (this.right) {
        this.right.setMarkerIndex(index);
      }
    }
  }

  class Velocity {
    diffFrom: number;
    diffTo: number;
    timeFrom: number;
    timeTo: number;

    constructor(diffFrom: number, diffTo: number, timeFrom: number, timeTo: number) {
      this.diffFrom = diffFrom;
      this.diffTo = diffTo;
      this.timeFrom = timeFrom;
      this.timeTo = timeTo;
    }
  }

  let isDirty = false;
  let isSingleFileMode = true;
  let srtMarkers: SrtMarker[] = [];

  let originalLeftSrtLines: SrtLine[] = [];
  let originalRightSrtLines: SrtLine[] = [];

  let leftSrtLines: SrtLine[] = [];
  let rightSrtLines: SrtLine[] = [];

  function onChangeStart(event: ChangeEventHandler<HTMLInputElement>, srtLine: SrtLine) {
    try {
      srtMarkers[srtLine.getMarkerIndex()].right = new SrtLine(
        srtLine.getIndex(),
        SrtLineType.Right
      ).setStartText(event.target.value);
      isDirty = true;
    } catch (e) {
      console.error(e);
    }
  }

  function onClickLeftCopy() {
    navigator.clipboard.writeText(leftSrtLines.map((srtLine) => srtLine.toString()).join('\n'));
  }

  function onClickLeftPaste() {
    navigator.clipboard.readText().then((text) => {
      leftSrtLines = srtTextToSrtLines(text, SrtLineType.Left);
      originalLeftSrtLines = leftSrtLines.map((srtLine) => srtLine.toClone());
    });
  }

  function onClickLeftRenumber() {
    leftSrtLines.forEach((srtLine, index) => {
      srtLine.setIndex(index + 1);
    });
    leftSrtLines = leftSrtLines;
    isDirty = true;
  }

  function onClickMarker(srtLine: SrtLine) {
    let markers = srtMarkers;
    if (srtLine.getMarkerIndex() >= 0) {
      const markerIndex = srtLine.getMarkerIndex();
      markers[markerIndex].clear();
      markers = markers.filter((_marker, i) => i !== markerIndex);
    } else {
      if (srtLine.getType() === SrtLineType.Left) {
        if (
          !markers.find((marker, i) => {
            if (marker.left === null) {
              srtLine.setMarkerIndex(i);
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
              srtLine.setMarkerIndex(i);
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
          return a.left.getStart() - b.left.getStart();
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
    isDirty = true;
  }

  function onClickReset() {
    srtMarkers = [];
    leftSrtLines = originalLeftSrtLines.map((srtLine) => srtLine.toClone());
    if (isSingleFileMode) {
      rightSrtLines = [];
    } else {
      rightSrtLines = originalRightSrtLines.map((srtLine) => srtLine.toClone());
    }
    isDirty = false;
  }

  function onClickRightCopy() {
    navigator.clipboard.writeText(rightSrtLines.map((srtLine) => srtLine.toString()).join('\n'));
  }

  function onClickRightPaste() {
    navigator.clipboard.readText().then((text) => {
      rightSrtLines = srtTextToSrtLines(text, SrtLineType.Right);
      originalRightSrtLines = rightSrtLines.map((srtLine) => srtLine.toClone());
    });
  }

  function onClickRightRenumber() {
    rightSrtLines.forEach((srtLine, index) => {
      srtLine.setIndex(index + 1);
    });
    rightSrtLines = rightSrtLines;
    isDirty = true;
  }

  function onClickSingleFileMode() {
    isSingleFileMode = !isSingleFileMode;
    rightSrtLines = [];
    srtMarkers = [];
  }

  function onClickSyncToLeft() {
    sync(SrtLineType.Left);
    isDirty = true;
  }

  function onClickSyncToRight() {
    sync(SrtLineType.Right);
    isDirty = true;
  }

  function srtTextToSrtLines(text: string | null, type: SrtLineType): SrtLine[] {
    const srtLines: SrtLine[] = [];
    if (text) {
      text = text.replace(/\r/g, '');
      const lines = text.split(SRT_LINE_SEPARATOR_PATTERN);
      const length = lines.length;
      let srtLine: SrtLine | null = null;
      for (let i = 0; i < length; ++i) {
        const line = lines[i];
        const indexMatcher = line.match(SRT_INDEX_PATTERN);
        if (indexMatcher && i < length - 1) {
          ++i;
          const timeMatcher = lines[i].match(SRT_TIME_PATTERN);
          if (timeMatcher) {
            srtLine = new SrtLine(parseInt(indexMatcher[0]), type)
              .setStartText(timeMatcher[2])
              .setEndText(timeMatcher[4]);
            if (timeMatcher[1] === '-') {
              srtLine.setStart(-1 * srtLine.getStart());
            }
            if (timeMatcher[3] === '-') {
              srtLine.setEnd(-1 * srtLine.getEnd());
            }
            srtLines.push(srtLine);
          }
        } else if (srtLine) {
          srtLine.setText(srtLine.getText() + line + '\n');
        } else {
          console.warn(`Ignored line: ${line}`);
        }
      }
    }
    srtLines
      .sort((a, b) => a.getStart() - b.getStart())
      .forEach((srtLine) => {
        srtLine.setText(srtLine.getText().trimEnd());
      });
    return srtLines;
  }

  function sync(type: SrtLineType) {
    const length = srtMarkers.length;
    if (isSingleFileMode) {
      rightSrtLines = leftSrtLines.map((srtLine) => srtLine.toClone().setType(SrtLineType.Right));
    }
    if (length == 1) {
      if (type === SrtLineType.Left) {
        const diffTime = srtMarkers[0].right!.getStart() - srtMarkers[0].left!.getStart();
        leftSrtLines.forEach((srtLine) => {
          srtLine.shiftTime(diffTime);
        });
        leftSrtLines = leftSrtLines;
      } else {
        const diffTime = isSingleFileMode
          ? srtMarkers[0].right!.getStart() - srtMarkers[0].left!.getStart()
          : srtMarkers[0].left!.getStart() - srtMarkers[0].right!.getStart();
        rightSrtLines.forEach((srtLine) => {
          srtLine.shiftTime(diffTime);
        });
        rightSrtLines = rightSrtLines;
      }
    } else if (length > 1) {
      if (type === SrtLineType.Left) {
        const velocities: Velocity[] = [];
        for (let i = 0; i < length - 1; ++i) {
          velocities.push(
            new Velocity(
              srtMarkers[i].right!.getStart() - srtMarkers[i].left!.getStart(),
              srtMarkers[i + 1].right!.getStart() - srtMarkers[i + 1].left!.getStart(),
              srtMarkers[i].left!.getStart(),
              srtMarkers[i + 1].left!.getStart()
            )
          );
        }
        let velocityIndex = 0;
        leftSrtLines.forEach((srtLine) => {
          const start = srtLine.getStart();
          let velocity = velocities[velocityIndex];
          while (start > velocity.timeTo && velocityIndex < velocities.length - 1) {
            ++velocityIndex;
            velocity = velocities[velocityIndex];
          }
          if (
            (velocityIndex == 0 && start < velocity.timeFrom) ||
            (velocityIndex == velocities.length - 1 && start > velocity.timeTo) ||
            (start >= velocity.timeFrom && start <= velocity.timeTo)
          ) {
            srtLine.shiftTime(
              velocity.diffFrom +
                ((velocity.diffTo - velocity.diffFrom) * (start - velocity.timeFrom)) /
                  (velocity.timeTo - velocity.timeFrom)
            );
          } else {
            console.warn('Ignore', srtLine);
          }
        });
        leftSrtLines = leftSrtLines;
      } else {
        const velocities: Velocity[] = [];
        for (let i = 0; i < length - 1; ++i) {
          velocities.push(
            isSingleFileMode
              ? new Velocity(
                  srtMarkers[i].right!.getStart() - srtMarkers[i].left!.getStart(),
                  srtMarkers[i + 1].right!.getStart() - srtMarkers[i + 1].left!.getStart(),
                  srtMarkers[i].left!.getStart(),
                  srtMarkers[i + 1].left!.getStart()
                )
              : new Velocity(
                  srtMarkers[i].left!.getStart() - srtMarkers[i].right!.getStart(),
                  srtMarkers[i + 1].left!.getStart() - srtMarkers[i + 1].right!.getStart(),
                  srtMarkers[i].right!.getStart(),
                  srtMarkers[i + 1].right!.getStart()
                )
          );
        }
        let velocityIndex = 0;
        rightSrtLines.forEach((srtLine) => {
          const start = srtLine.getStart();
          let velocity = velocities[velocityIndex];
          while (start > velocity.timeTo && velocityIndex < velocities.length - 1) {
            ++velocityIndex;
            velocity = velocities[velocityIndex];
          }
          if (
            (velocityIndex == 0 && start < velocity.timeFrom) ||
            (velocityIndex == velocities.length - 1 && start > velocity.timeTo) ||
            (start >= velocity.timeFrom && start <= velocity.timeTo)
          ) {
            srtLine.shiftTime(
              velocity.diffFrom +
                ((velocity.diffTo - velocity.diffFrom) * (start - velocity.timeFrom)) /
                  (velocity.timeTo - velocity.timeFrom)
            );
          } else {
            console.warn('Ignore', srtLine);
          }
        });
        rightSrtLines = rightSrtLines;
      }
    }
  }
</script>

<Grid>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm" on:click={onClickLeftPaste}>Paste</Button>
      <Button size="sm" on:click={onClickLeftCopy} disabled={leftSrtLines.length == 0}>Copy</Button>
      <Button size="sm" on:click={onClickLeftRenumber} disabled={leftSrtLines.length == 0}>
        Renumber
      </Button>
      <Button size="sm" on:click={onClickSyncToRight} disabled={srtMarkers.length == 0}>
        Sync ⇨
      </Button>
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      {#if !isSingleFileMode}
        <Button size="sm" on:click={onClickRightPaste}>Paste</Button>
      {/if}
      <Button size="sm" on:click={onClickRightCopy} disabled={rightSrtLines.length == 0}>
        Copy
      </Button>
      {#if !isSingleFileMode}
        <Button size="sm" on:click={onClickRightRenumber} disabled={rightSrtLines.length == 0}>
          Renumber
        </Button>
        <Button size="sm" on:click={onClickSyncToLeft} disabled={srtMarkers.length == 0}>
          ⇦ Sync
        </Button>
      {/if}
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
              class={srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length
                ? 'data-table-row-marked'
                : 'data-table-row-unmarked'}
            >
              <td class="data-table-cell-index">
                {#if srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length}
                  <span class="badge-marker">{`${srtLine.getMarkerIndex() + 1}`}</span>
                {/if}
                {srtLine.getIndex()}
              </td>
              <td class="data-table-cell-start">
                {#if srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length}
                  <TextInput
                    size="xs"
                    value={srtMarkers[srtLine.getMarkerIndex()].right
                      ? srtMarkers[srtLine.getMarkerIndex()].right?.getStartText()
                      : srtLine.getStartText()}
                    style="text-align: center; font-family: 'Courier New', Courier, monospace;"
                    on:change={(event) => {
                      onChangeStart(event, srtLine);
                    }}
                  />
                {:else}
                  {srtLine.getStartText()}
                {/if}
              </td>
              <td class="data-table-cell-end">{srtLine.getEndText()}</td>
              <td class="data-table-cell-text">{srtLine.getText()}</td>
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
              class={srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length
                ? 'data-table-row-marked'
                : 'data-table-row-unmarked'}
            >
              <td class="data-table-cell-index">
                {#if srtLine.getMarkerIndex() >= 0 && srtLine.getMarkerIndex() < srtMarkers.length}
                  <span class="badge-marker">{`${srtLine.getMarkerIndex() + 1}`}</span>
                {/if}
                {srtLine.getIndex()}
              </td>
              <td class="data-table-cell-start">{srtLine.getStartText()}</td>
              <td class="data-table-cell-end">{srtLine.getEndText()}</td>
              <td class="data-table-cell-text">{srtLine.getText()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Grid.Col>
  {#if leftSrtLines.length == 0 && rightSrtLines.length == 0}
    <Grid.Col span={12}>
      <Title order={2} color="gray" align="center" style="line-height: 1.5em" pt="1em">
        Paste the Srt file content.
      </Title>
      <Title order={2} color="gray" align="center" style="line-height: 1.5em" pb="1em">
        Ctrl + Click to mark or unmark.
      </Title>
    </Grid.Col>
  {/if}
  <Grid.Col span={12}>
    <Group position="center" spacing="lg">
      <Checkbox
        label="Single File Mode"
        checked={isSingleFileMode}
        on:click={onClickSingleFileMode}
      />
      <Button size="sm" variant="outline" on:click={onClickReset} disabled={!isDirty}>Reset</Button>
    </Group>
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
  .data-table-header-end {
    text-align: center;
  }
  .data-table-cell-start,
  .data-table-cell-end {
    text-align: center;
    font-size: 14px;
    font-family: 'Courier New', Courier, monospace;
  }
  .data-table-header-text {
    text-align: left;
  }
  .data-table-row-marked {
    background-color: #eeeeff;
  }
  .data-table-row-unmarked:hover,
  .data-table-row-marked:hover {
    background-color: #eeffee;
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
