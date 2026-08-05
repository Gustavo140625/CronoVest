/* ===================================================================
   perfil.js
   Lógica da página de perfil: exibição dos dados, upload de foto
   (Base64 + localStorage), formulário de edição e grade de
   conquistas.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('profile-name-display');
  if (!display) return; // não estamos em perfil.html

  renderProfileDisplay();
  renderProfileStats();
  renderAchievementsGrid();
  setupAvatarUpload();
  setupProfileForm();
});

function renderProfileDisplay() {
  const profile = getProfile();
  document.getElementById('profile-name-display').textContent = profile.name || 'Estudante';
  document.getElementById('profile-objective-display').textContent =
    profile.objective || 'Defina seu objetivo de estudo nas configurações abaixo.';
  document.getElementById('profile-quote-display').textContent = profile.quote ? `"${profile.quote}"` : '';
  renderAvatarPreview(profile.avatar);

  // Pré-popula o formulário com os dados atuais.
  document.getElementById('input-profile-name').value = profile.name || '';
  document.getElementById('input-profile-objective').value = profile.objective || '';
  document.getElementById('input-profile-quote').value = profile.quote || '';
}

function renderAvatarPreview(avatarSrc) {
  const preview = document.getElementById('avatar-preview');
  preview.innerHTML = avatarSrc
    ? `<img src="${avatarSrc}" alt="Foto de perfil">`
    : '<i class="fa-solid fa-user"></i>';
}

function setupAvatarUpload() {
  const btn = document.getElementById('btn-change-avatar');
  const input = document.getElementById('input-avatar');

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
      renderAvatarPreview(reader.result);
      renderNav(); // atualiza o avatar também na sidebar
      notify('Foto de perfil atualizada.', 'success');
    };
    reader.onerror = () => notify('Não foi possível ler essa imagem.', 'danger');
    reader.readAsDataURL(file);
  });
}

function setupProfileForm() {
  const form = document.getElementById('form-edit-profile');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('input-profile-name').value.trim();
    updateProfile({
      name: name || 'Estudante',
      objective: document.getElementById('input-profile-objective').value.trim(),
      quote: document.getElementById('input-profile-quote').value.trim(),
    });

    renderProfileDisplay();
    renderNav();
    notify('Perfil atualizado.', 'success');
  });
}

function renderProfileStats() {
  const profile = getProfile();
  const stats = computeAllStats();
  const createdDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('pt-BR')
    : '—';

  const cards = [
    { icon: 'fa-calendar-plus', value: createdDate, label: 'Conta criada em' },
    { icon: 'fa-layer-group', value: stats.totalSchedules, label: 'Cronogramas criados' },
    { icon: 'fa-fire', value: `${stats.currentStreak} dias`, label: 'Sequência atual de estudos' },
    { icon: 'fa-circle-check', value: stats.completedSubjects, label: 'Matérias concluídas', hero: stats.completedSubjects > 0 },
    { icon: 'fa-hourglass-half', value: '0h', label: 'Horas estudadas (em breve, com o cronômetro)' },
  ];

  document.getElementById('profile-stats').innerHTML = cards.map(card => `
    <div class="stat-card ${card.hero ? 'is-hero' : ''}">
      <div class="stat-card-icon"><i class="fa-solid ${card.icon}"></i></div>
      <span class="stat-card-value">${card.value}</span>
      <span class="stat-card-label">${card.label}</span>
    </div>
  `).join('');
}

function renderAchievementsGrid() {
  const achievements = getAchievementsWithStatus();
  document.getElementById('achievements-grid').innerHTML = achievements.map(a => `
    <div class="achievement-card ${a.unlocked ? 'is-unlocked' : ''}">
      <div class="achievement-icon"><i class="fa-solid ${a.icon}"></i></div>
      <div>
        <h4>${escapeHtml(a.title)}</h4>
        <p>${escapeHtml(a.description)}</p>
      </div>
    </div>
  `).join('');
}