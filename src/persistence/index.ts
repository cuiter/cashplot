import { classToPlain, plainToClass } from "class-transformer";
import { Persistence, PersistenceDriver } from "../interfaces";
import { Preferences, Settings } from "../types";
import { assert } from "../utils";

// Each stored config section contains a version attribute,
// which represents the version of the config format used for that specific section.
// This can be used to perform backwards-compatible config format changes in the future.

// The version attribute is stored either as a .version property in case of a JSON object,
// or a four-character base-10 representation of the version as a prefix in case of a "huge text" string.
const hugeTextVersionPrefixLength = 4;

// Note: version = 0 means there may be backwards-incompatible changes in the future.
const settingsKey = "settings";
const settingsVersion = 0;
const preferencesKey = "preferences";
const preferencesVersion = 0;
const sourceDataPrefix = "source-data/";
const sourceDataVersion = 0;

export class PersistenceImpl implements Persistence {
    public static inject = ["persistenceDriver"] as const;

    constructor(private persistenceDriver: PersistenceDriver) {}

    public loadSettings(): Settings | null {
        const settingsObj = this.persistenceDriver.loadObject(settingsKey);
        const settingsVersion = (settingsObj as any)["version"];
        assert(
            settingsVersion === 0,
            `Could not load settings object: unsupported version ${settingsVersion}`,
        );
        return settingsObj === null
            ? null
            : plainToClass(Settings, settingsObj);
    }

    public storeSettings(settings: Settings) {
        this.persistenceDriver.storeObject(settingsKey, classToPlain(settings));
    }

    public loadPreferences(): Preferences | null {
        const preferencesObj =
            this.persistenceDriver.loadObject(preferencesKey);
        const preferencesVersion = (preferencesObj as any)["version"];
        assert(
            preferencesVersion === 0,
            `Could not load preferences object: unsupported version ${preferencesVersion}`,
        );
        return preferencesObj === null
            ? null
            : plainToClass(Preferences, preferencesObj);
    }

    public storePreferences(preferences: Preferences) {
        this.persistenceDriver.storeObject(
            preferencesKey,
            classToPlain(preferences),
        );
    }

    public loadAllSourceData(): {
        name: string;
        transactionData: string;
    }[] {
        return this.persistenceDriver
            .listSections()
            .filter((section) => section.startsWith(sourceDataPrefix))
            .map((section) => {
                const sectionData =
                    this.persistenceDriver.loadHugeText(section)!;
                const version = Number(
                    sectionData.substr(0, hugeTextVersionPrefixLength),
                );
                assert(
                    version === 0,
                    `Could not load source data: unsupported version ${version}`,
                );

                return {
                    name: section.substr(sourceDataPrefix.length),
                    // Note: Assumes the contents have not been removed since
                    //       the this.persistenceDriver.listSections() call.
                    transactionData: sectionData.substr(
                        hugeTextVersionPrefixLength,
                    ),
                };
            });
    }

    public storeSourceData(name: string, transactionData: string) {
        this.persistenceDriver.storeHugeText(
            sourceDataPrefix + name,
            transactionData,
        );
    }

    public removeSourceData(name: string) {
        this.persistenceDriver.removeSection(name);
    }
}
