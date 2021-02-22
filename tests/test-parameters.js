const Parameters = require('../src/js/lib/parameters.js').Parameters;

describe('Parameters', function() {
  const testTransactionData = `
    "Date","Name / Description","Account","Counterparty","Code","Debit/credit","Amount (EUR)","Transaction type","Notifications"
  `;
  const testTransationFileName = 'test-data.csv';
  const testAccounts = [
    {
      'name': 'Main',
      'startingBalance': 0,
      'addToNet': true,
    },
  ];
  const testCategories = [
    {
      'name': 'Other',
      'descriptionPattern': '',
      'counterAccountPattern': '',
    },
  ];
  it('can be constructed', function() {
    const parameters = new Parameters(testTransactionData, testTransationFileName, testAccounts, testCategories);

    expect(parameters.transactionData).toBe(testTransactionData);
    expect(parameters.transactionFileName).toBe(testTransationFileName);
    expect(parameters.accounts).toEqual(testAccounts);
    expect(parameters.categories).toEqual(testCategories);
  });

  it('can be validated', function() {
    const parameters1 = new Parameters(testTransactionData, testTransationFileName, testAccounts, testCategories);
    expect(parameters1.validate()).toBe(null);

    const parameters2 = new Parameters(null, testTransationFileName, testAccounts, testCategories);
    expect(parameters2.validate()).toBe('transactionData is not a string');

    const parameters3 = new Parameters(testTransactionData, null, testAccounts, testCategories);
    expect(parameters3.validate()).toBe('transactionFileName is not a string');

    const parameters4 = new Parameters(testTransactionData, testTransationFileName, [], testCategories);
    expect(parameters4.validate()).toBe('accounts must have at least one element');

    const parameters5 = new Parameters(testTransactionData, testTransationFileName, testAccounts, [{}]);
    expect(parameters5.validate()).toBe('a category.name from categories is not of type string');
  });
});
