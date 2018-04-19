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

include_once(dirname(__FILE__) . "/lib/functions.php");
include_once(dirname(__FILE__) . "/lib/hooks.php");

function pleiofile_init() {
    elgg_register_css("pleiofile", "mod/pleiofile/static/css/build/pleiofile.css");
    elgg_register_js("pleiofile", "mod/pleiofile/static/js/build/pleiofile.js", "footer");

    elgg_register_page_handler("pleiofile", "pleiofile_page_handler");

    $base = dirname(__FILE__) . "/actions/";
    elgg_register_action("pleiofile/create_folder", $base . "create_folder.php");
    elgg_register_action("pleiofile/edit_folder", $base . "edit_folder.php");
    elgg_register_action("pleiofile/delete", $base . "delete.php");
    elgg_register_action("pleiofile/upload", $base . "upload.php");
    elgg_register_action("pleiofile/edit_file", $base . "edit_file.php");

    add_group_tool_option("pleiofile_management_can_add", elgg_echo("pleiofile:file_management:can_add"));

    elgg_register_plugin_hook_handler("route", "file", "pleiofile_file_route_hook");

    // overwrite write permissions, see http://learn.elgg.org/en/latest/guides/permissions-check.html
    elgg_register_plugin_hook_handler("permissions_check", "all", "pleiofile_permissions_check");
    elgg_register_plugin_hook_handler("container_permissions_check", "all", "pleiofile_container_permissions_check");

    elgg_register_plugin_hook_handler("register", "menu:title", "pleiofile_menu_title_hook_handler");
    elgg_register_plugin_hook_handler("register", "menu:filter", "pleiofile_menu_filter_hook_handler");

    elgg_register_widget_type("group_files", elgg_echo("widgets:file_tree:title"), elgg_echo("widgets:file_tree:description"), "dashboard,profile,groups", true);

    elgg_register_entity_url_handler("object", PLEIOFILE_FILE_OBJECT, "pleiofile_file_url_handler");
    elgg_register_entity_url_handler("object", PLEIOFILE_FOLDER_OBJECT, "pleiofile_folder_url_handler");

    elgg_register_plugin_hook_handler("entity:icon:url", "object", "pleiofile_folder_icon_hook");
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
        case "all":
        case "owner":
        case "group":
            $returnvalue = false;
            include(dirname(__FILE__) . "/pages/list.php");
            break;
        case "view":
            $returnvalue = false;
            set_input("guid", $url[1]);
            include(dirname(__FILE__) . "/pages/view.php");
            break;
        case "add":
            // remain compatible with file plugin add url
            forward("/file/group/" . $url[1] . "/all");
            break;
    }

    return $returnvalue;
}

function pleiofile_page_handler($url) {
    switch ($url[0]) {
        case "folder_tree":
            include("api/folder_tree.php");
            return true;
        case "browse":
            include("api/browse.php");
            return true;
        case "bulk_download":
            include("api/bulk_download.php");
            return true;
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
    return "file/view/" . $entity->getGUID() . "/" . urlencode($entity->title);
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
