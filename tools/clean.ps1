Param(
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

function Clean-File {
  Param([string]$Path)
  $ext = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  $text = Get-Content -Raw -LiteralPath $Path

  # Remove em-dash
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''  # safe no-op
  $text = $text -replace "", ''
  $text = $text -replace "", ''
  $text = $text -replace "\u2014", ''

  if ($ext -eq '.html') {
    $text = [regex]::Replace($text, '<!--[\s\S]*?-->', '', 'Singleline')
  }
  if ($ext -eq '.js' -or $ext -eq '.css') {
    $text = [regex]::Replace($text, '/\*[\s\S]*?\*/', '', 'Singleline')
    $text = [regex]::Replace($text, '^[ \t]*//.*$', '', 'Multiline')
  }

  if (-not $WhatIf) {
    Set-Content -LiteralPath $Path -Value $text -Encoding UTF8
  } else {
    Write-Host "Would clean: $Path"
  }
}

$root = Get-Location
$files = Get-ChildItem -Recurse -File -Include *.html,*.css,*.js,*.md,*.json -Exclude node_modules,*.min.js,*.min.css -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\.git\\' }

foreach ($f in $files) { Clean-File -Path $f.FullName }

Write-Host "Cleaned $($files.Count) files."

