<?php

global $CONFIG;

elgg_load_js('jquery-19');
elgg_load_js('jquery-noconflict');
elgg_load_js('formdata-polyfill');
elgg_load_js('bootstrap');

elgg_load_css('bootstrap');
elgg_load_css('pleiofile');

gatekeeper();

$page_owner = elgg_get_page_owner_entity();
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
    'accessIds' => get_write_access_array()
);

$params['content'] = "<script> var _appData = " . json_encode($data) . "; </script>";
$params['content'] .= "<div id=\"pleiobox\"></div>";
$params['content'] .= "<script src=\"/mod/pleiofile/static/js/build/pleiofile.js\"></script>";

if ($CONFIG->dev_mode) {
    $params['content'] .= "<script type='text/javascript' id=\"__bs_script__\">//<![CDATA[
        document.write(\"<script async src='http://HOST:3000/browser-sync/browser-sync-client.2.10.0.js'><\/script>\".replace(\"HOST\", location.hostname));
    //]]></script>";
}

echo elgg_view_page($title_text, elgg_view_layout("content", $params));

elgg_pop_context();