# maestro

Smoke test flows (`flows/launch.yaml`, `flows/play.yaml`, `flows/gameover.yaml`) for the Capacitor iOS build (appId `com.elchinjabbarli.stakura`).

- Install: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
- Run all flows (simulator or device): `maestro test maestro/flows`
- Tap coordinates are percentage-based, so they stay correct across device sizes; text selectors hit the webview DOM through the accessibility tree.
