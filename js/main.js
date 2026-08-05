/* ===================================================================
   main.js
   Lógica das páginas "leves": index, escolha e criar-cronograma.
   Cada bloco só executa se o elemento correspondente existir na
   página atual — assim este único arquivo pode ser incluído em
   todas elas sem causar erros.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setupHomePage();
  setupChoicePage();
  setupCreatePage();
});

/* ---------- index.html ---------- */
function setupHomePage() {
  const startBtn = document.getElementById('btn-comecar');
  if (!startBtn) return;
  startBtn.addEventListener('click', () => {
    window.location.href = 'escolha.html';
  });
}

/* ---------- escolha.html ---------- */
function setupChoicePage() {
  const enemCard = document.getElementById('card-enem');
  const fuvestCard = document.getElementById('card-fuvest');
  const customCard = document.getElementById('card-criar');
  if (!enemCard && !fuvestCard && !customCard) return;

  if (enemCard) {
    enemCard.addEventListener('click', () => {
      ensureFixedSchedule('enem', 'Cronograma ENEM', ENEM_DEFAULTS);
      setActiveSchedule('enem');
      window.location.href = 'cronograma.html';
    });
  }

  if (fuvestCard) {
    fuvestCard.addEventListener('click', () => {
      ensureFixedSchedule('fuvest', 'Cronograma FUVEST', FUVEST_DEFAULTS);
      setActiveSchedule('fuvest');
      window.location.href = 'cronograma.html';
    });
  }

  if (customCard) {
    customCard.addEventListener('click', () => {
      window.location.href = 'criar-cronograma.html';
    });
  }
}

/* ---------- criar-cronograma.html ---------- */
function setupCreatePage() {
  const form = document.getElementById('form-criar-cronograma');
  if (!form) return;

  const input = document.getElementById('input-nome-cronograma');
  const errorMsg = document.getElementById('erro-nome-cronograma');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();

    if (name.length === 0) {
      errorMsg.textContent = 'Dê um nome ao seu cronograma para continuar.';
      input.focus();
      return;
    }

    const schedule = createCustomSchedule(name);
    setActiveSchedule(schedule.id);
    window.location.href = 'cronograma-personalizado.html';
  });

  input.addEventListener('input', () => { errorMsg.textContent = ''; });
}
