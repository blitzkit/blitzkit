import locales from "@blitzkit/i18n/locales.json";
import { XMLParser } from "fast-xml-parser";
import {
  WGC_CLIENT_GUID,
  WGC_CLIENT_URL,
  WGC_METADATA_PROTOCOL_VERSION,
  WGC_PATCHES_CHAIN_PROTOCOL_VERSION,
} from "../../config/wgcClient";
import { ClientMetadata, PatchesChain } from "./types";

const parser = new XMLParser();

export async function downloadWGCClient() {
  const metadataUrl = new URL("api/v1/metadata", WGC_CLIENT_URL);

  metadataUrl.searchParams.set("guid", WGC_CLIENT_GUID);
  metadataUrl.searchParams.set("chain_id", "unknown");
  metadataUrl.searchParams.set(
    "protocol_version",
    WGC_METADATA_PROTOCOL_VERSION,
  );

  const metadata = await fetch(`${metadataUrl}`)
    .then((response) => response.text())
    .then((text) => parser.parse(text) as Promise<ClientMetadata>);

  const patchesChainUrl = new URL("api/v1/patches_chain", WGC_CLIENT_URL);

  patchesChainUrl.searchParams.set(
    "protocol_version",
    WGC_PATCHES_CHAIN_PROTOCOL_VERSION,
  );
  patchesChainUrl.searchParams.set("client_type", "full");
  patchesChainUrl.searchParams.set("lang", locales.default);
  patchesChainUrl.searchParams.set(
    "metadata_version",
    `${metadata.protocol.version}`,
  );
  patchesChainUrl.searchParams.set(
    "metadata_protocol_version",
    WGC_METADATA_PROTOCOL_VERSION,
  );
  patchesChainUrl.searchParams.set(
    "chain_id",
    metadata.protocol.predefined_section.chain_id,
  );
  patchesChainUrl.searchParams.set("game_installation", "true");
  patchesChainUrl.searchParams.set("game_id", WGC_CLIENT_GUID);
  patchesChainUrl.searchParams.set("client_current_version", "0");

  const patchesChain = await fetch(`${patchesChainUrl}`)
    .then((response) => response.text())
    .then((text) => parser.parse(text) as Promise<PatchesChain>);

  for (const file of patchesChain.protocol.patches_chain.patch.files.file) {
    const fileUrl = new URL(file.name, patchesChain.protocol.web_seeds.url);
    console.log(`${fileUrl}`);
  }
}
