<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $isReady ? 'WhatsApp Gateway - Terhubung' : 'WhatsApp Gateway - Tautkan Perangkat' }}</title>
    @if(!$isReady)
    <meta http-equiv="refresh" content="{{ $qrData ? 15 : 5 }}">
    @endif
    <style>
        :root {
            --wa-bg: 220 13% 9%;
            --wa-card: 220 13% 14%;
            --wa-border: 220 13% 22%;
            --wa-subtle: 220 13% 10%;
            --wa-text: 0 0% 97%;
            --wa-muted: 220 9% 65%;
            --wa-dim: 220 9% 45%;
            --wa-success: 142 76% 45%;
            --wa-success-bg: 142 76% 45% / 0.15;
            --wa-action: 199 89% 48%;
            --wa-action-fg: 220 13% 9%;
        }
        *, ::after, ::before { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: hsl(var(--wa-bg));
            color: hsl(var(--wa-text));
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .card {
            background-color: hsl(var(--wa-card));
            border: 1px solid hsl(var(--wa-border));
            border-radius: 1rem;
            padding: 2rem;
            width: 100%;
            max-width: 26rem;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        .icon-circle {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 9999px;
            background-color: hsl(var(--wa-success-bg));
            border: 1px solid hsl(var(--wa-success) / 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
        }
        .icon-circle svg {
            width: 1.75rem;
            height: 1.75rem;
            stroke: hsl(var(--wa-success));
        }
        .title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.375rem; color: hsl(var(--wa-text)); }
        .badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            margin-bottom: 1.25rem;
        }
        .badge-success { background-color: hsl(var(--wa-success-bg)); color: hsl(var(--wa-success)); }
        .badge-pending { background-color: hsl(var(--wa-border)); color: hsl(var(--wa-muted)); }
        .info-box {
            background-color: hsl(var(--wa-subtle));
            border: 1px solid hsl(var(--wa-border));
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: left;
            font-size: 0.8125rem;
            margin-bottom: 1.25rem;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding-bottom: 0.5rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid hsl(var(--wa-card));
        }
        .info-row:last-child { padding-bottom: 0; margin-bottom: 0; border-bottom: none; }
        .info-label { color: hsl(var(--wa-muted)); }
        .info-value { font-weight: 600; color: hsl(var(--wa-text)); }
        .info-value-success { font-weight: 600; color: hsl(var(--wa-success)); }
        .qr-wrapper {
            background-color: #ffffff;
            border-radius: 0.75rem;
            padding: 0.75rem;
            display: inline-block;
            margin-bottom: 1rem;
        }
        .qr-image { width: 15rem; height: 15rem; display: block; }
        .desc { font-size: 0.75rem; color: hsl(var(--wa-muted)); line-height: 1.5; margin-bottom: 1.25rem; }
        .footer-note { font-size: 0.75rem; color: hsl(var(--wa-dim)); margin-top: 0.5rem; }
        .btn {
            display: inline-block;
            padding: 0.625rem 1.5rem;
            background-color: hsl(var(--wa-action));
            color: hsl(var(--wa-action-fg));
            font-size: 0.8125rem;
            font-weight: 600;
            border-radius: 0.5rem;
            text-decoration: none;
            transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="card">
        @if($isReady)
            <div class="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 class="title">WhatsApp Gateway Aktif</h2>
            <div class="badge badge-success">● TERHUBUNG (READY)</div>
            <div class="info-box">
                <div class="info-row"><span class="info-label">Nomor HP:</span><span class="info-value">+{{ $phone }}</span></div>
                <div class="info-row"><span class="info-label">Nama Akun:</span><span class="info-value">{{ $name }}</span></div>
                <div class="info-row"><span class="info-label">Status Server:</span><span class="info-value-success">Aktif 24/7 (Online)</span></div>
            </div>
            <p class="desc">Notifikasi transaksi, peringatan stok, dan cron schedule siap dikirim otomatis.</p>
            <a href="/wa-qr" class="btn">Refresh Status</a>
        @elseif($qrData)
            <h2 class="title">Tautkan WhatsApp</h2>
            <p class="desc">Buka WhatsApp di HP &rarr; Menu &rarr; Perangkat Tertaut &rarr; Tautkan Perangkat</p>
            <div class="qr-wrapper">
                <img src="{{ $qrData }}" alt="WhatsApp QR" class="qr-image" />
            </div>
            <p class="footer-note">Otomatis me-refresh tiap 15 detik.<br>Setelah di-scan, sesi akan aktif 24/7 di server.</p>
        @else
            <h2 class="title">Status Sesi: {{ $status }}</h2>
            <div class="badge badge-pending">MEMPROSES</div>
            <p class="desc">Menghubungkan ke layanan WhatsApp... Halaman me-refresh otomatis tiap 5 detik.</p>
            <a href="/wa-qr" class="btn">Coba Sekarang</a>
        @endif
    </div>
</body>
</html>
