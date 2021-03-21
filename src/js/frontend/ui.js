import { generateGraphs, resizeGraphs } from "./graph";
import { Parameters } from "../lib/parameters.js";
import { DECIMAL } from "../lib/utils.js";

const HIDE_NAV_PAGES = ["home"];
const NAV_ELEMENT = "navigation";
const ACCOUNT_TABLE_ELEMENT = "account-table";
const CATEGORY_TABLE_ELEMENT = "category-table";

const WITHOUT_INPUT_NAV_LINKS = ["home", "input", "faq"];
const WITH_INPUT_NAV_LINKS = ["home", "input", "balance", "totals", "faq"];
const RESIZE_GRAPH_PAGES = ["balance", "totals"];

let transactionData = null;
let transactionFileName = null;
let parameters = null;

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
  const elements = document.querySelectorAll(".page");

  let found = false;
  for (const element of elements) {
    if (element.id == pageName + "-page") {
      element.classList.remove("disabled");
      found = true;
    } else {
      element.classList.add("disabled");
    }
  }

  if (!found) {
    throw new Error("Page " + pageName + " does not exist.");
  }

  if (RESIZE_GRAPH_PAGES.indexOf(pageName) >= 0) {
    resizeGraphs();
  }

  if (HIDE_NAV_PAGES.indexOf(pageName) >= 0) {
    document.getElementById(NAV_ELEMENT).classList.add("disabled");
  } else {
    document.getElementById(NAV_ELEMENT).classList.remove("disabled");
  }

  updateNavLinks(pageName);
}

/**
 * Updates the navigation links to reflect whether the input has been
 * submitted, and highlights the current page.
 *
 * @param {string} pageName - Name of the current page.
 */
function updateNavLinks(pageName) {
  const shownNavLinks =
    parameters !== null ? WITH_INPUT_NAV_LINKS : WITHOUT_INPUT_NAV_LINKS;
  const allNavLinks = Array.from(
    new Set(WITH_INPUT_NAV_LINKS.concat(WITHOUT_INPUT_NAV_LINKS))
  );
  for (const navLink of allNavLinks) {
    const navLinkElement = document.getElementById(
      "nav-" + navLink + "-button"
    );

    if (shownNavLinks.indexOf(navLink) >= 0) {
      navLinkElement.classList.remove("disabled");
    } else {
      navLinkElement.classList.add("disabled");
    }

    if (pageName !== null) {
      if (navLink === pageName) {
        navLinkElement.classList.add("current");
      } else {
        navLinkElement.classList.remove("current");
      }
    }
  }
}

/**
 * Adds a new account to the accounts table.
 *
 * @param {string} name - Default account name.
 * @param {boolean} [locked] - Whether the account should not be removable.
 * @param {number} [startingBalance] - The starting balance.
 * @param {boolean} [addToNet] - Whether the account should be added to the net worth.
 */
function addAccount(
  name,
  locked = false,
  startingBalance = 0,
  addToNet = true
) {
  const tableElement = document.getElementById(ACCOUNT_TABLE_ELEMENT);
  const row = tableElement.children[1].insertRow(-1);
  const nameInput = row.insertCell(-1);
  nameInput.innerHTML = '<input type="text" value=""></input>';
  nameInput.firstChild.value = name;
  row.insertCell(-1).innerHTML =
    '<input type="text" value="' +
    (startingBalance / DECIMAL).toFixed(0.01) +
    '"></input>';
  row.insertCell(-1).innerHTML =
    '<input type="checkbox"' + (addToNet ? " checked" : "") + "></input>";
  const removeButton = row.insertCell(-1);
  removeButton.innerHTML =
    '<button class="button button-small remove-row-button">Remove</button>';
  removeButton.firstChild.addEventListener("click", onRemoveRowButtonClicked);
  if (locked) {
    removeButton.firstChild.style.visibility = "hidden";
  }
}

/**
 * Adds a new category to the categories table.
 *
 * @param {string} name - Category name.
 * @param {string} descriptionPattern - Description pattern to match.
 * @param {string} counterAccountPattern - Counter account pattern to match.
 */
