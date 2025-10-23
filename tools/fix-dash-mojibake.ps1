Param(
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

function Fix-File {
  Param([string]$Path)
  $text = Get-Content -Raw -LiteralPath $Path -Encoding UTF8
  $new = $text
  $emdash_mojibake = [string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x201D)
  $endash_mojibake = [string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x201C)
  $new = $new -replace [regex]::Escape($emdash_mojibake), '-'
  $new = $new -replace [regex]::Escape($endash_mojibake), '-'
  if ($new -ne $text) {
    if ($WhatIf) { Write-Host "Would fix: $Path" }
    else { Set-Content -LiteralPath $Path -Value $new -Encoding UTF8 }
  }
}

$files = Get-ChildItem -Recurse -File -Include *.html,*.css,*.js,*.md,*.json -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\.git\\' }
foreach ($f in $files) { Fix-File -Path $f.FullName }
Write-Host "Fixed dash mojibake in $($files.Count) files (where present)."
