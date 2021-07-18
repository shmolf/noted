import 'STYLES/workspace/register.scss';

import { removeSpinner, showSpinner } from 'SCRIPTS/lib/loading-spinner';

const frameId = 'registration-frame';

let iframeClone: HTMLIFrameElement;
let iframeWrap: HTMLDivElement;

window.addEventListener('DOMContentLoaded', () => {
  const iframeTemplate = document.getElementById('registration-frame-template') as HTMLTemplateElement;
  iframeWrap = document.getElementById('registration-iframe-wrap') as HTMLDivElement;

  iframeClone = iframeTemplate?.content?.firstElementChild?.cloneNode(true) as HTMLIFrameElement;
  document.getElementById('registration-form')
    ?.addEventListener('submit', (e) => formSubmit(e));
});

function formSubmit(event: Event) {
  event.preventDefault();
  const inputUri = document.getElementById('registration-uri') as HTMLInputElement;
  const url = inputUri.value;
  const oauthWindow = window.open(url, 'Oauth Signin', 'resizable,scrollbars,status');
  const frame = (document.getElementById(frameId) as HTMLIFrameElement|null) ?? replaceIFrame();

  if (String(url).trim() === '') {
    return;
  }

  function openChannel(windowEvent: MessageEvent, page: Window|null) {
    const message = windowEvent.data;

    if (message === 'ready' && page !== null) {
      const channel = new MessageChannel();
      // Listen for messages on port1, coming from the iFrame
      channel.port1.onmessage = (e: MessageEvent) => console.log(e.data);

      // Transfer port2 to the iframe
      page?.postMessage('', (new URL(url)).origin, [channel.port2]);
    }
  }

  const useNewTab = true;
  const eventWrapper = (e: MessageEvent) => openChannel(e, useNewTab ? oauthWindow : frame?.contentWindow);

  window.addEventListener('message', eventWrapper);

  const modalInstance = M.Modal.init(document.getElementById('registration-modal') as HTMLElement, {
    onOpenStart: () => {
      showSpinner(iframeWrap);
      frame!.src = url;
      frame!.onload = () => removeSpinner(iframeWrap);
    },
    onCloseStart: () => {
      window.removeEventListener('message', eventWrapper);
      replaceIFrame();
    },
  });

  modalInstance.open();
}

function replaceIFrame(): HTMLIFrameElement {
  const existingFrame = document.getElementById(frameId) as HTMLIFrameElement|null;

  if (existingFrame instanceof HTMLIFrameElement) {
    existingFrame.parentElement?.removeChild(existingFrame);
  }

  const newFrame = iframeClone.cloneNode(true) as HTMLIFrameElement;
  newFrame.id = frameId;
  iframeWrap.appendChild(newFrame);
  return newFrame;
}
