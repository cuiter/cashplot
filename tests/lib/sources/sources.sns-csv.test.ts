import { DECIMAL, SourceTransaction } from "../../../src/lib/entities";
import { SNSBankCSVSource } from "../../../src/lib/sources/sns-csv";

const testTransactionsCsvFormat = `28-06-2021,NL00SNSB1234567890,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,4000.00,28-06-2021,28-06-2021,6305,IOS,5976384,,'Salary for June 2020’,1
29-06-2021,NL00SNSB1234567890,NL00SNSB1234567892,Mr. G SNS Internet Savings,,,,EUR,4000,EUR,-1000.00,29-06-2021,29-06-2021,8949,NGI,5949432,,'Savings’,1
12-07-2021,NL00SNSB1234567890,NL27INGB0000026500,bol.com b.v.,,,,EUR,3000,EUR,-50.00,12-07-2021,12-07-2021,7913,BEA,5994203,TM939B/950593,'Name: bol.com b.v. Description: 90340932902 2492049402’,2
25-07-2021,NL00SNSB1234567890,,,,,,EUR,2950,EUR,-2.25,25-07-2021,25-07-2021,7249,MSC,5855672,,'Costs usage checkings account including 1 card’,3`;

const testTransactionsCsv2004Format = `"28-06-2021";"NL00SNSB1234567890";"NL01WORK0987654321";"Company Inc.";"";"";"";"EUR";"0.00";"EUR";"4000.00";"28-06-2021";"28-06-2021";"6305";"IOS";"5976384";"";"'Salary for June 2020’";"1"
"29-06-2021";"NL00SNSB1234567890";"NL00SNSB1234567892";"Mr. G SNS Internet Savings";"";"";"";"EUR";"4000";"EUR";"-1000.00";"29-06-2021";"29-06-2021";"8949";"NGI";"5949432";"";"'Savings’";"1"
"12-07-2021";"NL00SNSB1234567890";"NL27INGB0000026500";"bol.com b.v.";"";"";"";"EUR";"3000";"EUR";"-50.00";"12-07-2021";"12-07-2021";"7913";"BEA";"5994203";"TM939B/950593";"'Name: bol.com b.v. Description: 90340932902 2492049402’";"2"
"25-07-2021";"NL00SNSB1234567890";"";"";"";"";"";"EUR";"2950";"EUR";"-2.25";"25-07-2021";"25-07-2021";"7249";"MSC";"5855672";"";"'Costs usage checkings account including 1 card’";"3"`;

function areParsedTransactionsValid(transactions: SourceTransaction[]) {
    expect(transactions.length).toBe(4);

    expect(transactions[0].date).toEqual(new Date("2021-06-28"));
    expect(transactions[0].amount).toBe(4000 * DECIMAL);
    expect(transactions[0].account).toBe("NL00SNSB1234567890");
    expect(transactions[0].contraAccount).toBe("NL01WORK0987654321");
    expect(transactions[0].contraAccountName).toBe("Company Inc.");
    expect(transactions[0].description).toBe("Salary for June 2020");

    expect(transactions[1].date).toEqual(new Date("2021-06-29"));
    expect(transactions[1].amount).toBe(-1000 * DECIMAL);
    expect(transactions[1].account).toBe("NL00SNSB1234567890");
    expect(transactions[1].contraAccount).toBe("NL00SNSB1234567892");
    expect(transactions[1].contraAccountName).toBe("Mr. G SNS Internet Savings");
    expect(transactions[1].description).toBe("Savings");

    expect(transactions[2].date).toEqual(new Date("2021-07-12"));
    expect(transactions[2].amount).toBe(-50 * DECIMAL);
    expect(transactions[2].account).toBe("NL00SNSB1234567890");
    expect(transactions[2].contraAccount).toBe("NL27INGB0000026500");
    expect(transactions[2].contraAccountName).toBe("bol.com b.v.");
    expect(transactions[2].description).toBe(
        "Name: bol.com b.v. Description: 90340932902 2492049402",
    );

    expect(transactions[3].date).toEqual(new Date("2021-07-25"));
    expect(transactions[3].amount).toBe(-2.25 * DECIMAL);
    expect(transactions[3].account).toBe("NL00SNSB1234567890");
    expect(transactions[3].contraAccount).toBe(null);
    expect(transactions[3].contraAccountName).toBe(null);
    expect(transactions[3].description).toBe("Costs usage checkings account including 1 card");
}

describe("INGSource", () => {
    test('should recognize valid "headers" of a CSV export', () => {
        const transactionData = testTransactionsCsvFormat;

        expect(new SNSBankCSVSource().hasValidHeader(transactionData)).toBe(true);
    });

    test('should recognize valid "headers" of a CSV2004 export', () => {
        const transactionData = testTransactionsCsv2004Format;

        expect(new SNSBankCSVSource().hasValidHeader(transactionData)).toBe(true);
    });

    test('should recognize invalid "headers" of a CSV export', () => {
        const invalidTransactionDataExamples = [
            "",
            "{}",
            '""',
            `"28-06-2021";"NL00SNSB1234567890";"NL01WORK0987654321";"Company Inc.";"";"";"";"EUR";"0.00";"EUR";"4000.00";"28-06-2021";"28-06-2021";"6305";"IOS";"5976384";""`,
        ];

        for (const example of invalidTransactionDataExamples) {
            expect(new SNSBankCSVSource().hasValidHeader(example)).toBe(false);
        }
    });

    test("should load transactions from a CSV export", () => {
        const transactionData = testTransactionsCsvFormat;

        const transactions = new SNSBankCSVSource().parseTransactions(transactionData);

        areParsedTransactionsValid(transactions);
    });

    test('should load transactions from a "CSV2004" export', () => {
        const transactionData = testTransactionsCsv2004Format;

        const transactions = new SNSBankCSVSource().parseTransactions(transactionData);

        areParsedTransactionsValid(transactions);
    });

    test("should signal an error if an invalid CSV export is given", () => {
        const invalidTransactionDataExamples = ["", "{}", '""'];

        for (const example of invalidTransactionDataExamples) {
            expect(() => new SNSBankCSVSource().parseTransactions(example)).toThrow(
                "Errors while parsing transaction data",
            );
        }

        expect(() =>
            new SNSBankCSVSource().parseTransactions(
                "28-062021,NL00SNSB1234567890,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,4000.00,28-06-2021,28-06-2021,6305,IOS,5976384,,'Salary for June 2020’,1",
            ),
        ).toThrow(
            'Invalid transaction data on line 1: Could not determine date from value: "28-062021"',
        );

        expect(() =>
            new SNSBankCSVSource().parseTransactions(
                "28-06-2021,,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,4000.00,28-06-2021,28-06-2021,6305,IOS,5976384,,'Salary for June 2020’,1",
            ),
        ).toThrow(
            "Invalid transaction data on line 1: Could not determine account (column 2 is empty)",
        );

        expect(() =>
            new SNSBankCSVSource().parseTransactions(
                "28-06-2021,NL00SNSB1234567890,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,not,28-06-2021,28-06-2021,6305,IOS,5976384,,'Salary for June 2020’,1",
            ),
        ).toThrow('Invalid transaction data on line 1: Could not determine amount from value: "not"');

        expect(() =>
            new SNSBankCSVSource().parseTransactions(
                "28-06-2021,NL00SNSB1234567890,NL01WORK0987654321,Company Inc.,,,,EUR,0.00,EUR,4000.00,28-06-2021,28-06-2021,6305,IOS,5976384,",
            ),
        ).toThrow(
            "Invalid transaction data on line 1: Could not determine description (column 18 is empty)",
        );
    });
});
