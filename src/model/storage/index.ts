import { instanceToPlain, plainToClass } from "class-transformer";
import { Storage, StorageDriver } from "../../interfaces";
import { Preferences, Settings } from "../entities";
import { assert } from "../../utils";

// === Configuration format ===

// Each stored config section contains an associated version.

// Whenever the config format changes in a backwards-incompatible way,
// the version should be incremented, and converters should be added to parse configs from previous versions.

// Note: version = 0 means there may be backwards-incompatible changes in the future.
const settingsKey = "settings";
const settingsVersion = 0;
const preferencesKey = "preferences";
const preferencesVersion = 0;
const sourceDataPrefix = "source-data/";
const sourceDataVersion = 0;

// The version attribute is stored either as a .version property in case of a JSON object,
// or a four-character base-10 representation of the version as a prefix in case of a "huge text" string.
const hugeTextVersionPrefixLength = 4;

export class StorageImpl implements Storage {
    public static inject = ["storageDriver"] as const;

    constructor(private storageDriver: StorageDriver) {}

    public loadSettings(): Settings | null {
        const settingsObj = this.storageDriver.loadObject(settingsKey);
        if (settingsObj === null) return null;
        const settingsVersion = (settingsObj as any)["version"]; // eslint-disable-line
        assert(
            settingsVersion === 0,
            `Could not load settings object: unsupported version ${settingsVersion}`,
        );
        delete (settingsObj as any).version; // eslint-disable-line
        return plainToClass(Settings, settingsObj);
    }

    public storeSettings(settings: Settings) {
        const settingsObj = instanceToPlain(settings);
        settingsObj.version = settingsVersion;
        this.storageDriver.storeObject(settingsKey, settingsObj);
    }

    public loadPreferences(): Preferences | null {
        const preferencesObj = this.storageDriver.loadObject(preferencesKey);
        if (preferencesObj === null) return null;
        const preferencesVersion = (preferencesObj as any)["version"]; // eslint-disable-line
        assert(
            preferencesVersion === 0,
            `Could not load preferences object: unsupported version ${preferencesVersion}`,
        );
        delete (preferencesObj as any).version; // eslint-disable-line
        return plainToClass(Preferences, preferencesObj);
    }

    public storePreferences(preferences: Preferences) {
        const preferencesObj = instanceToPlain(preferences);
        preferencesObj.version = preferencesVersion;
        this.storageDriver.storeObject(preferencesKey, preferencesObj);
    }

    public listSourceDataNames(): string[] {
        return this.storageDriver
            .listSections()
            .filter((section) => section.startsWith(sourceDataPrefix))
            .map((section) => section.substr(sourceDataPrefix.length));
    }

    public loadSourceData(name: string): {
        transactionData: string;
    } {
        const section = sourceDataPrefix + name;
        const sectionData = this.storageDriver.loadHugeText(section);
        if (sectionData === null) {
            throw new Error(
                `Could not load source data from persistent storage with name "${name}"`,
            );
        }
        const version = Number(
            sectionData.substr(0, hugeTextVersionPrefixLength),
        );
        assert(
            version === 0,
            `Could not load source data: unsupported version ${version}`,
        );

        return {
            // Note: Assumes the contents have not been removed since
            //       the this.storageDriver.listSections() call.
            transactionData: sectionData.substr(hugeTextVersionPrefixLength),
        };
    }

    public storeSourceData(name: string, transactionData: string) {
        const versionPrefix = sourceDataVersion.toLocaleString("en-US", {
            minimumIntegerDigits: hugeTextVersionPrefixLength,
            useGrouping: false,
        });
        this.storageDriver.storeHugeText(
            sourceDataPrefix + name,
            versionPrefix + transactionData,
        );
    }

    public removeSourceData(name: string) {
        this.storageDriver.removeSection(sourceDataPrefix + name);
    }

    public exportJson(): string {
        const exportObject: Record<string, string | null> = {};

        for (const section of this.storageDriver.listSections()) {
            exportObject[section] = this.storageDriver.loadHugeText(section);
        }

        return JSON.stringify(exportObject);
    }

    public importJson(jsonData: string) {
        const exportObject: Record<string, string | null> =
            JSON.parse(jsonData);

        // Remove existing sections
        for (const section of this.storageDriver.listSections()) {
            this.storageDriver.removeSection(section);
        }

        // Load sections from JSON object
        for (const section in exportObject) {
            if (typeof exportObject[section] == "string") {
                this.storageDriver.storeHugeText(
                    section,
                    exportObject[section] as string,
                );
            }
        }
    }
}
