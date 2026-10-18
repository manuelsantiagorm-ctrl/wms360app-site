# Invitación con GitHub Pages y Supabase

GitHub Pages muestra la invitación y admin.html; Supabase guarda comida/hora y autentica al dueño. No requiere PHP.

## Activar

1. Crea un proyecto en Supabase.
2. En Authentication > Users crea tu usuario con correo y contraseña y copia su UUID. Es una cuenta distinta de tu acceso al dashboard de Supabase.
3. En supabase.sql reemplaza el UUID de ceros con el UUID de tu usuario y ejecuta el script en SQL Editor. Solo ese usuario puede leer; los visitantes solo insertan comida/hora.
4. En config.js coloca la URL del proyecto y su clave pública publishable. Nunca uses secret key, service_role, contraseña ni token personal.
5. Sube los cambios y espera el despliegue de GitHub Pages.
6. Envía una respuesta de prueba e inicia sesión en /admin.html para verificar que aparece. Confirma también que una consulta sin sesión no pueda leer respuestas.

La sesión del panel se conserva solo en memoria; al recargar debes entrar otra vez. Al vencer, cierra sesión y vuelve a entrar. Muestra las 200 respuestas más recientes. La hora elegida no incluye fecha. La fecha de recepción se muestra en hora de Ciudad de México.

Mientras config.js esté vacío, el panel muestra configuración pendiente y no se pueden guardar respuestas. No existe contraseña universal de administrador.

Documentación: https://supabase.com/docs/guides/database/postgres/row-level-security
