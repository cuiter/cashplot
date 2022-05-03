import { StorageDriver } from "../../interfaces";

export class LocalStorageDriver implements StorageDriver {
    public static inject = [] as const;

    constructor(private storage: Storage = localStorage) {}

    public loadObject(section: string): object | null {
        const item = this.storage.getItem(section);

        return item === null ? null : JSON.parse(item);
    }

    public storeObject(section: string, object: object) {
        this.storage.setItem(section, JSON.stringify(object));
    }

    public loadHugeText(section: string): string | null {
        return this.storage.getItem(section);
    }

    public storeHugeText(section: string, text: string) {
        this.storage.setItem(section, text);
    }

    public listSections(): string[] {
        const sections = [];
        for (let i = 0; i < this.storage.length; i++) {
            const section = this.storage.key(i);
            if (section === null) {
                console.warn(
                    `Localstorage section ${i} unexpectedly disappeared while querying`,
                );
                continue;
            }
            sections.push(section);
        }
        return sections;
    }

    public removeSection(section: string) {
        this.storage.removeItem(section);
    }
}