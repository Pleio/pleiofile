<?php

$widget = $vars["entity"];
$group = $widget->getOwnerEntity();

$number = sanitise_int($widget->file_count, false);
if(empty($number) | $number < 0 | $number > 15){
	$number = 10;
}

$translation = array(
	"filename" => "o.title",
	"time_created" => "e.time_created"
);

$directions = array("ASC","DESC");

if (array_key_exists($widget->sort_on, $translation) && in_array($widget->sort_on_direction, $directions)) {
	$order_by = $translation[$widget->sort_on];
	$direction = $widget->sort_on_direction;
} elseif (array_key_exists($group->file_tools_sort_on, $translation) && in_array($group->file_tools_sort_on_direction, $directions)) {
	$order_by = $translation[$group->file_tools_sort_on];
	$direction = $group->file_tools_sort_on_direction;
} else {
	$order_by = $translation["filename"];
	$direction = "ASC";
}

$dbprefix = elgg_get_config("dbprefix");

$wheres = array();
$wheres[] = "NOT EXISTS (
			SELECT 1 FROM {$dbprefix}entity_relationships r
			WHERE r.guid_two = e.guid AND
			r.relationship = 'folder_of')";

$options = array(
	'type' => 'object',
	'full_view' => false,
	'subtype' => 'file',
	'container_guid' => $group->guid,
	'joins' => "INNER JOIN {$dbprefix}objects_entity o ON (o.guid = e.guid)",
	'order_by' => $order_by . " " . $direction,
	'wheres' => $wheres,
	'limit' => $number
);

echo elgg_list_entities($options);
