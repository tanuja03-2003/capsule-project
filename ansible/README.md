# EventHub Ansible Automation

This directory provides a small, demonstrable Ansible layer for the EventHub
capstone project. Ansible connects to Linux application hosts over SSH and
converges packages, services, directories, and non-secret configuration to a
desired state.

It complements the existing Jenkins-to-Kubernetes pipeline. It does not replace
Jenkins, deploy Kubernetes manifests, manage databases, or change persistent
infrastructure.

## Architecture

```text
Developer
    |
    v
GitHub
    |
    v
Jenkins -------------------- Ansible automation/configuration layer
    |                                      |
    v                                      v
Docker                         Linux application hosts
    |
    v
Kubernetes
    |
    v
EventHub services
```

Jenkins remains responsible for testing, building images, pushing images, and
optionally deploying the existing `backend` and `notification-worker`
Kubernetes Deployments. Ansible prepares separate Linux hosts and renders host
configuration when that environment is used.

## Structure

| Component | Purpose |
|---|---|
| `inventory` | Defines target Linux hosts and connection defaults |
| `group_vars` | Stores shared, non-secret configuration |
| `playbooks/setup.yml` | Configures Linux prerequisites and Docker |
| `playbooks/deploy.yml` | Renders EventHub host configuration |
| `roles/eventhub` | Reusable EventHub automation implementation |
| `tasks` | Idempotent package, service, directory, and template tasks |
| `handlers` | Restarts Docker only after Docker package changes |
| `templates` | Produces the non-secret `eventhub.env` file |
| `tests` | Runs inventory, syntax, and optional remote safety checks |

Important files:

- `ansible.cfg`: repository-local inventory, role-path, and interpreter defaults.
- `inventory/hosts.ini`: documentation-only example Linux hosts.
- `group_vars/all.yml`: application, directory, image, port, and package values.
- `roles/eventhub/tasks/main.yml`: reusable idempotent implementation.
- `roles/eventhub/handlers/main.yml`: Docker restart handler.
- `roles/eventhub/templates/eventhub.env.j2`: non-secret configuration template.
- `tests/validate.sh`: repeatable validation script with a PASS/FAIL summary.
- `tests/validate.ps1`: PowerShell equivalent for Windows development hosts.

## Inventory

Replace the example `192.168.56.x` addresses and `ansible_user` with values for
your Linux hosts. The sample inventory is not a live target and contains no
passwords, SSH private keys, tokens, kubeconfigs, or registry credentials.

The inventory deliberately does not point at the Docker Desktop Kubernetes
node. Kubernetes remains managed by the existing Jenkins pipeline.

Validate the inventory without connecting to hosts:

```bash
ansible-inventory -i inventory/hosts.ini --list
```

## Variables

Variables use lowercase `snake_case` names. Edit `group_vars/all.yml` for
non-secret values such as:

- application name and environment name
- application and configuration directories
- backend and notification-worker image names and tags
- application port
- Debian and Red Hat package lists

The rendered configuration contains application metadata and image references
only. It does not contain database passwords, Redis passwords, registry
credentials, or SSH material.

The playbooks set `eventhub_setup_host` and
`eventhub_deploy_configuration` explicitly. Role assertions validate required
values before host changes begin.

## Playbooks and Role

`setup.yml` prepares a host by updating package metadata, installing Docker and
utilities, enabling Docker, and creating `/opt/eventhub/config` by default.

`deploy.yml` creates the required application/configuration directories and
renders `/opt/eventhub/config/eventhub.env`. It does not run Docker Compose,
apply Kubernetes manifests, or manage MySQL/Redis.

Both playbooks call the `eventhub` role instead of duplicating tasks.

## Error Handling and Idempotency

The role uses fully qualified Ansible modules and does not use shell commands,
`ignore_errors`, or silent failure handling. Assertions fail early when required
variables are missing or setup targets an unsupported Linux family. Native
module failures identify the package, service, path, or template operation
that failed.

Docker is installed separately from utility packages. Only a Docker package
change notifies `eventhub_restart_docker`; installing or updating curl, Git, or
Python utilities does not unnecessarily restart Docker.

Package, service, file, and template modules are idempotent. Running the same
playbook repeatedly should produce no changes unless the host or variables
changed.

## Security and Ansible Vault

Never commit passwords, private keys, API tokens, registry credentials, or
kubeconfigs. Provide secrets through Ansible Vault, environment variables,
Jenkins credentials, or an external secret manager.

Example Vault workflow using a file that must remain uncommitted:

```bash
ansible-vault create group_vars/vault.yml
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --ask-vault-pass
```

The role currently does not require a secret. Vault is documented for future
secret-bearing host configuration.

## Testing

Run the lightweight validation script from this directory:

```bash
chmod +x tests/validate.sh
./tests/validate.sh
```

On Windows with PowerShell:

```powershell
.\tests\validate.ps1
```

The script always runs:

- inventory parsing
- setup playbook syntax check
- deploy playbook syntax check

Because the inventory contains example IPs, remote checks are opt-in:

```bash
RUN_REMOTE_CHECKS=1 ./tests/validate.sh
```

With real hosts configured, that additionally runs:

- `ansible all -m ansible.builtin.ping`
- setup playbook check mode
- deploy playbook check mode

The script exits non-zero if an executed test fails and prints a final PASS/FAIL
summary. It never performs destructive operations.

For explicit checks:

```bash
ansible all -i inventory/hosts.ini -m ansible.builtin.ping
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --syntax-check
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --syntax-check
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --check --diff
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --check --diff
```

For idempotency, run each playbook twice and compare the `changed` count. The
second run should report zero changes:

```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml
```

Optional linting:

```bash
ansible-lint .
```

`ansible-lint` is optional and is not required by the validation script.

## Troubleshooting

- **Unreachable host**: verify the address, SSH user, key/agent, firewall, and
  Python 3 path in `inventory/hosts.ini`.
- **Permission denied**: verify the user can use `sudo`; the playbooks use
  `become: true`.
- **Unsupported operating system**: use Debian-family or Red Hat-family Linux,
  or deliberately extend the package variables and role conditions.
- **Docker package/service failure**: inspect package-manager output and confirm
  the distribution provides the configured Docker package.
- **Template failure**: run deploy with `--check --diff` and verify required
  variables in `group_vars/all.yml`.
- **Secret requirement**: use Ansible Vault or an external secret manager;
  never add a plaintext secret to this directory.

No task in this role deletes databases, PVCs, Redis data, Kubernetes resources,
or application files outside the configured EventHub directories.

## CI/CD Relationship

1. Jenkins checks out EventHub, tests it, builds existing Docker images, and can
   push immutable tags.
2. Ansible prepares separate Linux application hosts and renders host
   configuration when that environment is used.
3. Jenkins can deploy the existing backend and notification-worker Kubernetes
   resources when `DEPLOY_TO_K8S=true`.
4. Kubernetes continues to own the EventHub runtime, including MySQL, Redis,
   backend HPA, and KEDA notification-worker scaling.

Ansible is complementary configuration automation, not a replacement for the
current Jenkins-to-Kubernetes pipeline.
