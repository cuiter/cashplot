import { LocalStorageDriver } from "../../src/frontend/localstorage-driver";

class LocalStorageMock implements Storage {
    private valueStore: any = {}; // eslint-disable-line
    public length = 0;

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
        if (!Object.prototype.hasOwnProperty.call(this.valueStore, key)) {
            this.length++;
        }
        this.valueStore[key] = value;
    }

    public removeItem(key: string) {
        if (Object.prototype.hasOwnProperty.call(this.valueStore, key)) {
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

    test("should remove section from localStorage", () => {
        const storageMock = new LocalStorageMock();
        const storageDriver = new LocalStorageDriver(storageMock);
        storageMock.setItem("test-section-1", testHugeText);

        storageDriver.removeSection("test-section-1");

        expect(storageMock.getItem("test-section-1")).toBeUndefined();
    });
});