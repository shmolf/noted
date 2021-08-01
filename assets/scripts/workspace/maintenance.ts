import axios from 'axios';

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
  const workspaceUri = elem.dataset.uri ?? null;
  disableRowButtons(row);
  // This design assumes each button provides a URI. If this changes, just move the check w/in each CASE
  if (workspaceUri === null) return;

  switch (action) {
    case 'refresh': {
      refreshWorkspace(workspaceUri).then(() => removeRow(row));
      break;
    }
    case 'delete': {
      delWorkspace(workspaceUri).then(() => removeRow(row));
      break;
    }
    default:
  }
}

function disableRowButtons(row: HTMLTableRowElement|null) {
  row?.querySelectorAll('button').forEach((button) => { button.disabled = true; });
}

function removeRow(row: HTMLTableRowElement|null) {
  row?.parentElement?.removeChild(row);
}

function delWorkspace(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(uri)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function refreshWorkspace(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.put(uri)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
