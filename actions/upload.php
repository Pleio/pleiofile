<?php

gatekeeper();

$path = pleiofile_explode_path(get_input('path'));
$access_id = get_input('access_id');

$container_guid = $path[0];
$container_path = array_slice($path, 1);
$container = get_entity($container_guid);

if ($container) {
    $browser = new ElggFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

if ($_FILES['file']['error'] !== 0) {
    http_response_code(500);
    exit();
}

$filename = $_FILES['file']['name'];
$content = file_get_contents($_FILES['file']['tmp_name']);

try {
    $browser->createFile($container_path, $filename, $content, $access_id);
} catch (Exception $e) {
    http_response_code(500);
    exit();
}

