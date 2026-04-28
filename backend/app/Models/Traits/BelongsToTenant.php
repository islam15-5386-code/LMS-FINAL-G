<?php

namespace App\Models\Traits;

use App\Scopes\TenantScope;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where($this->getTable() . '.tenant_id', $tenantId);
    }
}
