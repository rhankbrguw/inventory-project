INVENTORY SYSTEM - PERMINTAAN RESET PASSWORD

Halo {{ $user->name }},

Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.
Silakan buka tautan berikut untuk melanjutkan:
{{ $url }}

Tautan ini akan kedaluwarsa dalam {{ config('auth.passwords.users.expire') }} menit.
Jika Anda tidak meminta reset kata sandi, tidak ada tindakan lebih lanjut yang diperlukan.

© {{ date('Y') }} Inventory System. All rights reserved.
