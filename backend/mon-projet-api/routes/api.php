<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\LoginAttemptController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;


Route::post('login', [LoginAttemptController::class, 'login']);
Route::apiResource('tests', TestController::class);
Route::post('reset-block/{user_id}', [LoginAttemptController::class, 'resetBlock']);
Route::post('register', [AuthController::class, 'register']);
Route::apiResource('roles', RoleController::class);

Route::put('users/{id}', [UserController::class, 'update']);

