<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body bgcolor="#F8FAFC" style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#F8FAFC" style="background-color: #F8FAFC; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <tr>
                        <td bgcolor="#0F172A" style="background-color: #0F172A; padding: 24px; text-align: center;">
                            <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 2px;">
                                INVENTORY SYSTEM
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px 24px;">
                            <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0F172A; font-weight: 700;">
                                Permintaan Reset Password
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                                Halo <strong>{{ $user->name }}</strong>,<br>
                                Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:
                            </p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 24px auto;">
                                <tr>
                                    <td bgcolor="#0F172A" style="background-color: #0F172A; border-radius: 8px; text-align: center;">
                                        <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 8px; background-color: #0F172A;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                                Tautan ini akan kedaluwarsa dalam <strong>{{ config('auth.passwords.users.expire') }} menit</strong>. Jika Anda tidak meminta reset kata sandi, tidak ada tindakan lebih lanjut yang diperlukan.
                            </p>

                            <div style="padding-top: 16px; border-top: 1px solid #E2E8F0;">
                                <p style="margin: 0 0 6px 0; font-size: 12px; color: #94A3B8;">
                                    Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:
                                </p>
                                <a href="{{ $url }}" style="font-size: 12px; color: #2563EB; text-decoration: underline; word-break: break-all;">
                                    {{ $url }}
                                </a>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td bgcolor="#F8FAFC" style="background-color: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
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
