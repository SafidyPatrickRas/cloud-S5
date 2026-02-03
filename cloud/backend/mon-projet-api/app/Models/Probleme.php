<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Probleme extends Model
{
    use HasFactory;

    protected $table = 'probleme';
    protected $primaryKey = 'Id_probleme';

    const CREATED_AT = 'create_at';
    const UPDATED_AT = 'update_at';

    protected $fillable = [
        'is_deleted',
        'budget',
        'surface',
        'Id_entreprise'
    ];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'Id_entreprise', 'Id_entreprise');
    }

    public function signalements()
    {
        return $this->belongsToMany(
            Signalement::class,
            'signale_probleme',
            'Id_probleme',
            'Id_signalement'
        );
    }
}
