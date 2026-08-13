export interface QuickGitHubRelease {
  assets: Asset[];
}

interface Asset {
  name: string;
  browser_download_url: string;
}
