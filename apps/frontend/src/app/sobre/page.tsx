const journeySteps = [
  "Definir o problema que a startup quer resolver",
  "Mapear o publico-alvo e o contexto de uso",
  "Construir uma proposta de valor clara",
  "Planejar validacao inicial e primeiros testes",
];

const productPillars = [
  {
    title: "Jornada guiada",
    description:
      "A plataforma organiza a fase inicial da startup em etapas objetivas para evitar paralisia e dispersao.",
  },
  {
    title: "Progresso visivel",
    description:
      "O usuario acompanha o que ja estruturou, o que ainda falta e qual e o proximo passo recomendado.",
  },
  {
    title: "Engajamento com sentido",
    description:
      "A gamificacao entra como suporte ao avancar, sem desviar o foco da criacao da startup.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">TCC UFG · Estruturacao inicial de startups</span>
          <h1>Uma plataforma para tirar ideias do papel com clareza, etapas e progresso real.</h1>
          <p>
            Esta base inicial do projeto ja nasce alinhada ao recorte do TCC: orientar a criacao da
            startup, organizar informacoes essenciais e mostrar ao usuario como seguir adiante.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#arquitetura">
              Ver base tecnica
            </a>
            <a className="secondary-action" href="#jornada">
              Ver jornada inicial
            </a>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Resumo do produto">
          <div className="panel-chip">Escopo inicial</div>
          <ul className="panel-list">
            <li>Cadastro da startup</li>
            <li>Jornada guiada por etapas</li>
            <li>Dashboard de progresso</li>
            <li>Gamificacao leve</li>
          </ul>
        </aside>
      </section>

      <section className="section-grid" id="arquitetura">
        {productPillars.map((pillar) => (
          <article className="feature-card" key={pillar.title}>
            <h2>{pillar.title}</h2>
            <p>{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="journey-section" id="jornada">
        <div className="section-heading">
          <span className="section-kicker">Primeiro fluxo do produto</span>
          <h2>Etapas que vao orientar a implementacao inicial da plataforma.</h2>
        </div>

        <div className="journey-list">
          {journeySteps.map((step, index) => (
            <article className="journey-card" key={step}>
              <span className="journey-index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

