window.invitationApi = (() => {
  let token = '';
  function config() {
    const value = window.INVITATION_CONFIG;
    if (!value?.url || !value?.publishableKey) throw new Error('Falta conectar Supabase. Todavía no se pueden guardar ni consultar respuestas.');
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(value.url)) throw new Error('La dirección del proyecto Supabase no es válida.');
    if (value.publishableKey.startsWith('sb_secret_')) throw new Error('Usa únicamente la clave pública de Supabase.');
    return value;
  }
  async function request(path, options = {}, authorized = false) {
    const settings = config();
    const response = await fetch(settings.url.replace(/\/$/, '') + path, {
      ...options,
      headers: {apikey: settings.publishableKey, 'Content-Type': 'application/json',
        ...(authorized ? {Authorization: 'Bearer ' + token} : {}), ...options.headers}
    });
    if (!response.ok) {
      if (authorized && response.status === 401) { token = ''; throw new Error('Tu sesión venció. Vuelve a iniciar sesión.'); }
      throw new Error(response.status === 400 || response.status === 401
        ? 'No se pudo completar la solicitud. Revisa los datos y la configuración.'
        : 'No se pudo conectar con las respuestas. Intenta de nuevo.');
    }
    return response.status === 204 || response.headers.get('content-length') === '0' ? null : response.json();
  }
  return {
    configured: () => { try { config(); return true; } catch { return false; } },
    async save(food, time) {
      await request('/rest/v1/invitation_responses', {method:'POST', headers:{Prefer:'return=minimal'}, body:JSON.stringify({food, time})});
    },
    async login(email, password) {
      const session = await request('/auth/v1/token?grant_type=password', {method:'POST',body:JSON.stringify({email,password})});
      token = session.access_token;
    },
    async list() { return request('/rest/v1/invitation_responses?select=food,time,created_at&order=created_at.desc&limit=200', {}, true); },
    async logout() {
      try { if (token) await request('/auth/v1/logout', {method:'POST'}, true); }
      finally { token = ''; }
    }
  };
})();
