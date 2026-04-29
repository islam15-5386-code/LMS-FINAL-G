<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserUpload extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'label',
        'file_name',
        'file_mime',
        'file_size',
        'file_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

