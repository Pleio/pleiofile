<?php

elgg_push_context('group');
elgg_push_context('pleiofile');

$container_guid = get_input('container_guid');
$container = get_entity($container_guid);

if (!$container) {
    http_response_code(404);
    exit();
}

if (!$container instanceof ElggUser && !$container instanceof ElggGroup) {
    http_response_code(404);
    exit();
}

$browser = new PleioFileBrowser();

$parse_folder = function($folder) use (&$parse_folder) {
    if ($folder['folder'] instanceof ElggUser | $folder['folder'] instanceof ElggGroup) {
        $title = elgg_echo('pleiofile:main_folder');
    } else {
        $title = $folder['folder']->title;
    }

    $json = array(
        'guid' => $folder['folder']->guid,
        'title' => $title
    );

    $json['children'] = array();
    foreach ($folder['children'] as $child) {
        $json['children'][] = $parse_folder($child);
    }

    return $json;
};

$list = $browser->getFolderTree($container);
$json = $parse_folder($list);

header('Content-Type: application/json');
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

elgg_pop_context();
elgg_pop_context();
