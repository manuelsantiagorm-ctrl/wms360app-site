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
