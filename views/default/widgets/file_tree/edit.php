<?php

$limit = sanitise_int($vars["entity"]->limit);
if (empty($limit)) {
    $limit = 10;
}

echo "<div>";
echo elgg_echo("pleiofile:number_items");
echo elgg_view("input/dropdown", array("name" => "params[limit]", "options" => range(1, 15), "value" => $limit));
echo "</div>";
