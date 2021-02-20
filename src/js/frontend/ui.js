const HIDE_NAV_PAGES = ['home'];
const NAV_ELEMENT = 'navigation';

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
export function setActivePage(pageName) {
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
export function setInputSubmitted(submitted) {
  inputSubmitted = true;
}

/**
 * Updates the navigation links to reflect whether the input has been
 * submitted, and highlights the current page.
 *
 * @param {string} pageName - Name of the current page.
 */
function updateNavLinks(pageName) {
  const shownNavLinks = inputSubmitted ? WITH_INPUT_NAV_LINKS : WITHOUT_INPUT_NAV_LINKS;
  const allNavLinks = Array.from(new Set(WITH_INPUT_NAV_LINKS.concat(WITHOUT_INPUT_NAV_LINKS)));
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
