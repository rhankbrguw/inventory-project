import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users } from 'lucide-react';

export default function LocationOfficersCell({ users = [], t }) {
    if (!users || users.length === 0) {
        return <span className="text-muted-foreground text-xs italic">{t('ui.no_officers')}</span>;
    }

    const maxVisible = 2;
    const visibleUsers = users.slice(0, maxVisible);
    const hiddenCount = users.length - maxVisible;

    return (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {visibleUsers.map((user) => (
                <Badge key={user.id} variant="secondary" className="text-xs font-normal py-0.5 px-2">
                    <span className="truncate max-w-[110px]">{user.name}</span>
                    {user.role_code && <span className="ml-1 text-[10px] font-semibold text-muted-foreground">({user.role_code})</span>}
                </Badge>
            ))}
            {hiddenCount > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center"
                        >
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs font-medium py-0.5 px-1.5 transition-colors">
                                <Users className="w-3 h-3 mr-1" />
                                +{hiddenCount} {t('ui.more_officers')}
                            </Badge>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 shadow-lg" align="center" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5 border-b pb-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" /> {t('ui.all_assigned_officers')} ({users.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {users.map((u) => (
                                <div key={u.id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-muted/50 transition-colors">
                                    <span className="font-medium text-foreground truncate max-w-[150px]">{u.name}</span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                                        {u.role_code || u.role?.code || 'STF'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
