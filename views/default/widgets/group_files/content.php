<?php
elgg_load_css('pleiofile');
elgg_load_js('pleiofile');

$widget = elgg_extract("entity", $vars);
$container = $widget->getContainerEntity();
$homeGuid = $widget->folder ? $widget->folder : $container->guid;

// remove widget context, as the widget_manager otherwise overwrites get_write_access_array() in plugin hook
elgg_pop_context();
$accessIds = get_write_access_array();
elgg_push_context("widgets");

$data = array(
    'containerGuid' => $container->guid,
    'homeGuid' => $homeGuid,
    'accessIds' => $accessIds,
    'isWidget' => true,
    'odt_enabled' => elgg_is_active_plugin('odt_editor') ? true : false,
    'limit' => $widget->limit ? $widget->limit : 10
);

echo "<script> var _appData = " . json_encode($data) . "; </script>";
echo "<div class=\"pleiofile\" data-containerguid=\"" . (int) $container->guid . "\" data-homeguid=\"" . (int) $homeGuid . "\"></div>";
