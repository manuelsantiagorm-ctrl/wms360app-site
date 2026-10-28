const scenes = {
  'Rosas':'assets/rosas-azul.png', 'Tulipanes':'assets/tulipanes-azul.png',
  'Girasoles':'assets/girasoles.png', 'Peonías':'assets/peonias-azul.png', 'Gerberas':'assets/gerberas-azul.png'
};
const selection = document.getElementById('selection');
const view = document.getElementById('painting-view');
const canvas = document.getElementById('painting');
const status = document.getElementById('painting-status');
const paintMessage = document.getElementById('paint-message');
const saveError = document.getElementById('save-error');
const retry = document.getElementById('retry');
const buttons = [...document.querySelectorAll('[data-flower]')];
const images = new Map();
const flowerFacts = {
  'Rosas': {text:'Algunos rosales dan pequeños frutos llamados escaramujos. Después de sus flores, todavía tienen algo bonito que ofrecer.',source:'https://www.chicagobotanic.org/plant-information/rose-hips'},
  'Tulipanes': {text:'No todos los tulipanes tienen forma de copa: existen variedades con pétalos rizados, con flecos y hasta parecidas a peonías.',source:'https://www.rhs.org.uk/plants/tulip'},
  'Girasoles': {text:'Lo que parece una sola flor es un conjunto de pequeñas flores. En su centro crecen formando espirales.',source:'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:119003-2/general-information'},
  'Peonías': {text:'Una peonía bien cuidada puede vivir durante décadas. Algunas llegan a florecer en el mismo jardín durante casi un siglo.',source:'https://www.rhs.org.uk/press/documents/shows/chelsea/2026/reports/rhs-great-pavillion-tips-and-trends-report-2026.pdf?ext='},
  'Gerberas': {text:'La gerbera esconde muchas flores diminutas en una sola cabeza floral. ¡Es como un pequeño ramo dentro del ramo!',source:'https://www.kew.org/read-and-watch/lets-pluck-the-daisy'}
};
const note = document.getElementById('flower-note');
const personalNotes = {
  'Rosas':'Estas se ven bien, pero admito que compiten con tu sonrisa.',
  'Tulipanes':'Te las manda alguien que espera tener al menos una pequeña mención en tu mente hoy.',
  'Girasoles':'Aviso: estas flores no se comparan contigo, pero hacían el intento.',
  'Peonías':'Un sobornador anónimo me pidió que te entregara esto... ¿funcionará?',
  'Gerberas':'Si te sacan una sonrisa, entonces la misión del día está cumplida.'
};
const factText = document.getElementById('flower-fact');
let factWords = [], writtenWords = -1;
function prepareNote(name) {
  document.getElementById('flower-dedication').textContent = personalNotes[name];
  factWords = flowerFacts[name].text.split(' ');
  writtenWords = -1;
  factText.textContent = '';
  factText.classList.add('typing');
  document.getElementById('fact-accessible').textContent = flowerFacts[name].text;
  note.classList.remove('stuck');
  void note.offsetWidth;
  note.classList.add('stuck');
}
function writeFact(elapsed) {
  const count = Math.min(factWords.length,Math.max(0,Math.ceil((elapsed-550)/230)));
  if(count !== writtenWords) {
    factText.textContent = factWords.slice(0,count).join(' ');
    writtenWords = count;
  }
  if(count === factWords.length) factText.classList.remove('typing');
}
let current = '', generation = 0, cancelPainting = () => {}, saving = false;
function loadImage(name) {
  if (!images.has(name)) {
    const image = new Image();
    image.src = scenes[name];
    images.set(name, image.decode().then(() => image).catch(error => { images.delete(name); throw error; }));
  }
  return images.get(name);
}
// La precarga comienza mientras ella mira las cinco opciones.
for (const name of Object.keys(scenes)) loadImage(name).catch(() => {});
async function save(name, session) {
  saving = true;retry.disabled = true;
  try {
    await invitationApi.saveFlower(name);
    if (session === generation) saveError.hidden = true;
  } catch {
    if (session === generation) saveError.hidden = false;
  } finally {
    if (session === generation) { saving = false;retry.disabled = false; }
  }
}
async function paint(name, session) {
  cancelPainting();
  view.classList.remove('finished');
  prepareNote(name);
  paintMessage.textContent = 'Espera un momento';
  paintMessage.hidden = false;
  status.textContent = 'Preparando la pintura de ' + name.toLowerCase() + '.';
  const context=canvas.getContext('2d');context.fillStyle='#e8dfca';context.fillRect(0,0,canvas.width,canvas.height);
  try {
    const image = await loadImage(name);
    if (session !== generation) return;
    cancelPainting();
    canvas.setAttribute('aria-label','Pintura de unas manos sosteniendo un ramo de ' + name.toLowerCase());
    status.textContent = 'Pintando tu ramo de ' + name.toLowerCase() + '.';
    cancelPainting=PastelPainter.start(canvas,image,{
      onProgress:elapsed => {
        writeFact(elapsed);
        const message = elapsed < 2400 ? 'Espera un momento'
          : elapsed < 4700 ? 'Ya casi'
          : elapsed < 6500 ? 'Casi acabo' : 'Listo, para ti';
        if (paintMessage.textContent !== message) paintMessage.textContent = message;
      },
      onComplete:() => {
        view.classList.add('finished');
        paintMessage.hidden = true;
        writeFact(10000);
        status.textContent = 'Tu ramo de ' + name.toLowerCase() + ' está terminado. Para ti.';
      }
    });
  } catch {
    if (session === generation) {
      paintMessage.hidden = true;
      status.classList.remove('sr-only');status.classList.add('save-error');
      status.textContent='No se pudo cargar la pintura. Pulsa ↻ para reintentar.';
    }
  }
}
buttons.forEach(button => button.addEventListener('click', () => {
  current=button.dataset.flower; const session=++generation;
  selection.hidden=true;view.hidden=false;saveError.hidden=true;
  status.className='sr-only';
  document.getElementById('back').focus({preventScroll:true});
  paint(current,session);save(current,session);
}));
document.getElementById('back').addEventListener('click', () => {
  generation++;cancelPainting();view.hidden=true;selection.hidden=false;saving=false;
  buttons.find(button => button.dataset.flower===current)?.focus({preventScroll:true});
});
document.getElementById('return-home').addEventListener('click', () => document.getElementById('back').click());
document.getElementById('replay').addEventListener('click', () => {
  status.className='sr-only';paint(current,generation);
});
retry.addEventListener('click', () => { if(!saving) save(current,generation); });
document.addEventListener('keydown', event => {
  if(event.key==='Escape' && !view.hidden) document.getElementById('back').click();
});
