const buttonCompatibleKeys = [' ', 'Enter'];

export default function MakeClickable(element: HTMLElement): void {
  const elem = element;
  elem.tabIndex = 0;
  elem.addEventListener('keydown', (e) => eventClick(e));
}

function eventClick(event: KeyboardEvent): void {
  if (buttonCompatibleKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget as HTMLElement;
    element.click();
  }
}
