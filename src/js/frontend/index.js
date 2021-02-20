import {setActivePage} from './ui';

/**
 * Initialization method to be called when the page is done loading.
 * Registers event handlers.
 */
function init() {
  document.getElementById('nav-home-button')
      .addEventListener('click', () => setActivePage('home'));
  document.getElementById('nav-input-button')
      .addEventListener('click', () => setActivePage('input'));
  document.getElementById('nav-balance-button')
      .addEventListener('click', () => setActivePage('balance'));
  document.getElementById('nav-totals-button')
      .addEventListener('click', () => setActivePage('totals'));
  document.getElementById('nav-faq-button')
      .addEventListener('click', () => setActivePage('faq'));
  document.getElementById('get-started-button')
      .addEventListener('click', () => setActivePage('input'));
  document.getElementById('create-graph-button')
      .addEventListener('click', () => setActivePage('balance'));

  document.getElementById('transaction-data-upload')
      .addEventListener('change', onTransactionDataUpload);
}

/**
 * Callback for the transaction data "Browse file" button
 */
function onTransactionDataUpload() {
  const fileList = this.files; // eslint-disable-line no-invalid-this
  if (fileList.length > 0) {
    const file = fileList[0];
    const reader = new FileReader();
    reader.addEventListener('loadend', (event) => {
      document.getElementById('transaction-data-input').value =
        event.target.result;
    });
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', init);
