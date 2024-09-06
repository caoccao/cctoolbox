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
</script>

<Grid>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm">Paste</Button>
      <Button size="sm">Copy</Button>
      <Button size="sm">Sync</Button>
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <Group position="center" spacing="md">
      <Button size="sm">Paste</Button>
      <Button size="sm">Copy</Button>
      <Button size="sm">Sync</Button>
    </Group>
  </Grid.Col>
  <Grid.Col span={6}>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="data-table-header-start">Start</th>
            <th class="data-table-header-end">End</th>
            <th class="data-table-header-text">Text</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="data-table-cell-start">00:00:00.123</td>
            <td class="data-table-cell-end">00:00:00.123</td>
            <td class="data-table-cell-text">Test</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Grid.Col>
  <Grid.Col span={6}>
    <table class="data-table">
      <thead>
        <tr>
          <th class="data-table-header-start">Start</th>
          <th class="data-table-header-end">End</th>
          <th class="data-table-header-text">Text</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="data-table-cell-start">00:00:00.123</td>
          <td class="data-table-cell-end">00:00:00.123</td>
          <td class="data-table-cell-text">Test</td>
        </tr>
      </tbody>
    </table>
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
</style>
