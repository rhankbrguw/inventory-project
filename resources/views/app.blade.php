<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Inventory System') }}</title>
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon.png') }}?v=4">
        <link rel="shortcut icon" href="{{ asset('favicon.ico') }}?v=4">
        <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}?v=4">

        @unless(app()->environment('testing'))
            @routes
            @viteReactRefresh
            @vite(['resources/js/app.tsx'])
        @endunless
        <script>
            (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            })();
        </script>
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
