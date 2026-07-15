import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  avatarIcon: text("avatar_icon").default("leaf"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

export const series = pgTable("series", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  imagem: text("imagem"),
  cor: text("cor"),
  descricao: text("descricao"),
  ativa: boolean("ativa").default(true),
  createdAt: timestamp("created_at").defaultNow(),
})

export const meditacoes = pgTable("meditacoes", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  // Nullable: uma linha pertence a uma categoria OU a uma série, nunca as duas.
  categoria: text("categoria"),
  serieId: text("serie_id").references(() => series.id, { onDelete: "cascade" }),
  urlAudio: text("url_audio"),
  textoBiblico: text("texto_biblico"),
  referencia: text("referencia"),
  transcricao: text("transcricao"),
  duracaoSegundos: integer("duracao_segundos"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const sons = pgTable("sons", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  urlAudio: text("url_audio").notNull(),
  duracaoSegundos: integer("duracao_segundos"),
  imagem: text("imagem"),
  cor: text("cor"),
  descricao: text("descricao"),
  tipo: text("tipo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const manadiario = pgTable("mana_diario", {
  id: text("id").primaryKey(),
  data: text("data").notNull().unique(), // YYYY-MM-DD
  textoBiblico: text("texto_biblico").notNull(),
  referencia: text("referencia"),
  comentario: text("comentario"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const favoritos = pgTable("favoritos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  meditacaoId: text("meditacao_id")
    .notNull()
    .references(() => meditacoes.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at").defaultNow(),
})

// Registro individual de conclusão (1 linha por usuário+meditação), distinto
// dos contadores agregados em progressoUsuario. Usado pra calcular progresso
// de série e desbloquear a conquista de série completa.
export const meditacoesConcluidas = pgTable("meditacoes_concluidas", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  meditacaoId: text("meditacao_id")
    .notNull()
    .references(() => meditacoes.id, { onDelete: "cascade" }),
  concluidaEm: timestamp("concluida_em").defaultNow(),
}, (t) => [
  uniqueIndex("meditacoes_concluidas_user_med_idx").on(t.userId, t.meditacaoId),
])

export const progressoUsuario = pgTable("progresso_usuario", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  diasConsecutivos: integer("dias_consecutivos").default(0),
  totalMeditacoes: integer("total_meditacoes").default(0),
  totalMinutos: integer("total_minutos").default(0),
  ultimaMeditacao: timestamp("ultima_meditacao"),
  ultimoAcesso: text("ultimo_acesso"), // YYYY-MM-DD
})

export const conquistasUsuario = pgTable("conquistas_usuario", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conquistaId: text("conquista_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
})

export const notificacoesConfig = pgTable("notificacoes_config", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  ativo: boolean("ativo").default(false),
  horarios: json("horarios").$type<string[]>().default([]),
  diasSemana: json("dias_semana").$type<number[]>().default([]),
  tipos: json("tipos").$type<string[]>().default([]),
  antecedenciaMinutos: integer("antecedencia_minutos").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
})
