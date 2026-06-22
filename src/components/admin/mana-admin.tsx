"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { criarMana, atualizarMana, deletarMana } from "@/app/actions/admin"

type Mana = {
  id: string
  data: string
  textoBiblico: string
  referencia: string | null
  comentario: string | null
}

const EMPTY = { data: "", textoBiblico: "", referencia: "", comentario: "" }

export function ManaAdmin({ initialData }: { initialData: Mana[] }) {
  const [lista, setLista] = useState(initialData)
  const [editando, setEditando] = useState<Mana | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState("")
  const [isPending, startTransition] = useTransition()

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000) }

  function abrirNovo() { setForm(EMPTY); setEditando(null); setShowForm(true) }
  function abrirEditar(m: Mana) {
    setForm({ data: m.data, textoBiblico: m.textoBiblico, referencia: m.referencia ?? "", comentario: m.comentario ?? "" })
    setEditando(m); setShowForm(true)
  }

  function salvar() {
    if (!form.data || !form.textoBiblico) return
    startTransition(async () => {
      const payload = { data: form.data, textoBiblico: form.textoBiblico,
        referencia: form.referencia || undefined, comentario: form.comentario || undefined }
      if (editando) {
        await atualizarMana(editando.id, payload)
        setLista((prev) => prev.map((m) => m.id === editando.id ? { ...m, ...payload, referencia: payload.referencia ?? null, comentario: payload.comentario ?? null } : m))
        flash("Atualizado!")
      } else {
        await criarMana(payload)
        flash("Criado! Recarregue para ver na lista.")
      }
      setShowForm(false)
    })
  }

  function deletar(id: string) {
    if (!confirm("Deletar este Maná?")) return
    startTransition(async () => {
      await deletarMana(id)
      setLista((prev) => prev.filter((m) => m.id !== id))
      flash("Deletado.")
    })
  }

  const f = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{lista.length} entradas</p>
        <Button size="sm" onClick={abrirNovo}><Plus size={14} /> Novo</Button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-[var(--gold)]/10 p-3 text-sm text-[var(--gold)]">{msg}</p>}

      {showForm && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text)]">{editando ? "Editar" : "Novo Maná"}</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)]"><X size={16} /></button>
          </div>
          <div className="flex flex-col gap-3">
            <input type="date" value={form.data} onChange={(e) => f("data", e.target.value)} className="input-admin" />
            <input placeholder="Referência (ex: Sl 23:1)" value={form.referencia} onChange={(e) => f("referencia", e.target.value)} className="input-admin" />
            <textarea placeholder="Texto bíblico *" value={form.textoBiblico} onChange={(e) => f("textoBiblico", e.target.value)} rows={3} className="input-admin resize-none" />
            <textarea placeholder="Comentário / reflexão" value={form.comentario} onChange={(e) => f("comentario", e.target.value)} rows={4} className="input-admin resize-none" />
            <Button onClick={salvar} disabled={isPending}>{isPending ? "Salvando…" : "Salvar"}</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {lista.map((m) => (
          <div key={m.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--gold)]">{m.data}</p>
              {m.referencia && <p className="text-xs text-[var(--text-muted)]">{m.referencia}</p>}
              <p className="mt-1 line-clamp-2 text-sm text-[var(--text)]">{m.textoBiblico}</p>
            </div>
            <button onClick={() => abrirEditar(m)} className="text-[var(--text-muted)] hover:text-[var(--text)] shrink-0"><Pencil size={15} /></button>
            <button onClick={() => deletar(m.id)} className="text-[var(--text-muted)] hover:text-red-400 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .input-admin {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input-admin:focus { border-color: var(--gold); }
      `}</style>
    </div>
  )
}
