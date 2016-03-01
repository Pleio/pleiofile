<?php
/**
 * Folder renderer.
 *
 * @package Elggfolder
 */

$full = elgg_extract('full_view', $vars, FALSE);
$folder = elgg_extract('entity', $vars, FALSE);

if (!$folder) {
	return TRUE;
}

$owner = $folder->getOwnerEntity();
$container = $folder->getContainerEntity();
$categories = elgg_view('output/categories', $vars);
$excerpt = elgg_get_excerpt($folder->description);
$mime = $folder->mimetype;
$base_type = substr($mime, 0, strpos($mime,'/'));

$owner_link = elgg_view('output/url', array(
	'href' => "folder/owner/$owner->username",
	'text' => $owner->name,
	'is_trusted' => true,
));
$author_text = elgg_echo('byline', array($owner_link));

$folder_icon = elgg_view_entity_icon($folder, 'tiny', array(
	'img_class' => 'pleiofolder-tiny-icon'
));

$date = elgg_view_friendly_time($folder->time_created);

$comments_count = $folder->countComments();
//only display if there are commments
if ($comments_count != 0) {
	$text = elgg_echo("comments") . " ($comments_count)";
	$comments_link = elgg_view('output/url', array(
		'href' => $folder->getURL() . '#folder-comments',
		'text' => $text,
		'is_trusted' => true,
	));
} else {
	$comments_link = '';
}

$metadata = elgg_view_menu('entity', array(
	'entity' => $vars['entity'],
	'handler' => 'folder',
	'sort_by' => 'priority',
	'class' => 'elgg-menu-hz',
));

$subtitle = "$author_text $date $comments_link $categories";

// do not show the metadata and controls in widget view
if (elgg_in_context('widgets')) {
	$metadata = '';
}

if ($full && !elgg_in_context('gallery')) {

	$extra = '';
	if (elgg_view_exists("folder/specialcontent/$mime")) {
		$extra = elgg_view("folder/specialcontent/$mime", $vars);
	} else if (elgg_view_exists("folder/specialcontent/$base_type/default")) {
		$extra = elgg_view("folder/specialcontent/$base_type/default", $vars);
	}

	$params = array(
		'entity' => $folder,
		'title' => $folder->title,
		'metadata' => $metadata,
		'subtitle' => $subtitle,
	);
	$params = $params + $vars;
	$summary = elgg_view('object/elements/summary', $params);

	$text = elgg_view('output/longtext', array('value' => $folder->description));
	$body = "$text $extra";

	echo elgg_view('object/elements/full', array(
		'entity' => $folder,
		'icon' => $folder_icon,
		'summary' => $summary,
		'body' => $body,
	));

} elseif (elgg_in_context('gallery')) {
	echo '<div class="folder-gallery-item">';
	echo "<h3>" . $folder->title . "</h3>";
	echo elgg_view_entity_icon($folder, 'medium');
	echo "<p class='subtitle'>$owner_link $date</p>";
	echo '</div>';
} else {
	// brief view

	$params = array(
		'entity' => $folder,
		'metadata' => $metadata,
		'subtitle' => $subtitle,
		'content' => $excerpt,
	);
	$params = $params + $vars;
	$list_body = elgg_view('object/elements/summary', $params);

	echo elgg_view_image_block($folder_icon, $list_body);
}
