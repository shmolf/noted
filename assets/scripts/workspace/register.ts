import 'STYLES/workspace/register.scss';
import { MapStringTo } from 'SCRIPTS/types/Generic';
import axios from 'axios';
import { removeSpinner, showSpinner } from 'SCRIPTS/lib/loading-spinner';
import { TokenSourcePayload } from 'SCRIPTS/types/Api';

interface RegistrationData {
  origin: string|null,
  name: string|null,
}

let oauthWindow: Window|null;
let openChannelIntervalId: ReturnType<typeof setTimeout>|null;
let registrationForm: HTMLFormElement;
const registrationContext: RegistrationData = { origin: null, name: null };

window.addEventListener('DOMContentLoaded', () => {
  registrationForm = document.getElementById('registration-form') as HTMLFormElement;
  registrationForm?.addEventListener('submit', (e) => formSubmit(e));
});

// https://developers.google.com/web/updates/2018/07/page-lifecycle-api#legacy-lifecycle-apis-to-avoid
// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
// https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
window.addEventListener('beforeunload', () => {
  if ((oauthWindow ?? null) !== null) {
    killChildWindow(oauthWindow);
  }
});

function formSubmit(event: Event) {
  event.preventDefault();
  const inputUri = document.getElementById('registration-uri') as HTMLInputElement;
  const inputWorkspaceName = document.getElementById('workspace-name') as HTMLInputElement;
  // const inputToken = document.getElementById('app-token') as HTMLInputElement;
  const url = inputUri.value;
  registrationContext.origin = (new URL(url)).origin;
  registrationContext.name = inputWorkspaceName.value;

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
    if ((openChannelIntervalId ?? false) !== false) openChannel(oauthWindow!);
  }, 2000);
  oauthWindow?.addEventListener('message', (e: MessageEvent) => processWindowMessage(e));
}

/**
 * @param {bool} isEnabled - 'true' to enable, 'false' to disable
 */
function toggleWorkspaceInputs(isEnabled: boolean) {
  const inputName = document.getElementById('workspace-name') as HTMLInputElement;
  const inputUri = document.getElementById('registration-uri') as HTMLInputElement;
  // const inputToken = document.getElementById('app-token') as HTMLInputElement;

  inputName.disabled = !isEnabled;
  inputUri.disabled = !isEnabled;
  // inputToken.disabled = !isEnabled;
}

function clearWorkspaceInputs() {
  (document.getElementById('workspace-name') as HTMLInputElement).value = '';
  (document.getElementById('registration-uri') as HTMLInputElement).value = '';
}

function processWindowMessage(event: MessageEvent) {
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
      openChannel(oauthWindow!);
      break;
    default:
  }
}

function openChannel(page: Window) {
  const channel = new MessageChannel();
  // Listen for messages on port1, coming from the other page
  channel.port1.onmessage = processPipeMessage;

  // Transfer port2 to the other page
  page.postMessage(JSON.stringify({ state: 'pipe-ready' }), registrationContext.origin!, [channel.port2]);
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
  const data = JSON.parse(event.data);
  const load: MapStringTo<any> = data?.load ?? {};
  const action = data?.action ?? null;
  const state = data?.state ?? null;

  Object.keys(load).forEach((packageLoad) => {
    switch (packageLoad) {
      case 'tokens': {
        showSpinner(registrationForm);
        const tokenData: TokenSourcePayload = load[packageLoad];

        requestNewWorkspace(tokenData).then(() => {
          registrationContext.name = null;
          registrationContext.origin = null;
          clearWorkspaceInputs();
          removeSpinner(registrationForm);
          window.location.reload();
        }).catch((error) => console.debug(error));
        break;
      }
      default:
    }
  });

  switch (action) {
    case 'close':
      killChildWindow(oauthWindow);
      toggleWorkspaceInputs(true);
      event.ports.forEach((port: MessagePort) => port.close());
      break;
    default:
  }

  switch (state) {
    case 'ready':
      clearInterval(openChannelIntervalId!);
      openChannelIntervalId = null;
      console.debug('Connection established');
      // MessageChannel pipe is ready. Don't need to do anything but wait.
      break;
    case 'closing':
      killChildWindow(oauthWindow);
      toggleWorkspaceInputs(true);
      break;
    default:
  }
}

function killChildWindow(child: Window|null) {
  child?.close();
  child = null;
}

function requestNewWorkspace(tokenData: TokenSourcePayload): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.set('refreshToken', tokenData.token ?? '');
    formData.set('refreshExpiration', tokenData.expiration ?? new Date().toDateString());
    formData.set('refreshUri', tokenData.uri ?? '');
    formData.set('workspaceName', registrationContext.name ?? 'No Name Available');
    formData.set('workspaceOrigin', registrationContext.origin ?? 'No Origin Available');

    axios({
      url: registrationForm.dataset.successuri,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => resolve(true))
      .catch((response) => {
        console.debug(response instanceof Error ? response.message : response.data);
        removeSpinner(registrationForm);
        reject();
      });
  });
}
