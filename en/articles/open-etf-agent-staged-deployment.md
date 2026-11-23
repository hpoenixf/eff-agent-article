---
title: "Deploy Open ETF Agent from Scratch: Run the Research Workspace on Your Own Server"
description: "Run Open ETF Agent with a Linux server, a systemd service, and an SSH tunnel. First verify that an offline report survives a restart, then optionally connect your own model account without exposing the application port."
readingBrief:
  takeaways:
    - "Pin a public release and get the offline workbench running before connecting a real model."
    - "An SSH tunnel gives your browser access while keeping the remote application on loopback."
    - "Keep the source, writable workspace, startup configuration, and model credential separate so code upgrades do not overwrite conversation history."
    - "Do not stop at a healthy service: submit a question in the browser, then reopen the same report from History."
  appliesTo:
    - "You can connect to an Ubuntu 24.04 or compatible Linux server over SSH and want to run the workbench for yourself."
  notFor:
    - "You need public signup, shared team accounts, enterprise single sign-on, or a public multi-tenant deployment."
---

# Deploy Open ETF Agent from Scratch: Run the Research Workspace on Your Own Server

<LearningPathNav />

For a first agent deployment, I would not start with a domain name, accounts, and a paid model all at once. First send a question from your browser to the server, get a report, and open that report from History after restarting the service. That checks the installation, access path, interface, execution, and storage together. Connecting a real model can then be a change to one part of that working path.

This guide pins [Open ETF Agent v0.41.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.41.0). The steps are based on the public source and its [release verification notes](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/docs/verification/v041-release-candidate.md); they have not been run on your server. Here, deployment means keeping a workbench running on your own server and reaching it remotely, not opening it to visitors.

## 1. Install Node and check out a fixed release

You need SSH access to a Linux server and an account with `sudo`. The example uses Ubuntu 24.04. Prefer SSH-key authentication and verify the server's host fingerprint through a trusted channel, such as the provider console, before accepting it on first connection. **You do not need a domain or a firewall rule for the application port.**

On the server, use your ordinary operator account:

```bash
sudo apt-get update
sudo apt-get install -y git ca-certificates curl xz-utils iproute2
```

This release's [package.json](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/package.json) requires Node.js **26.8.1 through 26.x**. Choose a fixed, compatible Linux binary from the [official Node.js download page](https://nodejs.org/en/download). The project used Node.js 26.11.1 for verification. For that version, choose `linux-x64` if `uname -m` reports `x86_64`, or `linux-arm64` if it reports `aarch64`. Get `SHASUMS256.txt` from the same official release directory and follow the official signature verification instructions when a signature is available. Do not use a third-party repackaging with the same filename.

In your ordinary account's directory, verify and unpack it. This example uses the x64 names; substitute `arm64` on ARM:

```bash
grep -F '  node-v26.11.1-linux-x64.tar.xz' SHASUMS256.txt | sha256sum --check --strict
tar -xJf node-v26.11.1-linux-x64.tar.xz
sudo install -d -m 0755 /opt/node26 /opt/open-etf-agent
sudo cp -a node-v26.11.1-linux-x64/. /opt/node26/
sudo chown -R root:root /opt/node26
export PATH="/opt/node26/bin:$PATH"
node --version
npm --version
```

Deploy the release tag instead of the moving `main` branch. Install dependencies and build without `sudo`:

```bash
git clone --depth 1 --branch v0.41.0 \
  https://github.com/hpoenixf/open-etf-agent.git open-etf-agent-v041
cd open-etf-agent-v041
git describe --tags --exact-match
git rev-parse HEAD
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

Expect tag `v0.41.0` and commit `83bd684ea089cd17eebe652084acca679f87a56d`. Installation requires access to npm, but the offline example does not need a model key. On a fresh install, copy the workbench into its service directory and create a dedicated account:

```bash
test ! -e /opt/open-etf-agent/app
sudo cp -a . /opt/open-etf-agent/app
sudo chown -R root:root /opt/open-etf-agent/app
sudo useradd --system --user-group --no-create-home \
  --shell /usr/sbin/nologin openetf
```

If a directory or account with the same name already exists, verify that it is dedicated to this app. Do not overwrite an existing deployment or share another service's account and state.

## 2. Start the offline workbench

Save this file as `/etc/systemd/system/open-etf-agent.service`, for example with `sudoedit`. The `--project` path is for the app's data, not its source. Before first startup, leave `/var/lib/open-etf-agent/offline` absent so the application can initialize the workspace.

```ini
[Unit]
Description=Open ETF Agent research workbench
After=network.target

[Service]
Type=simple
User=openetf
Group=openetf
WorkingDirectory=/opt/open-etf-agent/app
StateDirectory=open-etf-agent
StateDirectoryMode=0700
UMask=0077
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ExecStart=/opt/node26/bin/node /opt/open-etf-agent/app/src/gui-cli.mjs --project /var/lib/open-etf-agent/offline --port 4179
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

