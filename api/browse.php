<?php

gatekeeper();

$path = get_input('path');

$container_guid = $path[0];
$container_path = array_slice($path, 1);
$container = get_entity($container_guid);

elgg_set_page_owner_guid($container->guid);

elgg_push_context('pleiofile');

if ($container) {
    $browser = new PleioFileBrowser($container->guid);
} else {
    http_response_code(404);
    exit();
}

$json = array();

if (count($container_path) == 0) {
    $json['title'] = $container->name;
    $json['access_id'] = get_default_access();
} else {
    $parent_guid = array_slice($path, -1)[0];
    $parent = get_entity($parent_guid);
    $json['title'] = $parent->title;
    $json['access_id'] = $parent->access_id;
}

$json['is_writable'] = $container->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT) && $container->canWriteToContainer(0, 'object', PLEIOFILE_FOLDER_OBJECT);

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
        'created_by' => $child->getOwnerEntity()->name,
        'time_updated' => date('c', $child->time_updated),
        'path' => $child instanceof ElggFile ? $child->getURL() : implode(array_merge($path, array($child->guid)), '/')
    );

    $json['children'][] = $attributes;
}

header('Content-Type: application/json');
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

elgg_pop_context();