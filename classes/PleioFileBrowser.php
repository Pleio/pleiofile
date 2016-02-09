<?php

class PleioFileBrowser {

    public function getPath($folder) {
        $path = array();

        if ($folder instanceof ElggUser | $folder instanceof ElggGroup) {
            return $path;
        }

        $path[] = $folder;

        $parent = get_entity($folder->parent_guid);
        while ($parent) {
            $path[] = $parent;
            $parent = get_entity($parent->parent_guid);
        }

        return array_reverse($path);
    }

    public function getFolderTree($container) {
        $db_prefix = elgg_get_config("dbprefix");
        $options = array(
            'type' => 'object',
            'subtype' => 'folder',
            'container_guid' => $container->guid,
            'limit' => 1000,
            'joins' => "JOIN {$db_prefix}objects_entity oe ON e.guid = oe.guid",
            'order_by' => 'oe.title ASC'
        );

        $children = array();
        foreach (elgg_get_entities($options) as $folder) {
            if (!array_key_exists($folder->parent_guid, $children)) {
                $children[$folder->parent_guid] = array();
            }
            $children[$folder->parent_guid][] = $folder;
        }

        $get_folder = function($parent_guid) use (&$get_folder, $children) {
			$result = array();

			if (array_key_exists($parent_guid, $children)) {
				foreach ($children[$parent_guid] as $child) {
					$result[] = array(
						'folder' => $child,
						'children' => $get_folder($child->guid)
					);
					$i++;
				}
			}

			return $result;
		};

		return array(
            'folder' => $container,
            'children' => $get_folder(0)
        );
    }

    public function getFolderContents($folder) {
        if ($folder instanceof ElggUser | $folder instanceof ElggGroup) {
            $container = $folder;
        } else {
            $container = $folder->getContainerEntity();
        }

        $db_prefix = elgg_get_config("dbprefix");

        $options = array(
            'type' => 'object',
            'subtype' => 'file',
            'container_guid' => $container->guid,
            'limit' => 100,
            'joins' => "JOIN {$db_prefix}objects_entity oe ON e.guid = oe.guid",
            'order_by' => 'oe.title ASC'
        );

        if ($folder instanceof ElggUser | $folder instanceof ElggGroup) {
            $parent_guid = 0;
            $options['wheres'] = "NOT EXISTS (
                    SELECT 1 FROM {$db_prefix}entity_relationships r
                    WHERE r.guid_two = e.guid AND
                    r.relationship = 'folder_of')";
            $files = elgg_get_entities($options);
        } else {
            $parent_guid = $folder->guid;
            $options['relationship'] = "folder_of";
            $options['relationship_guid'] = $parent_guid;
            $files = elgg_get_entities_from_relationship($options);
        }

        $options = array(
            'type' => 'object',
            'subtype' => 'folder',
            'container_guid' => $container->guid,
            'limit' => 100,
            'metadata_name_value_pairs' => array(array(
                'name' => 'parent_guid',
                'value' => $parent_guid
            )),
            'joins' => "JOIN {$db_prefix}objects_entity oe ON e.guid = oe.guid",
            'order_by' => 'oe.title ASC'
        );

        $folders = elgg_get_entities_from_metadata($options);

