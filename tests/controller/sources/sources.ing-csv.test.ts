import { SourceTransaction, DECIMAL } from "../../../src/model/entities";
import { INGBankCSVSource } from "../../../src/controller/sources/ing-csv";

const testTransactionsNlNewFormat = `"Datum";"Naam / Omschrijving";"Rekening";"Tegenrekening";"Code";"Af Bij";"Bedrag (EUR)";"Mutatiesoort";"Mededelingen";"Saldo na mutatie";"Tag"
"20210712";"bol.com b.v.";"NL00MAIN1234567890";"NL27INGB0000026500";"ID";"Af";"50";"iDEAL";"Name: bol.com b.v. Description: 90340932902 2492049402";"2950";""
"20210629";"Mr. G";"NL00MAIN1234567890";"NL00MAIN1234567890";"GT";"Af";"1000";"Online bankieren";"To Orange Savings Account ABC123456";"3000";""
"20210628";"Company Inc.";"NL00MAIN1234567890";"NL01WORK0987654321";"OV";"Bij";"4000";"Overschrijving";"Salary for June 2020";"4000";""`;

const testTransactionsEnOldFormat = `"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"
20210712,bol.com b.v.,NL00MAIN1234567890,NL27INGB0000026500,ID,Debit,50,iDEAL,Name: bol.com b.v. Description: 90340932902 2492049402
20210629,Mr. G,NL00MAIN1234567890,NL00MAIN1234567890,GT,Debit,1000,Online Banking,To Orange Savings Account ABC123456
20210628,Company Inc.,NL00MAIN1234567890,NL01WORK0987654321,OV,Credit,4000,Transfer,Salary for June 2020`;

const invalidTransactionDataExamples = [
    "",
    "{}",
    '""',
    '"Date"\n"2021-11-25"',
    '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications', // Notice missing end quote
    '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Notifications"\n0', // Missing amount and invalid second row
    '"Datum";"Rekening";"Tegenrekening";"Code";"Af Bij";"Bedrag (EUR)";"Mutatiesoort";"Mededelingen";"Saldo na mutatie";"Tag"\n0', // Missing contra-account name and invalid second row
];

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
    test("should recognize valid headers of a Dutch CSV export", () => {
        const transactionData = testTransactionsNlNewFormat;

        expect(new INGBankCSVSource().hasValidHeader(transactionData)).toBe(
            true,
        );
    });

    test("should recognize valid headers of an English CSV export", () => {
        const transactionData = testTransactionsEnOldFormat;

        expect(new INGBankCSVSource().hasValidHeader(transactionData)).toBe(
            true,
        );
    });

    test("should recognize invalid headers of a CSV export", () => {
        for (const example of invalidTransactionDataExamples) {
            expect(new INGBankCSVSource().hasValidHeader(example)).toBe(false);
        }
    });

    test("should load transactions from a Dutch CSV export", () => {
        const transactionData = testTransactionsNlNewFormat;

        const transactions = new INGBankCSVSource().parseTransactions(
            transactionData,
        );

        areParsedTransactionsValid(transactions);
    });

    test("should load transactions from an English CSV export", () => {
        const transactionData = testTransactionsEnOldFormat;

        const transactions = new INGBankCSVSource().parseTransactions(
            transactionData,
        );

        areParsedTransactionsValid(transactions);
    });

    test("should signal an error if an invalid CSV export is given", () => {
        for (const example of invalidTransactionDataExamples) {
            expect(() =>
                new INGBankCSVSource().parseTransactions(example),
            ).toThrow("Errors while parsing transaction data");
        }

        expect(() =>
            new INGBankCSVSource().parseTransactions(
                '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"\n,bol.com b.v.,NL00MAIN1234567890,NL27INGB0000026500,ID,Debit,50,iDEAL,Name: bol.com b.v. Description: 90340932902 2492049402',
            ),
        ).toThrow(
            "Invalid transaction data on line 2: Could not determine date (empty column)",
        );

        expect(() =>
            new INGBankCSVSource().parseTransactions(
                '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"\nabcd,bol.com b.v.,NL00MAIN1234567890,NL27INGB0000026500,ID,Debit,50,iDEAL,Name: bol.com b.v. Description: 90340932902 2492049402',
            ),
        ).toThrow(
            'Invalid transaction data on line 2: Could not determine date from value: "abcd"',
        );

        expect(() =>
            new INGBankCSVSource().parseTransactions(
                '"Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"\n20210923,bol.com b.v.,NL00MAIN1234567890,NL27INGB0000026500,ID,Deit,50,iDEAL,Name: bol.com b.v. Description: 90340932902 2492049402',
            ),
        ).toThrow(
            'Invalid transaction data on line 2: Could not determine direction from value: "Deit"',
        );
    });
});
