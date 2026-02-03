<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Utilisateur;

class Role extends Model
{
    use HasFactory;

    protected $table = 'role';
    protected $primaryKey = 'Id_role';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'libelle',
        'niveau',
        'is_deleted'
    ];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'Id_role', 'Id_role');
    }
}
