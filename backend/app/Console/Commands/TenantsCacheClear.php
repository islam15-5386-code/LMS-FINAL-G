<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class TenantsCacheClear extends Command
{
    protected $signature = 'tenants:cache-clear';
    protected $description = 'Clear tenant configuration caches';

    public function handle(): int
    {
        // Optionally, collect keys with prefix tenant_config*
        // For performance we just clear known keys pattern by scanning Redis if available
        try {
            // Laravel Cache doesn't provide a universal scan; we can use cache store tags if configured.
            // For simplicity clear entire cache when running this command in demo.
            Cache::flush();
            $this->info('Tenant caches cleared (cache flushed).');
        } catch (\Throwable $e) {
            $this->error('Failed to clear cache: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
