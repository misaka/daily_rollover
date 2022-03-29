export class DailyNote {
	contents: string;
	sections: Array<Section>;

	constructor(contents: string) {
		this.contents = contents;
		this.sections = Array
			.from(contents.matchAll(/\s{0,3}(#+)\s+(.*)\n((?:(?!\s*#).*\n)*)/g))
			.map((m) => new Section(m[1].length, m[2], m[3]));
	}

	async hasUncheckedTasks() {
		return this.sections.filter((s: Section) => s.hasUncheckedTasks()).length > 0;
	}

	async addUncheckedTasksFrom(previousNote: DailyNote) {
		this.sections.forEach((section: Section) => {
            const previousSection = previousNote.sections.find((ps: Section) => section.heading == ps.heading);
			if (!previousSection) return;

			const uncheckedTasks = previousSection.uncheckedTasks();
			if (!uncheckedTasks) return;

			uncheckedTasks.forEach((task: Task) => {
				console.log("Adding task: ", task);
			});
		});
	}

}

export class Section {
	level: number;
	heading: string;
	content: string;
	tasks: Array<Task>

	constructor(level: number, heading: string, content: string) {
		this.level = level;
		this.heading = heading;
		this.content = content;

		this.tasks = Array
			.from(this.content.matchAll(/^\n*(\s*- \[(.)\]\s+(.*))$/gm))
			.map(t => new Task(t[1], t[2], t[3]));
	}

	uncheckedTasks(): Array<Task> {
		return this.tasks.filter((t: Task) => t.isChecked());
	}

	hasUncheckedTasks(): boolean {
		return this.uncheckedTasks().length > 0
	}
}

export class Task {
	content: string;
	state: string;
	task: string;

	constructor(content: string, state: string, task: string) {
		this.content = content;
		this.state = state;
		this.task = task;
	}

	isChecked(): boolean {
		return this.state == "x";
	}
}
