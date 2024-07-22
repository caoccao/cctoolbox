<script>
	import { Button, Checkbox, Flex, Stack, Textarea, TextInput } from '@svelteuidev/core';

	let caseSensitiveChecked = false;
	let multilineChecked = false;
	let removeDuplicatedChecked = false;
	let sortChecked = false;

	let patternValue = '[^\\r\\n]+';
	let templateValue = '${_0}';
	let fromValue = '';
	let toValue = '';

	let errorMessage = '';

	function grep() {
		errorMessage = '';
		if (patternValue === '' || fromValue === '') {
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
			console.log(regex);
			// TODO
		} catch (error) {
			if (error instanceof Error) {
				errorMessage = error.message;
			} else {
				errorMessage = `Unknown error ${error}.`;
			}
		}
	}

	function onClickCopy() {
		errorMessage = '';
		navigator.clipboard.writeText(toValue).catch((error) => {
			errorMessage = error.message;
		});
	}

	function onChangeGrep() {
		setTimeout(grep, 0);
	}

	function onPaste() {
		errorMessage = '';
		navigator.clipboard
			.readText()
			.then((text) => {
				fromValue = text;
				onChangeGrep();
			})
			.catch((error) => {
				errorMessage = error.message;
			});
	}
</script>

<Stack align="strech" justify="flex-start">
	<TextInput label="Pattern *" bind:value={patternValue} on:change={onChangeGrep} />
	<Textarea
		label="Template"
		rows="5"
		required={false}
		bind:value={templateValue}
		on:change={onChangeGrep}
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
		<Button on:click={onPaste}>Paste</Button>
		<Button on:click={onClickCopy}>Copy</Button>
	</Flex>
	<Textarea
		label="From *"
		rows="10"
		error={errorMessage}
		bind:value={fromValue}
		on:change={onChangeGrep}
	/>
	<Textarea label="To" rows="10" required={false} variant="filled" bind:value={toValue} />
</Stack>
