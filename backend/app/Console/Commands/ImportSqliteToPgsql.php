<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportSqliteToPgsql extends Command
{
    protected $signature = 'db:import-sqlite-to-pgsql 
        {--sqlite= : Path to sqlite file (default: database/database.sqlite)}
        {--source=sqlite_import : Temporary source connection name}
        {--target=pgsql : Target connection name}
        {--fresh : Truncate target tables before importing}';

    protected $description = 'Import app data from SQLite into PostgreSQL while preserving IDs and functionality.';

    public function handle(): int
    {
        $sqlitePath = $this->option('sqlite') ?: database_path('database.sqlite');
        $sourceName = (string) $this->option('source');
        $targetName = (string) $this->option('target');

        if (! file_exists($sqlitePath)) {
            $this->error("SQLite file not found: {$sqlitePath}");
            return self::FAILURE;
        }

        config(["database.connections.{$sourceName}" => [
            'driver' => 'sqlite',
            'database' => $sqlitePath,
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]]);

        $source = DB::connection($sourceName);
        $target = DB::connection($targetName);

        $sourceTables = collect($source->select("SELECT name FROM sqlite_master WHERE type = 'table'"))
            ->map(fn ($row) => $row->name)
            ->reject(fn ($name) => in_array($name, ['sqlite_sequence'], true))
            ->values();

        if ($sourceTables->isEmpty()) {
            $this->warn('No source tables found in SQLite.');
            return self::SUCCESS;
        }

        $targetTables = collect(Schema::connection($targetName)->getTableListing());
        $tablesToImport = $sourceTables->filter(fn ($table) => $targetTables->contains($table))->values();
        $skipped = $sourceTables->diff($tablesToImport)->values();

        $this->info("Source tables: {$sourceTables->count()}, importable: {$tablesToImport->count()}");

        $target->beginTransaction();

        try {
            $target->statement("SET session_replication_role = 'replica'");

            if ($this->option('fresh')) {
                foreach ($tablesToImport as $table) {
                    $target->table($table)->truncate();
                }
            }

            foreach ($tablesToImport as $table) {
                $rows = $source->table($table)->get()->map(fn ($r) => (array) $r)->all();

                if (empty($rows)) {
                    $this->line("{$table}: 0 rows");
                    continue;
                }

                foreach (array_chunk($rows, 500) as $chunk) {
                    $target->table($table)->insert($chunk);
                }

                $this->line("{$table}: ".count($rows).' rows');
            }

            // Make sure sequences continue correctly after explicit ID inserts.
            foreach ($tablesToImport as $table) {
                if (! Schema::connection($targetName)->hasColumn($table, 'id')) {
                    continue;
                }

                $target->statement("
                    SELECT setval(
                        pg_get_serial_sequence('{$table}', 'id'),
                        COALESCE((SELECT MAX(id) FROM {$table}), 1),
                        true
                    )
                ");
            }

            $target->statement("SET session_replication_role = 'origin'");
            $target->commit();
        } catch (\Throwable $e) {
            try {
                $target->statement("SET session_replication_role = 'origin'");
            } catch (\Throwable) {
            }
            $target->rollBack();
            $this->error($e->getMessage());
            return self::FAILURE;
        }

        if ($skipped->isNotEmpty()) {
            $this->warn('Skipped (missing in PostgreSQL schema): '.implode(', ', $skipped->all()));
        }

        $this->info('SQLite to PostgreSQL import completed.');

        return self::SUCCESS;
    }
}

