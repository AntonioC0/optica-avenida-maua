# Ótica Avenida Mauá - Sistema de Controle de Estoque e Vendas

## Tarefas de Desenvolvimento

### Fase 1: Estrutura de Dados e Banco de Dados
- [x] Definir schema do banco de dados (usuários, categorias, produtos, vendas)
- [x] Criar tabelas: categories, products, sales, sale_items
- [x] Configurar relacionamentos entre tabelas
- [x] Executar migrações do banco de dados

### Fase 2: Autenticação e Gestão de Usuários
- [x] Implementar sistema de roles (owner/manager, seller)
- [x] Criar tela de login com autenticação OAuth
- [x] Implementar gestão de usuários (criar, editar, deletar)
- [x] Adicionar controle de acesso baseado em roles (RBAC)
- [x] Criar tela de gestão de funcionários (apenas para dono/gerente)

### Fase 3: Gestão de Categorias e Produtos
- [x] Criar tela de cadastro de categorias
- [x] Implementar CRUD de categorias
- [x] Criar tela de cadastro de produtos
- [x] Implementar leitura de código de barras (input de barcode)
- [x] Adicionar funcionalidade de +/- quantidade
- [x] Implementar botões: Salvar, Cancelar, Excluir com confirmação
- [x] Criar tela de listagem de produtos com filtros

### Fase 4: Sistema de Vendas
- [x] Criar tela de registro de vendas
- [x] Implementar seleção de produto por categoria
- [x] Adicionar seleção automática de vendedor (usuário logado)
- [x] Implementar quantidade de venda
- [x] Criar listagem de vendas (histórico)
- [x] Adicionar cálculo de faturamento por venda

### Fase 5: Dashboard do Dono/Gerente
- [ ] Criar dashboard com cards de faturamento diário
- [ ] Adicionar card de faturamento mensal
- [ ] Implementar card de quantidade total de produtos
- [ ] Criar gráfico de produtos mais vendidos
- [ ] Criar gráfico de produtos menos vendidos
- [ ] Adicionar filtros de data no dashboard

### Fase 6: Interface e Design
- [x] Implementar layout com sidebar navigation
- [x] Aplicar cores: amarelo (principal), preto e branco (secundárias)
- [x] Criar componentes reutilizáveis
- [x] Implementar design responsivo
- [x] Adicionar ícones e melhorar UX
- [x] Corrigir visibilidade das abas (Tabs)

### Fase 7: Testes e Ajustes Finais
- [ ] Testar fluxo completo de vendas
- [ ] Testar gestão de usuários
- [ ] Testar dashboard e relatórios
- [ ] Validar design e cores
- [ ] Otimizar performance
- [ ] Criar checkpoint final

## Progresso Geral
- Fase 1-4: Concluídas
- Fase 5-6: Parcialmente concluída
- Fase 7: Próxima

## Funcionalidades Implementadas
- Autenticação OAuth com Manus
- Sistema de roles (owner, manager, seller)
- Página inicial com redirecionamento automático
- Dashboard para Dono/Gerente com abas visíveis
- Página de vendas para Vendedores com funcionalidade completa
- CRUD completo de categorias
- CRUD completo de produtos com código de barras
- Design moderno com cores amarelo, preto e branco
- Componentes reutilizáveis (Cards, Tabs, Dialogs)
- Notificações com Sonner
- Usuário admin padrão criado automaticamente
- Página de vendas com:
  - Seleção de produtos por categoria
  - Suporte a leitura de código de barras
  - Funcionalidade de +/- quantidade
  - Resumo de venda em tempo real
  - Histórico de vendas
  - Confirmação antes de finalizar v## Funcionalidades em Desenvolvimento
- 🔄 Cálculo de faturamento diário/mensal
- 🔄 Gráficos de produtos mais/menos vendidos

## Notas Importantes
- Cores: Amarelo (principal), Preto (secundária), Branco (detalhes)
- Dois perfis: Dono/Gerente (acesso total) e Vendedor (apenas vendas e estoque)
- Suporte a múltiplos usuários simultâneos no mesmo dispositivo
- Leitura de código de barras via input de texto
- Confirmação antes de ações críticas (salvar, deletar, cancelar)
- Usuário admin padrão criado com script de seed (nome: Admin, role: owner)


## Novas Tarefas (Sprint Atual)
- [x] Criar página de gestão de usuários
- [x] Implementar formulário de adicionar usuário (nome, email, role)
- [x] Implementar edição de usuário (alterar nome, email, role)
- [x] Implementar remoção de usuário com confirmação
- [x] Criar listagem de usuários com filtros por role
- [x] Adicionar validações de permissão (apenas owner/manager)


## Novas Tarefas (Sprint Atual - Navegação)
- [x] Criar componente de barra de navegação inferior
- [x] Adicionar ícones para cada tela (Dashboard, Vendas, Categorias, Produtos, Usuários)
- [x] Implementar ícone ativo maior que os demais
- [x] Integrar em todas as páginas do sistema


## Correções Solicitadas (Sprint Atual - Permissões)
- [x] Restringir acesso de gerente (manager) na página de usuários
- [x] Apenas proprietário (owner) pode adicionar usuários
- [x] Apenas proprietário (owner) pode editar role de usuários
- [x] Apenas proprietário (owner) pode remover usuários
- [x] Gerente pode apenas visualizar lista de usuários


