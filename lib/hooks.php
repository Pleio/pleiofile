<?php

function pleiofile_permissions_check($hook_name, $entity_type, $return_value, $parameters) {
    $user = $parameters['user'];
    $entity = $parameters['entity'];

    if (!$user | !$entity) {
        return $return_value;
    }

    if ($subtype && !in_array($subtype, array(PLEIOFILE_FILE_OBJECT, PLEIOFILE_FOLDER_OBJECT))) {
        return $return_value;
    }

    // by default Elgg allows only owners (and admins) to write to entities, we would like to extend this with users in list $entity->write_access_id

    if ($return_value === true) {
        return true;
    }

    $write_permission = $entity->write_access_id;
    if (!$write_permission) {
        $write_permission = ACCESS_PRIVATE;
    }

    switch ($write_permission) {
        case ACCESS_PRIVATE:
            return $return_value;
            break;
        case ACCESS_FRIENDS:
            $owner = $params['entity']->getOwnerEntity();
            if ($owner && $owner->isFriendsWith($user->guid)) {
                return true;
            }
            break;
        default:
            $list = get_access_array($user->guid);
            if (in_array($write_permission, $list)) {
                // user in the access collection
                return true;
            }
            break;
    }
}

function pleiofile_container_permissions_check($hook_name, $entity_type, $return_value, $parameters) {
    $user = $parameters['user'];
    $container = $parameters['container'];
    $subtype = $parameters['subtype'];

    if (!$user | !$container) {
        return $return_value;
    }

    if ($subtype && !in_array($subtype, array(PLEIOFILE_FILE_OBJECT, PLEIOFILE_FOLDER_OBJECT))) {
        return $return_value;
    }

    if (!$container instanceof ElggGroup) {
        return $return_value;        
    }

    // by default Elgg allows all members of the group to write to the group. The admin has a switch to disable writing files and folders for all users entirely.
    if (!$container->canEdit() && $container->pleiofile_management_can_add_enable === "no") {
        return false;
    }
}

function pleiofile_folder_icon_hook($hook, $type, $returnvalue, $params) {
    $result = $returnvalue;

	if (empty($params) | !is_array($params)) {
        return $result;
    }

    $entity = elgg_extract("entity", $params);
	$size = elgg_extract("size", $params, "small");

    if (!elgg_instanceof($entity, "object", "folder")) {
        return $result;
    }

	switch($size){
		case "topbar":
		case "tiny":
		case "small":
			$result = "mod/pleiofile/graphics/folder/" . $size . ".png";
			break;
		default:
			$result = "mod/pleiofile/graphics/folder/medium.png";
			break;
	}

    return $result;
}

function pleiofile_menu_title_hook_handler($hook, $type, $returnvalue, $params) {
    if (!elgg_in_context("file")) {
        return $returnvalue;
    }

    foreach ($returnvalue as $key => $item) {
        if ($item->getName() == "add") {
            unset($returnvalue[$key]);
        }
    }

    return $returnvalue;
}

function pleiofile_menu_filter_hook_handler($hook, $type, $returnvalue, $params) {
	if (!elgg_in_context("file")) {
        return $returnvalue;
	}

    foreach ($returnvalue as $key => $item) {
        switch ($item->getName()) {
            case "friend":
                unset($returnvalue[$key]);
                break;
            case "all":
                $item->setHref("/file/all");
                break;
        }
    }

	return $returnvalue;
}