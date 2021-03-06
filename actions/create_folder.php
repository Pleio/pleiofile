<?php
gatekeeper();

$parent_guid = get_input('parent_guid');
$parent = get_entity($parent_guid);
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

$browser = new PleioFileBrowser();

try {
    $browser->createFolder($parent, array(
        'title' => get_input('title'),
        'tags' => string_to_tag_array(get_input('tags')),
        'access_id' => (int) get_input('access_id'),
        'write_access_id' => (int) get_input('write_access_id')
    ));
} catch (Exception $e) {
    http_response_code(500);
}
