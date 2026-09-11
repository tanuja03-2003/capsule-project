$ErrorActionPreference = 'Stop'

$ansibleDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$inventory = Join-Path $ansibleDirectory 'inventory/hosts.ini'
$setupPlaybook = Join-Path $ansibleDirectory 'playbooks/setup.yml'
$deployPlaybook = Join-Path $ansibleDirectory 'playbooks/deploy.yml'

$passed = 0
$failed = 0

function Invoke-Test {
    param(
        [Parameter(Mandatory = $true)] [string] $Name,
        [Parameter(Mandatory = $true)] [scriptblock] $Command
    )

    Write-Host "TEST: $Name"
    try {
        & $Command
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
            throw "Command exited with code $LASTEXITCODE"
        }
        Write-Host "PASS: $Name"
        $script:passed++
    }
    catch {
        Write-Error "FAIL: $Name - $($_.Exception.Message)"
        $script:failed++
    }
}

foreach ($command in @('ansible', 'ansible-playbook', 'ansible-inventory')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        Write-Error "Required command not found: $command"
        exit 2
    }
}

Invoke-Test 'Inventory parses' {
    ansible-inventory -i $inventory --list | Out-Null
}
Invoke-Test 'Setup playbook syntax' {
    ansible-playbook -i $inventory $setupPlaybook --syntax-check
}
Invoke-Test 'Deploy playbook syntax' {
    ansible-playbook -i $inventory $deployPlaybook --syntax-check
}

if ($env:RUN_REMOTE_CHECKS -eq '1') {
    Invoke-Test 'Inventory connectivity' {
        ansible all -i $inventory -m ansible.builtin.ping
    }
    Invoke-Test 'Setup check mode' {
        ansible-playbook -i $inventory $setupPlaybook --check --diff
    }
    Invoke-Test 'Deploy check mode' {
        ansible-playbook -i $inventory $deployPlaybook --check --diff
    }
}
else {
    Write-Host 'INFO: Remote ping/check-mode tests skipped. Set RUN_REMOTE_CHECKS=1 after configuring real hosts.'
}

Write-Host "SUMMARY: $passed passed, $failed failed"
if ($failed -gt 0) {
    exit 1
}
