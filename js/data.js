/* ===================================================================
   data.js
   Conteúdo padrão dos cronogramas prontos (ENEM e FUVEST).
   São usados apenas uma vez, por ensureFixedSchedule(), para popular
   o localStorage na primeira visita do usuário a cada um deles.
   =================================================================== */

const ENEM_DEFAULTS = {
  segunda: ['Matemática', 'Linguagens e Códigos'],
  terca:   ['Física', 'Química'],
  quarta:  ['Biologia', 'Redação'],
  quinta:  ['História', 'Geografia'],
  sexta:   ['Matemática', 'Filosofia e Sociologia'],
  sabado:  ['Revisão Geral', 'Exercícios de Fixação'],
  domingo: ['Simulado ENEM'],
};

const FUVEST_DEFAULTS = {
  segunda: ['Matemática', 'Física'],
  terca:   ['Química', 'Biologia'],
  quarta:  ['Português', 'Literatura'],
  quinta:  ['História', 'Geografia'],
  sexta:   ['Redação', 'Inglês'],
  sabado:  ['Revisão de Exatas', 'Atualidades'],
  domingo: ['Simulado FUVEST'],
};
