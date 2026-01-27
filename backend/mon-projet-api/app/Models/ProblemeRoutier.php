<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProblemeRoutier extends Model
{
    protected $table = 'probleme_routier';
    
    protected $primaryKey = 'id_probleme';
    
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;  

    protected $fillable = [
        'geom',
        'status',
        'surface_m2',
        'budget',
        'id_entreprise',
        'lieu',
        'description',
        'is_deleted',
        'last_update'
    ];

    protected $casts = [
        'surface_m2' => 'decimal:2',
        'budget' => 'decimal:2',
        'is_deleted' => 'boolean',
        'last_update' => 'datetime',
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
    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'id_entreprise', 'id_entreprise');
    }

    public function signalements()
    {
        return $this->hasMany(Signalement::class, 'id_probleme');
    }

    // Accesseurs pour les coordonnées PostGIS
    public function getLatitudeAttribute()
    {
        if ($this->geom) {
            preg_match('/POINT\(([^ ]+) ([^ ]+)\)/', $this->geom, $matches);
            return isset($matches[2]) ? (float) $matches[2] : null;
        }
        return null;
    }

    public function getLongitudeAttribute()
    {
        if ($this->geom) {
            preg_match('/POINT\(([^ ]+) ([^ ]+)\)/', $this->geom, $matches);
            return isset($matches[1]) ? (float) $matches[1] : null;
        }
        return null;
    }

    // Mutateur pour créer facilement un point depuis lat/lng
    public function setCoordinatesAttribute($value)
    {
        if (is_array($value) && isset($value['lat']) && isset($value['lng'])) {
            $this->attributes['geom'] = "POINT({$value['lng']} {$value['lat']})";
        }
    }
}
