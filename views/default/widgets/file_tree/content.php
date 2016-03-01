<?php

$widget = elgg_extract("entity", $vars);

$browser = new PleioFileBrowser();

$entities = $browser->getFolderContents($widget->getOwnerEntity());
echo elgg_view_entity_list($entities, array(
    'full_view' => false
));
