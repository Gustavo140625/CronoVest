/* Configurações do CronoVest: conta, foto de perfil e tema. */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-settings-account');
  if (!form) return;

  document.getElementById('settings-input-name').value =
    getProfile().name || '';

  setupAccountForm(form);
  setupAvatarButton();
  setupThemeOptions();
});

function setupAccountForm(form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('settings-input-name').value.trim();

    updateProfile({ name: name || 'Estudante' });
    renderNav();
    notify('Perfil atualizado.', 'success');
  });
}

function setupAvatarButton() {
  const button = document.getElementById('settings-btn-avatar');
  const input = document.getElementById('settings-input-avatar');

  button.addEventListener('click', () => input.click());

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

    reader.onerror = () => {
      notify('Não foi possível ler essa imagem.', 'danger');
    };

    reader.readAsDataURL(file);
  });
}

function setupThemeOptions() {
  const options = document.querySelectorAll('input[name="site-theme"]');
  const currentTheme = document.documentElement.dataset.theme || 'dark';

  options.forEach(option => {
    option.checked = option.value === currentTheme;

    option.addEventListener('change', () => {
      if (!option.checked) return;

      applySiteTheme(option.value);
      localStorage.setItem(SITE_THEME_KEY, option.value);
    });
  });
}