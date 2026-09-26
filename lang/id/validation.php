<?php

return array_merge(
    require __DIR__.'/validation/rules_1.php',
    require __DIR__.'/validation/rules_2.php',
    ['attributes' => require __DIR__.'/validation/attributes.php'],
);
