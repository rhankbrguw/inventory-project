<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi</title>
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
                                Verifikasi Keamanan
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                                Halo <strong>{{ $user->name }}</strong>,<br>
                                Untuk melindungi akun Anda, silakan masukkan kode verifikasi berikut. Kode ini berlaku selama <strong>{{ $validityDuration }} menit</strong>.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td bgcolor="#F1F5F9" align="center" style="background-color: #F1F5F9; border: 2px dashed #CBD5E1; border-radius: 8px; padding: 20px;">
                                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F172A; display: inline-block; font-family: 'Courier New', Courier, monospace;">
                                            {{ $otp }}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94A3B8;">
                                <em>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dengan aman.</em>
                            </p>
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
