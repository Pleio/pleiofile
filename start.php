<?php
/**
* Pleiofile
*
* @package pleiofile
* @author Stichting Pleio
* @link https://www.pleio.nl
*/

function pleiofile_init() {
    elgg_register_js("jquery-19", "https://code.jquery.com/jquery-1.9.1.min.js", 'head', -100);
    elgg_register_js("bootstrap", "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js", 'head', -99);
    elgg_register_js("jquery-noconflict", "mod/pleiofile/static/js/build/jquery-noconflict.js", 'head', -98);

    elgg_register_css("bootstrap", "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css");
    elgg_register_css("pleiofile", "mod/pleiofile/static/css/pleiofile.css");

    elgg_register_page_handler("files", "pleiofile_file_page_handler");
}

elgg_register_event_handler('init', 'system', 'pleiofile_init');

function pleiofile_file_page_handler($url) {
    gatekeeper();

    switch ($url[0]) {
        case "group":
            include(dirname(__FILE__) . "/pages/list.php");
            break;
    }

    return true;
}