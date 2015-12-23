<?php

function pleiofile_generate_file_thumbs(ElggObject $file) {
    if ($file->simpletype != "image") {
        return null;
    }

    $file->icontime = time();

    $sizes = array(
        60 => "thumb",
        153 => "smallthumb",
        600 => "largethumb"
    );

    $filename = str_replace("file/", "", $file->getFilename());

    foreach ($sizes as $size => $description) {
        if ($size < 600) {
            $upscale = true;
        } else {
            $upscale = false;
        }

        $thumbnail = get_resized_image_from_existing_file($file->getFilenameOnFilestore(), $size, $size, $upscale);

        if ($thumbnail) {
            $path = "file/" . $description . "_" . $filename;

            $thumb = new ElggFile();
            $thumb->setMimeType($_FILES['upload']['type']);

            $thumb->setFilename($path);
            $thumb->open("write");
            $thumb->write($thumbnail);
            $thumb->close();

            if ($description == "thumb") {
                $file->thumbnail = $path;
            } else {
                $file->$description = $path;
            }

            unset($thumbnail);
        }
    }

    exit();
}

function pleiofile_add_folder_to_zip(ZipArchive &$zip_archive, ElggObject $folder, $folder_path = ""){

    if(!empty($zip_archive) && !empty($folder) && elgg_instanceof($folder, "object", "folder")){
        $folder_title = elgg_get_friendly_title($folder->title);

        $zip_archive->addEmptyDir($folder_path . $folder_title);
        $folder_path .= $folder_title . DIRECTORY_SEPARATOR;

        $file_options = array(
            "type" => "object",
            "subtype" => "file",
            "limit" => false,
            "relationship" => "folder_of",
            "relationship_guid" => $folder->getGUID()
        );

        // add files from this folder to the zip
        if($files = elgg_get_entities_from_relationship($file_options)){
            foreach($files as $file){
                // check if the file exists
                if($zip_archive->statName($folder_path . $file->originalfilename) === false){
                    // doesn't exist, so add
                    $zip_archive->addFile($file->getFilenameOnFilestore(), $folder_path . $file->originalfilename);
                } else {
                    // file name exists, so create a new one
                    $ext_pos = strrpos($file->originalfilename, ".");
                    $file_name = substr($file->originalfilename, 0, $ext_pos) . "_" . $file->getGUID() . substr($file->originalfilename, $ext_pos);

                    $zip_archive->addFile($file->getFilenameOnFilestore(), $folder_path . $file_name);
                }
            }
        }

        // check if there are subfolders
        $folder_options = array(
            "type" => "object",
            "subtype" => "folder",
            "limit" => false,
            "metadata_name_value_pairs" => array("parent_guid" => $folder->getGUID())
        );

        if($sub_folders = elgg_get_entities_from_metadata($folder_options)){
            foreach($sub_folders as $sub_folder){
                pleiofile_add_folder_to_zip($zip_archive, $sub_folder, $folder_path);
            }
        }
    }
}
