<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
    $driver = Laravel\Socialite\Facades\Socialite::driver('oidc');
    $url = $driver->stateless()->redirect()->getTargetUrl();
    echo 'TARGET: ' . $url;
} catch (\Exception $e) {
    echo 'ERROR: ' . get_class($e) . ' - ' . $e->getMessage();
}
