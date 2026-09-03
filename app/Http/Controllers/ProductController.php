<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchProductsRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ApiResponse;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Type;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\ProductIndexQueryService;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
        private ProductIndexQueryService $queryService,
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function index(Request $request): Response
    {
        $viewData = $this->queryService->getIndexData(Auth::user(), $request);

        return Inertia::render('Products/Index', $viewData);
    }

    public function search(SearchProductsRequest $request): JsonResponse
    {
        $query = trim((string) $request->validated('query', ''));
        if ($query === '') {
            return ApiResponse::success([]);
        }

        $products = $this->productRepository->searchAccessibleProducts($request->user(), $query, 20);

        return ApiResponse::success($products);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Products/Create', [
            'types' => Type::getForGroup(Type::GROUP_PRODUCT),
            'suppliers' => Supplier::accessibleBy(Auth::user())->orderBy('name')->get(['id', 'name']),
            'validUnits' => Product::VALID_UNITS,
            'salesChannels' => Type::getForGroup(Type::GROUP_SALES_CHANNEL),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);
        $this->productService->createProduct($request->validated(), $request->user(), $request->file('image'));

        return Redirect::route('products.index')->with('success', __('messages.product.created'));
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);
        $user = Auth::user();
        $product->load(['type', 'defaultSupplier', 'suppliers', 'prices', 'inventories']);

        return Inertia::render('Products/Edit', $this->queryService->getEditData($product, $user));
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);
        $this->productService->updateProduct($product, $request->validated(), $request->user(), $request->file('image'));

        return Redirect::route('products.index')->with('success', __('messages.product.updated'));
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);
        if ($product->inventories()->where('quantity', '>', 0)->exists()) {
            return Redirect::back()->with('error', __('messages.product.cannot_delete_has_stock'));
        }
        $product->delete();

        return Redirect::route('products.index')->with('success', __('messages.product.deleted'));
    }

    public function restore(Product $product): RedirectResponse
    {
        $this->authorize('restore', $product);
        $product->restore();

        return Redirect::route('products.index')->with('success', __('messages.product.restored'));
    }
}
