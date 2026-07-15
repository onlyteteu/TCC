import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O projeto e acessado via 127.0.0.1 (README e script LIGAR-TUDO.cmd).
  // Sem isso, o Next.js bloqueia a conexao de hot-reload nessa origem e a
  // pagina fica sem interatividade: renderiza mas nenhum clique funciona.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
