<?php
gatekeeper();

$guid = get_input('guid');
$folder = get_entity($guid);
if (!$folder) {
    http_response_code(404);
    exit();
}

if (!$folder->canEdit()) {
    http_response_code(403);
    exit();
}

$browser = new PleioFileBrowser();

try {
    $browser->updateFolder($folder, array(
        'title' => get_input('title'),
        'tags' => string_to_tag_array(get_input('tags')),
        'parent_guid' => get_input('parent_guid'),
        'access_id' => (int) get_input('access_id')
    ));
} catch (Exception $e) {
    http_response_code(500);
}
