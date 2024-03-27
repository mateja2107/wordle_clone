<?php

$name = 'words14k.txt';
$words = [];

if(file_exists($name)) {
  $file = fopen($name, 'r');

  while(($row = fgets($file)) != NULL) {
    $row = trim($row);
    $words[] = $row;
  }
}

$string = implode("', '", $words);

echo "['" . $string . "']";