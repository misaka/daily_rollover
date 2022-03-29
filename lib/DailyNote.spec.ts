import { DailyNote, Section, Task } from './DailyNote';

const dailyNoteContents = `
# 2022-03-29

## First

- [ ] To Do one
- [ ] To Do two

## Second

- [ ] Not Done
- [x] Done
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

    describe('addUncheckedTasksFrom', () =>{
    });
});

describe('Section', () => {
    describe('constructor', () => {
        describe('parsed tasks', () => {
            test('saves contents', () => {
                const dailyNote = new DailyNote(dailyNoteContents);

                expect(dailyNote.sections[1].tasks[0].content).toBe("- [ ] To Do one");
                expect(dailyNote.sections[1].tasks[1].content).toBe("- [ ] To Do two");
                expect(dailyNote.sections[2].tasks[0].content).toBe("- [ ] Not Done");
                expect(dailyNote.sections[2].tasks[1].content).toBe("- [x] Done");
            });

            test('parses checked status ', () => {
                const dailyNote = new DailyNote(dailyNoteContents);

                expect(dailyNote.sections[1].tasks[0].isChecked()).toBe(false);
                expect(dailyNote.sections[1].tasks[1].isChecked()).toBe(false);
                expect(dailyNote.sections[2].tasks[0].isChecked()).toBe(false);
                expect(dailyNote.sections[2].tasks[1].isChecked()).toBe(true);
            });
        });
    });

})
