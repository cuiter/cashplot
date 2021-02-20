const HIDE_NAV_PAGES = ['home'];
const NAV_ELEMENT = 'navigation';

const NAV_LINKS = ['home', 'input', 'balance', 'totals', 'faq'];
const SHOW_NAV_LINKS = {
  'input': ['home', 'input', 'faq'],
  'balance': ['home', 'input', 'balance', 'totals', 'faq'],
  'totals': ['home', 'input', 'balance', 'totals', 'faq'],
  'faq': ['home', 'faq'],
};

/**
 * Sets the page to be visible, while hiding all others.
 * A page is an element with class .page and id <name>-page.
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
 * Updates the navigation links to reflect the current page to the user.
 * See NAV_LINKS and SHOW_NAV_LINKS which links are shown on which page.
 *
 * @param {string} pageName - Name of the current page.
 */
function updateNavLinks(pageName) {
  if (SHOW_NAV_LINKS[pageName] !== undefined) {
    const showNavLinks = SHOW_NAV_LINKS[pageName];
    for (const navLink of NAV_LINKS) {
      const navLinkElement =
        document.getElementById('nav-' + navLink + '-button');
      if (showNavLinks.indexOf(navLink) >= 0) {
        navLinkElement.classList.remove('disabled');
      } else {
        navLinkElement.classList.add('disabled');
      }

      if (navLink == pageName) {
        navLinkElement.classList.add('current');
      } else {
        navLinkElement.classList.remove('current');
      }
    }
  }
}
