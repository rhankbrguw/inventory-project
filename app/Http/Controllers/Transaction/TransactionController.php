<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Location;
use App\Models\Purchase;
use App\Models\Type;
use Illuminate\Http\Request;
use Inertia\Response;

class TransactionController extends Controller
{
   public function index(Request $request): Response
   {
      $transactions = Purchase::query()
         ->with(['location', 'supplier', 'user'])
         ->when($request->input('search'), function ($query, $search) {
            $query->where('reference_code', 'like', "%{$search}%")
               ->orWhereHas('supplier', fn($q) => $q->where('name', 'like', "%{$search}%"));
         })
         ->when($request->input('location_id'), function ($query, $locationId) {
            $query->where('location_id', $locationId);
         })
         ->when($request->input('sort'), function ($query, $sort) {
            match ($sort) {
               'total_desc' => $query->orderBy('total_cost', 'desc'),
               'total_asc' => $query->orderBy('total_cost', 'asc'),
               'oldest' => $query->orderBy('transaction_date', 'asc'),
               default => $query->latest('transaction_date'),
            };
         }, function ($query) {
            $query->latest('transaction_date');
         })
         ->paginate(15)
         ->withQueryString();

      return inertia('Transactions/Index', [
         'transactions' => TransactionResource::collection($transactions),
         'locations' => Location::orderBy('name')->get(['id', 'name']),
         'transactionTypes' => Type::where('group', Type::GROUP_TRANSACTION)
            ->orderBy('name')
            ->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'sort', 'location_id', 'type']),
      ]);
   }
}
