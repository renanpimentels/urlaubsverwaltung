import { CompanySettingsCard } from "@/components/CompanySettingsCard";
import { DepartmentSettingsList } from "@/components/DepartmentSettingsList";
import { PageHeader } from "@/components/PageHeader";
import { companySettings, departments, employees } from "@/lib/mock-data";

export default function SettingsPage() {
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