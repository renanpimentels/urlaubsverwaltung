import { notFound } from "next/navigation";

import { CompanySettingsCard } from "@/components/CompanySettingsCard";
import { DepartmentSettingsList } from "@/components/DepartmentSettingsList";
import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/current-user";
import { companySettings, departments, employees } from "@/lib/mock-data";
import { canAccessSettings } from "@/lib/mock-queries";

export default function SettingsPage() {
  if (!canAccessSettings(currentUser.role)) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Einstellungen"
        description="Zentrale Einstellungen für Urlaubsregeln, Abteilungen und Genehmigungswege."
      />

      <section className="grid gap-6">
        <CompanySettingsCard companySettings={companySettings} />

        <DepartmentSettingsList
          departments={departments}
          employees={employees}
        />
      </section>
    </>
  );
}