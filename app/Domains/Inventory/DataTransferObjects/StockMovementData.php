<?php

namespace App\Domains\Inventory\DataTransferObjects;

use App\Domains\Inventory\Enums\MovementType;

readonly class StockMovementData
{
    public function __construct(
        public int $product_id,
        public int $location_id,
        public string $quantity,
        public MovementType $type,
        public string $reference_type,
        public int $reference_id,
        public ?string $unit_cost = null,
        public ?int $sales_channel_type_id = null,
        public ?int $user_id = null,
        public ?string $notes = null,
    ) {
    }
}
