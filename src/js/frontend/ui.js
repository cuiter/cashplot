const HIDE_NAV_PAGES = ['home'];
const NAV_ELEMENT = 'navigation';
/**
 * Sets the page to be visible, while hiding all others.
 * A page is an element with class .page and id <name>-page.
 *
 * This function also shows/hides the navigation bar depending on the page.
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

  console.log(pageName);
  if (HIDE_NAV_PAGES.indexOf(pageName) >= 0) {
    document.getElementById(NAV_ELEMENT).classList.add('disabled');
  } else {
    document.getElementById(NAV_ELEMENT).classList.remove('disabled');
  }
}
