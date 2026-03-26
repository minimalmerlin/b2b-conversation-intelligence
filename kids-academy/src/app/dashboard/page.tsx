import { DashboardClient } from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <DashboardClient />
    </div>
  );
}

