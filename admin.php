<?php
declare(strict_types=1);
require __DIR__ . '/privado.php';
session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Strict', 'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'use_strict_mode' => true]);
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
$_SESSION['csrf'] ??= bin2hex(random_bytes(24));
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) {
        http_response_code(403);
        exit('Recarga la página e intenta de nuevo.');
    }
    if (isset($_POST['logout'])) {
        $_SESSION = [];
        session_destroy();
        header('Location: admin.php');
        exit;
    }
    if (ADMIN_HASH !== '' && password_verify((string)($_POST['password'] ?? ''), ADMIN_HASH)) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
    } else {
        $error = 'No se pudo iniciar sesión.';
    }
}
$answers = [];
if (!empty($_SESSION['admin'])) {
    try { $answers = array_reverse(readAnswers()); }
    catch (Throwable $e) { $error = 'No se pudieron cargar las respuestas. Intenta actualizar.'; }
}
?>
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Respuestas de la invitación</title>
<style>*{box-sizing:border-box}body{margin:0;padding:32px 20px;min-height:100vh;background:linear-gradient(145deg,#5483B3,#021024);color:#C1E8FF;font:16px/1.6 Arial,sans-serif}main{max-width:760px;margin:auto;padding:28px;background:#052659;border:1px solid #5483B3;border-radius:24px}h1{font:36px Georgia,serif}input,button{font:inherit;border:1px solid #5483B3;border-radius:12px;padding:12px}input{display:block;width:100%;margin:12px 0 20px;background:#021024;color:#C1E8FF}button{background:#C1E8FF;color:#021024;cursor:pointer}article{padding:18px;margin:18px 0;border:1px solid #5483B3;border-radius:16px}article p{margin:6px 0}small{color:#7DA0CA}.error{color:#C1E8FF;border-left:3px solid #7DA0CA;padding-left:12px}a{color:#C1E8FF}</style></head><body><main>
<h1>Las respuestas de tu invitación</h1>
<?php if ($error): ?><p class="error" role="alert"><?= escape($error) ?></p><?php endif; ?>
<?php if (empty($_SESSION['admin'])): ?>
<?php if (ADMIN_HASH === ''): ?>
<p>El panel está pendiente de configuración. Define la contraseña privada en el servidor siguiendo el archivo LEEME.md.</p>
<?php else: ?>
<form method="post"><input type="hidden" name="csrf" value="<?= escape($_SESSION['csrf']) ?>"><label for="password">Tu contraseña</label><input id="password" name="password" type="password" required autocomplete="current-password"><button>Entrar</button></form>
<?php endif; ?>
<?php else: ?>
<p><?= count($answers) ?> respuesta(s) recibida(s)</p>
<?php if (!$answers): ?><p>Todavía no hay respuestas. Aparecerán aquí cuando confirme la comida y la hora.</p><?php endif; ?>
<?php foreach ($answers as $answer): ?>
<article><p><strong>Comida:</strong> <?= escape($answer['food']) ?></p><p><strong>Hora elegida:</strong> <?= escape($answer['time']) ?></p><small>Recibida: <?= escape((new DateTimeImmutable($answer['received_at']))->setTimezone(new DateTimeZone('America/Mexico_City'))->format('d/m/Y H:i')) ?> (Ciudad de México)</small></article>
<?php endforeach; ?>
<p><a href="admin.php">Actualizar respuestas</a></p>
<form method="post"><input type="hidden" name="csrf" value="<?= escape($_SESSION['csrf']) ?>"><button name="logout" value="1">Cerrar sesión</button></form>
<?php endif; ?>
</main></body></html>
