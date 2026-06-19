<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Tenant extends Model
{
    //
    use HasFactory, SoftDeletes;

    /**
     * Kolom yang diizinkan untuk diisi melalui form/request.
     */
    protected $fillable = [
        'name',
        'company_name',
        'status',
        'type',
        'email',
        'phone',
        'area',
        'location',
        'logo_path',
        'description',
    ];
    protected $appends = ['logo_url'];
    /**
     * Casting tipe data secara otomatis.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function getLogoUrlAttribute()
    {
        if ($this->logo_path) {
            // Otomatis mengambil dari default disk (s3) tanpa memicu error IDE
            return Storage::url($this->logo_path);
        }

        return null;
    }
}
