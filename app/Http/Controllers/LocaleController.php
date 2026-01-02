<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class LocaleController extends Controller
{
    public function update(Request $request)
    {
        $locale = $request->validate([
            'locale' => 'required|in:id,en'
        ])['locale'];

        Session::put('locale', $locale);

        if ($request->user()) {
            $request->user()->update(['locale' => $locale]);
        }

        return back();
    }
}
