<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            if (!$this->indexExists('stock_transfers', 'stock_transfers_from_location_id_status_index')) {
                $table->index(['from_location_id', 'status'], 'stock_transfers_from_location_id_status_index');
            }
            if (!$this->indexExists('stock_transfers', 'stock_transfers_to_location_id_status_index')) {
                $table->index(['to_location_id', 'status'], 'stock_transfers_to_location_id_status_index');
            }
            if (!$this->indexExists('stock_transfers', 'stock_transfers_transfer_date_index')) {
                $table->index('transfer_date');
            }
            if (!$this->indexExists('stock_transfers', 'stock_transfers_created_at_index')) {
                $table->index('created_at');
            }
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            if (!$this->indexExists('stock_movements', 'stock_movements_reference_type_reference_id_type_index')) {
                $table->index(['reference_type', 'reference_id', 'type'], 'stock_movements_reference_type_reference_id_type_index');
            }
            if (!$this->indexExists('stock_movements', 'stock_movements_product_id_location_id_index')) {
                $table->index(['product_id', 'location_id'], 'stock_movements_product_id_location_id_index');
            }
        });

        Schema::table('location_user', function (Blueprint $table) {
            if (!$this->indexExists('location_user', 'location_user_location_id_role_id_index')) {
                $table->index(['location_id', 'role_id'], 'location_user_location_id_role_id_index');
            }
            if (!$this->indexExists('location_user', 'location_user_user_id_index')) {
                $table->index('user_id');
            }
        });

        Schema::table('purchases', function (Blueprint $table) {
            if (!$this->indexExists('purchases', 'purchases_location_id_index')) {
                $table->index('location_id');
            }
            if (!$this->indexExists('purchases', 'purchases_transaction_date_index')) {
                $table->index('transaction_date');
            }
            if (!$this->indexExists('purchases', 'purchases_created_at_index')) {
                $table->index('created_at');
            }
        });

        Schema::table('sells', function (Blueprint $table) {
            if (!$this->indexExists('sells', 'sells_location_id_index')) {
                $table->index('location_id');
            }
            if (!$this->indexExists('sells', 'sells_transaction_date_index')) {
                $table->index('transaction_date');
            }
            if (!$this->indexExists('sells', 'sells_created_at_index')) {
                $table->index('created_at');
            }
        });

        Schema::table('inventories', function (Blueprint $table) {
            if (!$this->indexExists('inventories', 'inventories_product_id_location_id_index')) {
                $table->index(['product_id', 'location_id'], 'inventories_product_id_location_id_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_transfers', function (Blueprint $table) {
            $table->dropIndex('stock_transfers_from_location_id_status_index');
            $table->dropIndex('stock_transfers_to_location_id_status_index');
            $table->dropIndex('stock_transfers_transfer_date_index');
            $table->dropIndex('stock_transfers_created_at_index');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex('stock_movements_reference_type_reference_id_type_index');
            $table->dropIndex('stock_movements_product_id_location_id_index');
        });

        Schema::table('location_user', function (Blueprint $table) {
            $table->dropIndex('location_user_location_id_role_id_index');
            $table->dropIndex('location_user_user_id_index');
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropIndex('purchases_location_id_index');
            $table->dropIndex('purchases_transaction_date_index');
            $table->dropIndex('purchases_created_at_index');
        });

        Schema::table('sells', function (Blueprint $table) {
            $table->dropIndex('sells_location_id_index');
            $table->dropIndex('sells_transaction_date_index');
            $table->dropIndex('sells_created_at_index');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex('inventories_product_id_location_id_index');
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $schemaManager = $connection->getDoctrineSchemaManager();
        $indexes = $schemaManager->listTableIndexes($table);
        return isset($indexes[$index]);
    }
};
