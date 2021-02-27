const Parameters = require("../src/js/lib/parameters").Parameters;

describe("Parameters", function () {
  /* eslint-disable */
  const testTransactionData = `
    "Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"
  `;
  /* eslint-enable */
  const testTransationFileName = "test-data.csv";
  const testAccounts = [
    {
      name: "Main",
      startingBalance: 0,
      addToNet: true,
    },
  ];
  const testCategories = [
    {
      name: "Other",
      descriptionPattern: "",
      counterAccountPattern: "",
    },
  ];
  it("can be constructed", function () {
    const parameters = new Parameters(
      testTransactionData,
      testTransationFileName,
      testAccounts,
      testCategories
    );

    expect(parameters.transactionData).toBe(testTransactionData);
    expect(parameters.transactionFileName).toBe(testTransationFileName);
    expect(parameters.accounts).toEqual(testAccounts);
    expect(parameters.categories).toEqual(testCategories);
  });

  it("can be validated", function () {
    const parameters1 = new Parameters(
      testTransactionData,
      testTransationFileName,
      testAccounts,
      testCategories
    );
    expect(parameters1.validate()).toBe(null);

    const parameters2 = new Parameters(
      null,
      testTransationFileName,
      testAccounts,
      testCategories
    );
    expect(parameters2.validate()).toBe("Transaction data not provided");

    const parameters3 = new Parameters(
      testTransactionData,
      null,
      testAccounts,
      testCategories
    );
    expect(parameters3.validate()).toBe("Transaction file name not provided");

    const parameters4 = new Parameters(
      testTransactionData,
      testTransationFileName,
      [],
      testCategories
    );
    expect(parameters4.validate()).toBe(
      "Accounts must have at least one element"
    );

    const parameters5Accounts = JSON.parse(JSON.stringify(testAccounts));
    parameters5Accounts[0].startingBalance = NaN;
    const parameters5 = new Parameters(
      testTransactionData,
      testTransationFileName,
      parameters5Accounts,
      testCategories
    );
    expect(parameters5.validate()).toBe(
      "An account starting balance is not a number"
    );

    const parameters6Accounts = JSON.parse(JSON.stringify(testAccounts));
    parameters6Accounts[0].startingBalance = Infinity;
    const parameters6 = new Parameters(
      testTransactionData,
      testTransationFileName,
      parameters6Accounts,
      testCategories
    );
    expect(parameters6.validate()).toBe(
      "An account starting balance is not a number"
    );

    const parameters7 = new Parameters(
      testTransactionData,
      testTransationFileName,
      testAccounts,
      [{}]
    );
    expect(parameters7.validate()).toBe(
      "A category name is not of type string"
    );
  });
});
