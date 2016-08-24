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

    private function getFiles($parent, $limit = 100, $offset = 0, $count = false) {
        $dbprefix = elgg_get_config("dbprefix");

        $options = array(
            'type' => 'object',
            'subtype' => 'file',
            'limit' => $limit,
            'offset' => $offset
        );

        if (!$count) {
            $options['joins'] = "JOIN {$dbprefix}objects_entity oe ON e.guid = oe.guid";
            $options['order_by'] = 'oe.title ASC';
        } else {
            $options['count'] = true;
        }

        if ($parent) {
            if ($parent instanceof ElggUser | $parent instanceof ElggGroup) {
                $options['container_guid'] = $parent->guid;
                $options['wheres'] = "NOT EXISTS (
                        SELECT 1 FROM {$dbprefix}entity_relationships r
                        WHERE r.guid_two = e.guid AND
                        r.relationship = 'folder_of')";
            } else {
                $options['container_guid'] = $parent->container_guid;
                $options['relationship'] = "folder_of";
                $options['relationship_guid'] = $parent->guid;
            }
        }

        return elgg_get_entities_from_relationship($options);
    }

    private function getFolders($parent, $limit = 100, $offset = 0, $count = false) {
        $dbprefix = elgg_get_config("dbprefix");

        $options = array(
            'type' => 'object',
            'subtype' => 'folder',
            'limit' => $limit,
            'offset' => $offset
        );

        if (!$count) {
            $options['joins'] = "JOIN {$dbprefix}objects_entity oe ON e.guid = oe.guid";
            $options['order_by'] = 'oe.title ASC';
        } else {
            $options['count'] = true;
        }

        if ($parent) {
            if ($parent instanceof ElggUser | $parent instanceof ElggGroup) {
                $options['container_guid'] = $parent->guid;
                $options['metadata_name_value_pairs'] = array(array(
                    'name' => 'parent_guid',
                    'value' => 0
                ));
            } else {
                $options['container_guid'] = $parent->container_guid;
                $options['metadata_name_value_pairs'] = array(array(
                    'name' => 'parent_guid',
                    'value' => $parent->guid
                ));
            }

            return elgg_get_entities_from_metadata($options);
        } else {
            if (!$count) {
                return array();
            } else {
                return 0;
            }
        }
    }

    public function getFolderContents($folder, $limit = 100, $offset = 0) {
        if ($folder) {
            $totalFolders = $this->getFolders($folder, $limit, $offset, true);
            $folders = $this->getFolders($folder, $limit, $offset, false);
        } else {
            // when we are on site-level, we only have files.
            $totalFolders = 0;
            $folders = array();
        }

        $totalFiles = $this->getFiles($folder, 1, 0, true);

        if ($limit == 0) {
            $files = $this->getFiles($folder, 0, max(0, $offset-$totalFolders), false);
        } elseif ($limit > count($folders)) {
            $files = $this->getFiles($folder, $limit-count($folders), max(0, $offset-$totalFolders), false);
        } else {
            $files = array();
        }

        return array($totalFolders + $totalFiles, array_merge($folders, $files));
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

        $folder->write_access_id = $params['write_access_id'];
        if (!$folder->write_access_id) {
            $folder->write_access_id = ACCESS_PRIVATE;
        }

        return $folder->save();
    }

    public function updateFolder($folder, $params = array()) {
        $folder->title = $params['title'];
        $folder->access_id = $params['access_id'];
        $folder->write_access_id = $params['write_access_id'];
        if (!$folder->write_access_id) {
            $folder->write_access_id = ACCESS_PRIVATE;
        }

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

        list($count, $objects) = $this->getFolderContents($folder);
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
        $file->write_access_id = $params['write_access_id'];
        if (!$file->write_access_id) {
            $file->write_access_id = ACCESS_PRIVATE;
        }

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

        return $file;
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
        $file->write_access_id = $params['write_access_id'];
        if (!$file->write_access_id) {
            $file->write_access_id = ACCESS_PRIVATE;
        }

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
