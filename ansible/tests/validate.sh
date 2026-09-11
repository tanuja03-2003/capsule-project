#!/usr/bin/env bash
set -u

ANSIBLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INVENTORY="${ANSIBLE_DIR}/inventory/hosts.ini"
SETUP_PLAYBOOK="${ANSIBLE_DIR}/playbooks/setup.yml"
DEPLOY_PLAYBOOK="${ANSIBLE_DIR}/playbooks/deploy.yml"

passed=0
failed=0

run_check() {
    local name="$1"
    shift

    printf 'TEST: %s\n' "$name"
    if "$@"; then
        printf 'PASS: %s\n' "$name"
        passed=$((passed + 1))
    else
        printf 'FAIL: %s\n' "$name" >&2
        failed=$((failed + 1))
    fi
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || {
        printf 'ERROR: Required command not found: %s\n' "$1" >&2
        failed=$((failed + 1))
    }
}

require_command ansible
require_command ansible-playbook
require_command ansible-inventory

if (( failed > 0 )); then
    printf '\nSUMMARY: %s passed, %s failed\n' "$passed" "$failed"
    exit 2
fi

run_check "Inventory parses" \
    ansible-inventory -i "$INVENTORY" --list >/dev/null
run_check "Setup playbook syntax" \
    ansible-playbook -i "$INVENTORY" "$SETUP_PLAYBOOK" --syntax-check
run_check "Deploy playbook syntax" \
    ansible-playbook -i "$INVENTORY" "$DEPLOY_PLAYBOOK" --syntax-check

# Remote checks are opt-in because the repository contains documentation-only
# example IPs. Set RUN_REMOTE_CHECKS=1 only after updating the inventory.
if [[ "${RUN_REMOTE_CHECKS:-0}" == "1" ]]; then
    run_check "Inventory connectivity" \
        ansible all -i "$INVENTORY" -m ansible.builtin.ping
    run_check "Setup check mode" \
        ansible-playbook -i "$INVENTORY" "$SETUP_PLAYBOOK" --check --diff
    run_check "Deploy check mode" \
        ansible-playbook -i "$INVENTORY" "$DEPLOY_PLAYBOOK" --check --diff
else
    printf 'INFO: Remote ping/check-mode tests skipped. Set RUN_REMOTE_CHECKS=1 after configuring real hosts.\n'
fi

printf '\nSUMMARY: %s passed, %s failed\n' "$passed" "$failed"
if (( failed > 0 )); then
    exit 1
fi
