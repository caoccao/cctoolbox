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
  import { Center, Container, Text, Title, SvelteUIProvider } from '@svelteuidev/core';
</script>

<SvelteUIProvider themeObserver="light">
  <Container size="xl">
    <header>
      <Center><Title order={1}>web-tools</Title></Center>
    </header>
  </Container>
  <Container size="xl"><slot></slot></Container>
  <Container size="xl" mt={10}>
    <footer>
      <Center>
        <Text size="xs">
          © Copyright 2024 Sam Cao <a href="https://www.caoccao.com/">caoccao.com</a>
        </Text>
      </Center>
    </footer>
  </Container>
</SvelteUIProvider>
