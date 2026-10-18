<?php
declare(strict_types=1);
require __DIR__ . '/privado.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit(json_encode(['ok' => false]));
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2048) {
    http_response_code(413);
    exit(json_encode(['ok' => false]));
}
try {
    $input = json_decode(file_get_contents('php://input', false, null, 0, 2049), true, 16, JSON_THROW_ON_ERROR);
    $foods = ['No lo sé, escoge tú', 'Hamburguesa de Burger King', 'Tacos', 'Birria', 'Tacos de sal'];
    if (!is_array($input) || !in_array($input['food'] ?? null, $foods, true)
        || !is_string($input['time'] ?? null) || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $input['time'])) {
        http_response_code(422);
        exit(json_encode(['ok' => false]));
    }
    if (!is_dir(dirname(ANSWER_FILE)) && !mkdir(dirname(ANSWER_FILE), 0700, true)) throw new RuntimeException();
    $file = fopen(ANSWER_FILE, 'c+');
    if (!$file || !flock($file, LOCK_EX)) throw new RuntimeException();
    $prefix = "<?php exit; ?>\n";
    $raw = stream_get_contents($file);
    $answers = $raw === '' ? [] : json_decode(substr($raw, strlen($prefix)), true, 512, JSON_THROW_ON_ERROR);
    $answers[] = ['food' => $input['food'], 'time' => $input['time'], 'received_at' => gmdate('c')];
    $output = $prefix . json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    rewind($file);
    if (fwrite($file, $output) !== strlen($output)) throw new RuntimeException();
    ftruncate($file, strlen($output));
    fflush($file);
    flock($file, LOCK_UN);
    fclose($file);
    echo json_encode(['ok' => true]);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false]);
}
