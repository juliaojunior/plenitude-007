import { NavBottom } from "@/components/nav-bottom"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <NavBottom />
    </div>
  )
}
