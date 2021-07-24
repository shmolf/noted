import axios from 'axios';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button.delete').forEach((elem: HTMLButtonElement) => {
    elem.addEventListener('click', (e) => {
      const row = elem.closest('tr');
      row?.querySelectorAll('button').forEach((button) => button.disabled = true);
      const deleteUri = elem.dataset.uri ?? '';
      delWorkspace(deleteUri).then(() => row?.parentElement?.removeChild(row));
    });
  });
});

function delWorkspace(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(uri)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}
