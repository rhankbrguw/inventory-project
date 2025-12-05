<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi</title>
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
                        <td style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #F4F5F7;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #282C34; text-transform: uppercase; letter-spacing: 1px;">
                                Inventory System
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #282C34; font-weight: 600;">
                                Verifikasi Keamanan
                            </h2>
                            <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #52525B;">
                                Halo {{ $user->name }},<br>
                                Untuk melindungi akun Anda, silakan masukkan kode berikut di halaman verifikasi. Kode ini akan kedaluwarsa dalam {{ $validityDuration }} menit.
                            </p>

                            <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
                                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #282C34; display: block;">
                                    {{ $otp }}
                                </span>
                            </div>

                            <p style="margin: 0; font-size: 13px; color: #94A3B8; font-style: italic;">
                                Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #F8FAFC; padding: 20px 40px; text-align: center; border-top: 1px solid #E2E4E8;">
                            <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                                &copy; {{ date('Y') }} Inventory System. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
