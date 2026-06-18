<?php

namespace App\Providers;

use Http;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\OIDC\Provider;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Http::globalOptions([
            'verify' => false,
        ]);
        Event::listen(function (SocialiteWasCalled $event) {
            $event->extendSocialite('oidc', \App\Providers\OIDCProvider::class);
        });
    }
}
