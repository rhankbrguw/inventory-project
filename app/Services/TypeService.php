<?php

namespace App\Services;

use App\Http\Resources\TypeResource;
use App\Models\Type;
use Illuminate\Http\Request;

class TypeService
{
    public function getIndexData(Request $request): array
    {
        $types = Type::query()
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")))
            ->when($request->input('group'), fn ($q, $g) => $q->where('group', $g))
            ->when($request->input('status'), fn ($q, $st) => $st === 'active' ? $q->whereNull('deleted_at') : ($st === 'inactive' ? $q->whereNotNull('deleted_at') : null))
            ->when($request->input('sort'), fn ($q, $srt) => $this->applySort($q, $srt), fn ($q) => $q->orderBy('group')->orderBy('name'))
            ->withTrashed()->paginate(15)->withQueryString();

        return [
            'types' => TypeResource::collection($types),
            'filters' => (object) $request->only(['search', 'group', 'sort']),
            'groups' => Type::getAvailableGroups(),
        ];
    }

    private function applySort(\Illuminate\Database\Eloquent\Builder $query, string $sort): void
    {
        $direction = str_ends_with($sort, '_desc') ? 'desc' : 'asc';
        $column = str_replace(['_asc', '_desc'], '', $sort);
        $query->orderBy($column, $direction);
    }

    public function createType(array $attributes): Type
    {
        return Type::create($attributes);
    }

    public function updateType(Type $type, array $attributes): bool
    {
        return $type->update($attributes);
    }

    public function deleteType(Type $type): bool
    {
        return (bool) $type->delete();
    }

    public function restoreType(int|string $id): bool
    {
        $type = Type::withTrashed()->findOrFail($id);

        return (bool) $type->restore();
    }
}
