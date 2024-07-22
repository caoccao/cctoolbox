<script>
	import { Button, Checkbox, Flex, Stack, Textarea, TextInput } from '@svelteuidev/core';

	let caseSensitiveChecked = false;
	let multilineChecked = false;
	let removeDuplicatedChecked = false;
	let sortChecked = false;

	let patternValue = '[^\\r\\n]+';
	let templateValue = '${$[0]}';
	let inputValue = '';
	let outputValue = '';

	let errorMessage = '';

	function grep() {
		errorMessage = '';
		if (patternValue === '' || inputValue === '') {
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
			/** @type {string[]} */
			let lines = [];
			for (const $ of inputValue.matchAll(regex)) {
				lines.push(eval('`' + templateValue + '`'));
			}
			if (removeDuplicatedChecked) {
				/** @type {string[]} */
				const uniqueLines = [];
				const lineSet = new Set();
				lines.forEach((line) => {
					if (!lineSet.has(line)) {
						lineSet.add(line);
						uniqueLines.push(line);
					}
				});
				lines = uniqueLines;
			}
			if (sortChecked) {
				lines.sort();
			}
			outputValue = lines.map((line) => `${line}\n`).join('');
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
		navigator.clipboard.writeText(outputValue).catch((error) => {
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
				inputValue = text;
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
		label="Input *"
		rows="10"
		error={errorMessage}
		bind:value={inputValue}
		on:change={onChangeGrep}
	/>
	<Textarea label="Output" rows="10" required={false} variant="filled" bind:value={outputValue} />
</Stack>