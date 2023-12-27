import { create } from 'domain';
import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, SuggestModal, editorEditorField } from 'obsidian';
import { isNumberObject } from 'util/types';

/**
 * TODO improve error handling
 * TODO allow bracket format instead of markdown list
 * TODO turn this into a pure query without changing the file
 * 
 * find the position of tags in the frontmatter. frontmatter has to exist! If the frontmatter is invalid, returns undefined
 * 
 * @param editor the editor instance
 * @returns the line number to insert at (the character position is always 0)
 */
function findTagsInFrontmatter(editor: Editor): number | undefined {
	let i = 1
	let line = editor.getLine(i);
	while (line != '---') {
		if (line.startsWith('tags:')) {
			if (line.endsWith('[]')) { // remove empty list brackets if they exist 
				editor.replaceRange('tags:\n', { ch: 0, line: i }, { ch: line.length, line: i })
			}
			return i + 1;
		}
		i += 1;
		console.log(i)
		try {
			line = editor.getLine(i);
		} catch (error) {
			return undefined // frontmatter is never closed -> invalid file
		}
	}
	// tags not in frontmatter, so we create them. This is a bit dirty and TODO
	console.log('no tags')
	editor.replaceRange('tags:\n', { ch: 0, line: 1 })
	return 2;

}

/**
 * return if the document has any frontmatter, i.e. starts with '---\n'. For performance reasons, doesn't check if the frontmatter is valid!
 */
function frontmatterExists(editor: Editor): boolean {
	let line0 = editor.getLine(0);
	return line0 == '---'
}

/**
 * append the two lines containing '---' as yaml frontmatter.
 * @param editor 
 */
function createFrontmatter(editor: Editor) {
	console.log('creating frontmatter')
	editor.replaceRange('---\n', { ch: 0, line: 0 });
	editor.replaceRange('---\n', { ch: 0, line: 0 });
}

/**
	 * I have no idea how this works, copied from the fantastic obsidian-git plugin:
	 * https://github.com/denolehov/obsidian-git
	 * 
	 * TODO: Add all tags as suggestions
	 */
export class UserInputModal extends SuggestModal<string> {

	resolve: (
		value: string | undefined | PromiseLike<string>
	) => void;

	constructor(placeholder: string) {
		super(app);
		this.setPlaceholder(placeholder);
	}

	open(): Promise<string> {
		super.open();
		this.inputEl.dispatchEvent(new Event("input"));
		return new Promise((resolve) => {
			return this.resolve = resolve;
		});
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		if (this.resolve) {
			this.resolve(value);
		}
		super.selectSuggestion(value, evt);
	}

	onClose() {
		if (this.resolve) this.resolve(undefined);
	}

	getSuggestions(query: string): string[] {
		return [query];
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) { }
}

export default class TagInFM extends Plugin {

	async onload() {
		console.log('start loading of taginfm');

		this.addCommand({
			id: 'add-tag-frontmatter',
			name: 'Add tag to Frontmatter',
			editorCallback: this.addTagToFrontmatter
		});

		console.log('loading done')
	}

	onunload() {
		console.log('unload taginfm');
	}

	/**
	 * the actual command callback that asks user input and adds the entered tag to the frontmatter
	 * 
	 */
	async addTagToFrontmatter(editor: Editor, view: MarkdownView) {
		editor.focus()
		const nameModal = new UserInputModal("Name of the new tag");
		const userInput = await nameModal.open();
		console.log(userInput);
		if (!frontmatterExists(editor)) {
			console.log('no frontmatter')
			createFrontmatter(editor)
		}
		let insertPosition = findTagsInFrontmatter(editor);
		if (insertPosition === undefined) {
			console.log('invalid frontmatter')
			return //TODO tell user that frontmatter is illegal
		}
		editor.replaceRange('  - ' + userInput + '\n', { ch: 0, line: insertPosition });
	}
}