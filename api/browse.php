<?php

$dbprefix = elgg_get_config('dbprefix');

$container_guid = (int) get_input('containerGuid');
$user = elgg_get_logged_in_user_entity();

$limit = (int) get_input('limit', 20);
$offset = (int) get_input('offset', 0);

if ($limit < 1 | $limit > 50) {
    $limit = 20;
}

if ($offset < 0) {
    $offset = 0;
}

$order_by = get_input('orderBy', 'title');
$direction = get_input('direction', 'asc');

if (!in_array($order_by, array('title', 'time_created', 'time_updated', 'access_id'))) {
    $order_by = 'time_created';
}

if (!in_array($direction, array('asc', 'desc'))) {
    $direction = 'asc';
}

if ($container_guid) {
    $container = get_entity($container_guid);
}

$json = array();

if ($container) {
    $json['guid'] = $container->guid;
    $json['canWrite'] = $container->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT) && $container->canWriteToContainer(0, 'object', PLEIOFILE_FOLDER_OBJECT);

    if ($container instanceof ElggUser | $container instanceof ElggGroup) {
        $json['title'] = $container->name;
        $json['accessId'] = get_default_access();
        $json['writeAccessId'] = ACCESS_PRIVATE;
    } else {
        $json['title'] = $container->title;
        $json['accessId'] = (int) $container->access_id;
        $json['writeAccessId'] = $container->write_access_id ? $container->write_access_id : ACCESS_PRIVATE;
    }
} else {
    $json['guid'] = 0;
    $json['accessId'] = (int) get_default_access();
    $json['writeAccessId'] = ACCESS_PRIVATE;
    $json['canWrite'] = false;
}

$breadcrumb = array();
if ($container instanceof ElggObject) {
    $breadcrumb[] = array(
        'guid' => $container->guid,
        'title' => $container->title
    );

    $parent_guid = $container->parent_guid;
    while ($parent_guid !== 0 && $loops < 15) {
        $parent = get_entity($parent_guid);
        $breadcrumb[] = array(
            'guid' => $parent->guid,
            'title' => $parent->title
        );

        $parent_guid = $parent->parent_guid;
        $loops++;
    }
}

$json['breadcrumb'] = array_reverse($breadcrumb);

if ($container) {
    $file_options = array(
        'type' => 'object',
        'subtype' => 'file'
    );

    $folder_options = array(
        'type' => 'object',
        'subtype' => 'folder'
    );

    if ($container instanceof ElggUser | $container instanceof ElggGroup) {
        // we are in the root folder of a user or group
        $file_options['container_guid'] = $container->guid;
        $file_options['wheres'] = "NOT EXISTS (SELECT 1 FROM {$dbprefix}entity_relationships r WHERE r.guid_two = e.guid AND r.relationship = 'folder_of')";
        $folder_options['container_guid'] = $container->guid;
        $folder_options['metadata_name_value_pairs'] = array(array(
                'name' => 'parent_guid',
                'value' => 0
        ));
    } else {
        // we are in a subfolder
        $file_options['container_guid'] = $container->container_guid;
        $file_options['relationship'] = "folder_of";
        $file_options['relationship_guid'] = $container->guid;
        $folder_options['container_guid'] = $container->container_guid;
        $folder_options['metadata_name_value_pairs'] = array(array(
                'name' => 'parent_guid',
                'value' => $container->guid
        ));
    }

    $folder_count = elgg_get_entities_from_metadata(array_merge($folder_options, array(
        'count' => true
    )));

    $folder_options['limit'] = get_input('limit');
    $folder_options['offset'] = get_input('offset');

    $entities = array_merge(
        elgg_get_entities_from_metadata($folder_options),
        elgg_get_entities_from_relationship($file_options)
    );

} else {
    $options = array(
        'type' => 'object',
        'subtype' => 'file',
        'offset' => $offset,
        'limit' => $limit
    );

    $entities = elgg_get_entities($options);
}

$json['children'] = array();
foreach ($entities as $entity) {
    $json['children'][] = array(
        'guid' => $entity->guid,
        'subtype' => $entity->getSubtype(),
        'title' => htmlspecialchars_decode($entity->title, ENT_QUOTES),
        'accessId' => (int) $entity->access_id,
        'writeAccessId' => (int) ($entity->write_access_id) ? $entity->write_access_id : ACCESS_PRIVATE,
        'canEdit' => $entity->canEdit(),
        'createdByGuid' => $entity->getOwnerEntity()->guid,
        'createdByName' => $entity->getOwnerEntity()->name,
        'tags' => $entity->tags ? $entity->tags : array(),
        'timeCreated' => date('c', $entity->time_created),
        'timeUpdated' => date('c', $entity->time_updated),
        'url' => $entity->getURL()
    );
}

header('Content-Type: application/json');
echo json_encode($json, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);