<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    public function test_403_renders_inertia_error_page(): void
    {
        Route::get('/test-forbidden', fn () => abort(403, 'Akses Ditolak'));

        $response = $this->get('/test-forbidden');

        $response->assertStatus(403);
        $response->assertInertia(fn ($page) => $page->component('Errors/403'));
    }

    public function test_404_renders_inertia_error_page(): void
    {
        $response = $this->get('/non-existent-page-url-12345');

        $response->assertStatus(404);
        $response->assertInertia(fn ($page) => $page->component('Errors/404'));
    }
}
