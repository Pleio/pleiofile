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

    foreach ($sizes as $size => $description) {
        if ($size < 600) {
            $upscale = true;
        } else {
            $upscale = false;
        }

        $thumbnail = get_resized_image_from_existing_file($file->getFilenameOnFilestore(), $size, $size, $upscale);

        if ($thumbnail) {
            $thumb = new ElggFile();
            $thumb->setMimeType($_FILES['upload']['type']);

            $thumb->setFilename($prefix . $description . $filestorename);
            $thumb->open("write");
            $thumb->write($thumbnail);
            $thumb->close();

            $file->thumbnail = $prefix . $description . $filestorename;
            unset($thumbnail);
        }
    }
}