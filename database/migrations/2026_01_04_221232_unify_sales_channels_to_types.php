<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('sales_channels')) {
            $channels = DB::table('sales_channels')->get();
            foreach ($channels as $channel) {
                $exists = DB::table('types')
                    ->where('code', $channel->code)
                    ->where('group', 'sales_channel')
                    ->exists();

                if (!$exists) {
                    DB::table('types')->insert([
                        'name' => $channel->name,
                        'code' => $channel->code,
                        'group' => 'sales_channel',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        Schema::table('product_prices', function (Blueprint $table) {
            if (!Schema::hasColumn('product_prices', 'type_id')) {
                $table->unsignedBigInteger('type_id')->nullable()->after('product_id');
            }
        });

        if (Schema::hasColumn('product_prices', 'sales_channel_id')) {
            $prices = DB::table('product_prices')->get();
            foreach ($prices as $price) {
                if ($price->sales_channel_id) {
                    $oldChannel = DB::table('sales_channels')->where('id', $price->sales_channel_id)->first();
                    if ($oldChannel) {
                        $newType = DB::table('types')
                            ->where('code', $oldChannel->code)
                            ->where('group', 'sales_channel')
                            ->first();

                        if ($newType) {
                            DB::table('product_prices')
                                ->where('id', $price->id)
                                ->update(['type_id' => $newType->id]);
                        }
                    }
                }
            }

            Schema::table('product_prices', function (Blueprint $table) {
                $table->dropForeign(['sales_channel_id']);
                $table->dropForeign(['product_id']);
            });

            Schema::table('product_prices', function (Blueprint $table) {
                $table->dropUnique(['product_id', 'sales_channel_id']);
                $table->dropColumn('sales_channel_id');
            });

            Schema::table('product_prices', function (Blueprint $table) {
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            });
        }

        Schema::table('product_prices', function (Blueprint $table) {
            $table->unsignedBigInteger('type_id')->nullable(false)->change();
            $table->foreign('type_id')->references('id')->on('types');

            try {
                $table->unique(['product_id', 'type_id']);
            } catch (\Exception) {
            }
        });

        if (!Schema::hasColumn('sells', 'sales_channel_type_id')) {
            Schema::table('sells', function (Blueprint $table) {
                $table->unsignedBigInteger('sales_channel_type_id')->nullable()->after('customer_id');
            });
        }

        if (Schema::hasColumn('sells', 'sales_channel_id')) {
            $sells = DB::table('sells')->get();
            foreach ($sells as $sell) {
                if ($sell->sales_channel_id) {
                    $oldChannel = DB::table('sales_channels')->where('id', $sell->sales_channel_id)->first();
                    if ($oldChannel) {
                        $newType = DB::table('types')
                            ->where('code', $oldChannel->code)
                            ->where('group', 'sales_channel')
                            ->first();

                        if ($newType) {
                            DB::table('sells')
                                ->where('id', $sell->id)
                                ->update(['sales_channel_type_id' => $newType->id]);
                        }
                    }
                }
            }

            Schema::table('sells', function (Blueprint $table) {
                $table->dropForeign(['sales_channel_id']);
                $table->dropColumn('sales_channel_id');
            });
        }

        Schema::table('sells', function (Blueprint $table) {
            $table->foreign('sales_channel_type_id')->references('id')->on('types');
        });

        Schema::dropIfExists('sales_channels');
    }

    public function down(): void
    {
    }
};
