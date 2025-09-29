<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Resources\Transaction\TransactionResource;
use App\Models\Location;
use App\Models\Purchase;
use App\Models\Type;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
   public function index(Request $request)
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
            if ($sort === 'total_desc') $query->orderBy('total_cost', 'desc');
            if ($sort === 'total_asc') $query->orderBy('total_cost', 'asc');
            if ($sort === 'oldest') $query->orderBy('transaction_date', 'asc');
         }, function ($query) {
            $query->latest('transaction_date');
         })
         ->paginate(15)
         ->withQueryString();

      return Inertia::render('Transactions/Index', [
         'transactions' => TransactionResource::collection($transactions),
         'locations' => Location::orderBy('name')->get(['id', 'name']),
         'transactionTypes' => Type::where('group', Type::GROUP_TRANSACTION)->orderBy('name')->get(['id', 'name']),
         'filters' => (object) $request->only(['search', 'sort', 'location_id', 'type']),
      ]);
   }
}
