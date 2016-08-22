<?php
elgg_load_css('pleiofile');
elgg_load_js('pleiofile');

$widget = elgg_extract("entity", $vars);
$container = $widget->getContainerEntity();

$data = array(
    'containerGuid' => $container->guid,
    'accessIds' => get_write_access_array(),
    'isWidget' => true,
    'odt_enabled' => elgg_is_active_plugin('odt_editor') ? true : false
);

echo "<script> var _appData = " . json_encode($data) . "; </script>";
echo "<div id=\"pleiofile\"></div>";
