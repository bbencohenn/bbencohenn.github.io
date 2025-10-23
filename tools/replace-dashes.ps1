Param(
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

function Replace-Dashes {
  Param([string]$Path)
  $text = Get-Content -Raw -LiteralPath $Path
  $new = $text -replace "\u2014","-" -replace "\u2013","-"
  if ($new -ne $text) {
    if ($WhatIf) { Write-Host "Would replace dashes in: $Path" }
    else { Set-Content -LiteralPath $Path -Value $new -Encoding UTF8 }
  }
}

$files = Get-ChildItem -Recurse -File -Include *.html,*.css,*.js,*.md,*.json -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\.git\\' }
foreach ($f in $files) { Replace-Dashes -Path $f.FullName }
Write-Host "Replaced dashes in $($files.Count) files (where present)."

