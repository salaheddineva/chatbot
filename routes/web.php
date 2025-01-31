<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/resources/images/{filename}', function($filename){
    $fileContent = !app()->environment('local')
        ? file_get_contents(asset('images/'.$filename))
        : file_get_contents(public_path('images/'.$filename));
    
    $detector = new League\MimeTypeDetection\FinfoMimeTypeDetector();
    $mimeType = $detector->detectMimeTypeFromBuffer($fileContent);

    return Response::make($fileContent, 200, [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="'.$filename.'"'
    ]);
});