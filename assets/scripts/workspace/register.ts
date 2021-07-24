import 'STYLES/workspace/register.scss';
import { MapStringTo } from 'SCRIPTS/types/Generic';

let oauthWindow: Window|null;
let openChannelIntervalId: ReturnType<typeof setTimeout>|null;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registration-form')?.addEventListener('submit', (e) => formSubmit(e));
});

// https://developers.google.com/web/updates/2018/07/page-lifecycle-api#legacy-lifecycle-apis-to-avoid
// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
window.addEventListener('beforeunload', (event) => {
  if ((oauthWindow ?? false) === false) {
    killChildWindow(oauthWindow);
    // oauthWindow?.close();
    // oauthWindow?.window?.close();
    // console.log(oauthWindow);
    // oauthWindow = null;
  }
});

function formSubmit(event: Event) {
  event.preventDefault();
  const inputName = document.getElementById('workspace-name') as HTMLInputElement;
  const inputUri = document.getElementById('registration-uri') as HTMLInputElement;
  const inputToken = document.getElementById('app-token') as HTMLInputElement;
  const url = inputUri.value;

  if (oauthWindow ?? null === false) {
    killChildWindow(oauthWindow);
  }

  if (String(url).trim() === '') {
    return;
  }

  toggleWorkspaceInputs(false);

  oauthWindow = window.open(url, 'Oauth Signin', 'resizable,scrollbars,status');

  // Page isn't always available immediately, and the child window can't communicate upwards, w/o a pipe.
  openChannelIntervalId = setInterval(() => {
    if (openChannelIntervalId ?? false !== false) openChannel(oauthWindow!, url), 2000
  });
  console.log({ pipeLoadAttempts: openChannelIntervalId });
  oauthWindow?.addEventListener('message', (e: MessageEvent) => processWindowMessage(e, url));
}

/**
 * @param {bool} isEnabled - 'true' to enable, 'false' to disable
 */
function toggleWorkspaceInputs(isEnabled: boolean) {
  const inputName = document.getElementById('workspace-name') as HTMLInputElement;
  const inputUri = document.getElementById('registration-uri') as HTMLInputElement;
  const inputToken = document.getElementById('app-token') as HTMLInputElement;

  inputName.disabled = !isEnabled;
  inputUri.disabled = !isEnabled;
  inputToken.disabled = !isEnabled;
}

function processWindowMessage(event: MessageEvent, uri: string) {
  console.log(event.data)
  const data = JSON.parse(event.data);
  const load = data?.load ?? null;
  const action = data?.action ?? null;
  const state = data?.state ?? null;

  switch (load) {
    default:
  }

  switch (action) {
    default:
  }

  switch (state) {
    case 'ready':
      openChannel(oauthWindow!, uri);
      break;
    default:
  }
}

function openChannel(page: Window, uri: string) {
  const channel = new MessageChannel();
  // Listen for messages on port1, coming from the other page
  channel.port1.onmessage = processPipeMessage;

  // Transfer port2 to the other page
  page.postMessage(JSON.stringify({ state: 'pipe-ready'}), (new URL(uri)).origin, [channel.port2]);
}

/**
 * This will be responsible for storing the refresh token on the server.
 * Should be encrypted prior to storage. Both URL and Refresh Token.
 * - Refresh Token (Access Token will be store in JS as a local variable, nvr in the server)
 * - Refresh Endpoint
 * - Note Api Endbpoint(s)
 *   - POST, PUT, DEL
 * - Machine-friendly sitemap, for getting up-to-date routes of the above. Should be canonical.
 */
function processPipeMessage(event: MessageEvent) {
  console.log(event.data)
  const data = JSON.parse(event.data);
  const load: MapStringTo<any> = data?.load ?? {};
  const action = data?.action ?? null;
  const state = data?.state ?? null;

  console.log({ load, action, state });

  Object.keys(load).forEach((packageLoad) => {
    switch (packageLoad) {
      case 'tokens':
        try {
          const tokenData = JSON.parse(load[packageLoad]);
          console.log(tokenData);
        } catch(e) {
          console.debug([
            e,
            load[packageLoad],
          ]);
        }
        console.log([
          packageLoad,
          load[packageLoad],
        ]);
        break;
      default:
    }
  });

  switch (action) {
    case 'close':
      killChildWindow(oauthWindow);
      toggleWorkspaceInputs(true);
      console.log(event.ports);
      event.ports.forEach((port: MessagePort) => port.close());
      break;
    default:
  }

  switch (state) {
    case 'ready':
      clearInterval(openChannelIntervalId!);
      openChannelIntervalId = null;
      // MessageChannel pipe is ready. Don't need to do anything but wait.
      break;
    case 'closing':
      killChildWindow(oauthWindow);
      toggleWorkspaceInputs(true)
    default:
  }
}

function killChildWindow(child: Window|null) {
  child?.close();
  child = null;
}
