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
    $options = array(
        'title' => get_input('title'),
        'access_id' => (int) get_input('access_id'),
        'write_access_id' => (int) get_input('write_access_id'),
        'tags' => string_to_tag_array(get_input('tags')),
        'parent_guid' => (int) get_input('parent_guid')
    );

    if (isset($_FILES['file'])) {
        $options['file'] = $_FILES['file'];
    }

    $browser->updateFile($file, $options);
} catch (Exception $e) {
    http_response_code(500);
}
