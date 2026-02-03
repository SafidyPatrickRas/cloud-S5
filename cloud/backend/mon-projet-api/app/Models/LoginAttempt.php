<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Utilisateur;

class LoginAttempt extends Model
{
    use HasFactory;

    protected $table = 'login_attempts';

    protected $fillable = [
        'user_id',
        'attempts',
        'blocked_until'
    ];

    public function user()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
