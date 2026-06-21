<?php

namespace App\Services;

use App\Models\WorkOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected string $apiKey;
    protected string $apiUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', env('OPENAI_API_KEY', ''));
        $this->apiUrl = config('services.openai.api_url', 'https://api.openai.com/v1/chat/completions');
        $this->model = config('services.openai.model', 'gpt-3.5-turbo');
    }

    public function summarizeWorkOrder(WorkOrder $workOrder): ?string
    {
        if (empty($this->apiKey)) {
            return $this->generateLocalSummary($workOrder);
        }

        try {
            $prompt = "Buat ringkasan singkat (maksimal 2 kalimat) dalam Bahasa Indonesia untuk work order berikut:\n\n"
                . "Judul: {$workOrder->title}\n"
                . "Deskripsi: {$workOrder->job_description}\n"
                . "Prioritas: {$workOrder->priority_label}\n"
                . "Departemen: {$workOrder->department?->name}\n\n"
                . "Ringkasan:";

            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Anda adalah asisten yang membantu merangkum work order.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 150,
                    'temperature' => 0.3,
                ]);

            if ($response->successful()) {
                return trim($response->json('choices.0.message.content'));
            }

            Log::warning('AI API error: ' . $response->body());
            return $this->generateLocalSummary($workOrder);
        } catch (\Exception $e) {
            Log::error('AI Service error: ' . $e->getMessage());
            return $this->generateLocalSummary($workOrder);
        }
    }

    public function estimateCompletionTime(WorkOrder $workOrder): ?string
    {
        if (empty($this->apiKey)) {
            return $this->generateLocalEstimate($workOrder);
        }

        try {
            $prompt = "Perkirakan waktu penyelesaian dalam jam atau hari untuk work order berikut:\n\n"
                . "Judul: {$workOrder->title}\n"
                . "Deskripsi: {$workOrder->job_description}\n"
                . "Prioritas: {$workOrder->priority_label}\n"
                . "Jumlah personel: {$workOrder->total_personnel}\n\n"
                . "Jawab dengan format: 'Estimasi: X jam/hari'";

            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Anda adalah asisten yang membantu estimasi waktu pekerjaan.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 100,
                    'temperature' => 0.3,
                ]);

            if ($response->successful()) {
                return trim($response->json('choices.0.message.content'));
            }

            return $this->generateLocalEstimate($workOrder);
        } catch (\Exception $e) {
            Log::error('AI Service error: ' . $e->getMessage());
            return $this->generateLocalEstimate($workOrder);
        }
    }

    public function autoCategorize(WorkOrder $workOrder): string
    {
        $description = strtolower($workOrder->title . ' ' . $workOrder->job_description);

        $categories = [
            'AC & Pendingin' => ['ac', 'pendingin', 'cooling', 'air conditioner', 'freon', 'kompresor', 'temperature'],
            'Listrik' => ['listrik', 'lampu', 'stop kontak', 'saklar', 'kabel', 'panel', 'voltase', 'mati lampu'],
            'Pipa & Air' => ['pipa', 'air', 'bocor', 'saluran', 'selokan', 'kran', 'toilet', 'wc', 'wastafel'],
            'Bangunan & Struktur' => ['dinding', 'lantai', 'plafon', 'atap', 'cat', 'plester', 'retak', 'pintu', 'jendela'],
            'Kebersihan' => ['bersih', 'sampah', 'kotor', 'debu', 'sanitasi', 'fumigasi'],
            'Keamanan' => ['cctv', 'kamera', 'alarm', 'kunci', 'pintu', 'security', 'fire alarm', 'sprinkler'],
            'Mekanikal & Elektrikal' => ['mesin', 'pompa', 'motor', 'generator', 'genset', 'turbin', 'blower'],
            'IT & Jaringan' => ['komputer', 'server', 'jaringan', 'internet', 'wifi', 'lan', 'printer', 'software'],
            'Lanskap & Taman' => ['taman', 'tanaman', 'rumput', 'pohon', 'lanskap', 'gardening'],
            'Lainnya' => [],
        ];

        foreach ($categories as $category => $keywords) {
            if (empty($keywords)) continue;
            foreach ($keywords as $keyword) {
                if (str_contains($description, $keyword)) {
                    return $category;
                }
            }
        }

        return 'Lainnya';
    }

    protected function generateLocalSummary(WorkOrder $workOrder): string
    {
        $words = str_word_count($workOrder->job_description, 1);
        $summary = implode(' ', array_slice($words, 0, 20));
        return !empty($summary) ? $summary . '...' : substr($workOrder->title, 0, 100);
    }

    protected function generateLocalEstimate(WorkOrder $workOrder): string
    {
        $wordCount = str_word_count($workOrder->job_description);
        $complexity = strlen($workOrder->job_description);

        if ($workOrder->priority === 'urgent_by_accident') {
            return 'Estimasi: 2-4 jam (urgent)';
        }

        if ($complexity > 500 || $wordCount > 100) {
            return 'Estimasi: 2-3 hari';
        } elseif ($complexity > 200 || $wordCount > 50) {
            return 'Estimasi: 1-2 hari';
        }

        return 'Estimasi: 4-8 jam';
    }
}
