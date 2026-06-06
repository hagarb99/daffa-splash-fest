import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivitiesAdmin } from "@/components/admin/ActivitiesAdmin";
import { TimeSlotsAdmin } from "@/components/admin/TimeSlotsAdmin";
import { CitiesAdmin } from "@/components/admin/CitiesAdmin";
import { SponsorsAdmin } from "@/components/admin/SponsorsAdmin";
import { BrandsAdmin } from "@/components/admin/BrandsAdmin";
import { BookingsAdmin } from "@/components/admin/BookingsAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLang();

  if (loading) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><Link to="/auth" className="underline">{t.nav.signIn}</Link></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">403 — admin only</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h1 className="font-display text-4xl font-bold text-primary mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="flex flex-wrap h-auto justify-start">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="slots">Time Slots</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">User Roles</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="bookings"><BookingsAdmin /></TabsContent>
            <TabsContent value="activities"><ActivitiesAdmin /></TabsContent>
            <TabsContent value="slots"><TimeSlotsAdmin /></TabsContent>
            <TabsContent value="cities"><CitiesAdmin /></TabsContent>
            <TabsContent value="sponsors"><SponsorsAdmin /></TabsContent>
            <TabsContent value="brands"><BrandsAdmin /></TabsContent>
            <TabsContent value="settings"><SettingsAdmin /></TabsContent>
            <TabsContent value="users"><UsersAdmin /></TabsContent>
          </div>
        </Tabs>
      </section>
      <Footer />
    </div>
  );
}
