<script>
	import { Center, Container, Title, SvelteUIProvider } from '@svelteuidev/core';
</script>

<SvelteUIProvider themeObserver="light">
	<Container size="xl"><Center><Title order={1}>web-tools</Title></Center></Container>
	<Container size="xl"><slot></slot></Container>
</SvelteUIProvider>
