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
  import { Button, Grid, Group, Title } from '@svelteuidev/core';

  const SRT_LINE_SEPARATOR_PATTERN = /[\r\n]/;
  const SRT_INDEX_PATTERN = /^\s*\d+\s*$/;
  const SRT_TIME_PATTERN =
    /^\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\-{2}\>\s*(\d{2}:\d{2}:\d{2},\d{3})\s*$/;

  const millsToSrtTime = (mills: number) => {
    mills = Math.round(mills);
    const millionSeconds = mills % 1000;
    const seconds = ((mills - millionSeconds) / 1000) % 60;
    const minutes = ((mills - millionSeconds - seconds * 1000) / 60000) % 60;
    const hours = (mills - millionSeconds - seconds * 1000 - minutes * 60000) / 360000;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')},${millionSeconds.toString().padStart(3, '0')}`;
  };

  const srtTimeToMills = (srtTime: string) => {
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
    index: number;
    markerIndex: number;
    start: string;
    end: string;
    text: string;
    type: SrtLineType;
    constructor(index: number, start: string, end: string, type: SrtLineType) {
      this.index = index;
      this.markerIndex = -1;
      this.start = start;
      this.end = end;
      this.text = '';
      this.type = type;
    }

    getEndTime() {
      return srtTimeToMills(this.end);
    }

    getStartTime() {
      return srtTimeToMills(this.start);
    }

    setEndTime(mills: number) {
      this.end = millsToSrtTime(mills);
    }

    setStartTime(mills: number) {
      this.start = millsToSrtTime(mills);
    }

    shiftTime(diffTime: number) {
      this.setStartTime(this.getStartTime() + diffTime);
      this.setEndTime(this.getEndTime() + diffTime);
    }

    toClone() {
      const clone = new SrtLine(this.index, this.start, this.end, this.type);
      clone.markerIndex = this.markerIndex;
      clone.text = this.text;
      return clone;
    }

    toString() {
      return `${this.index}\n${this.start} --> ${this.end}\n${this.text}\n`;
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
  let srtMarkers: SrtMarker[] = [];

  let originalLeftSrtLines: SrtLine[] = [];
  let originalRightSrtLines: SrtLine[] = [];

  let leftSrtLines: SrtLine[] = [];
  let rightSrtLines: SrtLine[] = [];

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
      srtLine.index = index + 1;
    });
    leftSrtLines = leftSrtLines;
    isDirty = true;
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
    isDirty = true;
  }

  function onClickReset() {
    srtMarkers = [];
    leftSrtLines = originalLeftSrtLines.map((srtLine) => srtLine.toClone());
    rightSrtLines = originalRightSrtLines.map((srtLine) => srtLine.toClone());
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
      srtLine.index = index + 1;
    });
    rightSrtLines = rightSrtLines;
    isDirty = true;
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
            srtLine = new SrtLine(parseInt(indexMatcher[0]), timeMatcher[1], timeMatcher[2], type);
            srtLines.push(srtLine);
          }
        } else if (srtLine) {
          srtLine.text += line + '\n';
        } else {
          console.warn(`Ignored line: ${line}`);
        }
      }
    }
    srtLines
      .sort((a, b) => a.start.localeCompare(b.start))
      .forEach((srtLine) => {
        srtLine.text = srtLine.text.trimEnd();
      });
    return srtLines;
  }

  function sync(type: SrtLineType) {
    console.log(srtMarkers);
    const length = srtMarkers.length;
    if (length == 1) {
      if (type === SrtLineType.Left) {
        const diffTime = srtMarkers[0].right!.getStartTime() - srtMarkers[0].left!.getStartTime();
        leftSrtLines.forEach((srtLine) => {
          srtLine.shiftTime(diffTime);
        });
        leftSrtLines = leftSrtLines;
      } else {
        const diffTime = srtMarkers[0].left!.getStartTime() - srtMarkers[0].right!.getStartTime();
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
              srtMarkers[i].right!.getStartTime() - srtMarkers[i].left!.getStartTime(),
              srtMarkers[i + 1].right!.getStartTime() - srtMarkers[i + 1].left!.getStartTime(),
              srtMarkers[i].left!.getStartTime(),
              srtMarkers[i + 1].left!.getStartTime()
            )
          );
        }
        let velocityIndex = 0;
        leftSrtLines.forEach((srtLine) => {
          const startTime = srtLine.getStartTime();
          let velocity = velocities[velocityIndex];
          while (startTime > velocity.timeTo && velocityIndex < velocities.length - 1) {
            ++velocityIndex;
            velocity = velocities[velocityIndex];
          }
          if (
            (velocityIndex == 0 && startTime < velocity.timeFrom) ||
            (velocityIndex == velocities.length - 1 && startTime > velocity.timeTo) ||
            (startTime >= velocity.timeFrom && startTime <= velocity.timeTo)
          ) {
            srtLine.shiftTime(
              velocity.diffFrom +
                ((velocity.diffTo - velocity.diffFrom) * (startTime - velocity.timeFrom)) /
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
            new Velocity(
              srtMarkers[i].left!.getStartTime() - srtMarkers[i].right!.getStartTime(),
              srtMarkers[i + 1].left!.getStartTime() - srtMarkers[i + 1].right!.getStartTime(),
              srtMarkers[i].right!.getStartTime(),
              srtMarkers[i + 1].right!.getStartTime()
            )
          );
        }
        let velocityIndex = 0;
        rightSrtLines.forEach((srtLine) => {
          const startTime = srtLine.getStartTime();
          let velocity = velocities[velocityIndex];
          while (startTime > velocity.timeTo && velocityIndex < velocities.length - 1) {
            ++velocityIndex;
            velocity = velocities[velocityIndex];
          }
          if (
            (velocityIndex == 0 && startTime < velocity.timeFrom) ||
            (velocityIndex == velocities.length - 1 && startTime > velocity.timeTo) ||
            (startTime >= velocity.timeFrom && startTime <= velocity.timeTo)
          ) {
            srtLine.shiftTime(
              velocity.diffFrom +
                ((velocity.diffTo - velocity.diffFrom) * (startTime - velocity.timeFrom)) /
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
      <Button size="sm" on:click={onClickLeftRenumber} disabled={leftSrtLines.length == 0}
        >Renumber</Button
      >
      <Button
        size="sm"
        on:click={onClickSyncToRight}
        disabled={leftSrtLines.length == 0 || rightSrtLines.length == 0}>Sync ⇨</Button
      >
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm" on:click={onClickRightPaste}>Paste</Button>
      <Button size="sm" on:click={onClickRightCopy} disabled={leftSrtLines.length == 0}>Copy</Button
      >
      <Button size="sm" on:click={onClickRightRenumber} disabled={rightSrtLines.length == 0}
        >Renumber</Button
      >
      <Button
        size="sm"
        on:click={onClickSyncToLeft}
        disabled={leftSrtLines.length == 0 || rightSrtLines.length == 0}>⇦ Sync</Button
      >
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
    <Group position="center" spacing="md">
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
