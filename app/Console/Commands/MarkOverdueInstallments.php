<?php

namespace App\Console\Commands;

use App\Services\InstallmentService;
use Illuminate\Console\Command;

class MarkOverdueInstallments extends Command
{
    protected $signature = 'installments:mark-overdue';

    protected $description = 'Mark all pending installments that have passed their due date as overdue.';

    public function __construct(private InstallmentService $installmentService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $count = $this->installmentService->markOverdue();

        $this->info("Marked {$count} installment(s) as overdue.");

        return Command::SUCCESS;
    }
}
