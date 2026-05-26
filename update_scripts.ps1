$files = Get-ChildItem -Filter *.html

foreach ($file in $files) {
    if ($file.Name -eq "index.html" -or $file.Name -eq "body_dump.html" -or $file.Name -eq "timeline.html") { continue }
    
    $content = Get-Content $file.FullName -Raw

    # 1. Clean up existing supabase scripts to avoid duplicates, and existing shared scripts to unify
    $content = $content -replace '<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>\s*', ''
    $content = $content -replace '<script src="js/supabase-config\.js[^"]*"></script>\s*', ''
    $content = $content -replace '<script src="js/shared-auth\.js[^"]*"></script>\s*', ''
    $content = $content -replace '<script src="js/shared-data\.js[^"]*"></script>\s*', ''
    $content = $content -replace '<script src="js/shared-nav\.js[^"]*"></script>\s*', ''

    # 2. Prepare the block to insert
    $scriptBlock = @"
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-config.js?v=10"></script>
  <script src="js/shared-auth.js?v=10"></script>
  <script src="js/shared-data.js?v=10"></script>
  <script src="js/shared-nav.js?v=10"></script>
"@

    # 3. Find the first custom script or the <script> block and insert right before it
    # Most files have `  <script src="js/shared-tree.js"></script>` or just `<script>`
    if ($content -match '<script src="js/shared-tree\.js[^"]*"></script>') {
        $content = $content -replace '(\s*<script src="js/shared-tree\.js[^"]*"></script>)', ("`n" + $scriptBlock + '$1')
    } elseif ($content -match '<script>') {
        $content = $content -replace '(\s*<script>)', ("`n" + $scriptBlock + '$1')
    } else {
        # Fallback to before </body>
        $content = $content -replace '(\s*</body>)', ("`n" + $scriptBlock + '$1')
    }

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Updated $($file.Name)"
}
