<?php
$entity = elgg_extract("entity", $vars);

echo "<div>";
echo elgg_echo("pleiofile:number_items") . ": ";
echo elgg_view("input/dropdown", array(
    "name" => "params[limit]",
    "options" => range(1, 15),
    "value" => $entity->limit ? (int) $entity->limit : 10
));
echo "</div>";

echo "<div>";
echo elgg_echo("pleiofile:show_folder")  . ": ";
echo elgg_view("input/folder_select", array(
    "name" => "params[folder]",
    "folder" => $entity->folder ? (int) $entity->folder : null
));
echo "</div>";