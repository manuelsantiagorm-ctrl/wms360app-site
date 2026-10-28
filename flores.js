const scenes = {
  'Rosas':'assets/rosas-azul.png', 'Tulipanes':'assets/tulipanes-azul.png',
  'Girasoles':'assets/girasoles.png', 'Peonías':'assets/peonias-azul.png', 'Gerberas':'assets/gerberas-azul.png'
};
const selection = document.getElementById('selection');
const view = document.getElementById('painting-view');
const canvas = document.getElementById('painting');
const status = document.getElementById('painting-status');
const saveError = document.getElementById('save-error');
const retry = document.getElementById('retry');
const buttons = [...document.querySelectorAll('[data-flower]')];
const images = new Map();
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
  status.textContent = 'Preparando la pintura de ' + name.toLowerCase() + '.';
  const context=canvas.getContext('2d');context.fillStyle='#e8dfca';context.fillRect(0,0,canvas.width,canvas.height);
  try {
    const image = await loadImage(name);
    if (session !== generation) return;
    cancelPainting();
    canvas.setAttribute('aria-label','Pintura de unas manos sosteniendo un ramo de ' + name.toLowerCase());
    status.textContent = 'Pintando tu ramo de ' + name.toLowerCase() + '.';
    cancelPainting=PastelPainter.start(canvas,image,{
      onComplete:() => {
        view.classList.add('finished');
        status.textContent = 'Tu ramo de ' + name.toLowerCase() + ' está terminado. Para ti.';
      }
    });
  } catch {
    if (session === generation) {
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
document.getElementById('replay').addEventListener('click', () => {
  status.className='sr-only';paint(current,generation);
});
retry.addEventListener('click', () => { if(!saving) save(current,generation); });
document.addEventListener('keydown', event => {
  if(event.key==='Escape' && !view.hidden) document.getElementById('back').click();
});
