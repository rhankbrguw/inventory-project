<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        $addIndex = function (string $table, $columns, string $indexName) {
            if (!Schema::hasTable($table)) {
                return;
            }

            $schema = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $schema->listTableIndexes($table);

            if (!array_key_exists($indexName, $indexes)) {
                Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
                    $t->index($columns, $indexName);
                });
            }
        };

        $addIndex('stock_transfers', ['from_location_id', 'status'], 'stock_transfers_from_loc_status_idx');
        $addIndex('stock_transfers', ['to_location_id', 'status'], 'stock_transfers_to_loc_status_idx');
        $addIndex('stock_transfers', 'transfer_date', 'stock_transfers_date_idx');
        $addIndex('stock_transfers', 'created_at', 'stock_transfers_created_idx');

        $addIndex('stock_movements', ['reference_type', 'reference_id', 'type'], 'stock_movements_ref_idx');
        $addIndex('stock_movements', ['product_id', 'location_id'], 'stock_movements_prod_loc_idx');

        $addIndex('location_user', ['location_id', 'role_id'], 'location_user_loc_role_idx');
        $addIndex('location_user', 'user_id', 'location_user_user_idx');

        $addIndex('purchases', 'location_id', 'purchases_location_idx');
        $addIndex('purchases', 'transaction_date', 'purchases_date_idx');

        $addIndex('sells', 'location_id', 'sells_location_idx');
        $addIndex('sells', 'transaction_date', 'sells_date_idx');

        $addIndex('inventories', ['product_id', 'location_id'], 'inventories_prod_loc_idx');
    }

    public function down(): void
    {
        $drop = function (string $table, string $indexName) {
            if (!Schema::hasTable($table)) {
                return;
            }
            Schema::table($table, function (Blueprint $t) use ($indexName) {
                try {
                    $t->dropIndex($indexName);
                } catch (\Throwable) {
                }
            });
        };

        $drop('stock_transfers', 'stock_transfers_from_loc_status_idx');
        $drop('stock_transfers', 'stock_transfers_to_loc_status_idx');
        $drop('stock_transfers', 'stock_transfers_date_idx');
        $drop('stock_transfers', 'stock_transfers_created_idx');

        $drop('stock_movements', 'stock_movements_ref_idx');
        $drop('stock_movements', 'stock_movements_prod_loc_idx');

        $drop('location_user', 'location_user_loc_role_idx');
        $drop('location_user', 'location_user_user_idx');

        $drop('purchases', 'purchases_location_idx');
        $drop('purchases', 'purchases_date_idx');

        $drop('sells', 'sells_location_idx');
        $drop('sells', 'sells_date_idx');

        $drop('inventories', 'inventories_prod_loc_idx');
    }
};
