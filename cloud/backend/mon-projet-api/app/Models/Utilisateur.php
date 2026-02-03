<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'utilisateur';
    protected $primaryKey = 'Id_utilisateur';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'email',
        'mdp',
        'id_deleted',
        'fire_user_id',
        'Id_role'
    ];

    protected $hidden = [
        'mdp',
    ];

    public function getAuthPassword()
    {
        return $this->mdp;
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'Id_role', 'Id_role');
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
