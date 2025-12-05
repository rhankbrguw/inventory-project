<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="font-family: sans-serif; color: #333;">
    <div style="padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #845369">Inventory System</h1>
        <h2 style="color: #555879;">Verifikasi Akun Anda</h2>
        <p>Halo {{ $user->name }},</p>
        <p>Gunakan kode di bawah ini untuk memverifikasi alamat email Anda. Kode ini berlaku selama {{ $validityDuration }} menit.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; background-color: #f4f4f4; padding: 15px; border-radius: 4px; color: #555879;">
            {{ $otp }}
        </p>
        <p>Jika Anda tidak meminta kode ini, Anda dapat dengan aman mengabaikan email ini.</p>
        <p>Terima kasih,<br><b>Tim Developer</b></p>
    </div>
</body>
</html>