`ExecStart` invokes the fixed release's [GUI entry point](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/src/gui-cli.mjs), the same one used by `npm run gui`. With [systemd's StateDirectory](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#StateDirectory=), the service has a dedicated writable location for persistent state. The application files do not need to be writable by the service user.

```bash
sudo systemd-analyze verify /etc/systemd/system/open-etf-agent.service
sudo systemctl daemon-reload
sudo systemctl enable --now open-etf-agent.service
sudo systemctl is-active open-etf-agent.service
ss -ltn 'sport = :4179'
curl --fail --silent --show-error \
  --output /dev/null --write-out 'HTTP %{http_code}\n' http://127.0.0.1:4179/
```

Expect `active`, a listener at `127.0.0.1:4179`, and HTTP 200 from the local request. If you see `0.0.0.0` or another external address, stop and investigate. The workbench does not authenticate public users, and other processes on the same server may be able to reach its loopback port. Use this path on a trusted single-operator server, not a shared host.

## 3. Open the workbench in your browser without exposing its port

On **your own computer**, not the server, run:

```bash
ssh -NT -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:4179:127.0.0.1:4179 \
  your-ssh-user@your-server
```

Substitute your SSH username and server address. Keep the terminal running, then open **`http://127.0.0.1:4179/`** in your local browser. The forward binds only to loopback on your computer. See [OpenSSH's `-L` option](https://man.openbsd.org/ssh#L) for the forwarding syntax.

The two port numbers match on purpose. This release's [GUI server](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/src/gui-server.mjs) checks the HTTP Host and requires the listener's origin for write requests. SSH forwards TCP; it does not rewrite HTTP headers. If you open `localhost:4179` instead of `127.0.0.1:4179`, or use a different local port, the page or a submission can fail with `GUI_ORIGIN_REQUIRED`. If local port 4179 is busy, choose a free port and change the service's `--port`, both sides of the tunnel, and the browser URL together. Do not disable the origin check.

Choose a bundled fixture and submit a simple question, such as “What does this source say?” Then:

1. Wait for a completed demo report and open its source. The offline fixture does not use a real model.
2. Reload or open the conversation from History. The original question and report should still be there; reopening should not start another research run.
3. On the server, run `sudo systemctl restart open-etf-agent.service`, then reopen that report in the browser. This checks persistent storage rather than the original process still remembering the turn.

If something fails, inspect `sudo journalctl -u open-etf-agent.service -n 40 --no-pager`. First check that the listener is up, that systemd is using the correct Node binary, and that the service user can write its own state directory. Then look at the browser's error. Do not paste unredacted logs into a public forum. **A curl response of 200 proves the page was served, not that a browser can submit a question, reopen History, or recover a report after restart.**

## 4. Optional: Connect your own model account

You can leave the workbench offline. To send a real request, first check that the provider permits your use case, region, and account. Review billing, retention, and any overage setting. Use synthetic material for the first request, not personal documents.

The [fixed release's real-model guide](https://github.com/hpoenixf/open-etf-agent/blob/v0.41.0/docs/local-gui-live.md) documents direct DeepSeek and OpenCode Go profiles. The example below uses **DeepSeek Flash through the direct API**, a profile recognized by this version. The endpoint and model are those supported by the pinned release; this is not a guarantee of current account or regional availability. See the [DeepSeek tool-call documentation](https://api-docs.deepseek.com/guides/tool_calls/). If you choose OpenCode Go instead, consult the [official Go guide](https://opencode.ai/docs/console/go/) and the pinned app documentation. In Go owner mode, sending a message can consume your allowance. Do not share a subscription or route around provider refusals.

Create the configuration directory:

```bash
sudo install -d -o root -g openetf -m 0750 /etc/open-etf-agent
```

Save the following non-secret configuration to `/etc/open-etf-agent/live.json`, owned by `root:openetf` with mode `0640`:

```json
{
  "gateway": {
    "provider": "deepseek-direct",
    "endpoint": "https://api.deepseek.com/chat/completions",
    "model": "deepseek-flash",
    "apiKeyEnv": "ETF_GUI_PROVIDER_KEY"
  },
  "limits": {
    "model": 4,
    "timeoutMs": 120000
  }
}
```

Enter the key at a hidden prompt on the server. Do not put the key in SSH arguments, JSON, Git, chat, shell history, or an `echo` command. This setup refuses to overwrite an existing credential. Run it first and wait for the prompt before pasting:

```bash
sudo bash -c '
  set -eu
  umask 077
  dir=/etc/open-etf-agent
  test ! -e "$dir/provider.key"
  IFS= read -r -s -p "Provider key: " key < /dev/tty
  printf "\n" >&2
  test -n "$key"
  set -o noclobber
  printf "%s\n" "$key" > "$dir/provider.key"
  unset key
'
sudo stat -c '%U:%G %a %n' /etc/open-etf-agent/provider.key
```

Expect `root:root` and mode `600`. Save this wrapper as `/opt/open-etf-agent/start-live.sh`, owned by root and executable with mode `0755`. It reads the credential supplied to the process by systemd, then makes it available through the environment variable the app expects. Do not display that variable or enable shell tracing.

```bash
#!/bin/bash
set -eu
: "${CREDENTIALS_DIRECTORY:?No service credentials}"
export ETF_GUI_PROVIDER_KEY="$(< "$CREDENTIALS_DIRECTORY/provider.key")"
test -n "$ETF_GUI_PROVIDER_KEY"
exec /opt/node26/bin/node /opt/open-etf-agent/app/src/gui-cli.mjs \
  --project /var/lib/open-etf-agent/live --port 4179 \
  --live-config /etc/open-etf-agent/live.json
```

Keep the offline unit as it is. Add a drop-in that switches the service to live mode. First create the directory, then save the second block to `/etc/systemd/system/open-etf-agent.service.d/10-live.conf` with `sudoedit`.

```bash
sudo install -d -m 0755 /etc/systemd/system/open-etf-agent.service.d
```

```ini
[Service]
LoadCredential=provider.key:/etc/open-etf-agent/provider.key
ExecStart=
ExecStart=/opt/open-etf-agent/start-live.sh
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart open-etf-agent.service
sudo systemctl is-active open-etf-agent.service
ss -ltn 'sport = :4179'
```

Live mode uses a new workspace named `live`; it does not take over the offline History. Reopen the same SSH-forwarded URL and check the mode and model. Send one small question using the bundled synthetic material, such as “Which two limits does this sample describe?” If the UI asks you to confirm the question and source material, follow that prompt. Check that the answer arrives, that it can be opened from History, and that the charges shown in your provider account match what you authorized. Opening the page, creating an empty conversation, and reading History should not call the model. Sending a question may incur a charge; `limits.model` **is not a spending cap**. If you get 403, 429, or an unknown result, verify the account's access, allowance, and original request before resubmitting.

To go back to offline mode, move only the live drop-in. Do not delete either workspace or reinstall the service:

```bash
sudo mv /etc/systemd/system/open-etf-agent.service.d/10-live.conf \
  /etc/open-etf-agent/10-live.conf.disabled
sudo systemctl daemon-reload
sudo systemctl restart open-etf-agent.service
```

Both workspaces stay on disk. For a routine upgrade, retain the current code and separate backups of the two workspaces. Install the new tag in another code directory and verify it with a fresh workspace first. Before switching over, check whether the new version writes a different storage format: rolling back the code does not necessarily undo data writes. The old live launcher may also check the original workspace's configuration identity. Do not arbitrarily mix an existing workspace with different launch settings.

## 5. When do you need a domain and HTTPS?

For personal use, the steps above are a complete self-hosted deployment. There is no visitor entrance outside the SSH tunnel and no reason to add port 4179 to the server's firewall or security group. A trusted mobile SSH client that supports local port forwarding can use the same approach. Do not expose the application port directly just because your mobile client cannot forward it.

If you need to type a domain directly into a phone browser or share access with someone else, that is **a separate deployment task**. At minimum, you need a dedicated hostname, HTTPS, authentication in front of every page and API, and separation between staging and production data. In a reverse proxy such as Caddy, [automatic HTTPS](https://caddyserver.com/docs/automatic-https) and [access authentication](https://caddyserver.com/docs/caddyfile/directives/basic_auth) cover the public entrance. The proxy or a trusted gateway must also validate the real public Host and write request Origin *before* rewriting an authorized request's Host and Origin to the loopback values the app expects. **Never rewrite Origin unconditionally**: doing so would make an unrelated request look like a same-origin one to the app. On isolated data, verify anonymous access is denied and then exercise browser login, submission, and History before opening production access. If you need app-level accounts, [v0.43.0](https://github.com/hpoenixf/open-etf-agent/releases/tag/v0.43.0) introduced a separate optional invite-only implementation. It does not add authentication to v0.41, and its release does not certify your hosting setup.

For a first deployment, three results matter: **the application port is not public, the report still opens after a restart, and the model key never appears in the browser, source code, or logs.** The browser is only the entrance. Knowing who can run a task, where results go, and what an upgrade can change is what lets you keep the workbench on the server.

Continue with [From a Question to a Visible Answer: ETF Agent’s Six-Layer Request Lifecycle](017-prompt-to-answer-six-layer-panorama-v3.md). · [Star the project on GitHub if it is useful](https://github.com/hpoenixf/open-etf-agent)
