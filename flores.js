const form = document.getElementById('flowers-form');
const drawing = document.getElementById('drawing');
const caption = document.getElementById('flower-name');
const confirm = document.getElementById('confirm-flower');
const replay = document.getElementById('replay');
const status = document.getElementById('flower-status');
let choice = '';
let sending = false;
form.addEventListener('change', () => {
  choice = new FormData(form).get('flower');
  drawing.innerHTML = FlowerArt.draw(choice);
  caption.textContent = choice;
  replay.hidden = false;
  confirm.disabled = false;
  confirm.textContent = 'Esta es mi favorita';
  status.textContent = '';
});
replay.addEventListener('click', () => { if (choice) drawing.innerHTML = FlowerArt.draw(choice); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!choice || sending) return;
  sending = true;
  confirm.disabled = true;
  form.querySelector('fieldset').disabled = true;
  status.textContent = 'Guardando tu elección…';
  try {
    await invitationApi.saveFlower(choice);
    status.textContent = '¡Gracias! Ya guardé tu favorita. Este ramito es para ti.';
    confirm.textContent = 'Elección guardada';
  } catch {
    status.textContent = 'El dibujo es para ti, pero no se pudo guardar tu elección. Intenta de nuevo en un momento.';
    confirm.disabled = false;
  } finally {
    sending = false;
    form.querySelector('fieldset').disabled = false;
  }
});
