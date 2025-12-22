<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F5F7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F4F5F7; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #E2E4E8;">
                    <tr>
                        <td style="background-color: #282C34; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
                                INVENTORY SYSTEM
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #282C34; font-weight: 600;">
                                Permintaan Reset Password
                            </h2>
                            <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #52525B;">
                                Halo {{ $user->name }},<br>
                                Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.
                            </p>

                            <div style="text-align: center; margin-bottom: 25px;">
                                <a href="{{ $url }}" style="display: inline-block; background-color: #282C34; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                    Reset Password
                                </a>
                            </div>

                            <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #52525B;">
Link reset password ini akan kadaluwarsa dalam <strong>{{ config('auth.passwords.users.expire') }}</strong> menit. Jika Anda tidak meminta reset password, tidak ada tindakan lebih lanjut yang diperlukan.
                            </p>

                            <p style="margin: 0; font-size: 13px; color: #94A3B8; font-style: italic;">
                                Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:<br>
                                <a href="{{ $url }}" style="color: #3B82F6; text-decoration: none;">{{ $url }}</a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E4E8;">
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
