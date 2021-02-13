import {setActivePage} from './ui';

function init() {
  document.getElementById('get-started-button')
      .addEventListener('click', () => setActivePage('input'));
  document.getElementById('transaction-export-upload')
      .addEventListener('change', onTransactionExportUpload);
}

function onTransactionExportUpload() {
  const fileList = this.files;
  if (fileList.length > 0) {
    const file = this.files[0];
    const reader = new FileReader();
    reader.addEventListener('loadend', (event) => {
      console.log(event.target.result);
      document.getElementById('transaction-export-input').value = event.target.result;
    });
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', init);
