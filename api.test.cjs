const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(fetch, config = {url:'https://example.supabase.co',publishableKey:'sb_publishable_test'}) {
  const context = {window:{INVITATION_CONFIG:config},fetch};
  vm.runInNewContext(fs.readFileSync(__dirname + '/api.js','utf8'),context);
  return context.window.invitationApi;
}
test('missing configuration prevents a false success', async () => {
  const api = setup(() => { throw new Error('Should not fetch'); }, {});
  assert.equal(api.configured(),false);
  await assert.rejects(api.save('Tacos','18:30'), /Falta conectar/);
});
test('public submission sends food and time without requesting records', async () => {
  const api = setup(async (url,options) => {
    assert.ok(url.endsWith('/rest/v1/invitation_responses'));
    assert.equal(options.headers.Prefer,'return=minimal');
    assert.equal(options.headers.Authorization,undefined);
    assert.deepEqual(JSON.parse(options.body),{food:'Tacos',time:'18:30'});
    return {ok:true,status:204};
  });
  await api.save('Tacos','18:30');
});
test('admin queries require the login token', async () => {
  const api = setup(async (url,options) => {
    if (url.includes('/token?')) return {ok:true,status:200,headers:new Headers(),json:async () => ({access_token:'session-token'})};
    assert.equal(options.headers.Authorization,'Bearer session-token');
    return {ok:true,status:200,headers:new Headers(),json:async () => []};
  });
  await api.login('owner@example.com','test-only');
  await api.list();
});
test('backend failure is reported instead of confirming a save', async () => {
  const api = setup(async () => ({ok:false,status:403}));
  await assert.rejects(api.save('Birria','19:00'), /No se pudo conectar/);
});
test('flowers save independently and reject unsupported values', async () => {
  const api = setup(async (url, options) => {
    assert.ok(url.endsWith('/rest/v1/flower_responses'));
    assert.deepEqual(JSON.parse(options.body), {flower:'Rosas'});
    assert.equal(options.headers.Prefer,'return=minimal');
    assert.equal(options.headers.Authorization,undefined);
    return {ok:true,status:204};
  });
  await api.saveFlower('Rosas');
  await assert.rejects(api.saveFlower('Inventada'), /flor válida/);
});
test('successful empty 201 does not falsely report a failed flower save', async () => {
  const api = setup(async () => ({ok:true,status:201,headers:new Headers(),json:async () => {throw new SyntaxError('Unexpected end of JSON input');}}));
  await api.saveFlower('Rosas');
});
test('painting progresses through timed layers and completes within eight seconds', () => {
  let callback, complete = false, strokeCount = 0, finalImageCount = 0;
  const progressTimes = [];
  const mockContext = {
    drawImage() { finalImageCount++; },
    getImageData() { return {data:new Uint8ClampedArray(720*1080*4)}; },
    fill() {strokeCount++;},
    fillRect(){},save(){},restore(){},translate(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){}
  };
  const canvas = {getContext:() => mockContext};
  const context = {window:{},document:{createElement:() => ({getContext:() => mockContext})},
    performance:{now:() => 0},requestAnimationFrame:fn => { callback=fn;return 1; },cancelAnimationFrame(){}};
  vm.runInNewContext(fs.readFileSync(__dirname + '/pintura.js','utf8'),context);
  const painter = context.window.PastelPainter;
  assert.ok(painter.DURATION<=8000);
  const marks=painter.schedule(720,1080);
  assert.ok(marks.every((mark,i) => mark.when>=0 && mark.when<=1 && (!i || mark.when>=marks[i-1].when)));
  painter.start(canvas,{naturalWidth:1024,naturalHeight:1536},{onComplete:() => {complete=true;},onProgress:elapsed => progressTimes.push(elapsed)});
  callback(3500);
  assert.ok(strokeCount>0);
  assert.equal(complete,false);
  assert.deepEqual(progressTimes,[3500]);
  callback(painter.DURATION);
  assert.equal(complete,true);
  assert.deepEqual(progressTimes,[3500]);
  assert.ok(finalImageCount>=2);
});
