<?php

namespace App\Providers;

use SocialiteProviders\OIDC\Provider as BaseProvider;

class OIDCProvider extends BaseProvider
{
    /**
     * Disable nonce verification.
     * Beberapa server SSO tidak mengirimkan 'nonce' di dalam ID Token mereka.
     * Mengubah nilai ini menjadi false akan melewati pengecekan nonce.
     */
    protected function usesNonce(): bool
    {
        return false;
    }
}
