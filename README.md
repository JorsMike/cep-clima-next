# Trabalho Final - Migração para Next.js: Consulta CEP e Clima

## 1. Descrição Geral do Projeto
Este projeto consiste na evolução e migração de uma aplicação web estática (HTML/CSS/JS) para o framework **Next.js**. O objetivo principal foi modernizar a arquitetura utilizando **Frontend Desacoplado**, implementar funcionalidades dinâmicas como integração com **API do Google Maps** e aplicar estratégias de renderização avançadas (SSG e CSR) para otimizar a performance e a experiência do usuário.

A aplicação permite consultar o clima e dados de endereço via CEP (usando as APIs ViaCEP e OpenWeatherMap) e visualizar a localização exata em um mapa interativo.

## 2. Estratégias de Renderização e Páginas

O projeto foi estruturado em duas páginas principais, cada uma utilizando uma estratégia de renderização do Next.js adequada à sua necessidade técnica:

| Página | Rota | Tipo de Renderização | Justificativa Técnica |
| :--- | :--- | :---: | :--- |
| **Home** | `/` | **SSG** (Static Site Generation) | A estrutura base da página e o formulário são estáticos. O Next.js gera o HTML no momento do build, garantindo máxima performance de carregamento (LCP) e indexação (SEO). A interatividade (busca de dados) ocorre via *hydration* no cliente, mas o esqueleto da página já chega pronto ao navegador. |
| **Mapa** | `/mapa` | **CSR** (Client-Side Rendering) | Esta página depende intrinsecamente do objeto `window` e da biblioteca do Google Maps, que só existem no navegador. Além disso, ela consome parâmetros dinâmicos da URL (`searchParams`) em tempo real. Tentar renderizar isso no servidor causaria erros, tornando o CSR a escolha obrigatória e ideal. |

## 3. Análise Comparativa Lighthouse (Antes x Depois)

Abaixo, a comparação das métricas de desempenho entre a versão original (HTML/CSS/JS Puro) e a nova versão migrada para Next.js (hospedada na Vercel).

> **Ambiente de Teste:** Navegação Anônima, Dispositivo Mobile.

| Métrica | Projeto Original (Local/Estático) | Next.js (Home - SSG) | Status |
| :--- | :---: | :---: | :---: |
| **Performance** | 96 | 100 | 🟢 Melhorou |
| **Acessibilidade** | 93 | 100 | 🟢 Melhorou |
| **Boas Práticas** | 96 | 100 | 🟢 Melhorou |
| **SEO** | 100 | 100 | 🔵 Manteve |

*(Dados extraídos dos relatórios gerados em 06/12/2025)*

### 3.1. Análise dos Resultados
* **Performance:** Houve um aumento para a nota máxima (**100**) na versão Next.js. Isso se deve à otimização automática do framework, que realiza o *code splitting* (carrega apenas o JS necessário para a página), otimização de imagens e minificação de assets durante o build na Vercel. O uso de **SSG** eliminou o tempo de bloqueio inicial que poderia haver em renderizações puramente dinâmicas.
* **Acessibilidade e Boas Práticas:** O Next.js (junto com o ESLint configurado) forçou o uso de padrões mais rigorosos de HTML semântico e atributos como `alt` em imagens, elevando as notas para 100.
* **Impacto da Renderização:** A escolha pelo **SSG** na Home foi determinante para o *First Contentful Paint (FCP)* ser quase imediato, superando a versão antiga que, apesar de leve, não possuía as otimizações de servidor da Vercel (CDN e cache).

## 4. Reflexão: Frontend Desacoplado
Este projeto ilustra na prática a arquitetura de **Frontend Desacoplado** (Jamstack). Diferente de aplicações monolíticas onde o backend gera o HTML, aqui temos:
1.  **Independência:** O Frontend (Next.js) é construído e hospedado separadamente (Vercel) das fontes de dados.
2.  **APIs Externas:** Toda a lógica de dados consome APIs de terceiros (ViaCEP, OpenWeather, Google Maps) via JSON/HTTP.
3.  **Escalabilidade:** Como o frontend é servido majoritariamente como arquivos estáticos (CDN), ele pode escalar para milhares de acessos sem sobrecarregar um servidor de aplicação tradicional.

Essa abordagem resultou em um sistema mais seguro, rápido e fácil de manter, onde a interface pode evoluir independentemente dos serviços de dados.

---
**Desenvolvido por:** [Mike Vargas]
**Disciplina:** Desenvolvimento Web/Frontend
