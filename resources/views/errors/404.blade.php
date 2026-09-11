<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Halaman Tidak Ditemukan</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,900&display=swap" rel="stylesheet" />
    <style>
        :root {
            --page-bg: 220 13% 9%;
            --page-foreground: 0 0% 95%;
            --page-soft: 220 13% 14%;
            --page-subtle: 220 13% 23%;
            --page-muted: 220 9% 64%;
            --page-border: 220 13% 23%;
            --page-danger: 0 84% 60%;
            --page-action: 221 83% 53%;
            --page-action-strong: 217 91% 60%;
            --page-surface: 220 13% 14%;
        }

        *, ::after, ::before { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Figtree, system-ui, -apple-system, sans-serif;
            background-color: hsl(var(--page-bg));
            color: hsl(var(--page-foreground));
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .container {
            max-width: 32rem;
            width: 100%;
            text-align: center;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-weight: 600;
            background: hsl(var(--page-soft));
            color: hsl(var(--page-muted));
            border: 1px solid hsl(var(--page-border));
            margin-bottom: 1.25rem;
        }
        .dot {
            width: 0.375rem;
            height: 0.375rem;
            border-radius: 9999px;
            background-color: hsl(var(--page-danger));
        }
        .code {
            font-size: 6rem;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -0.05em;
            color: hsl(var(--page-foreground));
            margin-bottom: 1rem;
            user-select: none;
        }
        h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: hsl(var(--page-foreground)); letter-spacing: -0.025em; }
        p { font-size: 0.875rem; color: hsl(var(--page-muted)); line-height: 1.6; margin-bottom: 2rem; max-width: 26rem; margin-left: auto; margin-right: auto; }
        .btn-group { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            font-size: 0.8125rem;
            font-weight: 600;
            border-radius: 0.5rem;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
        }
        .btn-primary { background: hsl(var(--page-action)); color: hsl(var(--page-foreground)); border: 1px solid hsl(var(--page-action)); }
        .btn-primary:hover { background: hsl(var(--page-action-strong)); }
        .btn-outline { background: hsl(var(--page-soft)); color: hsl(var(--page-foreground)); border: 1px solid hsl(var(--page-border)); }
        .btn-outline:hover { background: hsl(var(--page-border)); }
        .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid hsl(var(--page-border));
            font-family: ui-monospace, monospace;
            font-size: 0.6875rem;
            color: hsl(var(--page-muted));
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">
            <span class="dot"></span>
            <span>HTTP 404</span>
        </div>
        <div class="code">404</div>
        <h2>Halaman Tidak Ditemukan</h2>
        <p>Halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang dimasukkan salah.</p>
        <div class="btn-group">
            <button onclick="window.history.back()" class="btn btn-outline">Kembali</button>
            <a href="/dashboard" class="btn btn-primary">Kembali ke Dashboard</a>
        </div>
        <div class="footer">Enterprise Cloud Platform</div>
    </div>
</body>
</html>
