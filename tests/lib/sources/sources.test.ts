import { DECIMAL } from "../../../src/lib/entities";
import { SourcesImpl } from "../../../src/lib/sources";

const testTransactionsSnsCsvFormat = `28-06-2021,NL00MAIN1234567890,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,4000.00,28-06-2021,28-06-2021,6305,IOS,5976384,,'Salary for June 2021’,1
29-06-2021,NL00MAIN1234567890,NL00MAIN1234567892,Mr. G,,,,EUR,4000,EUR,-1000.00,29-06-2021,29-06-2021,8949,NGI,5949432,,'Savings’,1`;
const testTransactionsIngCsvFormat = `"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"
20210629,Mr. G,NL00MAIN1234567890,NL00MAIN1234567892,GT,Debit,1000,Online Banking,Savings
20210628,Company Inc.,NL00MAIN1234567890,NL01WORK0987654321,OV,Credit,4000,Transfer,Salary for June 2021`;

describe("Sources", () => {
    test("should automatically detect the type of transactions data and load transactions", () => {
        for (const transactionsData of [testTransactionsIngCsvFormat, testTransactionsSnsCsvFormat]) {
            const transactions = new SourcesImpl().parseTransactions(transactionsData);

            expect(transactions[0].date).toEqual(new Date("2021-06-28"));
            expect(transactions[0].amount).toBe(4000 * DECIMAL);
            expect(transactions[0].account).toBe("NL00MAIN1234567890");
            expect(transactions[0].contraAccount).toBe("NL01WORK0987654321");
            expect(transactions[0].contraAccountName).toBe("Company Inc.");
            expect(transactions[0].description).toBe("Salary for June 2021");

            expect(transactions[1].date).toEqual(new Date("2021-06-29"));
            expect(transactions[1].amount).toBe(-1000 * DECIMAL);
            expect(transactions[1].account).toBe("NL00MAIN1234567890");
            expect(transactions[1].contraAccount).toBe("NL00MAIN1234567892");
            expect(transactions[1].contraAccountName).toBe("Mr. G");
            expect(transactions[1].description).toBe("Savings");
        }
    });

    test("should signal an error if invalid transaction data is given", () => {
        const invalidTransactionDataExamples = [
            "",
            "{}",
            '""',
            `"28-06-2021";"NL00SNSB1234567890";"NL01WORK0987654321";"Company Inc.";"";"";"";"EUR";"0.00";"EUR";"4000.00";"28-06-2021";"28-06-2021";"6305";"IOS";"5976384";""`,
        ];

        for (const example of invalidTransactionDataExamples) {
            expect(() => new SourcesImpl().parseTransactions(example)).toThrow(
                "Could not parse transactions: unrecognized format",
            );
        }
    });

    test("should signal an error if there were no transactions in the given data", () => {
        const transactionsData = testTransactionsIngCsvFormat.split("\n")[0];

        expect(() => new SourcesImpl().parseTransactions(transactionsData)).toThrow(
            "No transactions were present in the given data",
        );
    });
});
