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
  import { Tabs } from '@svelteuidev/core';
  import GrepIt from './grep-it.svelte';
  import SrtSync from './srt-sync.svelte';

  const routingList = ['#grep-it', '#srt-sync'];
  const routingMap = new Map(routingList.map((value, index) => [value, index]));

  let initialTabIndex = getTabIndexFromHash();

  function onHashChange(_event: HashChangeEvent) {
    initialTabIndex = getTabIndexFromHash();
  }

  function onLoad() {
    initialTabIndex = getTabIndexFromHash();
  }

  function onTabChange(event: CustomEvent<{ index: number; key: string }>) {
    const index = event.detail.index;
    if (index >= 0 && index < routingList.length) {
      window.location.hash = routingList[index];
    }
  }

  function getTabIndexFromHash() {
    const hash = window.location.hash;
    if (routingMap.has(hash)) {
      return routingMap.get(hash) as number;
    }
    return 0;
  }
</script>

<svelte:window on:hashchange={onHashChange} on:load={onLoad} />

<Tabs bind:initialTab={initialTabIndex} on:change={onTabChange}>
  <Tabs.Tab label="Grep It"><GrepIt /></Tabs.Tab>
  <Tabs.Tab label="Srt Sync"><SrtSync /></Tabs.Tab>
</Tabs>
