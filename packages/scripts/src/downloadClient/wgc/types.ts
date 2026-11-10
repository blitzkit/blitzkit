export interface ClientMetadata {
  protocol: {
    version: number;
    predefined_section: PredefinedSection;
    generated_section: GeneratedSection;
  };
}

interface GeneratedSection {
  launch_forbidden: string;
  stop_supporting: string;
}

interface PredefinedSection {
  app_id: string;
  chain_id: string;
  supported_languages: string;
  default_language: string;
  name: string;
  fs_name: string;
  shortcut_name: string;
  executables: { executable: string };
  keep_patches_interval: number;
  client_types: { client_type: ClientType };
  login_enabled: boolean;
  realms_settings: RealmsSettings;
  localization: Localization;
}

interface ClientType {
  initial_app_type: string;
  final_app_type: string;
  min_supported_os: string;
  client_parts: { client_part: string };
}

interface Localization {
  item: { text: string[] };
}

interface RealmsSettings {
  instances: { instance: Instance[] };
}

interface Instance {
  game_id: string;
  title_id: string;
  platform_realm_id: string;
  options: { option: string };
  content_service_url: string;
}

export interface PatchesChain {
  protocol: {
    parts_info: { part: Part };
    patches_chain: { patch: Patch };
    delay_preload: string;
    web_seeds: { url: string };
    meta_need_update: string;
    version_name: string;
  };
}

interface Part {
  name: string;
  version: number;
  status: string;
}

interface Patch {
  files: { file: File[] };
  torrent: Torrent;
  part: string;
  version_from: number;
  version_to: string;
}

interface File {
  name: string;
  size: number;
  unpacked_size: number;
}

interface Torrent {
  hash: string;
  urls: { url: string };
}
