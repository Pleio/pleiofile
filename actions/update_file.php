<?php
gatekeeper();

$guid = get_input('guid');
$file = get_entity($guid);
if (!$file) {
    http_response_code(404);
    exit();
}

if (!$file->canEdit()) {
    http_response_code(403);
    exit();
}

$browser = new PleioFileBrowser();

try {
    $browser->updateFile($file, array(
        'title' => get_input('title'),
        'access_id' => (int) get_input('access_id')
    ));
} catch (Exception $e) {
    http_response_code(500);
}