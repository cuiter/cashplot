// Provides CashPlot as a library.
//
// Example:
//
// const cashplot = CashPlot.new();
// cashplot.categories.add("Rent");
//
// const cashflow = await cashplot.cashFlow.calculateCashFlow({categoryName: "Rent"});
// console.log(cashflow.expenses);

import "reflect-metadata";
import { createInjector } from "typed-inject";

import { Sources, SourcesImpl } from "./sources";
import { Storage, StorageDriver, StorageImpl } from "./storage";
import { SourceDataCollection, SourceDataCollectionImpl } from "./collections/source-data-collection";
import { CategoryCollection, CategoryCollectionImpl } from "./collections/category-collection";
import { TransactionAssigner, TransactionAssignerImpl } from "./processing/transaction-assigner";
import { TransactionSearcher, TransactionSearcherImpl } from "./processing/transaction-searcher";
import { CashFlowCalculator, CashFlowCalculatorImpl } from "./processing/cashflow-calculator";
import { LocalStorageDriver } from "../lib/storage-drivers/localstorage";

export class CashPlot {
    static inject = [
        "sources",
        "storageDriver",
        "storage",
        "sourceData",
        "categories",
        "assigner",
        "searcher",
        "cashFlow",
    ] as const;

    constructor(
        private sources: Sources,
        private storageDriver: StorageDriver,
        private storage: Storage,
        public sourceData: SourceDataCollection,
        public categories: CategoryCollection,
        public assigner: TransactionAssigner,
        public searcher: TransactionSearcher,
        public cashFlow: CashFlowCalculator,
    ) {}

    static new(): CashPlot {
        return CashPlot._injector().injectClass(CashPlot);
    }

    static _injector() {
        return createInjector()
            .provideClass("sources", SourcesImpl)
            .provideClass("storageDriver", LocalStorageDriver)
            .provideClass("storage", StorageImpl)
            .provideClass("sourceData", SourceDataCollectionImpl)
            .provideClass("categories", CategoryCollectionImpl)
            .provideClass("assigner", TransactionAssignerImpl)
            .provideClass("searcher", TransactionSearcherImpl)
            .provideClass("cashFlow", CashFlowCalculatorImpl);
    }
}
