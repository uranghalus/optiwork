<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class DepartmentController extends Controller
{
    //
    public function index(Request $request)
    {
        $searchQuery = $request->query('q');

        $cacheKey = 'gate_departments_' . ($searchQuery ? md5($searchQuery) : 'all');
        $departments = Cache::remember($cacheKey, 600, function () use ($searchQuery) {
            try {
                // Siapkan parameter yang akan dikirim ke API luar
                $queryParams = [];
                if ($searchQuery) {
                    $queryParams['q'] = $searchQuery;
                }

                // Matikan paginasi dari sana agar kita dapat semua list untuk dropdown
                $queryParams['paginate'] = 'false';

                $response = Http::withToken(env('GATE_APP_TOKEN'))
                    ->timeout(5)
                    ->get(env('GATE_APP_URL') . '/api/departments', $queryParams);

                if ($response->successful()) {
                    // Asumsi struktur balikan API: { "data": [ { "id": "..", "name": ".." } ] }
                    return $response->json('data') ?? [];
                }

                return [];
            } catch (\Exception $e) {
                return [];
            }
        });

        // Kembalikan ke frontend React dalam bentuk JSON murni
        return response()->json($departments);
    }
}
