<?php

gatekeeper();

$path = pleiofile_explode_path(get_input('path'));

$container = get_entity($path[0]);
if ($container) {
    $browser = new ElggFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

$container_path = array_slice($path, 1);
$container_path[] = get_input('title');

$access_id = get_input('access_id');

try {
    $browser->createFolder($container_path, $access_id);
} catch (Exception $e) {
    http_response_code(403);
}