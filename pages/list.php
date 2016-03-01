<?php

global $CONFIG;

elgg_load_js('jquery-19');
elgg_load_js('jquery-noconflict');
elgg_load_js('formdata-polyfill');
elgg_load_js('bootstrap');

elgg_load_css('bootstrap');
elgg_load_css('pleiofile');

$page_owner = elgg_get_page_owner_entity();
if (!$page_owner) {
    register_error(elgg_echo("pleiofile:entity_not_found"));
    forward();
}

$title_text = elgg_echo("file:user", array($page_owner->name));

elgg_push_context('pleiofile');

$params = array(
    "title" => $title_text,
);

if ($page_owner instanceof ElggGroup) {
    $params['filter'] = false;
} else {
    if($page_owner->getGUID() == elgg_get_logged_in_user_guid()){
        $params["filter_context"] = "mine";
    } else {
        $params["filter_context"] = $page_owner->username;
    }
}

$data = array(
    'containerGuid' => $page_owner->getGUID(),
    'accessIds' => get_write_access_array(),
    'odt_enabled' => elgg_is_active_plugin('odt_editor') ? true : false
);

$params['content'] = "<script> var _appData = " . json_encode($data) . "; </script>";
$params['content'] .= "<div id=\"pleiobox\"></div>";
$params['content'] .= "<script src=\"/mod/pleiofile/static/js/build/pleiofile.js\"></script>";

echo elgg_view_page($title_text, elgg_view_layout("content", $params));

elgg_pop_context();
