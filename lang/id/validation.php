<?php

return [
    'accepted' => ':attribute harus diterima.',
    'current_password' => 'Password yang dimasukkan salah.',
    'distinct' => 'Isian :attribute memiliki nilai yang duplikat.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'exists' => ':attribute yang dipilih tidak valid.',
    'max' => [
        'string' => ':attribute tidak boleh lebih dari :max karakter.',
    ],
    'min' => [
        'string' => ':attribute minimal harus :min karakter.',
    ],
    'required' => 'Kolom :attribute tidak boleh kosong.',
    'string' => ':attribute harus berupa teks.',
    'unique' => ':attribute ini sudah terdaftar.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'custom' => [
        'items.*.product_id' => [
            'distinct' => 'Produk yang sama tidak boleh ditambahkan lebih dari sekali.',
        ],
    ],
    'attributes' => [
        'name' => 'Nama Lengkap',
        'email' => 'Alamat Email',
        'password' => 'Password',
        'items.*.product_id' => 'Produk',
    ],
];
