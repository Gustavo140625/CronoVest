/* ===================================================================
   notifications.js
   Sistema interno de notificações (toasts). Qualquer página pode
   chamar notify(mensagem, tipo) — o container é criado sozinho na
   primeira chamada, sem precisar de markup extra no HTML.
   =================================================================== */

const TOAST_ICONS = {
  success: 'fa-circle-check',
  info: 'fa-circle-info',
  danger: 'fa-triangle-exclamation',
};

function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Mostra uma notificação no canto da tela.
 * @param {string} message - texto exibido
 * @param {'success'|'info'|'danger'} type - estilo visual
 * @param {number} duration - tempo em ms antes de desaparecer
 */
function notify(message, type = 'success', duration = 3200) {
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.info}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}