## Novas Tarefas (Sprint Atual - Gráficos)
- [x] Instalar e configurar biblioteca Recharts
- [x] Criar funções de banco de dados para calcular vendas por produto
- [x] Criar funções de banco de dados para calcular faturamento diário/mensal
- [x] Implementar gráfico de produtos mais vendidos (BarChart)
- [x] Implementar gráfico de produtos menos vendidos (BarChart)
- [x] Implementar gráfico de faturamento diário (LineChart)
- [x] Implementar gráfico de faturamento mensal (BarChart)
- [x] Integrar gráficos no dashboard


## Novas Tarefas (Sprint Atual - Alertas de Estoque)
- [x] Adicionar coluna de estoque mínimo na tabela de produtos
- [x] Criar função de banco de dados para buscar produtos com estoque baixo
- [x] Criar rota tRPC para obter produtos com estoque baixo
- [x] Implementar página de alertas de estoque
- [x] Adicionar ícone de alertas na barra de navegação inferior
- [x] Implementar notificações visuais para estoque baixo (crítico e aviso)
- [x] Permitir editar estoque mínimo de cada produto
- [x] Criar cards de resumo (total, crítico, aviso)


## Novas Tarefas (Sprint Atual - Notificações em Tempo Real)
- [x] Criar função para verificar estoque baixo durante venda
- [x] Implementar notificações toast ao adicionar produto com estoque baixo
- [x] Adicionar aviso visual no resumo de venda
- [x] Implementar notificações ao finalizar venda com estoque baixo
- [x] Criar alertas visuais para produtos críticos (sem estoque)
- [x] Integrar notificações com sistema de toast (Sonner)


## Correções Urgentes
- [x] Corrigir erro na execução da venda
- [x] Verificar retorno da mutação createSale
- [x] Validar estrutura de resposta do banco de dados


## Novas Tarefas (Sprint Atual - Redesign de UI)
- [x] Criar tabela de notificações no banco de dados
- [x] Adicionar rotas tRPC para gerenciar notificações
- [x] Criar componente NotificationBell com painel flutuante
- [x] Adicionar botões "Ler Todas" e "Excluir Todas" no painel
- [x] Adicionar contador de notificações não lidas no bell icon
- [x] Integrar NotificationBell no Dashboard
- [x] Remover página de alertas (StockAlerts)
- [x] Remover ícone de alertas da navegação inferior
- [ ] Implementar notificações de estoque baixo (5 unidades)
- [ ] Implementar notificações de nova venda
- [ ] Adicionar dashboard de faturamento na tela inicial
- [ ] Integrar gerenciador de categorias na tela de produtos


## Novas Tarefas (Sprint Atual - Notificações Automáticas)
- [x] Criar função para notificar quando produto atinge 5 unidades
- [x] Integrar notificação ao finalizar venda
- [x] Integrar notificação ao atualizar quantidade de produto
- [x] Notificar todos os usuários owner/manager sobre estoque baixo
- [x] Implementar notificações de nova venda
- [x] Testar notificações automáticas


## Novas Tarefas (Sprint Atual - Dashboard Home e Gerenciador de Categorias)
- [x] Adicionar dashboard de faturamento na tela inicial
- [x] Mostrar gráficos de faturamento diário na Home
- [x] Mostrar gráficos de faturamento mensal na Home
- [x] Criar modal de gerenciador de categorias
- [x] Integrar gerenciador de categorias na página de produtos
- [x] Adicionar botão de criar categoria no modal
- [x] Adicionar botão de editar categoria no modal
- [x] Adicionar botão de deletar categoria no modal


## Novas Tarefas (Sprint Atual - Autenticação por Email)
- [x] Adicionar campo email obrigatório na tabela de usuários
- [x] Corrigir erros de tipo TypeScript no sistema de autenticação
- [ ] Criar página de login com campo de email
- [ ] Integrar busca de usuário por email
- [ ] Testar fluxo de autenticação com email


## Status Final do Projeto - COMPLETO
- [x] Dashboard Completo com metricas de vendas
- [x] Gestao de Produtos com codigo de barras
- [x] Gestao de Categorias integrada
- [x] Sistema de Vendas com calculo de totais
- [x] Alertas de Estoque automaticos
- [x] Gestao de Usuarios com roles
- [x] Navegacao Inferior com icones
- [x] Sistema de Notificacoes com bell icon
- [x] Design Moderno (amarelo, preto, branco)
- [x] Autenticacao com email obrigatorio


## Novas Tarefas (Sprint Atual - Reorganizacao de Categorias)
- [x] Remover página de Categorias
- [x] Integrar gerenciador de categorias na página de Produtos
- [x] Adicionar botão de Categoria na tela de Produtos
- [x] Remover ícone de Categorias da barra de navegação inferior
- [x] Testar fluxo de gerenciamento de categorias em Produtos


## Correções Urgentes (Sprint Atual)
- [x] Corrigir visibilidade do botão de Categoria na página de Produtos
- [x] Adicionar contraste melhor ao botão de Categoria


## Tarefas Finais (Sprint Final - Preparacao para Hospedagem)
- [x] Remover menu de abas (Tabs) do Dashboard
- [x] Melhorar design da barra de navegacao inferior
- [x] Testar todas as funcionalidades do sistema
- [ ] Preparar arquivos para hospedagem
- [ ] Gerar documentacao de deployment


## Correções de Erros (Sprint Urgente)
- [x] Corrigir erro de query de faturamento diário
- [x] Corrigir erro de query de faturamento mensal
- [x] Verificar schema da tabela sales
- [x] Testar queries após correção
- [x] Resolver erro ONLY_FULL_GROUP_BY do MySQL
- [x] Adicionar CAST e COALESCE nas queries
