<?php
/**
* Pleiofile
*
* @package pleiofile
* @author Stichting Pleio
* @link https://www.pleio.nl
*/

define("PLEIOFILE_FILE_OBJECT", "file");
define("PLEIOFILE_FOLDER_OBJECT", "folder");

include_once(dirname(__FILE__) . "/lib/hooks.php");

function pleiofile_init() {
    elgg_register_js("jquery-19", "https://code.jquery.com/jquery-1.9.1.min.js", 'head', -100);
    elgg_register_js("bootstrap", "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js", 'head', -99);
    elgg_register_js("jquery-noconflict", "mod/pleiofile/static/js/build/jquery-noconflict.js", 'head', -98);
    elgg_register_js("formdata-polyfill", "mod/pleiofile/static/js/formdata-polyfill.js", 'head', -97);

    elgg_register_css("bootstrap", "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
    elgg_register_css("pleiofile", "mod/pleiofile/static/css/pleiofile.css");

    elgg_register_page_handler("pleiofile", "pleiofile_page_handler");

    $base = dirname(__FILE__) . "/actions/";
    elgg_register_action("pleiofile/create_folder", $base . "create_folder.php");
    elgg_register_action("pleiofile/update_folder", $base . "update_folder.php");
    elgg_register_action("pleiofile/delete", $base . "delete.php");
    elgg_register_action("pleiofile/download", $base . "download.php");
    elgg_register_action("pleiofile/upload", $base . "upload.php");
    elgg_register_action("pleiofile/update_file", $base . "update_file.php");

    add_group_tool_option("pleiofile_management_can_add", elgg_echo("pleiofile:file_management:can_add"));
    add_group_tool_option("pleiofile_management_can_edit", elgg_echo("pleiofile:file_management:can_edit"), false);

    elgg_register_plugin_hook_handler("route", "file", "pleiofile_file_route_hook");

    // overwrite write permissions, see http://learn.elgg.org/en/latest/guides/permissions-check.html
    elgg_register_plugin_hook_handler("permissions_check", "all", "pleiofile_permissions_check");
    elgg_register_plugin_hook_handler("container_permissions_check", "all", "pleiofile_container_permissions_check");

    // @todo!
    elgg_register_widget_type("group_files", elgg_echo("file:group"), elgg_echo("widgets:group_files:description"), "groups");
    elgg_register_widget_type("index_file", elgg_echo("file"), elgg_echo("widgets:index_file:description"), "index", true);

    elgg_register_entity_url_handler("object", PLEIOFILE_FILE_OBJECT, "pleiofile_file_url_handler");
    elgg_register_entity_url_handler("object", PLEIOFILE_FOLDER_OBJECT, "pleiofile_folder_url_handler");
}

elgg_register_event_handler("init", "system", "pleiofile_init");
elgg_register_event_handler("pagesetup", "system", "pleiofile_pagesetup");

function pleiofile_pagesetup() {
    $page_owner = elgg_get_page_owner_entity();
    if ($page_owner->file_enable == "no") {
        elgg_unregister_widget_type("group_files");
    }
}

function pleiofile_explode_path($path) {
    $path = explode('/', $path);
    return array_values(array_filter($path, 'strlen'));
}

function pleiofile_file_route_hook($hook, $type, $returnvalue, $params) {
    $result = $returnvalue;

    if (!isset($result) | !is_array($result)) {
        return $result;
    }

    $url = elgg_extract("segments", $result);

    pleiofile_set_page_owner($url);

    switch ($url[0]) {
        case "group":
            $returnvalue = false;
            include(dirname(__FILE__) . "/pages/list.php");
            break;
        case "add":
            // remain compatible with file plugin add url
            forward("/file/group/" . $url[1] . "/all");
            break;
    }

    return $returnvalue;
}

function pleiofile_page_handler($url) {
    gatekeeper();
    pleiofile_set_page_owner($url);

    switch ($url[0]) {
        case "browse":
            set_input('path', array_slice($url, 1));
            include("api/browse.php");
            return true;
            break;
    }

    return false;
}

function pleiofile_set_page_owner($url) {
    $entity = get_entity($url[1]);
    if ($entity instanceof ElggGroup) {
        elgg_set_page_owner_guid($entity->guid);
        elgg_push_context('group');
    } elseif ($entity instanceof ElggUser) {
        elgg_set_page_owner_guid($entity->guid);
        elgg_push_context('user');
    } else {
        return false;
    }

    return true;
}

function pleiofile_file_url_handler($entity) {
    if (pleiofile_is_odt($entity)) {
        return "file/view/" . $entity->getGUID() . "/" . elgg_get_friendly_title($entity->title);
    }

    if (elgg_in_context("pleiofile")) {
        return "file/download/" . $entity->getGUID();
    } else {
        return "file/view/" . $entity->getGUID() . "/" . elgg_get_friendly_title($entity->title);
    }
}

function pleiofile_folder_url_handler($entity) {
    $container = $entity->getContainerEntity();

    if(elgg_instanceof($container, "group")){
        $result = "file/group/" . $container->getGUID() . "/all#" . $entity->getGUID();
    } else {
        $result = "file/owner/" . $container->username . "#" . $entity->getGUID();
    }

    return $result;
}

function pleiofile_is_odt(ElggFile $file) {
    if (!elgg_is_active_plugin("odt_editor")) {
        return false;
    }

    if ($file->getMimetype() == "application/vnd.oasis.opendocument.text") {
        return true;
    } else {
        return false;
    }
}