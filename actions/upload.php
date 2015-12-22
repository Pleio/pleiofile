<?php
gatekeeper();

$parent_guid = get_input('parent_guid');
$parent = get_entity($parent_guid);

if (!$parent) {
    http_response_code(404);
    exit();
}

if (!$parent->canWriteToContainer()) {
    http_response_code(403);
    exit();
}

if ($_FILES['file']['error'] !== 0) {
    http_response_code(500);
    exit();
}

$browser = new PleioFileBrowser();

try {
    $browser->createFile($parent, array(
        'filename' => $_FILES['file']['name'],
        'stream' => file_get_contents($_FILES['file']['tmp_name']),
        'access_id' => get_input('access_id'),
        'type' => $_FILES['upload']['type']
    ));
} catch (Exception $e) {
    http_response_code(500);
    exit();
}

