<?php

namespace App\Enums;

enum RoleLevel: int
{
    case SUPER_ADMIN = 1;
    case ADMIN = 2;
    case WAREHOUSE_MGR = 10;
    case BRANCH_MGR = 11;
    case STAFF = 20;

    public function isSuperAdmin(): bool
    {
        return $this === self::SUPER_ADMIN;
    }

    public function isManagerial(): bool
    {
        return $this->value <= 10;
    }
}
