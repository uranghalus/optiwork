<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    //
    public function redirect()
    {
        return Socialite::driver('oidc')->redirect();
    }
    /**
     * Menangani callback setelah user berhasil/gagal login di SSO.
     */
    public function callback(Request $request)
    {
        try {
            // 1. Ambil profil user dari OIDC Perusahaan
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('oidc');
            $ssoUser = $driver->stateless()->user();
            // Data mentah (raw) dari SSO disimpan di $ssoUser->user (array)
            $rawData = $ssoUser->user ?? [];
            dd($ssoUser);

            // 2. Cari user berdasarkan email, atau buat baru jika belum ada (Upsert)
            $user = User::updateOrCreate(
                ['email' => $ssoUser->getEmail()],
                [
                    'name'          => $ssoUser->getName(),
                    'email'         => $ssoUser->getEmail(),
                    'password'      => null, // SSO user tidak memiliki password lokal
                    'phone'         => $rawData['whatsapp_number'] ?? $rawData['phone_number'] ?? $rawData['phone'] ?? null,
                    'department'    => $rawData['department'] ?? null,
                    'position'      => $rawData['position'] ?? null,
                    'last_login_at' => $rawData['last_login_at'] ?? now(),
                    'last_login_ip' => $rawData['last_login_ip'] ?? request()->ip(),
                ]
            );

            // 3. Login user ke dalam session Laravel
            Auth::login($user);

            // 4. Regenerasi session untuk keamanan (mencegah session fixation)
            $request->session()->regenerate();

            // 5. Redirect ke dashboard
            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            Log::error('OIDC SSO Callback Error: ' . $e->getMessage());

            return redirect('/')->with('error', 'Terjadi kesalahan saat login SSO: ' . $e->getMessage());
        }
    }

    /**
     * (Opsional) Fungsi untuk Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
