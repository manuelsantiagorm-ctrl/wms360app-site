# Invitación en Hostinger

Requiere hosting con PHP 8.1 o superior y almacenamiento persistente. No funciona como una página estática en GitHub Pages. GitHub guarda el código; Hostinger ejecuta PHP y guarda las respuestas.

1. Sube el contenido de esta carpeta a `public_html` (o a una subcarpeta del dominio), con PHP habilitado y HTTPS activo.
2. Genera un hash de tu contraseña en una terminal con PHP: `php -r 'echo password_hash(readline("Contraseña: "), PASSWORD_DEFAULT), PHP_EOL;'`. No uses un generador de contraseñas de terceros.
3. Copia `config.example.php` a `config.local.php` en el servidor y coloca el hash generado en `admin_hash`. El archivo local y los datos están excluidos de Git.
4. Comparte la dirección de `index.html`. Para consultar respuestas entra a `admin.php` en la misma carpeta y escribe tu contraseña.
5. Prueba con una respuesta antes de compartir. Confirma que aparezca en el panel. No se solicita una fecha: la hora corresponde al día que acuerden por separado.

Las respuestas se guardan en `datos/respuestas.php` con bloqueo para escrituras concurrentes. PHP impide que ese archivo entregue los datos directamente. No despliegues esta carpeta en un servidor que sirva archivos PHP como texto. Conserva `datos/` y `config.local.php` al actualizar desde GitHub; configura el despliegue sin borrar esos archivos. Inclúyelos en las copias de seguridad privadas del hosting.

Para probar localmente con PHP: `php -S 127.0.0.1:8080 -t invitacion` desde la raíz del proyecto. Abre `http://127.0.0.1:8080/`. Abrir el HTML como archivo permite ver el diseño y el modal, pero no guardar respuestas.

El panel requiere actualizar la página para ver nuevas respuestas. No envía mensajes ni notificaciones.