function addCategory(
  name,
  descriptionPattern = "",
  counterAccountPattern = ""
) {
  const tableElement = document.getElementById(CATEGORY_TABLE_ELEMENT);
  const row = tableElement.children[1].insertRow(-1);
  const nameInput = row.insertCell(-1);
  nameInput.innerHTML = '<input type="text" value=""></input>';
  nameInput.firstChild.value = name;
  const descriptionPatternInput = row.insertCell(-1);
  descriptionPatternInput.innerHTML = '<input type="text" value=""></input>';
  descriptionPatternInput.firstChild.value = descriptionPattern;
  const counterAccountPatternInput = row.insertCell(-1);
  counterAccountPatternInput.innerHTML = '<input type="text" value=""></input>';
  counterAccountPatternInput.firstChild.value = counterAccountPattern;
  const removeButton = row.insertCell(-1);
  removeButton.innerHTML =
    '<button class="button button-small remove-row-button">Remove</button>';
  removeButton.firstChild.addEventListener("click", onRemoveRowButtonClicked);
}

/**
 * Sets the current transaction data - showing a message of the result.
 *
 * @param {string} data - Loaded transaction data.
 * @param {string} fileName - File name to display if successful.
 */
function setTransactionData(data, fileName) {
  if (data === null && fileName === null) {
    document.getElementById("transaction-data-ok").classList.add("disabled");
    document.getElementById("transaction-data-error").classList.add("disabled");
    document.getElementById("transaction-data-message").textContent =
      "No file selected.";
  } else {
    let resultMessage = "";
    let resultOk = false;
    if (data === "") {
      resultMessage = "File is empty.";
      resultOk = false;
    } else {
      resultOk = true;
    }

    if (resultOk) {
      resultMessage = fileName;
      transactionData = data;
      transactionFileName = fileName;
      document
        .getElementById("transaction-data-ok")
        .classList.remove("disabled");
      document
        .getElementById("transaction-data-error")
        .classList.add("disabled");
    } else {
      document.getElementById("transaction-data-ok").classList.add("disabled");
      document
        .getElementById("transaction-data-error")
        .classList.remove("disabled");
    }
    document.getElementById(
      "transaction-data-message"
    ).textContent = resultMessage;
  }
}

/**
 * Reads the entered parameters from the page.
 * @return {Parameters} A Parameters instance containing the entered data.
 */
function readParameters() {
  const accounts = [];
  const accountTableElement = document.getElementById("account-table");
  for (const row of accountTableElement.children[1].children) {
    accounts.push({
      name: row.children[0].children[0].value,
      startingBalance: Math.round(
        Number(row.children[1].children[0].value) * DECIMAL
      ),
      addToNet: row.children[2].children[0].checked,
    });
  }

  const categories = [];
  const categoryTableElement = document.getElementById("category-table");
  for (const row of categoryTableElement.children[1].children) {
    categories.push({
      name: row.children[0].children[0].value,
      descriptionPattern: row.children[1].children[0].value,
      counterAccountPattern: row.children[2].children[0].value,
    });
  }

  const parameters = new Parameters(
    transactionData,
    transactionFileName,
    accounts,
    categories
  );

  return parameters;
}

/**
 * Clears the parameters on the page.
 */
function clearParameters() {
  setTransactionData(null, null);

  const accountTableElement = document.getElementById("account-table");
  const categoryTableElement = document.getElementById("category-table");
  accountTableElement.children[1].innerHTML = "";
  categoryTableElement.children[1].innerHTML = "";
}

/**
 * Imports parameters from an export and fills in the fields.
 * @param {string} exportStr - String containing the export.
 */
function importParameters(exportStr) {
  let parameters;
  try {
    parameters = Parameters.import(exportStr);
  } catch (err) {
    document
      .getElementById("parameters-upload-error")
      .classList.remove("disabled");
    document.getElementById("parameters-upload-message").textContent =
      err.message;
    return;
  }
  document.getElementById("parameters-upload-error").classList.add("disabled");
  document.getElementById("parameters-upload-message").textContent = "";

  clearParameters();

  setTransactionData(
    parameters.transactionFileName,
    parameters.transactionFileName
  );

  let firstAccount = true;
  for (const account of parameters.accounts) {
    addAccount(
      account.name,
      firstAccount,
      account.startingBalance,
      account.addToNet
    );
    firstAccount = false;
  }
  for (const category of parameters.categories) {
    addCategory(
      category.name,
      category.descriptionPattern,
      category.counterAccountPattern
    );
  }
}

/* Event listener and callback code */

/**
 * Initialization method to be called when the page is done loading.
 * Registers event handlers.
 */
