// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if std::env::args().nth(1).as_deref() == Some("mcp") {
        eprintln!("The MCP server is disabled in this build.");
        std::process::exit(2);
    }
    gitdesktop_lib::run()
}
