# Lista de Tarefas - Área Administrativa Plenitude

## Fase 1: Definição e Acesso do Administrador

- [ ] **001.1:** Definir manualmente o campo `role: "admin"` para um usuário de teste no Firestore.
- [X] **001.2:** Modificar `AuthContext.tsx` para buscar o campo `role` do usuário no Firestore após o login.
- [X] **001.3:** Armazenar a informação de `role` (e um booleano `isAdmin`) no estado do `AuthContext`.

## Fase 2: Roteamento e Estrutura das Páginas Admin

- [X] **002.1:** Atualizar o sistema de roteamento para direcionar administradores para `/admin/dashboard` após o login.
- [X] **002.2:** Manter usuários não administradores sendo direcionados para a página principal (`/`).
- [X] **003.1:** Criar a estrutura de pastas e arquivos básicos para as páginas administrativas:
    - `/app/admin/dashboard/page.tsx`
    - `/app/admin/mana-diario/page.tsx`
    - `/app/admin/meditacoes/page.tsx`
- [X] **003.2:** Implementar um componente `AdminProtectedRoute` para proteger as rotas `/admin/*`.

## Fase 3: Desenvolvimento do Dashboard do Administrador

- [X] **004.1:** Desenvolver a interface básica do `/admin/dashboard/page.tsx` com links para "Gerenciar Maná Diário" e "Gerenciar Meditações".
- [X] **004.2:** Implementar a lógica para buscar e exibir estatísticas no dashboard (ex: número de usuários, número de meditações). (Pode ser simplificado inicialmente com dados placeholder se a consulta ao Firestore for complexa).

## Fase 4: Gerenciamento do Maná Diário

- [X] **005.1:** Desenvolver a interface do `/admin/mana-diario/page.tsx` com formulário para adicionar/editar Maná Diário (data, texto bíblico, comentário).
- [X] **005.2:** Implementar a lógica para salvar/atualizar as entradas do Maná Diário no Firestore.
- [X] **005.3:** Listar as entradas de Maná Diário existentes para gerenciamento.

## Fase 5: Gerenciamento de Meditações

- [X] **006.1:** Desenvolver a interface do `/admin/meditacoes/page.tsx` com formulário para adicionar/editar meditações (título, categoria, áudio, texto, etc.).
- [X] **006.2:** Implementar a lógica para salvar/atualizar as meditações no Firestore.
- [X] **006.3:** Listar as meditações existentes para gerenciamento.

## Fase 6: Integração com a Tela Principal

- [X] **007.1:** Modificar a tela principal (`/app/page.tsx`) para buscar e exibir o Maná Diário do Firestore correspondente à data atual.

## Fase 7: Validação e Entrega

- [ ] **008.1:** Testar exaustivamente todas as funcionalidades administrativas (login como admin, acesso às páginas, criação/edição de Maná e meditações, visualização de estatísticas).
- [ ] **008.2:** Testar a visualização do Maná Diário correto na tela principal do usuário comum.
- [ ] **008.3:** Revisar responsividade e usabilidade da área administrativa.
- [ ] **009.1:** Preparar o relatório final e empacotar o projeto atualizado.
- [ ] **009.2:** Enviar o projeto e as instruções para o usuário.

