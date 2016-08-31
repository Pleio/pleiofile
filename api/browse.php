<?php
$browser = new PleioFileBrowser();
$dbprefix = elgg_get_config('dbprefix');

$container_guid = (int) get_input('containerGuid');
$limit = (int) get_input('limit', 100);
$offset = (int) get_input('offset', 0);

$user = elgg_get_logged_in_user_entity();

if ($limit < 1 | $limit > 100) {
    $limit = 100;
}

if ($offset < 0) {
    $offset = 0;
}

if ($container_guid) {
    $container = get_entity($container_guid);
} else {
    $container = null;
}

$json = array();
if ($container) {
    $json['guid'] = $container->guid;

    if ($container instanceof ElggUser | $container instanceof ElggGroup) {
        elgg_set_page_owner_guid($container->guid);
        $json['title'] = $container->name;
        $json['accessId'] = get_default_access();
        $json['writeAccessId'] = ACCESS_PRIVATE;
        $json['canWriteFiles'] = $container->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT);
        $json['canWriteFolders'] = $container->canWriteToContainer(0, 'object', PLEIOFILE_FOLDER_OBJECT);
    } else {
        elgg_set_page_owner_guid($container->getContainerEntity()->guid);
        $json['title'] = $container->title;
        $json['accessId'] = (int) $container->access_id;
        $json['writeAccessId'] = $container->write_access_id ? $container->write_access_id : ACCESS_PRIVATE;
        $json['canWriteFiles'] = $container->getContainerEntity()->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT);
        $json['canWriteFolders'] = $container->getContainerEntity()->canWriteToContainer(0, 'object', PLEIOFILE_FOLDER_OBJECT);
    }
} else {
    $json['guid'] = 0;
    $json['accessId'] = (int) get_default_access();
    $json['writeAccessId'] = ACCESS_PRIVATE;

    if ($user) {
        $json['canWriteFiles'] = $user->canWriteToContainer(0, 'object', PLEIOFILE_FILE_OBJECT);
        $json['canWriteFolders'] = false;
    } else {
        $json['canWriteFiles'] = false;
        $json['canWriteFolders'] = false;
    }
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

list($total, $children) = $browser->getFolderContents($container, $limit, $offset);

$json['total'] = $total;
$json['limit'] = $limit;
$json['offset'] = $offset;

$json['children'] = array();
foreach ($children as $entity) {
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