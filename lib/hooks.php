<?php

function pleiofile_permissions_check($hook_name, $entity_type, $return_value, $parameters) {
    $user = $parameters['user'];
    $entity = $parameters['entity'];

    if (!$user | !$entity) {
        return $return_value;
    }

    if ($entity->getType() !== "object" | !in_array($entity->getSubtype(), array(PLEIOFILE_FILE_OBJECT, PLEIOFILE_FOLDER_OBJECT))) {
        return $return_value;
    }

    if ($return_value === true) {
        return true;
    }

    $container = $entity->getContainerEntity();
    if (!$container instanceof ElggGroup) {
        return false;
    }

    $container = $entity->getContainerEntity();
    if ($container->isMember($user) && $container->pleiofile_management_can_edit_enable === "yes") {
        return true;
    } else {
        return false;
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

    if ($return_value === false) {
        return false;
    }

    if (!$container instanceof ElggGroup) {
        return $return_value;
    }

    if (!$container->canEdit() && $container->pleiofile_management_can_add_enable === "no") {
        return false;
    }

    return $return_value;
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