<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F5F7; font-family: 'Montserrat', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F4F5F7; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden; border: 1px solid #E2E4E8;">

                    <tr>
                        <td style="padding: 0; height: 6px; background-color: #282C34;"></td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #282C34;">
                                Selamat Datang!
                            </h1>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #52525B;">
                                Halo <strong>{{ $user->name }}</strong>,
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #52525B;">
                                Akun Anda telah berhasil diverifikasi. Sekarang Anda memiliki akses penuh ke <strong>Inventory System</strong> untuk mengelola stok, memantau transaksi, dan mengatur laporan dengan lebih efisien.
                            </p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background-color: #282C34;">
                                        <a href="{{ $loginUrl }}" target="_blank" style="padding: 14px 32px; border: 1px solid #282C34; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block; cursor: pointer;">
                                            Masuk ke Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E4E8;">
                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #94A3B8;">
                                    Jika tombol di atas tidak berfungsi, salin tautan ini ke browser Anda:
                                </p>
                                <a href="{{ $loginUrl }}" style="font-size: 12px; color: #282C34; text-decoration: underline; word-break: break-all;">
                                    {{ $loginUrl }}
                                </a>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #F8FAFC; padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94A3B8; font-weight: 500;">
                                Tim Developer Inventory System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
