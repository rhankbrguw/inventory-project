<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang</title>
</head>
<body style="font-family: sans-serif; color: #333; margin: 0; padding: 0;">
    <div style="padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px;">
        <h1 style="color: #845369; margin-bottom: 10px;">Inventory System</h1>
        <h2 style="color: #555879; margin-top: 0;">Selamat Datang, {{ $user->name }}!</h2>

        <p style="line-height: 1.6; color: #555;">
            Terima kasih telah bergabung. Akun Anda telah berhasil diverifikasi sepenuhnya.
            Sekarang Anda memiliki akses penuh untuk mengelola inventaris Anda dengan lebih efisien.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $loginUrl }}" style="background-color: #845369; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Masuk ke Dashboard
            </a>
        </div>

        <p style="line-height: 1.6; color: #555;">
            Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
            <span style="color: #845369; word-break: break-all;">{{ $loginUrl }}</span>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <p style="color: #999; font-size: 12px;">
            Hormat kami,<br><b>Tim Developer</b>
        </p>
    </div>
</body>
</html>
