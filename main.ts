import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile } from 'obsidian';

import { DailyNote, Section, Task } from 'lib/DailyNote';

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

		// Yes, this is just for the sake of naming, not a separate thing.
		const dailyNoteFile = file;
		console.log(`New daily file found: ${dailyNoteFile.path}`);

		const lastDailyNote = await this.lastDailyNoteFile()
			.then(lastDailyFile => this.app.vault.read(lastDailyFile))
			.then(lastDailyContents => new DailyNote(lastDailyContents));

		if (!lastDailyNote.hasUncheckedTasks()) return;

		return await this.app.vault.read(dailyNoteFile)
			.then(dailyContents => new DailyNote(dailyContents))
			.then((dailyNote: DailyNote) => {
				console.log(dailyNote);
				return dailyNote.addUncheckedTasksFrom(lastDailyNote)
			});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	isDailyNote(file: TAbstractFile): boolean {
		return file.path.match(/Daily\/\d{4}-\d{2}-\d{2}\.md/)?.length > 0;
	}

	isJustCreated(file: TFile): boolean {
		const today = new Date();

		return ((today.getTime() - file.stat.ctime) < 100); //  && !ignoreCreationTime;
	}

	async lastDailyNoteFile() {
		return (this.app.vault.getAllLoadedFiles() as TFile[])
            .filter(f => f.path.match(/^Daily\/\d{4}-\d{2}-\d{2}.md$/))
            .sort((A, B) => B.name.localeCompare(A.name))
            .find(f => new Date(f.basename).getTime() < (Date.now() - this.ONE_DAY_IN_MS));
	}
}
