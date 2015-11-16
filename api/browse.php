<?php

gatekeeper();

$path = get_input('path');

$container_guid = $path[0];
$container_path = array_slice($path, 1);
$container = get_entity($container_guid);

if ($container) {
    $browser = new ElggFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

$json = array();
$json['title'] = $container->name;

$json['breadcrumb'] = array();
foreach ($container_path as $item) {
    $item = get_entity($item);
    $json['breadcrumb'][] = array(
        'guid' => $item->guid,
        'title' => $item->title
    );
}

$json['children'] = array();
$children = $browser->getFolderContents($container_path);
foreach ($children as $child) {
    $attributes = array(
        'title' => htmlspecialchars_decode($child->title, ENT_QUOTES),
        'is_dir' => $child instanceof ElggFile ? false : true,
        'is_writable' => $child->canEdit(),
        'access_id' => $child->access_id,
        'time_updated' => date('c', $child->time_updated),
        'path' => implode(array_merge($path, array($child->guid)), '/')
    );

    $json['children'][] = $attributes;
}

header('Content-Type: application/json');
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);