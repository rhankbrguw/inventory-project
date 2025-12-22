import { Link, usePage } from "@inertiajs/react";
import useTranslation from "@/hooks/useTranslation";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    BarChart2,
    Users,
    Truck,
    Settings,
    ClipboardList,
    MapPin,
    Contact,
    ArrowRightLeft,
} from "lucide-react";

const NavLink = ({ href, active, children, onClick }) => (
    <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
    >
        {children}
    </Link>
);

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const user = auth.user;
    const userLevel = user.level;

    const hasAccess = (link) => {
        if (link.requiredLevel && userLevel > link.requiredLevel) return false;
        return true;
    };

    const navLinks = [
        {
            name: t("ui.dashboard"),
            href: route("dashboard"),
            icon: LayoutDashboard,
            current: route().current("dashboard"),
            requiredLevel: 100,
        },
        {
            name: t("ui.product"),
            href: route("products.index"),
            icon: Package,
            current: route().current("products.*"),
            requiredLevel: 20,
        },
        {
            name: t("ui.locations"),
            href: route("locations.index"),
            icon: MapPin,
            current: route().current("locations.*"),
            requiredLevel: 10,
        },
        {
            name: t("ui.stock"),
            href: route("stock.index"),
            icon: Warehouse,
            current:
                route().current("stock.*") &&
                !route().current("stock-movements.*"),
            requiredLevel: 20,
        },
        {
            name: t("ui.stock_movements"),
            href: route("stock-movements.index"),
            icon: ArrowRightLeft,
            current: route().current("stock-movements.*"),
            requiredLevel: 10,
        },
        {
            name: t("ui.transactions"),
            href: route("transactions.index"),
            icon: ClipboardList,
            current: route().current("transactions.*"),
            requiredLevel: 20,
        },
        {
            name: t("ui.suppliers"),
            href: route("suppliers.index"),
            icon: Truck,
            current: route().current("suppliers.*"),
            requiredLevel: 10,
        },
        {
            name: t("ui.customers"),
            href: route("customers.index"),
            icon: Contact,
            current: route().current("customers.*"),
            requiredLevel: 20,
        },
        {
            name: t("ui.reports"),
            href: route("reports.index"),
            icon: BarChart2,
            current: route().current("reports.*"),
            requiredLevel: 10,
        },
        {
            name: t("ui.users"),
            href: route("users.index"),
            icon: Users,
            current: route().current("users.*"),
            requiredLevel: 1,
        },
        {
            name: t("ui.types"),
            href: route("types.index"),
            icon: Settings,
            current: route().current("types.*"),
            requiredLevel: 1,
        },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`}
        >
            <div className="h-16 flex items-center justify-center px-4 border-b">
                <h1 className="text-xl font-bold text-foreground">
                    {t("ui.welcome")}
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navLinks.filter(hasAccess).map((link) => (
                    <NavLink
                        key={link.href}
                        href={link.href}
                        active={link.current}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
