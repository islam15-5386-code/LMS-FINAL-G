<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Request;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenant = Request::instance()->attributes->get('tenant');

        if ($tenant !== null && $tenant->id) {
            $builder->where($model->getTable() . '.tenant_id', $tenant->id);
        }
    }
}
