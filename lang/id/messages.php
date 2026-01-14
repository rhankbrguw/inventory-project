<?php

return [
    // Network & Server Errors
    'network_error' => 'Kesalahan Jaringan',
    'network_error_desc' => 'Gagal terhubung ke server. Cek koneksi internet Anda.',
    'server_error' => 'Kesalahan Server',
    'server_error_desc' => 'Terjadi kesalahan di server.',

    // Stock Transfer Messages
    'transfer' => [
        'created' => 'Permintaan transfer dibuat. Menunggu persetujuan dari lokasi tujuan.',
        'approved' => 'Transfer disetujui. Menunggu pengiriman dari lokasi asal.',
        'rejected' => 'Transfer ditolak.',
        'shipped' => 'Barang dikirim. Menunggu konfirmasi penerimaan.',
        'received' => 'Barang diterima. Transfer selesai.',
        'not_approved' => 'Belum disetujui.',
        'not_shipped' => 'Belum dikirim.',
        'invalid_status' => 'Status tidak valid.',
    ],

    // Purchase Messages
    'purchase' => [
        'created' => 'Transaksi pembelian berhasil disimpan.',
        'updated' => 'Pembelian berhasil diperbarui.',
        'deleted' => 'Pembelian berhasil dihapus.',
    ],

    // Sell Messages
    'sell' => [
        'created' => 'Penjualan berhasil disimpan.',
        'approved' => 'Pesanan disetujui. Menunggu pengiriman.',
        'rejected' => 'Pesanan ditolak.',
        'shipped' => 'Barang dikirim.',
        'received' => 'Barang diterima.',
        'not_approved' => 'Pesanan belum disetujui.',
        'not_shipped' => 'Barang belum dikirim.',
        'invalid_status' => 'Status tidak valid.',
    ],

    // Product Messages
    'product' => [
        'created' => 'Produk berhasil ditambahkan.',
        'updated' => 'Produk berhasil diperbarui.',
        'deleted' => 'Produk berhasil dihapus.',
        'restored' => 'Produk berhasil dipulihkan.',
        'cannot_delete_has_stock' => 'Produk tidak dapat dihapus karena masih memiliki stok.',
    ],

    // Location Messages
    'location' => [
        'created' => 'Lokasi berhasil ditambahkan.',
        'updated' => 'Lokasi berhasil diperbarui.',
        'deleted' => 'Lokasi berhasil dihapus.',
        'restored' => 'Lokasi berhasil dipulihkan.',
    ],

    // Customer Messages
    'customer' => [
        'created' => 'Pelanggan berhasil ditambahkan.',
        'created_from_modal' => 'Pelanggan berhasil ditambahkan dan siap digunakan.',
        'updated' => 'Pelanggan berhasil diperbarui.',
        'deleted' => 'Pelanggan berhasil dihapus.',
        'restored' => 'Pelanggan berhasil dipulihkan.',
    ],

    // Supplier Messages
    'supplier' => [
        'created' => 'Pemasok berhasil ditambahkan.',
        'updated' => 'Pemasok berhasil diperbarui.',
        'deleted' => 'Pemasok berhasil dihapus.',
        'restored' => 'Pemasok berhasil dipulihkan.',
    ],

    // User Messages
    'user' => [
        'created' => 'Pengguna berhasil ditambahkan.',
        'updated' => 'Pengguna berhasil diperbarui.',
        'updated_with_sync' => 'Pengguna berhasil diperbarui. Role disinkronkan ke :count lokasi sebagai :role.',
        'deleted' => 'Pengguna berhasil dihapus.',
        'restored' => 'Pengguna berhasil dipulihkan.',
        'cannot_delete_in_use' => 'Tipe tidak dapat dihapus karena sedang digunakan.',
    ],

    // Type Messages
    'type' => [
        'created' => 'Tipe berhasil ditambahkan.',
        'updated' => 'Tipe berhasil diperbarui.',
        'deleted' => 'Tipe berhasil dihapus.',
        'restored' => 'Tipe berhasil dipulihkan.',
        'cannot_delete_in_use' => 'Tipe tidak dapat dihapus karena sedang digunakan.',
    ],

    // Stock Messages
    'stock' => [
        'adjusted' => 'Stok berhasil disesuaikan.',
        'insufficient' => 'Stok tidak mencukupi.',
    ],

    // General Messages
    'success' => 'Berhasil!',
    'error' => 'Terjadi Kesalahan',
    'unauthorized' => 'Tidak Diizinkan',
    'not_found' => 'Tidak Ditemukan',
    'validation_failed' => 'Validasi Gagal',
];
