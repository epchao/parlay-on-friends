import BetHistory from "@/components/bet-history/BetHistory";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <BetHistory />
      {children}
    </section>
  );
}
