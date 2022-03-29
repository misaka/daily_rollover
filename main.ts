import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DailyRolloverSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: DailyRolloverSettings = {
	mySetting: 'default'
}

export default class DailyRollover extends Plugin {
	settings: DailyRolloverSettings;

	async onload() {
		await this.loadSettings();

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Daily Rollover Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'new-daily-rollover-file',
		// 	name: 'Create new daily',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.registerEvent(this.app.vault.on('create', async (file) => {
			// console.log(`rollover-daily-todos: 0 todos found in ${lastDailyNote.basename}.md`)
			this.daily_rollover(file);
		}))
	}

	onunload() {

	}

	ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

	async daily_rollover(file) {
		if (file == null) return;
		if (!this.isDailyNote(file)) return;
		if (!this.isJustCreated(file)) return;

		console.log(`New daily file found: ${file.path}`);
		console.log(`Last daily note file: ${this.lastDailyNoteFile().path}`);

		const lastDailyFile = this.lastDailyNoteFile();
		const fileContents = await this.app.vault.read(lastDailyFile);

		const sections = await this.getHeadingSections(fileContents)
		sections.forEach((section) => {
			console.log("Section ", section.heading, " tasks: ", section.tasks());
		})
	}

	isDailyNote(file: TAbstractFile): boolean {
		return file.path.match(/Daily\/\d{4}-\d{2}-\d{2}\.md/)?.length > 0;
	}

	isJustCreated(file: TFile): boolean {
		const today = new Date();

		return ((today.getTime() - file.stat.ctime) < 100); //  && !ignoreCreationTime;
	}

	async getHeadingSections(contents: string) {
		return Array
			.from(contents.matchAll(/\s{0,3}(#+)\s+(.*)\n((?:(?!\s*#).*\n)*)/g))
			.map((m) => new Section(m[1].length, m[2], m[3]));
	}

	lastDailyNoteFile() {
		return (this.app.vault.getAllLoadedFiles() as TFile[])
            .filter(f => f.path.match(/^Daily\/\d{4}-\d{2}-\d{2}.md$/))
            .sort((A, B) => B.name.localeCompare(A.name))
            .find(f => new Date(f.basename).getTime() < (Date.now() - this.ONE_DAY_IN_MS));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class Section {
	level: number;
	heading: string;
	content: string;

	constructor(level: number, heading: string, content: string) {
		this.level = level;
		this.heading = heading;
		this.content = content;
	}

	tasks() {
		return Array
			.from(this.content.matchAll(/^(\s*- \[(.)\].*)$/gm))
			.map(t => new Task(t[1], t[2]));
	}
}

class Task {
	content: string;
	state: string;

	constructor(content: string, state: string) {
		this.content = content;
		this.state = state;
	}

	isChecked(): boolean {
		return this.state == "x";
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

// class DailyRolloverTab extends PluginSettingTab {
// 	plugin: DailyRollover;

// 	constructor(app: App, plugin: DailyRollover) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const {containerEl} = this;

// 		containerEl.empty();

// 		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					console.log('Secret: ' + value);
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }
