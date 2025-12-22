<?php

namespace Database\Seeders;

use App\Models\SalesChannel;
use Illuminate\Database\Seeder;

class SalesChannelSeeder extends Seeder
{
    public function run(): void
    {
        $channels = [
            ['name' => 'Cash / Counter', 'code' => 'CASH'],
            ['name' => 'GoFood', 'code' => 'GFD'],
            ['name' => 'GrabFood', 'code' => 'GRB'],
            ['name' => 'ShopeeFood', 'code' => 'SPF'],
            ['name' => 'ESB', 'code' => 'ESB'],
        ];

        foreach ($channels as $channel) {
            SalesChannel::firstOrCreate(['code' => $channel['code']], $channel);
        }
    }
}
