<?php
gatekeeper();

$guid = get_input('guid');
$item = get_entity($guid);
if (!$item) {
    http_response_code(404);
    exit();
}

if (!$item->canEdit()) {
    http_response_code(403);
    exit();
}

$browser = new PleioFileBrowser();
if ($item instanceof ElggFile) {
    $browser->deleteFile($item);
} else {
    $browser->deleteFolder($item);
}