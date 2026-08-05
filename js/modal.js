/* ===================================================================
   modal.js
   Modal de confirmação reutilizável para ações sensíveis (excluir
   cronograma, limpar progresso, apagar todos os dados, etc).
   =================================================================== */

/**
 * Abre um modal de confirmação.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.confirmLabel='Confirmar']
 * @param {string} [options.cancelLabel='Cancelar']
 * @param {boolean} [options.danger=true] - estilo vermelho no botão de confirmar
 * @param {Function} options.onConfirm - chamado se o usuário confirmar
 */
function confirmAction({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
}) {
  // Remove qualquer modal anterior para nunca empilhar overlays.
  document.getElementById('modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-icon ${danger ? 'is-danger' : ''}">
        <i class="fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}"></i>
      </div>
      <h3 class="modal-title">${escapeHtml(title)}</h3>
      <p class="modal-message">${escapeHtml(message)}</p>
      <div class="modal-actions">
        <button type="button" class="btn-ghost" id="modal-btn-cancel">${escapeHtml(cancelLabel)}</button>
        <button type="button" class="${danger ? 'btn-danger' : 'btn-primary'}" id="modal-btn-confirm">
          ${escapeHtml(confirmLabel)}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => {
    overlay.classList.remove('is-visible');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  document.getElementById('modal-btn-cancel').addEventListener('click', close);
  document.getElementById('modal-btn-confirm').addEventListener('click', () => {
    onConfirm?.();
    close();
  });
}