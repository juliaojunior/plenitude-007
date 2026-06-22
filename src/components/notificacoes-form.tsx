"use client"

import { useState, useTransition } from "react"
import { Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { salvarNotificacoes } from "@/app/actions/notificacoes"

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const TIPOS = [
  { id: "pratica_diaria",    label: "Prática diária" },
  { id: "novas_meditacoes",  label: "Novas meditações" },
  { id: "manutencao_sequencia", label: "Manter sequência" },
  { id: "sugestoes",         label: "Sugestões" },
]

interface Props {
  userId: string
  config: {
    ativo: boolean | null
    horarios: string[] | null
    diasSemana: number[] | null
    tipos: string[] | null
    antecedenciaMinutos: number | null
  } | null
}

export function NotificacoesForm({ userId, config }: Props) {
  const [ativo, setAtivo] = useState(config?.ativo ?? false)
  const [horarios, setHorarios] = useState<string[]>(config?.horarios ?? ["08:00"])
  const [dias, setDias] = useState<number[]>(config?.diasSemana ?? [1, 2, 3, 4, 5])
  const [tipos, setTipos] = useState<string[]>(config?.tipos ?? ["pratica_diaria"])
  const [novoHorario, setNovoHorario] = useState("08:00")
  const [status, setStatus] = useState<"idle" | "ok" | "erro">("idle")
  const [isPending, startTransition] = useTransition()

  function toggleDia(d: number) {
    setDias((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  function toggleTipo(t: string) {
    setTipos((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function addHorario() {
    if (!horarios.includes(novoHorario)) setHorarios((prev) => [...prev, novoHorario].sort())
  }

  function save() {
    startTransition(async () => {
      const result = await salvarNotificacoes(userId, { ativo, horarios, diasSemana: dias, tipos, antecedenciaMinutos: 0 })
      setStatus(result.ok ? "ok" : "erro")
      setTimeout(() => setStatus("idle"), 3000)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle principal */}
      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div>
          <p className="font-medium text-[var(--text)]">Ativar notificações</p>
          <p className="text-xs text-[var(--text-muted)]">Requer permissão do navegador</p>
        </div>
        <button
          role="switch"
          aria-checked={ativo}
          onClick={() => setAtivo(!ativo)}
          className={`relative h-7 w-12 rounded-full transition-colors ${ativo ? "bg-[var(--gold)]" : "bg-[var(--bg-surface)]"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${ativo ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {/* Horários */}
      <div className={`flex flex-col gap-3 ${!ativo ? "pointer-events-none opacity-40" : ""}`}>
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Horários
        </h2>
        <div className="flex flex-wrap gap-2">
          {horarios.map((h) => (
            <div key={h} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1">
              <span className="text-sm font-medium text-[var(--text)]">{h}</span>
              <button onClick={() => setHorarios((prev) => prev.filter((x) => x !== h))} className="text-[var(--text-faint)] hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={novoHorario}
            onChange={(e) => setNovoHorario(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--gold)] focus:outline-none"
          />
          <Button variant="outline" size="sm" onClick={addHorario}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        {/* Dias da semana */}
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Dias da semana
        </h2>
        <div className="flex gap-2">
          {DIAS.map((d, i) => (
            <button
              key={d}
              onClick={() => toggleDia(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                dias.includes(i)
                  ? "bg-[var(--gold)] text-[#0D0F1C]"
                  : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]"
              }`}
            >
              {d[0]}
            </button>
          ))}
        </div>

        {/* Tipos */}
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Tipo de lembrete
        </h2>
        <div className="flex flex-col gap-2">
          {TIPOS.map(({ id, label }) => (
            <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  tipos.includes(id)
                    ? "border-[var(--gold)] bg-[var(--gold)]"
                    : "border-[var(--border)]"
                }`}
                onClick={() => toggleTipo(id)}
              >
                {tipos.includes(id) && <Check size={12} className="text-[#0D0F1C]" />}
              </span>
              <span className="text-sm text-[var(--text)]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salvar */}
      <Button onClick={save} disabled={isPending} className="w-full">
        {isPending ? "Salvando…" : "Salvar configurações"}
      </Button>

      {status === "ok" && (
        <p className="text-center text-sm text-emerald-500">Configurações salvas!</p>
      )}
      {status === "erro" && (
        <p className="text-center text-sm text-red-400">Erro ao salvar. Tente novamente.</p>
      )}
    </div>
  )
}
