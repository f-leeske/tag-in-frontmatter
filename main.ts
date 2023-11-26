import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, SuggestModal, editorEditorField } from 'obsidian';

/**
 * TODO find the position to insert a new tag in the YAML frontmatter
 * 
 * @param editor the editor instance
 * @returns the line number to insert (the character position is always 0)
 */
async function findTagsInFrontmatter(editor: Editor): Promise<number> {
	return 1;
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
			let res;
			res = value;
			this.resolve(res);
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
		const nameModal = new UserInputModal("Name of the new tag",);
		let insertPosition = await findTagsInFrontmatter(editor)
		const userInput = await nameModal.open()
		editor.replaceRange('  - ' + userInput + '\n', { ch: 0, line: 2 });
	}
}