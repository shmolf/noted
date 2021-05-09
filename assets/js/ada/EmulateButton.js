const buttonCompatibleKeys = [' ', 'Enter'];

/**
 * @param {HTMLElement} element
 */
export default function MakeClickable(element) {
  const elem = element;
  elem.tabIndex = 0;
  elem.addEventListener('keydown', (e) => eventClick(e));
}

/**
 * @param {KeyboardEvent} event
 */
function eventClick(event) {
  if (buttonCompatibleKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();

    const element = /** @type {HTMLElement} */(event.currentTarget);
    element.click();
  }
}
