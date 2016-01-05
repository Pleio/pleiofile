<?php
$container_guid = elgg_extract("container_guid", $vars, elgg_get_page_owner_guid());
$current_folder	= elgg_extract("folder", $vars);

$browser = new PleioFileBrowser();
$container = get_entity($container_guid);

$parse_folder = function($folder, $prefix = "") use (&$parse_folder) {
    if ($folder['folder'] instanceof ElggUser | $folder['folder'] instanceof ElggGroup) {
        $title = elgg_echo('pleiofile:main_folder');
    } else {
        $title = $folder['folder']->title;
    }

    $json = array();
    $json[$folder['folder']->guid] = $prefix . ' ' . $title;

    $children = array();
    foreach ($folder['children'] as $child) {
        $children = $children + $parse_folder($child, $prefix . '-');
    }

    return $json + $children;
};

$vars["options_values"] = $parse_folder($browser->getFolderTree($container));
$vars["value"] = $current_folder;

echo elgg_view("input/dropdown", $vars);
