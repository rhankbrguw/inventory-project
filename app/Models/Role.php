<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    public const LEVEL_SUPER_ADMIN = 1;

    public const THRESHOLD_MANAGERIAL = 10;

    public const THRESHOLD_STAFF = 20;

    public const CODE_SUPER_ADMIN = 'ADM';

    public const CODE_WAREHOUSE_MGR = 'WHM';

    public const CODE_BRANCH_MGR = 'BRM';

    public const CODE_STAFF = 'STF';

    public const CODE_CASHIER = 'CSH';

    public const NAME_SUPER_ADMIN = 'Super Admin';

    public const NAME_WAREHOUSE_MGR = 'Warehouse Manager';

    public const NAME_BRANCH_MGR = 'Branch Manager';

    public const NAME_CASHIER = 'Cashier';

    public const NAME_STAFF = 'Staff';

    protected $fillable = [
        'name',
        'guard_name',
        'code',
        'level',
    ];

    protected $casts = [
        'level' => 'integer',
    ];

    public static function isSuperAdmin(int $level): bool
    {
        return $level === self::LEVEL_SUPER_ADMIN;
    }

    public static function isManagerial(int $level): bool
    {
        return $level <= self::THRESHOLD_MANAGERIAL;
    }

    public static function isOperational(int $level): bool
    {
        return $level <= self::THRESHOLD_STAFF;
    }
}
