<?php

gatekeeper();

$path = pleiofile_explode_path(get_input('path'));

$container = get_entity($path[0]);
if ($container) {
    $browser = new PleioFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

$container_path = array_slice($path, 1);

try {
    $browser->updateFile($container_path, array(
        'title' => get_input('title'),
        'access_id' => (int) get_input('access_id')
    ));
} catch (Exception $e) {
    http_response_code(403);
}