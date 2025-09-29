#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle();

      let entry = app_handle
        .path_resolver()
        .resolve_resource("../../dist/website/server/entry.mjs")
        .expect("failed to resolve server.ts");

      Command::new("bun")
        .arg("run")
        .arg(entry)
        .stderr(Stdio::null())
        .spawn()
        .expect("failed to start Bun server");

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running Tauri app");
}
