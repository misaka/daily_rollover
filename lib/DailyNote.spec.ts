import { DailyNote, Section, Task } from './DailyNote';

const dailyNoteContents = `
# 2022-03-29

## First

- [ ] To Do one
- [ ] To Do two

## Second

- [ ] Not Done
- [x] Done

## Third

- [x] All alone
`;

describe('DailyNote', () => {
    describe('constructor', () => {
        test('parses section headings', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[0].heading).toBe("2022-03-29");
            expect(dailyNote.sections[1].heading).toBe("First");
            expect(dailyNote.sections[2].heading).toBe("Second");
        });

        test('parses section levels', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[0].level).toBe(1);
            expect(dailyNote.sections[1].level).toBe(2);
            expect(dailyNote.sections[2].level).toBe(2);
        });
    });

    describe('addUncheckedTasksFrom()', () => {
        const newDailyNoteContents = `
# 2022-03-30

## First

- [ ] To Do three

## Second

- [ ] Not Done
`;
        test('adds tasks from another note', () => {
            const dailyNote = new DailyNote(dailyNoteContents);
            const newDailyNote = new DailyNote(newDailyNoteContents);

            newDailyNote.addUncheckedTasksFrom(dailyNote);

            expect(newDailyNote.sections[1].tasks[0].content).toBe("- [ ] To Do three");
            expect(newDailyNote.sections[1].tasks[1].content).toBe("- [ ] To Do one");
            expect(newDailyNote.sections[1].tasks[2].content).toBe("- [ ] To Do two");
        });

        test("doesn't add checked tasks", () => {
            const dailyNote = new DailyNote(dailyNoteContents);
            const newDailyNote = new DailyNote(newDailyNoteContents);

            newDailyNote.addUncheckedTasksFrom(dailyNote);

            expect(newDailyNote.sections[2].tasks.map(t => t.task)).not.toContain("Done");
        });

        test("doesn't add already existing tasks", () => {
            const dailyNote = new DailyNote(dailyNoteContents);
            const newDailyNote = new DailyNote(newDailyNoteContents);

            newDailyNote.addUncheckedTasksFrom(dailyNote);

            expect(newDailyNote.sections[2].tasks.filter(t => t.task == "Not Done").length).toBe(1);
        });
    });
});

describe('Section', () => {
    describe('parsed tasks', () => {
        test('saves contents', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[1].tasks[0].content).toBe("- [ ] To Do one");
            expect(dailyNote.sections[1].tasks[1].content).toBe("- [ ] To Do two");
            expect(dailyNote.sections[2].tasks[0].content).toBe("- [ ] Not Done");
            expect(dailyNote.sections[2].tasks[1].content).toBe("- [x] Done");
        });

        test('parses state ', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[2].tasks[0].state).toBe(' ');
            expect(dailyNote.sections[2].tasks[1].state).toBe('x');
        });
    });

    describe('uncheckedTasks()', () => {
        test('returns unchecked tasks', () => {
            const dailyNote = new DailyNote(dailyNoteContents);
            const uncheckedTasks = dailyNote.sections[2].uncheckedTasks();

            expect(uncheckedTasks[0].content).toBe("- [ ] Not Done");
            expect(uncheckedTasks.length).toBe(1);
        });
    });

    describe('hasUncheckedTasks()', () => {
        test('detects any unchecked tasks', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[2].hasUncheckedTasks()).toBe(true);
        });

        test("detects no unchecked tasks", () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[3].hasUncheckedTasks()).toBe(false);
        });
    })
});

describe('Task', () => {
    describe('isChecked()', () => {
        test('detects checked status ', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[2].tasks[1].isChecked()).toBe(true);
        });

        test('detects unchecked status ', () => {
            const dailyNote = new DailyNote(dailyNoteContents);

            expect(dailyNote.sections[2].tasks[0].isChecked()).toBe(false);
        });
    });
})
