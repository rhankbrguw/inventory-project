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
        'approved' => 'Transfer is on process. Awaiting shipment from source location.',
        'rejected' => 'Transfer rejected.',
        'shipped' => 'Goods shipped. Awaiting receipt confirmation.',
        'received' => 'Goods received. Transfer completed.',
        'not_approved' => 'Not yet approved.',
        'not_shipped' => 'Not yet shipped.',
        'invalid_status' => 'Invalid status.',
    ],

    // Purchase Messages
    'purchase' => [
        'created' => 'Purchase transaction saved successfully.',
        'updated' => 'Purchase updated successfully.',
        'deleted' => 'Purchase deleted successfully.',
    ],

    // Sell Messages
    'sell' => [
        'created' => 'Sale saved successfully.',
        'approved' => 'Order is on process. Awaiting shipment.',
        'rejected' => 'Order rejected.',
        'shipped' => 'Goods shipped.',
        'received' => 'Goods received.',
        'not_approved' => 'Order not yet approved.',
        'not_shipped' => 'Goods not yet shipped.',
        'invalid_status' => 'Invalid status.',
    ],

    // Product Messages
    'product' => [
        'created' => 'Product added successfully.',
        'updated' => 'Product updated successfully.',
        'deleted' => 'Product deleted successfully.',
        'restored' => 'Product restored successfully.',
        'cannot_delete_has_stock' => 'Product cannot be deleted because it still has stock.',
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
        'created_from_modal' => 'Customer added successfully and ready to use.',
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
        'updated_with_sync' => 'User updated successfully. Role synchronized to :count location(s) as :role.',
        'deleted' => 'User deleted successfully.',
        'restored' => 'User restored successfully.',
        'cannot_delete_self' => 'You cannot delete your own account.'
    ],

    // Type Messages
    'type' => [
        'created' => 'Type added successfully.',
        'updated' => 'Type updated successfully.',
        'deleted' => 'Type deleted successfully.',
        'restored' => 'Type restored successfully.',
        'cannot_delete_in_use' => 'Type cannot be deleted because it is currently in use.',
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
