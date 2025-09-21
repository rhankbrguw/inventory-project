<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
   public function index(Request $request)
   {
      // Untuk sementara
      $transactions = Purchase::with(['location', 'supplier', 'user'])
         ->latest('transaction_date')
         ->paginate(10);

      return Inertia::render('Transactions/Index', [
         'transactions' => TransactionResource::collection($transactions)
      ]);
   }
}