export function init() {
  document
    .getElementById("nav-home-button")
    .addEventListener("click", () => setActivePage("home"));
  document
    .getElementById("nav-input-button")
    .addEventListener("click", () => setActivePage("input"));
  document
    .getElementById("nav-balance-button")
    .addEventListener("click", () => setActivePage("balance"));
  document
    .getElementById("nav-totals-button")
    .addEventListener("click", () => setActivePage("totals"));
  document
    .getElementById("nav-faq-button")
    .addEventListener("click", () => setActivePage("faq"));
  document
    .getElementById("get-started-button")
    .addEventListener("click", () => setActivePage("input"));
  document
    .getElementById("add-account-button")
    .addEventListener("click", onAddAccountButtonClicked);
  document
    .getElementById("add-category-button")
    .addEventListener("click", onAddCategoryButtonClicked);
  document
    .getElementById("create-graph-button")
    .addEventListener("click", submitParameters);
  document
    .getElementById("export-parameters-button")
    .addEventListener("click", exportParameters);
  document
    .getElementById("totals-select")
    .addEventListener("change", changeTotalsGraph);
  document
    .getElementById("parameters-upload")
    .addEventListener("change", onParametersUpload);
  document
    .getElementById("transaction-data-upload")
    .addEventListener("change", onTransactionDataUpload);

  for (const element of document.querySelectorAll(".remove-row-button")) {
    element.addEventListener("click", onRemoveRowButtonClicked);
  }

  // Prevent form submitting (we don't collect any data anyway).
  for (const element of document.querySelectorAll("form")) {
    element.addEventListener("submit", (event) => {
      event.preventDefault();
      return false;
    });
  }

  setTransactionData(null, null);

  addAccount("Main", true);
  addCategory("Other");
}

/**
 * Callback for any "remove row" button.
 */
function onRemoveRowButtonClicked() {
  const rowElement = this.parentNode.parentNode; // eslint-disable-line no-invalid-this
  rowElement.parentNode.removeChild(rowElement);
}

/**
 * Callback for "add account" button.
 *
 * @param {Event} event - DOM event.
 */
function onAddAccountButtonClicked(event) {
  addAccount("Savings");
}

/**
 * Callback for "add category" button.
 *
 * @param {Event} event - DOM event.
 */
function onAddCategoryButtonClicked(event) {
  addCategory("Category");
}

/**
 * Callback for the Upload Transactions button.
 */
function onTransactionDataUpload() {
  const fileList = this.files; // eslint-disable-line no-invalid-this
  if (fileList.length > 0) {
    const file = fileList[0];
    const reader = new FileReader();
    reader.addEventListener("loadend", (event) => {
      setTransactionData(event.target.result, file.name);
    });
    reader.readAsText(file);
  }
}

/**
 * Callback for the Upload Parameters button.
 */
function onParametersUpload() {
  const fileList = this.files; // eslint-disable-line no-invalid-this
  if (fileList.length > 0) {
    const file = fileList[0];
    const reader = new FileReader();
    reader.addEventListener("loadend", (event) => {
      importParameters(event.target.result);
    });
    reader.readAsText(file);
  }
}

/**
 * Callback for the Create Graph button.
 * Submits the entered parameters and generates graphs.
 */
function submitParameters() {
  const inputParameters = readParameters();
  const validateError = inputParameters.validate();

  if (validateError !== null) {
    document.getElementById("create-graph-error").classList.remove("disabled");
    document.getElementById("create-graph-message").textContent =
      validateError + ".";
  } else {
    document.getElementById("create-graph-error").classList.add("disabled");
    document.getElementById("create-graph-message").textContent = "";
    parameters = inputParameters;
    generateGraphs(parameters);
    setActivePage("balance");
  }
}

/**
 * Callback for the Export Parameters button.
 * If parameters are valid, exports them into a file the user can download.
 */
function exportParameters() {
  const parameters = readParameters();
  const exportStr = parameters.export();
  const data = new Blob([exportStr], { type: "application/json" });
  const url = window.URL.createObjectURL(data);
  const exportParametersLink = document.getElementById(
    "export-parameters-link"
  );
  exportParametersLink.href = url;
  exportParametersLink.download = "cashplot.json";
  exportParametersLink.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Callback for the totals dropdown. Changes the currently displayed graph.
 * NOTE: Assumes that every totals graph element has the id
 *       <period>-totals-graph.
 */
function changeTotalsGraph() {
  const selectElement = this; // eslint-disable-line no-invalid-this

  for (let i = 0; i < selectElement.options.length; i++) {
    if (i === selectElement.selectedIndex) {
      document
        .getElementById(selectElement.options[i].value + "-totals-graph")
        .classList.remove("disabled");
    } else {
      document
        .getElementById(selectElement.options[i].value + "-totals-graph")
        .classList.add("disabled");
    }
  }

  resizeGraphs();
}
