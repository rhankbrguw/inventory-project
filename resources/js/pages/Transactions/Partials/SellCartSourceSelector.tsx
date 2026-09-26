import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, AlertCircle } from 'lucide-react';
import CustomerSelector from './CustomerSelector';
import BranchSelector from './BranchSelector';
import useTranslation from '@/hooks/useTranslation';

export default function SellCartSourceSelector({
    buyerTab,
    handleTabChange,
    customerOpen,
    setCustomerOpen,
    branchOpen,
    setBranchOpen,
    selectedCustomerId,
    selectedBranchId,
    customers,
    branches,
    customerTypes,
    handleNewCustomer,
    onCustomerChange,
    onBranchChange,
    isWarehouse = false,
    currentLocationId = null,
}) {
    const { t } = useTranslation();
    const isMissingBranch = (isWarehouse || buyerTab === 'branch') && !selectedBranchId;
    const isMissingCustomer = buyerTab === 'customer' && !selectedCustomerId;

    if (isWarehouse) {
        return (
            <div className="space-y-3">
                <div className="p-2.5 rounded-lg border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t('ui.warehouse_internal_distribution_notice')}</span>
                </div>
                <BranchSelector
                    branchOpen={branchOpen}
                    setBranchOpen={setBranchOpen}
                    selectedBranchId={selectedBranchId}
                    branches={branches}
                    onBranchChange={onBranchChange}
                    currentLocationId={currentLocationId}
                />
                {isMissingBranch && (
                    <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{t('ui.dest_branch_required_warning')}</span>
                    </p>
                )}
            </div>
        );
    }

    return (
        <Tabs value={buyerTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="general" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {t('ui.general')}
                </TabsTrigger>
                <TabsTrigger value="customer" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {t('ui.customer')}
                </TabsTrigger>
                <TabsTrigger value="branch" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    {t('ui.internal_label')}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-3">
                <div className="p-3 rounded-lg border bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">{t('ui.walk_in_customer')}</p>
                </div>
            </TabsContent>

            <TabsContent value="customer" className="mt-3 space-y-2">
                <CustomerSelector
                    customerOpen={customerOpen}
                    setCustomerOpen={setCustomerOpen}
                    selectedCustomerId={selectedCustomerId}
                    customers={customers}
                    customerTypes={customerTypes}
                    handleNewCustomer={handleNewCustomer}
                    onCustomerChange={onCustomerChange}
                />
                {isMissingCustomer && (
                    <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{t('ui.dest_customer_required_warning')}</span>
                    </p>
                )}
            </TabsContent>

            <TabsContent value="branch" className="mt-3 space-y-2">
                <BranchSelector
                    branchOpen={branchOpen}
                    setBranchOpen={setBranchOpen}
                    selectedBranchId={selectedBranchId}
                    branches={branches}
                    onBranchChange={onBranchChange}
                    currentLocationId={currentLocationId}
                />
                {isMissingBranch && (
                    <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{t('ui.dest_branch_required_warning')}</span>
                    </p>
                )}
            </TabsContent>
        </Tabs>
    );
}
