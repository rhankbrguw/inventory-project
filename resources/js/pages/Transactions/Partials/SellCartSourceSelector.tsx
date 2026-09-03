import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2 } from 'lucide-react';
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
}) {
    const { t } = useTranslation();

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

            <TabsContent value="customer" className="mt-3">
                <CustomerSelector
                    customerOpen={customerOpen}
                    setCustomerOpen={setCustomerOpen}
                    selectedCustomerId={selectedCustomerId}
                    customers={customers}
                    customerTypes={customerTypes}
                    handleNewCustomer={handleNewCustomer}
                    onCustomerChange={onCustomerChange}
                />
            </TabsContent>

            <TabsContent value="branch" className="mt-3">
                <BranchSelector
                    branchOpen={branchOpen}
                    setBranchOpen={setBranchOpen}
                    selectedBranchId={selectedBranchId}
                    branches={branches}
                    onBranchChange={onBranchChange}
                />
            </TabsContent>
        </Tabs>
    );
}
