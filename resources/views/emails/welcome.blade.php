<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang</title>
    <style>
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f4ebd3;
            color: #555879;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #555879;
        }
        p {
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Halo, {{ $user->name }}!</h1>
        <p>
            Terima kasih telah mendaftar di <strong>Inventory SAE RASA</strong>. Akun Anda telah berhasil dibuat dan siap untuk digunakan.
        </p>
        <p>
            Anda sekarang dapat login ke dalam sistem untuk memulai.
        </p>
        <br>
        <p>Hormat kami,</p>
        <p><strong>Tim Developer</strong></p>
    </div>
</body>
</html>
