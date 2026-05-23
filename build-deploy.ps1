param(
  [switch]$NoDeploy,
  [switch]$NoGit,
  [switch]$DryRun,
  [string]$Message
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$artifactDir = Join-Path $root ".deploy\cpanel"
$manifestFile = Join-Path $root ".deploy-manifest.json"
$envFile = Join-Path $root ".env.deploy"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Church CMS - Build, Sync & Deploy" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Invoke-Step {
  param(
    [string]$Command,
    [string]$FailureMessage
  )

  Invoke-Expression $Command
  if ($LASTEXITCODE -ne 0) {
    Write-Host $FailureMessage -ForegroundColor Red
    exit 1
  }
}

function Read-DeployEnv {
  $envVars = @{}

  if (-not (Test-Path $envFile)) {
    return $envVars
  }

  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+?)\s*=\s*(.+)$') {
      $envVars[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
    }
  }

  return $envVars
}

function Get-FileHashString {
  param([string]$FilePath)

  return (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash
}

function Convert-ToHashtable {
  param($Object)

  $hash = @{}
  if ($null -eq $Object) {
    return $hash
  }

  $Object.PSObject.Properties | ForEach-Object {
    $hash[$_.Name] = $_.Value
  }

  return $hash
}

function Get-RelativeDeployPath {
  param([string]$FullName)

  return $FullName.Substring($artifactDir.Length).Replace('\', '/')
}

# Allow PS5 to talk to cPanel's HTTPS API even when the TLS cert doesn't match
function Set-TrustAllCerts {
  if ($PSVersionTable.PSVersion.Major -lt 6) {
    try {
      Add-Type -TypeDefinition @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertPolicy : ICertificatePolicy {
  public bool CheckValidationResult(
    ServicePoint sp, X509Certificate cert, WebRequest req, int p) { return true; }
}
"@
    } catch {}
    [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertPolicy
    [System.Net.ServicePointManager]::SecurityProtocol  = [System.Net.SecurityProtocolType]::Tls12
  }
}

# Thin wrapper that adds -SkipCertificateCheck on PS7+ so the same call works on both
function Invoke-CpanelApi {
  param([string]$Url, [hashtable]$Body, [hashtable]$Headers, [bool]$SkipTls = $false)
  if ($SkipTls -and $PSVersionTable.PSVersion.Major -ge 6) {
    return Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body -SkipCertificateCheck
  }
  return Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body
}

# Step 1: install and build locally
Write-Host "[1/5] Building locally..." -ForegroundColor Yellow
Push-Location $root
Invoke-Step "npm install --silent 2>`$null" "Dependency install failed."
Invoke-Step "npm run prisma:generate" "Prisma generate failed."
Invoke-Step "npm run build" "App build failed."
Invoke-Step "npm run build:artifact" "Artifact build failed."
Pop-Location
Write-Host "  Local build complete." -ForegroundColor Green

# Step 2: optional git sync
$envVars = Read-DeployEnv
$gitSyncEnabled = ($envVars['DEPLOY_GIT_SYNC'] -ne '0')
$gitRemote = if ($envVars['DEPLOY_GIT_REMOTE']) { $envVars['DEPLOY_GIT_REMOTE'] } else { 'origin' }
$gitBranch = if ($envVars['DEPLOY_GIT_BRANCH']) { $envVars['DEPLOY_GIT_BRANCH'] } else { 'main' }
$gitMessage = if ($Message) { $Message } elseif ($envVars['DEPLOY_GIT_MESSAGE']) { $envVars['DEPLOY_GIT_MESSAGE'] } else { "deploy: $(Get-Date -Format s)" }

if (-not $NoGit -and $gitSyncEnabled) {
  Write-Host "[2/5] Syncing git..." -ForegroundColor Yellow
  Push-Location $root
  git rev-parse --is-inside-work-tree *> $null
  if ($LASTEXITCODE -eq 0) {
    git remote get-url $gitRemote *> $null
    if ($LASTEXITCODE -eq 0) {
      $status = git status --porcelain
      if ($status) {
        git add -A
        git commit -m $gitMessage *> $null
      }
      git push $gitRemote $gitBranch
      if ($LASTEXITCODE -ne 0) {
        Write-Host "Git push failed." -ForegroundColor Red
        exit 1
      }
      Write-Host "  Git sync complete." -ForegroundColor Green
    } else {
      Write-Host "  Skipping git sync: remote '$gitRemote' is not configured." -ForegroundColor Yellow
    }
  } else {
    Write-Host "  Skipping git sync: this folder is not a git repository." -ForegroundColor Yellow
  }
  Pop-Location
} else {
  Write-Host "[2/5] Skipping git sync" -ForegroundColor Yellow
}

# Step 3: confirm artifact exists
Write-Host "[3/5] Preparing deploy artifact..." -ForegroundColor Yellow
if (-not (Test-Path $artifactDir)) {
  Write-Host "Deploy artifact not found at $artifactDir" -ForegroundColor Red
  exit 1
}
Write-Host "  Deploy artifact ready at $artifactDir" -ForegroundColor Green

if ($NoDeploy) {
  Write-Host ""
  Write-Host "[4/5] Skipping upload (-NoDeploy flag set)" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "============================================" -ForegroundColor Cyan
  Write-Host "  Deploy artifact ready at:" -ForegroundColor Cyan
  Write-Host "  $artifactDir" -ForegroundColor White
  Write-Host "============================================" -ForegroundColor Cyan
  Write-Host ""
  exit 0
}

# Step 4: Deploy via ZIP + cPanel UAPI
#
# Why ZIP instead of per-file FTP?
# Next.js App Router uses route groups like (dashboard) and dynamic segments like [id]
# in compiled output paths. cPanel's FTP server rejects those characters in STOR paths
# with "553 File name not allowed". Uploading a single ZIP avoids the problem entirely:
# the ZIP is extracted server-side by cPanel, which operates directly on the filesystem
# with no such restriction.
#
# Flow:
#   1. Build an incremental ZIP containing only files that changed since last deploy
#   2. FTP-upload the ZIP to the FTP root (your home dir) - one clean filename
#   3. Call cPanel UAPI Fileman::extract_file to extract into the app dir
#   4. Call cPanel UAPI Fileman::delete_files to remove stale files (best effort)
#   5. Delete the temp ZIP from the server

$deployHost   = if ($envVars['DEPLOY_HOST'])   { $envVars['DEPLOY_HOST'] }   elseif ($envVars['CPANEL_SFTP_HOST'])     { $envVars['CPANEL_SFTP_HOST'] }     else { $null }
$deployUser   = if ($envVars['DEPLOY_USER'])   { $envVars['DEPLOY_USER'] }   elseif ($envVars['CPANEL_SFTP_USERNAME']) { $envVars['CPANEL_SFTP_USERNAME'] } else { $null }
$deployPass   = if ($envVars['DEPLOY_PASS'])   { $envVars['DEPLOY_PASS'] }   elseif ($envVars['CPANEL_SFTP_PASSWORD']) { $envVars['CPANEL_SFTP_PASSWORD'] } else { $null }
$deployPath   = if ($envVars['DEPLOY_PATH'])   { $envVars['DEPLOY_PATH'] }   elseif ($envVars['CPANEL_REMOTE_DIR'])    { $envVars['CPANEL_REMOTE_DIR'] }    else { $null }
$cpanelPort   = if ($envVars['DEPLOY_CPANEL_PORT']) { [int]$envVars['DEPLOY_CPANEL_PORT'] } elseif ($envVars['CPANEL_PANEL_PORT']) { [int]$envVars['CPANEL_PANEL_PORT'] } else { 2083 }

if ($envVars['DEPLOY_FTP_PORT']) {
  $deployPort = [int]$envVars['DEPLOY_FTP_PORT']
} elseif ($envVars['CPANEL_FTP_PORT']) {
  $deployPort = [int]$envVars['CPANEL_FTP_PORT']
} else {
  $deployPort = 21
}

$deploySsl     = ($envVars['DEPLOY_FTP_SSL'] -eq '1')
$skipTlsVerify = ($envVars['CPANEL_FTP_TLS_REJECT_UNAUTHORIZED'] -eq '0' -or $envVars['DEPLOY_TLS_SKIP_VERIFY'] -eq '1')

if (-not $deployHost -or -not $deployUser -or -not $deployPass -or -not $deployPath) {
  Write-Host "Missing deploy credentials. Set DEPLOY_HOST/DEPLOY_USER/DEPLOY_PASS/DEPLOY_PATH (or legacy CPANEL_* equivalents) in .env.deploy." -ForegroundColor Red
  exit 1
}

# deployPath is the absolute server path, e.g. /home/beatlesb/cms.mikadee.oo.gd
$remoteRoot    = $deployPath.Trim('/')       # home/beatlesb/cms.mikadee.oo.gd
$absRemotePath = "/$remoteRoot"              # /home/beatlesb/cms.mikadee.oo.gd
$homeDirPath   = "/home/$deployUser"         # /home/beatlesb  (== FTP root on cPanel)

Write-Host "[4/5] Deploying to cPanel via ZIP + API..." -ForegroundColor Yellow

if ($skipTlsVerify) { Set-TrustAllCerts }

# ── Hash-based manifest comparison ───────────────────────────────────────────

$oldManifest    = @{}
if (Test-Path $manifestFile) {
  $oldManifest = Convert-ToHashtable (Get-Content $manifestFile -Raw | ConvertFrom-Json)
}
$newManifest    = @{}
$changedFiles   = @()
$unchangedCount = 0

$allFiles = Get-ChildItem -Path $artifactDir -Recurse -File | Where-Object {
  $_.FullName -notlike "*\public\uploads\*" -and $_.Name -ne ".cpanel-deploy-manifest.json"
}

foreach ($file in $allFiles) {
  $relativePath = Get-RelativeDeployPath $file.FullName
  $fileHash     = Get-FileHashString $file.FullName
  $newManifest[$relativePath] = $fileHash

  if ($oldManifest.ContainsKey($relativePath) -and $oldManifest[$relativePath] -eq $fileHash) {
    $unchangedCount++
  } else {
    $changedFiles += @{ File = $file; RelativePath = $relativePath }
  }
}

$removedFiles = @()
foreach ($oldPath in $oldManifest.Keys) {
  if (-not $newManifest.ContainsKey($oldPath)) { $removedFiles += $oldPath }
}

# ── Dry run ───────────────────────────────────────────────────────────────────

if ($DryRun) {
  if ($changedFiles.Count -eq 0 -and $removedFiles.Count -eq 0) {
    Write-Host "  No files changed since last deploy." -ForegroundColor Green
  } else {
    Write-Host "  $($changedFiles.Count) changed, $($removedFiles.Count) removed, $unchangedCount unchanged." -ForegroundColor White
    Write-Host "  Dry run only - no remote changes will be made." -ForegroundColor Yellow
    Write-Host ""
    ($changedFiles | Select-Object -First 20) | ForEach-Object {
      Write-Host "    Would upload: $($_.RelativePath)" -ForegroundColor DarkGray
    }
    if ($changedFiles.Count -gt 20) {
      Write-Host "    ... plus $($changedFiles.Count - 20) more changed files" -ForegroundColor DarkGray
    }
    ($removedFiles | Select-Object -First 10) | ForEach-Object {
      Write-Host "    Would delete: $_" -ForegroundColor DarkGray
    }
    if ($removedFiles.Count -gt 10) {
      Write-Host "    ... plus $($removedFiles.Count - 10) more removed files" -ForegroundColor DarkGray
    }
  }
  Write-Host ""
  Write-Host "[5/5] Dry run complete." -ForegroundColor Green
  Write-Host ""
  exit 0
}

# ── Nothing to do ─────────────────────────────────────────────────────────────

if ($changedFiles.Count -eq 0 -and $removedFiles.Count -eq 0) {
  Write-Host "  No files changed since last deploy. Nothing to upload or delete." -ForegroundColor Green
} else {
  Write-Host "  $($changedFiles.Count) changed, $($removedFiles.Count) removed, $unchangedCount unchanged." -ForegroundColor White

  # ── Build incremental ZIP ─────────────────────────────────────────────────
  if ($changedFiles.Count -gt 0) {
    $tempZip = Join-Path $root ".deploy\incremental.zip"
    if (Test-Path $tempZip) { Remove-Item $tempZip -Force }

    Write-Host "  Packaging $($changedFiles.Count) changed file(s) into ZIP..." -ForegroundColor White

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipStream = [System.IO.File]::Open($tempZip, [System.IO.FileMode]::Create)
    $zip       = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

    foreach ($cf in $changedFiles) {
      $entryName = (($cf.RelativePath -replace '^/+', '') -replace '\\', '/')
      try {
        $entry       = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
        $entryStream = $entry.Open()
        $fileStream  = [System.IO.File]::OpenRead($cf.File.FullName)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
      } catch {
        Write-Host "    WARN: Could not add $($cf.RelativePath): $_" -ForegroundColor Yellow
      }
    }

    $zip.Dispose()
    $zipStream.Close()

    $zipSizeMB = [math]::Round((Get-Item $tempZip).Length / 1MB, 1)
    Write-Host "  ZIP ready ($zipSizeMB MB)." -ForegroundColor DarkGray

    # ── Upload ZIP to FTP root ────────────────────────────────────────────────
    # Single clean filename at FTP root - avoids (dashboard), [id] FTP rejections
    Write-Host "  Uploading ZIP via FTP..." -ForegroundColor White

    $cred      = New-Object System.Net.NetworkCredential($deployUser, $deployPass)
    $ftpZipUrl = "ftp://${deployHost}:${deployPort}/incremental.zip"

    try {
      $ftpUp               = [System.Net.FtpWebRequest]::Create($ftpZipUrl)
      $ftpUp.Method        = [System.Net.WebRequestMethods+Ftp]::UploadFile
      $ftpUp.Credentials   = $cred
      $ftpUp.EnableSsl     = $deploySsl
      $ftpUp.UseBinary     = $true
      $ftpUp.UsePassive    = $true
      $zipBytes            = [System.IO.File]::ReadAllBytes($tempZip)
      $ftpUp.ContentLength = $zipBytes.Length
      $ftpStream           = $ftpUp.GetRequestStream()
      $ftpStream.Write($zipBytes, 0, $zipBytes.Length)
      $ftpStream.Close()
      ($ftpUp.GetResponse()).Close()
    } catch {
      Write-Host "  FTP upload failed: $_" -ForegroundColor Red
      Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
      exit 1
    }

    Write-Host "  ZIP uploaded to server FTP root." -ForegroundColor DarkGray

    # ── Extract on server via cPanel UAPI ────────────────────────────────────
    Write-Host "  Extracting files on server via cPanel API..." -ForegroundColor White

    $authBase64 = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("${deployUser}:${deployPass}"))
    $apiHeaders = @{ Authorization = "Basic $authBase64"; Accept = "application/json" }

    try {
      $extractResult = Invoke-CpanelApi `
        -Url "https://${deployHost}:${cpanelPort}/execute/Fileman/extract_file" `
        -Body @{ dir = $homeDirPath; filename = "incremental.zip"; dest = $absRemotePath } `
        -Headers $apiHeaders `
        -SkipTls $skipTlsVerify

      if ($extractResult.status -eq 1) {
        Write-Host "  Extracted $($changedFiles.Count) file(s) into $absRemotePath." -ForegroundColor Green
      } else {
        $errMsg = if ($extractResult.errors) { $extractResult.errors -join ', ' } else { 'unknown error' }
        Write-Host "  Extract API warning: $errMsg" -ForegroundColor Yellow
      }
    } catch {
      Write-Host "  Extract API failed: $_" -ForegroundColor Red
      # Clean up ZIP before exiting
      try {
        $ftpDel            = [System.Net.FtpWebRequest]::Create($ftpZipUrl)
        $ftpDel.Method     = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $ftpDel.Credentials = $cred
        $ftpDel.EnableSsl  = $deploySsl
        $ftpDel.UseBinary  = $true
        $ftpDel.UsePassive = $true
        ($ftpDel.GetResponse()).Close()
      } catch {}
      Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
      exit 1
    }

    # ── Clean up ZIP from server ──────────────────────────────────────────────
    try {
      $ftpDel            = [System.Net.FtpWebRequest]::Create($ftpZipUrl)
      $ftpDel.Method     = [System.Net.WebRequestMethods+Ftp]::DeleteFile
      $ftpDel.Credentials = $cred
      $ftpDel.EnableSsl  = $deploySsl
      $ftpDel.UseBinary  = $true
      $ftpDel.UsePassive = $true
      ($ftpDel.GetResponse()).Close()
      Write-Host "  Cleaned up temp ZIP from server." -ForegroundColor DarkGray
    } catch {
      Write-Host "  WARN: Could not remove temp ZIP from server (not critical): $_" -ForegroundColor Yellow
    }

    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
  }

  # ── Delete removed files via cPanel UAPI ─────────────────────────────────
  if ($removedFiles.Count -gt 0) {
    Write-Host "  Removing $($removedFiles.Count) stale file(s) via cPanel API..." -ForegroundColor White

    $authBase64 = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("${deployUser}:${deployPass}"))
    $apiHeaders = @{ Authorization = "Basic $authBase64"; Accept = "application/json" }

    $deleteBody = @{}
    $i = 0
    foreach ($removedPath in $removedFiles) {
      $cleanPath = (($removedPath -replace '^/+', '') -replace '\\', '/')
      $deleteBody["files-$i-path"] = "$absRemotePath/$cleanPath"
      $i++
    }

    try {
      $deleteResult = Invoke-CpanelApi `
        -Url "https://${deployHost}:${cpanelPort}/execute/Fileman/delete_files" `
        -Body $deleteBody `
        -Headers $apiHeaders `
        -SkipTls $skipTlsVerify
      Write-Host "  Removed $($removedFiles.Count) stale file(s) from server." -ForegroundColor DarkGray
    } catch {
      Write-Host "  WARN: Stale file removal failed (not critical): $_" -ForegroundColor Yellow
    }
  }
}

$newManifest | ConvertTo-Json -Depth 10 | Set-Content $manifestFile -Encoding UTF8
Write-Host "  Deploy manifest saved." -ForegroundColor DarkGray

Write-Host ""
Write-Host "[5/5] Done! Deployment complete." -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deployed to: $absRemotePath" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Restart your Node.js app in cPanel:" -ForegroundColor White
Write-Host "  cPanel > Setup Node.js App > Restart" -ForegroundColor Yellow
Write-Host ""
