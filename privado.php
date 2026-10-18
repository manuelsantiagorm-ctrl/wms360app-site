<?php
declare(strict_types=1);
// Archivo compartido: no sirve datos directamente.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}
$config = is_file(__DIR__ . '/config.local.php') ? require __DIR__ . '/config.local.php' : [];
define('ADMIN_HASH', $config['admin_hash'] ?? getenv('INVITACION_ADMIN_HASH') ?: '');
define('ANSWER_FILE', __DIR__ . '/datos/respuestas.php');
function readAnswers(): array {
    if (!is_file(ANSWER_FILE)) return [];
    $file = fopen(ANSWER_FILE, 'r');
    if (!$file || !flock($file, LOCK_SH)) throw new RuntimeException('No se pudo leer.');
    $raw = stream_get_contents($file);
    flock($file, LOCK_UN);
    fclose($file);
    return json_decode(substr($raw, strlen("<?php exit; ?>\n")), true, 512, JSON_THROW_ON_ERROR);
}
function escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
