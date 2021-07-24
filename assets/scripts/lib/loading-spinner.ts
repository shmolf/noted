let spinnerTemplate: HTMLElement;

window.addEventListener('DOMContentLoaded', () => {
  const template = document.getElementById('loading-spinner') as HTMLTemplateElement;
  spinnerTemplate = template?.content?.firstElementChild?.cloneNode(true) as HTMLElement;
});

export function showSpinner(parent: HTMLElement|null): void {
  parent?.appendChild(spinnerTemplate.cloneNode());
  parent?.classList.add('loading-spinner-parent');
}

export function removeSpinner(parent: HTMLElement|null): void {
  parent?.querySelectorAll(':scope > .loading-spinner').forEach((element: HTMLElement) => element.remove());
  parent?.classList.remove('loading-spinner-parent');
}
