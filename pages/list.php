<?php
global $CONFIG;

elgg_load_css('pleiofile');
elgg_load_js('pleiofile');

$page_owner = elgg_get_page_owner_entity();

if ($page_owner) {
    $title_text = elgg_echo("file:user", array($page_owner->name));
} else {
    $title_text = elgg_echo("file");
}

$params = array(
    "title" => $title_text,
);

if ($page_owner instanceof ElggGroup) {
    $containerGuid = $page_owner->guid;
    $params['filter'] = false;
} elseif ($page_owner instanceof ElggUser) {
    $containerGuid = $page_owner->guid;
    if($page_owner->getGUID() == elgg_get_logged_in_user_guid()){
        $params["filter_context"] = "mine";
    } else {
        $params["filter_context"] = $page_owner->username;
    }
} else {
    $containerGuid = 0;
}

$data = array(
    'containerGuid' => $containerGuid,
    'accessIds' => get_write_access_array(),
    'isWidget' => false,
    'odt_enabled' => elgg_is_active_plugin('odt_editor') ? true : false
);

$params['content'] = "<script> var _appData = " . json_encode($data) . "; </script>";
$params['content'] .= "<div id=\"pleiofile\"></div>";

if ($page_owner instanceof ElggGroup && elgg_is_active_plugin('search')) {
    $params['sidebar'] = elgg_view('groups/sidebar/search', array('entity' => $page_owner));
}

echo elgg_view_page($title_text, elgg_view_layout("content", $params));