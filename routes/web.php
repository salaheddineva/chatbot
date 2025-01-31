<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/resources/images/{filename}', function($filename){
    $fileContent = !app()->environment('local')
        ? file_get_contents(asset('images/'.$filename))
        : file_get_contents(public_path('images/'.$filename));
    $mimeType = !app()->environment('local')
        ? mime_content_type(asset('images/'.$filename))
        : File::mimeType(public_path('images/'.$filename));

    return Response::make($fileContent, 200, [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="'.$filename.'"'
    ]);
});