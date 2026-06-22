import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-light text-[var(--text)]">Plenitude</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Meditações para o seu bem-estar</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-[var(--bg-card)] border border-[var(--border)] shadow-xl rounded-2xl",
            headerTitle: "text-[var(--text)] font-semibold",
            headerSubtitle: "text-[var(--text-muted)]",
            formButtonPrimary: "bg-[var(--gold)] text-[#0D0F1C] hover:bg-[var(--gold-light)] font-semibold",
            formFieldInput: "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text)] rounded-lg",
            formFieldLabel: "text-[var(--text-muted)]",
            footerActionLink: "text-[var(--gold)]",
            socialButtonsBlockButton: "hidden",
            socialButtonsBlockButtonText: "hidden",
            dividerRow: "hidden",
          },
        }}
      />
    </div>
  )
}
