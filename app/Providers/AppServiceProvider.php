<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->numbers()
                ->uncompromised();
        });

        Model::preventLazyLoading(! $this->app->isProduction());

        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());

        Model::preventAccessingMissingAttributes(! $this->app->isProduction());
    }
}