        return array_merge($folders, $files);
    }

    public function createFolder($parent, $params = array()) {
        if ($parent instanceof ElggUser | $parent instanceof ElggGroup) {
            $container = $parent;
        } else {
            $container = $parent->getContainerEntity();
        }

        $folder = new ElggObject();
        $folder->subtype = 'folder';
        $folder->title = $params['title'];
        $folder->container_guid = $container->guid;
        $folder->tags = $params['tags'];

        if ($parent instanceof ElggObject) { // lower level folder
            $folder->parent_guid = $parent->guid;
        } elseif ($parent instanceof ElggUser | $parent instanceof ElggGroup) { // top level folder
            $folder->parent_guid = 0;
        }

        if (isset($params['access_id'])) {
            $folder->access_id = $params['access_id'];
        } else {
            if ($parent instanceof ElggObject) {
                $folder->access_id = $parent->access_id;
            } elseif ($parent instanceof ElggGroup) {
                $folder->access_id = $parent->group_acl;
            }
        }

        return $folder->save();
    }

    public function updateFolder($folder, $params = array()) {
        $folder->title = $params['title'];
        $folder->access_id = $params['access_id'];
        $folder->tags = $params['tags'];

        if ($params['parent_guid'] && $folder->parent_guid !== $folder->guid) {
            if ($params['parent_guid'] == $folder->container_guid) {
                $params['parent_guid'] = 0;
            }

            $folder->parent_guid = $params['parent_guid'];
        }

        return $folder->save();
    }

    public function deleteFolder($folder) {
        if (!$folder instanceof ElggObject) {
            return false;
        }

        $objects = $this->getFolderContents($folder);
        foreach ($objects as $object) {
            $subtype = $object->getSubtype();
            if ($subtype == 'folder') {
                $this->deleteFolder($object);
            } elseif ($subtype == 'file') {
                $object->delete();
            }
        }

        $folder->delete();
    }

    public function createFile($parent, $params = array()) {
        if ($parent instanceof ElggUser | $parent instanceof ElggGroup) {
            $container = $parent;
        } else {
            $container = $parent->getContainerEntity();
        }

        if (!$params['access_id']) {
            if ($parent instanceof ElggObject) { // lower level folder
                $access_id = $parent->access_id;
            } elseif ($parent instanceof ElggGroup) { // top level folder
                $access_id = $parent->group_acl;
            }
        } else {
            $access_id = $params['access_id'];
        }

        $file = new FilePluginFile();
        $file->title = $params['filename'];
        $file->access_id = $access_id;
        $file->container_guid = $container->guid;

        $filestorename = elgg_strtolower(time() . $params['filename']);
        $file->setFilename("file/" . $filestorename);
        $file->originalfilename = $params['filename'];

        if ($params['stream']) {
            file_put_contents($file->getFilenameOnFilestore(), $params['stream']);
        } else {
            $input = fopen("php://input", "r");
            file_put_contents($file->getFilenameOnFilestore(), $input);
        }

        $mime_type = ElggFile::detectMimeType($file->getFilenameOnFilestore(), $params['type']);
        $file->setMimeType($mime_type);
        $file->simpletype = file_get_simple_type($mime_type);

        $file->save();

        if ($parent instanceof ElggObject) {
            add_entity_relationship($parent->guid, "folder_of", $file->guid);
        }

        pleiofile_generate_file_thumbs($file);
    }

    public function updateFile($file, $params = array()) {
        if (!$file->canEdit()) {
            return true;
        }

        if ($params['parent_guid']) {
            $parent = get_entity($params['parent_guid']);
        }

        if (!$parent) {
            $parents = $file->getEntitiesFromRelationship(array(
                'relationship' => "folder_of",
                'inverse' => true
            ));

            if ($parents) {
                $parent = $parents[0];
            } else {
                $parent = $file->getContainerEntity();
            }
        }

        $file->title = $params['title'];
        $file->access_id = $params['access_id'];
        $file->tags = $params['tags'];
        $result = $file->save();

        if ($parent instanceof ElggObject) {
            add_entity_relationship($parent->guid, "folder_of", $file->guid);
        } elseif ($parent instanceof ElggGroup) {
            remove_entity_relationships($file->guid, "folder_of", true);
        }

        return $result;

    }

    public function downloadFile($file) {
        if (!$file instanceof ElggFile) {
            throw new Exception('Could not find this specific file.');
        }

        $mime = $file->getMimeType();
        if (!$mime) {
            $mime = "application/octet-stream";
        }

        $filename = $file->originalfilename;

        header("Content-Type: $mime");
        header("Content-Disposition: attachment; filename=\"$filename\"");
        header("Content-Length: " . filesize($file->getFilenameOnFilestore()));

        ob_clean();
        flush();
        readfile($file->getFilenameOnFilestore());
        exit;
    }

    public function deleteFile($file) {
        if (!$file instanceof ElggFile) {
            throw new Exception('This is not an ElggFile object.');
        }

        return $file->delete();
    }
}
