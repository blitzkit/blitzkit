import { assertSecret } from "@blitzkit/core";
import { GameInterface } from "@blitzkit/game";

interface Bindings {
  bindings: Binding[];
  forbidden: string[];
}

interface Binding {
  name: string;
  versions: string[];
  discovery: string;
  env: string;
  show_server_selection: boolean;
}

interface Discovery {
  version: "1";
  clusters: string[];
  default_server: string;
  servers: Record<string, Server>;
  icmp_servers: Record<string, ICMPServer>;
  clusters_versions: Record<string, ClusterVersion[]>;
  countries_by_clusters: Record<string, Countries>;
  extensions: Record<string, Extension>;
}

interface ClusterVersion {
  version: string;
  server: string;
}

interface Countries {
  countries: string[];
}

interface Extension {
  playability_config_url: string;
  fullscreen_notifications_url: string;
  mgg_frontier_url: string;
  mgg_pay_url: string;
}

type ICMPServer = Record<string, string[]>;

interface Server {
  name: string;
  addr: string;
  addr_dsapp?: string;
}

const game = new GameInterface(
  assertSecret(import.meta.env.PUBLIC_WOTB_CLIENT),
  assertSecret(import.meta.env.WOTB_USMAP),
  assertSecret(import.meta.env.TEMP),
  Number(assertSecret(import.meta.env.TEXTURE_CHUNKS)),
);

game.discoveryUrls().forEach(async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    console.log(`Failed to fetch ${url}: ${response.statusText}`);
    return;
  }

  const bindings = (await response.json()) as Bindings;

  bindings.bindings.forEach(async (binding) => {
    const discovery = await fetch(binding.discovery).then(
      (response) => response.json() as Promise<Discovery>,
    );

    if (discovery.version !== "1") {
      throw new Error(`Unsupported discovery version: ${discovery.version}`);
    }

    Object.values(discovery.servers).forEach(async (server) => {
      const url = server.addr
        .replace("wss://", "https://")
        .replace(/:\d+$/, "");
      const response = await fetch(url).catch(() => null);

      if (response === null || response.status !== 426) return;

      let message = "";

      message += `${server.name}:\n`;
      message += `  address: ${server.addr}\n`;
      message += `  versions:\n`;

      for (const version of binding.versions) {
        message += `    - ${version}\n`;
      }

      console.log(message);
    });
  });
});
