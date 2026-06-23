import useSWR from "swr";

type DatabaseInfo = {
  version?: string;
  max_connections: number;
  opened_connections: number;
};

type StatusApiResponse = {
  updated_at: string;
  dependencies: {
    database: DatabaseInfo;
  };
};

type StatusViewModel = {
  updatedAt: string;
  database: DatabaseInfo;
};

async function fetchStatus(endpoint: string): Promise<StatusViewModel> {
  const response = await fetch(endpoint);
  const data: StatusApiResponse = await response.json();

  return {
    updatedAt: data.updated_at,
    database: data.dependencies.database,
  };
}

function UpdatedAt() {
  const response = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  if (response.isLoading || !response.data) {
    return <p>Última atualização: carregando…</p>;
  }

  const updatedAtValueText = new Date(response.data.updatedAt).toLocaleString(
    "pt-BR",
  );
  return <p>Última atualização: {updatedAtValueText}</p>;
}

const DatabaseStatusInfo = () => {
  const response = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
  });

  if (response.isLoading || !response.data) {
    return <p>Informações do Banco de dados: Carregando…</p>;
  }

  const { version, max_connections, opened_connections } =
    response.data.database;

  return (
    <section>
      <h2>Informações do Banco de dados</h2>
      <ul>
        {version && <li>Versão: {version}</li>}
        <li>Conexões máximas: {max_connections}</li>
        <li>Conexões abertas: {opened_connections}</li>
      </ul>
    </section>
  );
};

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatusInfo />
    </>
  );
}
