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
      name: "Salary",
      descriptionPattern: "Salary for *",
      counterAccountPattern: "Company Inc.",
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
    const validParameters = () =>
      new Parameters(
        testTransactionData,
        testTransationFileName,
        JSON.parse(JSON.stringify(testAccounts)),
        JSON.parse(JSON.stringify(testCategories))
      );

    const parameters1 = validParameters();
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

    const parameters4 = validParameters();
    parameters4.accounts[0].startingBalance = NaN;
    expect(parameters4.validate()).toBe(
      "Starting balance for account Main is not a number"
    );

    const parameters5 = validParameters();
    parameters5.accounts[0].startingBalance = Infinity;
    expect(parameters5.validate()).toBe(
      "Starting balance for account Main is not a number"
    );

    const parameters6 = validParameters();
    parameters6.categories[0].name = "";
    expect(parameters6.validate()).toBe("A category name is empty");

    const parameters7 = validParameters();
    parameters7.categories[0].descriptionPattern = "";
    expect(parameters7.validate()).toBe(null);
    const parameters8 = validParameters();
    parameters8.categories[0].counterAccountPattern = "";
    expect(parameters8.validate()).toBe(null);
    const parameters9 = validParameters();
    parameters9.categories[0].descriptionPattern = "";
    parameters9.categories[0].counterAccountPattern = "";
    expect(parameters9.validate()).toBe(
      "No description or counter-account given for category Salary"
    );
  });

  it("can be exported", function () {
    const parameters = new Parameters(
      testTransactionData,
      testTransationFileName,
      testAccounts,
      testCategories
    );
    const exportStr = parameters.export();
    expect(typeof exportStr).toBe("string");
    expect(typeof JSON.parse(exportStr)).toBe("object");
  });

  it("can be imported", function () {
    const parameters = new Parameters(
      testTransactionData,
      testTransationFileName,
      testAccounts,
      testCategories
    );
    const exportStr = parameters.export();
    const importedParameters = Parameters.import(exportStr);
    expect(importedParameters).toEqual(parameters);
  });
});
