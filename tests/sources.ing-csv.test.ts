import { SourceTransaction, DECIMAL } from "../src/types";
import { INGBankCSVSource } from "../src/sources/ing-csv";

const testTransactionsNl = `"Datum";"Naam / Omschrijving";"Rekening";"Tegenrekening";"Code";"Af Bij";"Bedrag (EUR)";"Mutatiesoort";"Mededelingen"
20210712;bol.com b.v.;NL00MAIN1234567890;NL27INGB0000026500;ID;Af;50;iDEAL;Name: bol.com b.v. Description: 90340932902 2492049402
20210629;Mr. G;NL00MAIN1234567890;NL00MAIN1234567890;GT;Af;1000;Online bankieren;To Orange Savings Account ABC123456
20210628;Company Inc.;NL00MAIN1234567890;NL01WORK0987654321;OV;Bij;4000;Overschrijving;Salary for June 2020`;

const testTransactionsEn = `"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"
20210712,bol.com b.v.,NL00MAIN1234567890,NL27INGB0000026500,ID,Debit,50,iDEAL,Name: bol.com b.v. Description: 90340932902 2492049402
20210629,Mr. G,NL00MAIN1234567890,NL00MAIN1234567890,GT,Debit,1000,Online Banking,To Orange Savings Account ABC123456
20210628,Company Inc.,NL00MAIN1234567890,NL01WORK0987654321,OV,Credit,4000,Transfer,Salary for June 2020`;

function areParsedTransactionsValid(transactions: SourceTransaction[]) {
    expect(transactions.length).toBe(3);
    expect(transactions[0].date).toEqual(new Date("2021-07-12"));
    expect(transactions[0].amount).toBe(-50 * DECIMAL);
    expect(transactions[0].account).toBe("NL00MAIN1234567890");
    expect(transactions[0].contraAccount).toBe("NL27INGB0000026500");
    expect(transactions[0].contraAccountName).toBe("bol.com b.v.");
    expect(transactions[0].description).toBe(
        "Name: bol.com b.v. Description: 90340932902 2492049402",
    );

    expect(transactions[1].date).toEqual(new Date("2021-06-29"));
    expect(transactions[1].amount).toBe(-1000 * DECIMAL);
    expect(transactions[1].account).toBe("NL00MAIN1234567890");
    expect(transactions[1].contraAccount).toBe("NL00MAIN1234567890");
    expect(transactions[1].contraAccountName).toBe("Mr. G");
    expect(transactions[1].description).toBe(
        "To Orange Savings Account ABC123456",
    );

    expect(transactions[2].date).toEqual(new Date("2021-06-28"));
    expect(transactions[2].amount).toBe(4000 * DECIMAL);
    expect(transactions[2].account).toBe("NL00MAIN1234567890");
    expect(transactions[2].contraAccount).toBe("NL01WORK0987654321");
    expect(transactions[2].contraAccountName).toBe("Company Inc.");
    expect(transactions[2].description).toBe("Salary for June 2020");
}

describe("INGSource", () => {
    test("should load transactions from a Dutch CSV export", () => {
        const transactionData = testTransactionsNl;

        const transactions = new INGBankCSVSource().parseTransactions(
            transactionData,
        );

        areParsedTransactionsValid(transactions);
    });

    test("should load transactions from an English CSV export", () => {
        const transactionData = testTransactionsEn;

        const transactions = new INGBankCSVSource().parseTransactions(
            transactionData,
        );

        areParsedTransactionsValid(transactions);
    });

    test("should signal an error if an invalid CSV export is given", () => {
        const invalidTransactionDataExamples = [
            "",
            "{}",
            '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications', // Notice missing semicolon
        ];

        for (const example of invalidTransactionDataExamples) {
            expect(() =>
                new INGBankCSVSource().parseTransactions(example),
            ).toThrow("Errors while parsing transaction data");
        }
    });
});
