/** @module */
import deepEqual from "fast-deep-equal";
import exampleParameters from "../../assets/example-parameters.json";
import { generateGraphs, resizeGraphs } from "./graph";
import { Parameters } from "../lib/parameters.js";
import { DECIMAL } from "../lib/utils.js";

const HIDE_NAV_PAGES = ["home"];
const HASH_PAGES = ["faq"];
const GRAPH_PAGES = ["balance", "totals"];
const NAV_ELEMENT = "navigation";
const ACCOUNT_TABLE_ELEMENT = "account-table";
const CATEGORY_TABLE_ELEMENT = "category-table";

const WITHOUT_INPUT_NAV_LINKS = ["home", "input-transactions", "faq"];
const WITH_INPUT_NAV_LINKS = [
  "home",
  "input-transactions",
  "input-accounts",
  "input-categories",
  "balance",
  "totals",
  "faq",
];

const LOCALSTORAGE_PARAMETER_KEY = "parameters";
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
 * @param {boolean} [changeHash] - Whether to change the hash of the URL if applicable.
 */
function setActivePage(pageName, changeHash = true) {
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

  if (changeHash) {
    if (HASH_PAGES.indexOf(pageName) >= 0) {
      window.location.hash = "#" + pageName;
    } else if (window.location.hash !== "") {
      // Attempt to remove the hash part of the URL.
      try {
        history.replaceState(null, null, " ");
      } catch (_e) {
        window.location.hash = "";
      }
    }
  }

  if (GRAPH_PAGES.indexOf(pageName) >= 0) {
    submitParameters();
  }

  if (HIDE_NAV_PAGES.indexOf(pageName) >= 0) {
    document.getElementById(NAV_ELEMENT).classList.add("disabled");
    hideStatusBar();
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
    transactionData !== null ? WITH_INPUT_NAV_LINKS : WITHOUT_INPUT_NAV_LINKS;
  const allNavLinks = Array.from(
    new Set(WITH_INPUT_NAV_LINKS.concat(WITHOUT_INPUT_NAV_LINKS))
  );
  for (const navLink of allNavLinks) {
    const navLinkElement = document.getElementById(
      "nav-" + navLink + "-button"
    );

    if (shownNavLinks.indexOf(navLink) >= 0) {
      navLinkElement.classList.remove("faded");
    } else {
      navLinkElement.classList.add("faded");
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
      updateNavLinks("input-transactions");
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
    // Allow commas as well as periods.
    const startingBalance = Number(
      row.children[1].children[0].value.replace(/\,/g, ".")
    );
    accounts.push({
      name: row.children[0].children[0].value,
      startingBalance: Math.round(startingBalance * DECIMAL),
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
    document.getElementById(
      "parameters-upload-message"
    ).textContent = getErrorMessage(err);
    return;
  }
  document.getElementById("parameters-upload-error").classList.add("disabled");
  document.getElementById("parameters-upload-message").textContent = "";

  clearParameters();

  setTransactionData(
    parameters.transactionData,
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

/**
 * Callback for the "generate graphs" timeout.
 * This timeout is used to split off letting the user know that the graph is
 * being generated, from actually generating the graph (which is
 * time-intensive).
 */
function onGenerateGraphsTimeout() {
  try {
    generateGraphs(parameters);
    hideStatusBar();
    resizeGraphs();
  } catch (err) {
    console.error(err);
    showStatusError("Error generating graph: " + getErrorMessage(err) + ".");
    return;
  }

  try {
    localStorage.setItem(LOCALSTORAGE_PARAMETER_KEY, parameters.export());
  } catch (err) {
    console.error(err);
    showStatusError("Error saving parameters: " + getErrorMessage(err) + ".");
    return;
  }
}

/**
 * Callback for the "on URL hash change" event.
 */
function onHashChange() {
  const locationHash = (window.location.hash || "").substr(1);
  if (HASH_PAGES.indexOf(locationHash) >= 0) {
    setActivePage(locationHash, false);
  }
}

/* Event listener and callback code */

/**
 * Initialization method to be called when the page is done loading.
 * Registers event handlers.
 */
export function init() {
  window.addEventListener("hashchange", onHashChange, false);

  for (const navLink of WITH_INPUT_NAV_LINKS) {
    document
      .getElementById("nav-" + navLink + "-button")
      .addEventListener("click", () => setActivePage(navLink));
  }
  document
    .getElementById("start-button")
    .addEventListener("click", onStartButtonClicked);
  document
    .getElementById("start-demo-button")
    .addEventListener("click", onStartDemoButtonClicked);
  document
    .getElementById("input-transactions-next-button")
    .addEventListener("click", () => setActivePage("input-accounts"));
  document
    .getElementById("input-accounts-next-button")
    .addEventListener("click", () => setActivePage("input-categories"));
  document
    .getElementById("input-categories-next-button")
    .addEventListener("click", () => setActivePage("balance"));
  document
    .getElementById("add-account-button")
    .addEventListener("click", onAddAccountButtonClicked);
  document
    .getElementById("add-category-button")
    .addEventListener("click", onAddCategoryButtonClicked);
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

  // Switch to hash page if specified in the URL.
  onHashChange();
}

/**
 * Callback for the "start" button.
 */
function onStartButtonClicked() {
  let storedParameters = null;
  try {
    storedParameters = localStorage.getItem(LOCALSTORAGE_PARAMETER_KEY);
  } catch (err) {
    console.error(err);
    showStatusError("Error loading parameters: " + getErrorMessage(err) + ".");
  }
  if (storedParameters !== null) {
    importParameters(storedParameters);
  } else {
    setTransactionData(null, null);

    addAccount("Main", true);
  }

  setActivePage("input-transactions");
}

/**
 * Callback for the "start demo" button.
 */
function onStartDemoButtonClicked() {
  importParameters(JSON.stringify(exampleParameters));
  setActivePage("input-transactions");
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
  addAccount("New Account");
}

/**
 * Callback for "add category" button.
 *
 * @param {Event} event - DOM event.
 */
function onAddCategoryButtonClicked(event) {
  addCategory("New Category");
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
 * Show the given message on the status bar.
 * @param {string} message - The message to be displayed.
 */
function showStatusMessage(message) {
  document.getElementById("status-bar").classList.remove("disabled");
  document.getElementById("status-bar").classList.remove("error-bar");
  document.getElementById("status-message").textContent = message;
}

/**
 * Show the given error message on the status bar.
 * @param {string} errorMessage - The error message to be displayed.
 */
function showStatusError(errorMessage) {
  document.getElementById("status-bar").classList.remove("disabled");
  document.getElementById("status-bar").classList.add("error-bar");
  document.getElementById("status-message").textContent = errorMessage;
}

/**
 * Hide the status bar.
 */
function hideStatusBar() {
  document.getElementById("status-bar").classList.add("disabled");
}

/**
 * Get a human-readable error message from the given Error.
 * @param {Error} err - The error to extract the message from.
 * @return {string} A human-readable error message.
 */
function getErrorMessage(err) {
  if (err.message) {
    return err.message.toString();
  } else if (err.name) {
    if (err.name === "NS_ERROR_FILE_NO_DEVICE_SPACE") {
      return "File error: No device space";
    } else {
      return err.name.toString();
    }
  } else {
    return err.toString();
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
    showStatusError(validateError + ".");
  } else {
    if (!deepEqual(parameters, inputParameters)) {
      parameters = inputParameters;
      showStatusMessage("Generating graph. This may take a while...");
      // Give the browser some time to update the screen before generating the graph.
      setTimeout(onGenerateGraphsTimeout, 100);
    } else {
      // Only resize the graphs since the inputs haven't changed.
      resizeGraphs();
    }
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
