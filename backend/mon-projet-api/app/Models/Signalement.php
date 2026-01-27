<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Signalement extends Model
{
    protected $table = 'signalement';
    
    protected $primaryKey = 'id_signalement';
    
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_probleme',
        'user_id',
        'date_signalement',
        'commentaire',
        'is_deleted',
        'last_update'
    ];

    protected $casts = [
        'date_signalement' => 'datetime',
        'is_deleted' => 'boolean',
        'last_update' => 'datetime',
    ];

    public $timestamps = true;

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
            if (empty($model->date_signalement)) {
                $model->date_signalement = now();
            }
        });
    }

    // Relations
    public function probleme()
    {
        return $this->belongsTo(ProblemeRoutier::class, 'id_probleme', 'id_probleme');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
