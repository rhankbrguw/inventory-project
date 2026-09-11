import { Building2, Truck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupplierTabContent from './SupplierTabContent';
import InternalTabContent from './InternalTabContent';
import useTranslation from '@/hooks/useTranslation';

export default function PurchaseCartSourceSelector({
    sourceTab,
    handleTabChange,
    supplierOpen,
    setSupplierOpen,
    warehouseOpen,
    setWarehouseOpen,
    getSupplierLabel,
    getWarehouseLabel,
    suppliers,
    warehouses,
    locations,
    selectedSourceId,
    setFilter,
    onInternalSourceChange,
}) {
    const { t } = useTranslation();
    const restrictedWarehouseIds =
        locations.length === 1 ? [locations[0].id.toString()] : [];

    return (
        <Tabs
            value={sourceTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList className="grid w-full grid-cols-2 h-9 mb-3">
                <TabsTrigger value="supplier" className="text-xs">
                    <Truck className="h-3 w-3 mr-1" />
                    {t('ui.supplier_label')}
                </TabsTrigger>
                <TabsTrigger value="internal" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    {t('ui.internal_label')}
                </TabsTrigger>
            </TabsList>

            <SupplierTabContent
                supplierOpen={supplierOpen}
                setSupplierOpen={setSupplierOpen}
                getSupplierLabel={getSupplierLabel}
                suppliers={suppliers}
                selectedSourceId={selectedSourceId}
                setFilter={setFilter}
                onInternalSourceChange={onInternalSourceChange}
            />

            <InternalTabContent
                warehouseOpen={warehouseOpen}
                setWarehouseOpen={setWarehouseOpen}
                getWarehouseLabel={getWarehouseLabel}
                warehouses={warehouses}
                selectedSourceId={selectedSourceId}
                restrictedWarehouseIds={restrictedWarehouseIds}
                onInternalSourceChange={onInternalSourceChange}
            />
        </Tabs>
    );
}
