<?php

elgg_push_context('group');
elgg_push_context('pleiofile');

$folder_guid = get_input('folder_guid');
$folder = get_entity($folder_guid);

if ($folder instanceof ElggUser | $folder instanceof ElggGroup) {
    elgg_set_page_owner_guid($folder->guid);
} else {
    elgg_set_page_owner_guid($folder->container_guid);
}

if (!$folder) {
    http_response_code(404);
    exit();
}

$json = array();
$json['guid'] = $folder->guid;
$json['is_writable'] = $folder->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT) && $folder->canWriteToContainer(0, 'object', PLEIOFILE_FOLDER_OBJECT);

if ($folder instanceof ElggUser | $folder instanceof ElggGroup) {
    $json['title'] = $folder->name;
    $json['access_id'] = get_default_access();
} else {
    $json['title'] = $folder->title;
    $json['access_id'] = $folder->access_id;
}

$browser = new PleioFileBrowser();

$json['breadcrumb'] = array();

foreach ($browser->getPath($folder) as $item) {
    $json['breadcrumb'][] = array(
        'guid' => $item->guid,
        'title' => $item->title
    );
}

$json['children'] = array();
$children = $browser->getFolderContents($folder);
foreach ($children as $child) {
    $attributes = array(
        'guid' => $child->guid,
        'title' => htmlspecialchars_decode($child->title, ENT_QUOTES),
        'is_dir' => $child instanceof ElggFile ? false : true,
        'is_writable' => $child->canEdit(),
        'access_id' => $child->access_id,
        'created_by' => $child->getOwnerEntity()->name,
        'time_updated' => date('c', $child->time_updated)
    );

    if ($child instanceof ElggFile) {
        $attributes['url'] = $child->getURL();
    }

    $json['children'][] = $attributes;
}

header('Content-Type: application/json');
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

elgg_pop_context();
elgg_pop_context();