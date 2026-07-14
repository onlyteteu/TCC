"use client";

export function PanelResolutionError() {
  return (
    <main>
      <section role="alert">
        <h1>Nao foi possivel abrir seu workspace</h1>
        <p>Confira se o backend esta ligado e tente novamente.</p>
        <button onClick={() => window.location.reload()} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
