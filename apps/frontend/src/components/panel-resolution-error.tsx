"use client";

export function PanelResolutionError() {
  return (
    <main>
      <section role="alert">
        <h1>Não foi possível abrir seu workspace</h1>
        <p>Não foi possível conectar ao servidor. Tente novamente em instantes.</p>
        <button onClick={() => window.location.reload()} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
