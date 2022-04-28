import { createInjector } from "typed-inject";
import { StorageDriver } from "../src/interfaces";
import { StorageImpl } from "../src/model/storage";
import { LocalStorageDriver } from "../src/model/storage/localstorage-driver";
import {
    Account,
    Category,
    DECIMAL,
    Preferences,
    Settings,
    WildcardFilter,
} from "../src/model/types";

class LocalStorageMock implements Storage {
    private valueStore: any = {};
    public length: number = 0;

    constructor() {}

    public clear() {
        this.valueStore = {};
    }

    public key(index: number) {
        return Object.keys(this.valueStore)[index];
    }

    public getItem(key: string) {
        return this.valueStore[key];
    }

    public setItem(key: string, value: string) {
        if (!this.valueStore.hasOwnProperty(key)) {
            this.length++;
        }
        this.valueStore[key] = value;
    }

    public removeItem(key: string) {
        if (this.valueStore.hasOwnProperty(key)) {
            delete this.valueStore[key];
            this.length--;
        }
    }
}

const testObject = {
    foo: 1,
    bar: "hello",
    test: { inner: ["1", -2.5, null, true] },
};
const testHugeText = "transaction,data,test\n1,2,3";

describe("LocalStorageDriver", () => {
    test("should store objects to localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);

        storageDriver.storeObject("test-section", testObject);

        expect(JSON.parse(storageMock.getItem("test-section"))).toEqual(
            testObject,
        );
    });

    test("should load objects from localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);
        storageMock.setItem("test-section", JSON.stringify(testObject));

        const object = storageDriver.loadObject("test-section");

        expect(object).toEqual(testObject);
    });

    test("should store hugetexts to localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);

        storageDriver.storeHugeText("test-section", testHugeText);

        expect(storageMock.getItem("test-section")).toEqual(testHugeText);
    });

    test("should load hugetexts from localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);
        storageMock.setItem("test-section", testHugeText);

        const hugetext = storageDriver.loadHugeText("test-section");

        expect(hugetext).toEqual(testHugeText);
    });

    test("should list sections stored in localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);
        storageMock.setItem("test-section-1", testHugeText);
        storageMock.setItem("test-section-2", JSON.stringify(testObject));

        const sections = storageDriver.listSections();

        expect(sections).toEqual(["test-section-1", "test-section-2"]);
    });

    test("can remove a section from localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);
        storageMock.setItem("test-section-1", testHugeText);

        storageDriver.removeSection("test-section-1");

        expect(storageMock.getItem("test-section-1")).toBeUndefined();
    });
});
