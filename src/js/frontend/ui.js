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
}
