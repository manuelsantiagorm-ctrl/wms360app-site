# Flores pintadas y panel privado

La portada solo muestra «¿Qué prefieres?» y cinco opciones. Al tocar una, se abre una vista de pintura que ocupa el viewport y la elección se envía automáticamente a Supabase. No hay botón de confirmar.

Cada flor tiene su propia pintura original con manos sosteniendo el ramo y un escenario distinto. Los PNG y los prompts están en assets/. pintura.js genera capas de pinceladas en canvas, desde masas de color hasta detalle, con una duración de 7.600 ms una vez cargada la imagen. Las imágenes empiezan a precargarse al abrir la pregunta. La animación se reproduce al elegir y puede repetirse o interrumpirse con los controles.

## Activar el guardado

Ejecuta flores.sql en SQL Editor del proyecto Supabase existente. Crea flower_responses y permite insertar una flor a visitantes y leer únicamente al usuario administrador configurado. No borra respuestas anteriores. Si la tabla todavía no existe, la pintura se reproduce pero aparece un aviso para reintentar el guardado.

admin.html consulta flores y respuestas anteriores usando el mismo correo/contraseña de Supabase Authentication. Las fechas se muestran en horario de Ciudad de México. config.js contiene únicamente la URL y clave pública. Nunca publiques claves secretas ni contraseñas.

La invitación anterior se conserva en cita.html. Las sesiones del administrador solo duran mientras la página permanece abierta. El panel muestra las 200 respuestas más recientes por tipo.

Verificación: node --test api.test.cjs
