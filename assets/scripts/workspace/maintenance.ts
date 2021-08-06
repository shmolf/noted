import axios from 'axios';
import { WorkspacePackage } from 'SCRIPTS/notes/worker-client-api';
import { TokenSourcePayload } from 'SCRIPTS/types/Api';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button.refresh').forEach((elem: HTMLButtonElement) => {
    elem.addEventListener('click', () => handleWorkspaceAction(elem, 'refresh'));
  });

  document.querySelectorAll('button.delete').forEach((elem: HTMLButtonElement) => {
    elem.addEventListener('click', () => handleWorkspaceAction(elem, 'delete'));
  });
});

function handleWorkspaceAction(elem: HTMLButtonElement, action: string) {
  const row = elem.closest('tr');
  const actionUri = elem.dataset.uri ?? null;
  disableRowButtons(row);
  // This design assumes each button provides a URI. If this changes, just move the check w/in each CASE
  if (actionUri === null) throw new Error('Missing Workspace URI');

  switch (action) {
    case 'refresh': {
      const workspaceUri = row?.dataset.uri ?? null;
      if (workspaceUri === null) throw new Error('Missing Workspace URI');

      getWorkspace(workspaceUri).then((workspace: WorkspacePackage) => {
        refreshToken(workspace.tokenUri, workspace.token).then((data: TokenSourcePayload) => {
          updateWorkspace(actionUri, data).then((response) => {
            const expirationCell = row?.querySelector('.time-expiration') as HTMLTimeElement;
            expirationCell.innerText = data.expiration;
            enableRowButtons(row);
          });
        });
      });
      break;
    }
    case 'delete':
      delWorkspace(actionUri).then(() => removeRow(row));
      break;
    default:
  }
}

function disableRowButtons(row: HTMLTableRowElement|null) {
  row?.querySelectorAll('button').forEach((button) => { button.disabled = true; });
}

function enableRowButtons(row: HTMLTableRowElement|null) {
  row?.querySelectorAll('button').forEach((button) => { button.disabled = false; });
}

function removeRow(row: HTMLTableRowElement|null) {
  row?.parentElement?.removeChild(row);
}

function getWorkspace(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.get(uri)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function delWorkspace(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(uri)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function refreshToken(uri: string, token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.get(`${uri}?grant_type=refreshToken`, {
      headers: {
        'X-TOKEN-REFRESH': token,
      },
    })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function updateWorkspace(uri: string, tokenData: TokenSourcePayload): Promise<any> {
  return new Promise((resolve, reject) => {
    axios({
      url: uri,
      method: 'put',
      data: {
        token: tokenData.token,
        expiration: tokenData.expiration,
      },
    })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
