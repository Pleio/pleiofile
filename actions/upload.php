<?php
gatekeeper();

$parent_guid = get_input('parent_guid');
if ($parent_guid != 0) {
    $parent = get_entity($parent_guid);
} else {
    $parent = elgg_get_logged_in_user_entity();
}

if (!$parent) {
    http_response_code(404);
    exit();
}

if ($parent instanceof ElggUser | $parent instanceof ElggGroup) {
    $container = $parent;
} else {
    $container = $parent->getContainerEntity();
}

if (!$container->canWriteToContainer()) {
    http_response_code(403);
    exit();
}

if ($_FILES['file']['error'] !== 0) {
    http_response_code(500);
    exit();
}

$browser = new PleioFileBrowser();

try {
    $file = $browser->createFile($parent, array(
        'file' => $_FILES['file'],
        'access_id' => get_input('access_id'),
        'write_access_id' => get_input('write_access_id')
    ));

    add_to_river('river/object/file/create', 'create', elgg_get_logged_in_user_guid(), $file->guid);
} catch (Exception $e) {
    http_response_code(500);
    exit();
}
