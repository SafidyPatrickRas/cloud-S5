<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    use HasFactory;

    protected $table = 'entreprise';
    protected $primaryKey = 'Id_entreprise';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'nom',
        'is_deleted'
    ];

    public function problemes()
    {
        return $this->hasMany(Probleme::class, 'Id_entreprise', 'Id_entreprise');
    }
}
