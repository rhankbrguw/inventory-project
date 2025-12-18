<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockTransferRequest;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\StockTransfer;
use App\Models\User;
use App\Notifications\StockTransferNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('StockMovements/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),

            'products' => [],
        ]);
    }

    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $transfer = DB::transaction(function () use ($validated, $request) {
            $transfer = StockTransfer::create([
                'reference_code' => 'TRF-' . now()->format('Ymd-His'),
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'user_id' => $request->user()->id,
                'transfer_date' => now(),
                'notes' => $validated['notes'],
                'status' => 'completed',
            ]);

            foreach ($validated['items'] as $item) {
                $sourceInventory = Inventory::where('product_id', $item['product_id'])
                    ->where('location_id', $validated['from_location_id'])
                    ->firstOrFail();

                $costPerUnit = $sourceInventory->average_cost;

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['from_location_id'],
                    'type' => 'transfer_out',
                    'quantity' => -abs($item['quantity']),
                    'cost_per_unit' => $costPerUnit,
                    'notes' => $validated['notes'],
                    'user_id' => $request->user()->id,
                ]);

                $transfer->stockMovements()->create([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                    'type' => 'transfer_in',
                    'quantity' => abs($item['quantity']),
                    'cost_per_unit' => $costPerUnit,
                    'notes' => $validated['notes'],
                    'user_id' => $request->user()->id,
                ]);

                $sourceInventory->decrement('quantity', $item['quantity']);

                $destinationInventory = Inventory::firstOrNew([
                    'product_id' => $item['product_id'],
                    'location_id' => $validated['to_location_id'],
                ]);

                $oldQty = $destinationInventory->quantity ?? 0;
                $oldAvgCost = $destinationInventory->average_cost ?? 0;
                $newQty = abs($item['quantity']);

                $totalQty = $oldQty + $newQty;
                $newAvgCost = $totalQty > 0
                    ? (($oldQty * $oldAvgCost) + ($newQty * $costPerUnit)) / $totalQty
                    : 0;

                $destinationInventory->quantity = $totalQty;
                $destinationInventory->average_cost = $newAvgCost;
                $destinationInventory->save();
            }

            return $transfer;
        });

        try {
            $locationManagers = User::whereHas('locations', function ($q) use ($transfer) {
                $q->where('locations.id', $transfer->to_location_id)
                    ->whereIn('location_user.role_id', function ($subQuery) {
                        $subQuery->select('id')
                            ->from('roles')
                            ->whereIn('code', ['WHM', 'BRM']);
                    });
            })->get();

            $superAdmins = User::whereHas('roles', function ($q) {
                $q->where('level', 1);
            })->get();

            $targetManagers = $locationManagers->merge($superAdmins)->unique('id');

            Log::info('Target managers found:', [
                'location_managers' => $locationManagers->pluck('name', 'id')->toArray(),
                'super_admins' => $superAdmins->pluck('name', 'id')->toArray(),
                'total' => $targetManagers->count()
            ]);

            if ($targetManagers->count() > 0) {
                foreach ($targetManagers as $manager) {
                    Log::info('Attempting to send notification to:', [
                        'manager_id' => $manager->id,
                        'manager_name' => $manager->name,
                        'manager_phone' => $manager->phone,
                        'manager_phone_length' => strlen($manager->phone ?? ''),
                        'has_phone' => !empty($manager->phone),
                    ]);

                    try {
                        $manager->notify(new StockTransferNotification($transfer, $request->user()->name));
                        Log::info("Notification sent successfully to {$manager->name}");
                    } catch (\Exception $innerException) {
                        Log::error("Failed to notify {$manager->name}: " . $innerException->getMessage());
                        Log::error($innerException->getTraceAsString());
                    }
                }
            } else {
                Log::warning('No target managers found for transfer notification. Location ID: ' . $transfer->to_location_id);
            }
        } catch (\Exception $e) {
            Log::error('Gagal kirim notifikasi transfer: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }

        return Redirect::route('stock-movements.index')
            ->with('success', 'Transfer stok berhasil dicatat.');
    }
}
