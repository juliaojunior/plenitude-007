"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIAS } from "@/lib/categorias"
import { criarMeditacao, atualizarMeditacao, deletarMeditacao } from "@/app/actions/admin"

type Med = {
  id: string
  titulo: string
  categoria: string
  urlAudio: string | null
  textoBiblico: string | null
  referencia: string | null
  transcricao: string | null
  duracaoSegundos: number | null
}

const EMPTY = {
  titulo: "", categoria: "ansiedade", urlAudio: "",
  textoBiblico: "", referencia: "", transcricao: "", duracaoSegundos: "",
}

export function MeditacoesAdmin({ initialData }: { initialData: Med[] }) {
  const [lista, setLista] = useState(initialData)
  const [editando, setEditando] = useState<Med | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState("")
  const [isPending, startTransition] = useTransition()

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000) }

  function abrirNovo() { setForm(EMPTY); setEditando(null); setShowForm(true) }
  function abrirEditar(med: Med) {
    setForm({ ...med, urlAudio: med.urlAudio ?? "", textoBiblico: med.textoBiblico ?? "",
      referencia: med.referencia ?? "", transcricao: med.transcricao ?? "",
      duracaoSegundos: String(med.duracaoSegundos ?? "") })
    setEditando(med); setShowForm(true)
  }

  function salvar() {
    if (!form.titulo || !form.categoria) return
    startTransition(async () => {
      const payload = {
        titulo: form.titulo, categoria: form.categoria,
        urlAudio: form.urlAudio || undefined,
        textoBiblico: form.textoBiblico || undefined,
        referencia: form.referencia || undefined,
        transcricao: form.transcricao || undefined,
        duracaoSegundos: form.duracaoSegundos ? Number(form.duracaoSegundos) : undefined,
      }
      if (editando) {
        await atualizarMeditacao(editando.id, payload)
        setLista((prev) => prev.map((m): Med => m.id === editando.id
          ? { ...m, titulo: payload.titulo, categoria: payload.categoria,
              urlAudio: payload.urlAudio ?? null, textoBiblico: payload.textoBiblico ?? null,
              referencia: payload.referencia ?? null, transcricao: payload.transcricao ?? null,
              duracaoSegundos: payload.duracaoSegundos ?? null }
          : m))
        flash("Meditação atualizada!")
      } else {
        const { id } = await criarMeditacao(payload)
        const novaEntry: Med = { id, titulo: payload.titulo, categoria: payload.categoria,
          urlAudio: payload.urlAudio ?? null, textoBiblico: payload.textoBiblico ?? null,
          referencia: payload.referencia ?? null, transcricao: payload.transcricao ?? null,
          duracaoSegundos: payload.duracaoSegundos ?? null }
        setLista((prev) => [...prev, novaEntry])
        flash("Meditação criada!")
      }
      setShowForm(false)
    })
  }

  function deletar(id: string) {
    if (!confirm("Deletar esta meditação?")) return
    startTransition(async () => {
      await deletarMeditacao(id)
      setLista((prev) => prev.filter((m) => m.id !== id))
      flash("Deletada.")
    })
  }

  const f = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{lista.length} meditações</p>
        <Button size="sm" onClick={abrirNovo}><Plus size={14} /> Nova</Button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-[var(--gold)]/10 p-3 text-sm text-[var(--gold)]">{msg}</p>}

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text)]">{editando ? "Editar" : "Nova meditação"}</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)]"><X size={16} /></button>
          </div>
          <div className="flex flex-col gap-3">
            <input placeholder="Título *" value={form.titulo} onChange={(e) => f("titulo", e.target.value)} className="input-admin" />
            <select value={form.categoria} onChange={(e) => f("categoria", e.target.value)} className="input-admin">
              {CATEGORIAS.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            <input placeholder="URL do áudio" value={form.urlAudio} onChange={(e) => f("urlAudio", e.target.value)} className="input-admin" />
            <input placeholder="Referência bíblica (ex: João 3:16)" value={form.referencia} onChange={(e) => f("referencia", e.target.value)} className="input-admin" />
            <textarea placeholder="Texto bíblico" value={form.textoBiblico} onChange={(e) => f("textoBiblico", e.target.value)} rows={3} className="input-admin resize-none" />
            <textarea placeholder="Transcrição / reflexão" value={form.transcricao} onChange={(e) => f("transcricao", e.target.value)} rows={4} className="input-admin resize-none" />
            <input type="number" placeholder="Duração em segundos" value={form.duracaoSegundos} onChange={(e) => f("duracaoSegundos", e.target.value)} className="input-admin" />
            <Button onClick={salvar} disabled={isPending}>{isPending ? "Salvando…" : "Salvar"}</Button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {lista.map((med) => {
          const cat = CATEGORIAS.find((c) => c.slug === med.categoria)
          return (
            <div key={med.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <span className="text-xl">{cat?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--text)] truncate">{med.titulo}</p>
                <p className="text-xs text-[var(--text-muted)]">{cat?.label}</p>
              </div>
              <button onClick={() => abrirEditar(med)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><Pencil size={15} /></button>
              <button onClick={() => deletar(med.id)} className="text-[var(--text-muted)] hover:text-red-400"><Trash2 size={15} /></button>
            </div>
          )
        })}
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
