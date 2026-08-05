/* ===================================================================
   nav.js
   Componente de navegação reutilizável. Toda página interna só
   precisa ter <div id="nav-root"></div> no início do <body> — este
   arquivo injeta a sidebar (desktop) / menu hambúrguer (mobile) e
   marca automaticamente o link da página atual como ativo.
   =================================================================== */

const NAV_ITEMS = [
  { label: 'Início',            href: 'dashboard.html',         icon: 'fa-house' },
  { label: 'Cronogramas',       href: 'escolha.html',           icon: 'fa-layer-group' },
  { label: 'Criar Cronograma',  href: 'criar-cronograma.html',  icon: 'fa-wand-magic-sparkles' },
  { label: 'Calendário',        href: 'calendario.html',        icon: 'fa-calendar-days' },
  { label: 'Metas',             href: 'metas.html',             icon: 'fa-bullseye' },
  { label: 'Meu Perfil',        href: 'perfil.html',            icon: 'fa-user' },
  { label: 'Estatísticas',      href: 'estatisticas.html',      icon: 'fa-chart-simple' },
  { label: 'Configurações',     href: 'configuracoes.html',     icon: 'fa-gear' },
];

document.addEventListener('DOMContentLoaded', renderNav);

function renderNav() {
  const root = document.getElementById('nav-root');
  if (!root) return;

  document.body.classList.add('with-app-nav');

  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const profile = getProfile();

  root.innerHTML = `
    <button id="nav-hamburger" class="nav-hamburger" type="button" aria-label="Abrir menu de navegação">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div id="nav-overlay" class="nav-overlay"></div>
    <aside id="app-sidebar" class="app-sidebar">
      <a href="dashboard.html" class="sidebar-brand">
        <i class="fa-solid fa-meteor"></i>
        <span>CronoVest</span>
      </a>

      <a href="perfil.html" class="sidebar-user">
        <div class="sidebar-avatar">
          ${profile.avatar
            ? `<img src="${profile.avatar}" alt="Foto de perfil">`
            : '<i class="fa-solid fa-user"></i>'}
        </div>
        <div class="sidebar-user-info">
          <p class="sidebar-user-name">${escapeHtml(profile.name || 'Estudante')}</p>
          <p class="sidebar-user-objective">${escapeHtml(profile.objective || 'Defina seu objetivo')}</p>
        </div>
      </a>

      <nav class="sidebar-nav">
        ${NAV_ITEMS.map(item => `
          <a href="${item.href}" class="sidebar-link ${currentPage === item.href ? 'is-active' : ''}">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
    </aside>
  `;

  const hamburger = document.getElementById('nav-hamburger');
  const overlay = document.getElementById('nav-overlay');
  const sidebar = document.getElementById('app-sidebar');

  const closeNav = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible');
  });

  overlay.addEventListener('click', closeNav);
  sidebar.querySelectorAll('.sidebar-link, .sidebar-brand').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}