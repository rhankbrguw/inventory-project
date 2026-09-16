<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Inventory System') }}</title>
        <style>
            :root {
                --page-bg: 210 20% 98%;
                --page-surface: 0 0% 100%;
                --page-border: 220 15% 90%;
                --page-text: 220 18% 14%;
                --page-text-soft: 220 10% 42%;
                --page-accent: 220 18% 18%;
                --page-accent-foreground: 0 0% 100%;
                --page-muted: 220 10% 64%;
                --page-success: 152 56% 46%;
                --page-shadow: 220 18% 14%;
                --space-2: 0.5rem;
                --space-4: 1rem;
                --space-6: 1.5rem;
                --space-8: 2rem;
                --space-12: 3rem;
                --space-16: 4rem;
            }

            * { box-sizing: border-box; }

            html, body {
                margin: 0;
                min-height: 100%;
                font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                background: hsl(var(--page-bg));
                color: hsl(var(--page-text));
            }

            body {
                display: grid;
                place-items: center;
                padding: var(--space-8);
            }

            main {
                width: min(100%, 40rem);
                background: hsl(var(--page-surface));
                border: 1px solid hsl(var(--page-border));
                border-radius: 1rem;
                box-shadow: 0 1rem 2rem hsl(var(--page-shadow) / 0.05);
                padding: var(--space-12) var(--space-8);
            }

            .eyebrow {
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: 0.375rem 0.75rem;
                background: hsl(var(--page-accent));
                color: hsl(var(--page-accent-foreground));
                border-radius: 9999px;
                font-size: 0.75rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            h1 {
                margin: var(--space-6) 0 var(--space-4);
                font-size: clamp(2rem, 4vw, 3rem);
                line-height: 1.1;
                letter-spacing: -0.04em;
            }

            p {
                margin: 0;
                color: hsl(var(--page-text-soft));
                font-size: 1.05rem;
                line-height: 1.7;
            }

            .actions {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-4);
                margin-top: var(--space-8);
            }

            a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 2.75rem;
                padding: 0.75rem 1.25rem;
                border: 1px solid hsl(var(--page-border));
                border-radius: 0.75rem;
                color: hsl(var(--page-text));
                text-decoration: none;
                font-weight: 600;
                transition: transform 150ms ease-in-out, border-color 150ms ease-in-out;
            }

            a:hover {
                transform: translateY(-1px);
                border-color: hsl(var(--page-accent));
            }

            .primary {
                background: hsl(var(--page-accent));
                border-color: hsl(var(--page-accent));
                color: hsl(var(--page-accent-foreground));
            }

            .meta {
                margin-top: var(--space-8);
                color: hsl(var(--page-muted));
                font-size: 0.875rem;
            }
        </style>
    </head>
    <body>
        <main>
            <div class="eyebrow">Inventory System</div>
            <h1>Manage operations with clarity.</h1>
            <p>
                Track stock, purchases, sales, customers, and branch activity from a single operational workspace.
            </p>

            <div class="actions">
                @if (Route::has('login'))
                    @auth
                        <a class="primary" href="{{ url('/home') }}">Open dashboard</a>
                    @else
                        <a class="primary" href="{{ route('login') }}">Log in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}">Create account</a>
                        @endif
                    @endauth
                @endif
            </div>

            <p class="meta">Built for a clean, maintainable, production-ready workflow.</p>
        </main>
    </body>
</html>
