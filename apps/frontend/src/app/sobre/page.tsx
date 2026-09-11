const journeySteps = [
  "Definir o problema que a startup quer resolver",
  "Mapear o público-alvo e o contexto de uso",
  "Construir uma proposta de valor clara",
  "Planejar validação inicial e primeiros testes",
];

const productPillars = [
  {
    title: "Jornada guiada",
    description:
      "A plataforma organiza a fase inicial da startup em etapas objetivas para evitar paralisia e dispersão.",
  },
  {
    title: "Progresso visível",
    description:
      "O usuário acompanha o que já estruturou, o que ainda falta e qual é o próximo passo recomendado.",
  },
  {
    title: "Engajamento com sentido",
    description:
      "A gamificação entra como suporte ao avançar, sem desviar o foco da criação da startup.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">TCC UFG · Estruturação inicial de startups</span>
          <h1>Uma plataforma para tirar ideias do papel com clareza, etapas e progresso real.</h1>
          <p>
            Esta base inicial do projeto já nasce alinhada ao recorte do TCC: orientar a criação da
            startup, organizar informações essenciais e mostrar ao usuário como seguir adiante.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#arquitetura">
              Ver base técnica
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
            <li>Gamificação leve</li>
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
          <h2>Etapas que vão orientar a implementação inicial da plataforma.</h2>
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

