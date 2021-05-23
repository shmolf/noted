const buttonCompatibleKeys = [' ', 'Enter'];

export default function MakeClickable(element: HTMLElement) {
  const elem = element;
  elem.tabIndex = 0;
  elem.addEventListener('keydown', (e) => eventClick(e));
}

/**
 * @param {KeyboardEvent} event
 */
function eventClick(event: KeyboardEvent) {
  if (buttonCompatibleKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget as HTMLElement;
    element.click();
  }
}
