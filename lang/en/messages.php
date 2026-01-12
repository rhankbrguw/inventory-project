<?php

return [
    // Network & Server Errors
    'network_error' => 'Network Error',
    'network_error_desc' => 'Failed to connect to server. Check your internet connection.',
    'server_error' => 'Server Error',
    'server_error_desc' => 'An error occurred on the server.',

    // Stock Transfer Messages
    'transfer' => [
        'created' => 'Transfer request created. Awaiting approval from destination location.',
        'approved' => 'Transfer approved. Awaiting shipment from source location.',
        'rejected' => 'Transfer rejected.',
        'shipped' => 'Goods shipped. Awaiting receipt confirmation.',
        'received' => 'Goods received. Transfer completed.',
        'not_approved' => 'Not yet approved.',
        'not_shipped' => 'Not yet shipped.',
        'invalid_status' => 'Invalid status.',
    ],

    // Purchase Messages
    'purchase' => [
        'created' => 'Purchase created successfully.',
        'updated' => 'Purchase updated successfully.',
        'deleted' => 'Purchase deleted successfully.',
    ],

    // Sell Messages
    'sell' => [
        'created' => 'Sale created successfully.',
        'approved' => 'Sale approved.',
        'rejected' => 'Sale rejected.',
        'shipped' => 'Goods shipped.',
        'received' => 'Goods received.',
    ],

    // Product Messages
    'product' => [
        'created' => 'Product added successfully.',
        'updated' => 'Product updated successfully.',
        'deleted' => 'Product deleted successfully.',
        'restored' => 'Product restored successfully.',
    ],

    // Location Messages
    'location' => [
        'created' => 'Location added successfully.',
        'updated' => 'Location updated successfully.',
        'deleted' => 'Location deleted successfully.',
        'restored' => 'Location restored successfully.',
    ],

    // Customer Messages
    'customer' => [
        'created' => 'Customer added successfully.',
        'updated' => 'Customer updated successfully.',
        'deleted' => 'Customer deleted successfully.',
        'restored' => 'Customer restored successfully.',
    ],

    // Supplier Messages
    'supplier' => [
        'created' => 'Supplier added successfully.',
        'updated' => 'Supplier updated successfully.',
        'deleted' => 'Supplier deleted successfully.',
        'restored' => 'Supplier restored successfully.',
    ],

    // User Messages
    'user' => [
        'created' => 'User added successfully.',
        'updated' => 'User updated successfully.',
        'deleted' => 'User deleted successfully.',
        'restored' => 'User restored successfully.',
    ],

    // Stock Messages
    'stock' => [
        'adjusted' => 'Stock adjusted successfully.',
        'insufficient' => 'Insufficient stock.',
    ],

    // General Messages
    'success' => 'Success!',
    'error' => 'Error Occurred',
    'unauthorized' => 'Unauthorized',
    'not_found' => 'Not Found',
    'validation_failed' => 'Validation Failed',
];
