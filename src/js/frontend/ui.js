const HIDE_NAV_PAGES = ['home'];
const NAV_ELEMENT = 'navigation';
const ACCOUNT_TABLE_ELEMENT = 'account-table';
const CATEGORY_TABLE_ELEMENT = 'category-table';

const WITHOUT_INPUT_NAV_LINKS = ['home', 'input', 'faq'];
const WITH_INPUT_NAV_LINKS = ['home', 'input', 'balance', 'totals', 'faq'];

let inputSubmitted = false;

/**
 * Sets the page to be visible, while hiding all others.
 * A page is an element with class .page, an id <name>-page,
 * and a separate nav element with id nav-<name>-button.
 *
 * This function also shows/hides the navigation bar depending on the page,
 * and updates the navigation links accordingly.
 *
 * @param {string} pageName - Name of the page to switch to.
 */
function setActivePage(pageName) {
  const elements = document.querySelectorAll('.page');

  let found = false;
  for (const element of elements) {
    if (element.id == pageName + '-page') {
      element.classList.remove('disabled');
      found = true;
    } else {
      element.classList.add('disabled');
    }
  }

  if (!found) {
    throw new Error('Page ' + pageName + ' does not exist.');
  }

  if (HIDE_NAV_PAGES.indexOf(pageName) >= 0) {
    document.getElementById(NAV_ELEMENT).classList.add('disabled');
  } else {
    document.getElementById(NAV_ELEMENT).classList.remove('disabled');
  }

  updateNavLinks(pageName);
}

/**
 * Sets whether the input has been submitted, which will affect the shown
 * navigation links.
 *
 * @param {boolean} submitted - Whether the input has been submitted.
 */
function setInputSubmitted(submitted) {
  inputSubmitted = true;
}

/**
 * Updates the navigation links to reflect whether the input has been
 * submitted, and highlights the current page.
 *
 * @param {string} pageName - Name of the current page.
 */
function updateNavLinks(pageName) {
  const shownNavLinks = inputSubmitted ?
    WITH_INPUT_NAV_LINKS : WITHOUT_INPUT_NAV_LINKS;
  const allNavLinks = Array.from(
      new Set(WITH_INPUT_NAV_LINKS.concat(WITHOUT_INPUT_NAV_LINKS)));
  for (const navLink of allNavLinks) {
    const navLinkElement =
      document.getElementById('nav-' + navLink + '-button');

    if (shownNavLinks.indexOf(navLink) >= 0) {
      navLinkElement.classList.remove('disabled');
    } else {
      navLinkElement.classList.add('disabled');
    }

    if (pageName !== null) {
      if (navLink === pageName) {
        navLinkElement.classList.add('current');
      } else {
        navLinkElement.classList.remove('current');
      }
    }
  }
}

/**
 * Adds a new account to the accounts table.
 *
 * @param {string} name - Default account name. (NOTE: Inserted as raw HTML)
 * @param {boolean} [locked] - Whether the account should not be removable.
 */
function addAccount(name, locked = false) {
  const tableElement = document.getElementById(ACCOUNT_TABLE_ELEMENT);
  const row = tableElement.insertRow(-1);
  row.insertCell(-1).innerHTML =
    '<input type="text" value="' + name + '"></input>';
  row.insertCell(-1).innerHTML = '<input type="text" value="0"></input>';
  row.insertCell(-1).innerHTML = '<input type="checkbox" checked></input>';
  const removeButton = row.insertCell(-1);
  removeButton.innerHTML =
    '<button class="button button-small remove-row-button">Remove</button>';
  removeButton.firstChild.addEventListener('click', onRemoveRowButtonClicked);
  if (locked) {
    removeButton.firstChild.style.visibility = 'hidden';
  }
}

/**
 * Adds a new categry to the categories table.
 *
 * @param {string} name - Default category name.
 */
function addCategory(name) {
  const tableElement = document.getElementById(CATEGORY_TABLE_ELEMENT);
  const row = tableElement.insertRow(-1);
  row.insertCell(-1).innerHTML =
    '<input type="text" value="' + name + '"></input>';
  row.insertCell(-1).innerHTML = '<input type="text" value=""></input>';
  row.insertCell(-1).innerHTML = '<input type="text" value=""></input>';
  const removeButton = row.insertCell(-1);
  removeButton.innerHTML =
    '<button class="button button-small remove-row-button">Remove</button>';
  removeButton.firstChild.addEventListener('click', onRemoveRowButtonClicked);
}


/* Event listener and callback code */

/**
 * Initialization method to be called when the page is done loading.
 * Registers event handlers.
 */
export function init() {
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
  document.getElementById('add-account-button')
      .addEventListener('click', onAddAccountButtonClicked);
  document.getElementById('add-category-button')
      .addEventListener('click', onAddCategoryButtonClicked);
  document.getElementById('create-graph-button')
      .addEventListener('click', () => {
        setInputSubmitted(true);
        setActivePage('balance');
      });

  for (const element of document.querySelectorAll('.remove-row-button')) {
    element.addEventListener('click', onRemoveRowButtonClicked);
  }

  // Prevent form submitting (we don't collect any data anyway).
  for (const element of document.querySelectorAll('form')) {
    element.addEventListener('submit', (event) => {
      event.preventDefault();
      return false;
    });
  }

  document.getElementById('transaction-data-upload')
      .addEventListener('change', onTransactionDataUpload);

  addAccount('Main', true);
  addCategory('Other');
}

/**
 * Callback for any "remove row" button.
 */
function onRemoveRowButtonClicked() {
  const rowElement =
    this.parentNode.parentNode; // eslint-disable-line no-invalid-this
  rowElement.parentNode.removeChild(rowElement);
}

/**
 * Callback for "add account" button.
 *
 * @param {Event} event - DOM event.
 */
function onAddAccountButtonClicked(event) {
  addAccount('Savings');
}

/**
 * Callback for "add category" button.
 *
 * @param {Event} event - DOM event.
 */
function onAddCategoryButtonClicked(event) {
  addCategory('Category');
}

/**
 * Callback for the transaction data "Browse file" button.
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
