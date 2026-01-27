<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;
    protected $fillable = [
        'email',
        'password',
        'nom',
        'prenom',
        'role_id',
        'blocked',
        'failed_attempts',
        'is_deleted'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'blocked' => 'boolean',
        'is_deleted' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    // Relations
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function loginAttempts()
    {
        return $this->hasOne(LoginAttempt::class);
    }

    public function signalements()
    {
        return $this->hasMany(Signalement::class);
    }

    public function syncLogs()
    {
        return $this->hasMany(SyncLog::class, 'manager_id');
    }

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
