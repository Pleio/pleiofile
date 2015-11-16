<?php

gatekeeper();

$path = pleiofile_explode_path(get_input('path'));
$item = get_entity(array_slice($path, -1)[0]);

$container = get_entity($path[0]);

if ($container) {
    $browser = new ElggFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

$container_path = array_slice($path, 1);

if ($item instanceof ElggFile) {
    $container_path[] = "random_filename.txt";
    $browser->deleteFile($container_path);
} else {
    $browser->deleteFolder($container_path);
}