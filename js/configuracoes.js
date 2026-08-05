/* ===================================================================
   configuracoes.js
   Lógica da página de configurações: edição rápida da conta e as
   três ações "perigosas", todas atrás de um modal de confirmação.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-settings-account');
  if (!form) return; // não estamos em configuracoes.html

  document.getElementById('settings-input-name').value = getProfile().name || '';

  setupAccountForm(form);
  setupAvatarButton();
  setupDangerZone();
});

function setupAccountForm(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('settings-input-name').value.trim();
    updateProfile({ name: name || 'Estudante' });
    renderNav();
    notify('Perfil atualizado.', 'success');
  });
}

function setupAvatarButton() {
  const btn = document.getElementById('settings-btn-avatar');
  const input = document.getElementById('settings-input-avatar');

  btn.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Selecione um arquivo de imagem válido.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result });
      renderNav();
      notify('Foto de perfil atualizada.', 'success');
    };
    reader.onerror = () => notify('Não foi possível ler essa imagem.', 'danger');
    reader.readAsDataURL(file);
  });
}

function setupDangerZone() {
  document.getElementById('btn-clear-progress').addEventListener('click', () => {
    confirmAction({
      title: 'Limpar todo o progresso?',
      message: 'Todas as matérias concluídas serão desmarcadas em todos os seus cronogramas. Esta ação não poderá ser desfeita.',
      confirmLabel: 'Limpar progresso',
      onConfirm: () => {
        clearAllProgress();
        notify('Progresso limpo com sucesso.', 'success');
      },
    });
  });

  document.getElementById('btn-restore-schedules').addEventListener('click', () => {
    confirmAction({
      title: 'Restaurar cronogramas prontos?',
      message: 'O ENEM e a FUVEST serão recriados com as matérias padrão. Cronogramas personalizados não são afetados. Esta ação não poderá ser desfeita.',
      confirmLabel: 'Restaurar',
      onConfirm: () => {
        restoreDefaultSchedules();
        notify('Cronogramas prontos restaurados.', 'success');
      },
    });
  });

  document.getElementById('btn-erase-all').addEventListener('click', () => {
    confirmAction({
      title: 'Excluir todos os dados?',
      message: 'Isso vai apagar permanentemente todos os cronogramas, seu perfil, metas e conquistas salvos neste navegador. Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir tudo',
      onConfirm: () => {
        eraseAllData();
        window.location.href = 'index.html';
      },
    });
  });
}