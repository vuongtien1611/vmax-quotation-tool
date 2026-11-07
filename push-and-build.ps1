param(
    [string]$RepoUrl
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VMAX QUOTATION BUILDER - GITHUB ACTIONS DMG BUILDER     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $RepoUrl) {
    Write-Host "`nVui lòng dán đường dẫn GitHub Repository URL của bạn vào đây:" -ForegroundColor Yellow
    Write-Host "Ví dụ: https://github.com/vuongtien1611/vmax-quotation-tool.git`n" -ForegroundColor Gray
    $RepoUrl = Read-Host "GitHub Repo URL"
}

if (-not $RepoUrl) {
    Write-Host "Lỗi: Bạn chưa nhập URL repository!" -ForegroundColor Red
    exit 1
}

# Cập nhật remote origin
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}

Write-Host "`nĐang đẩy mã nguồn lên nhánh 'main' của GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n>>> Đẩy mã nguồn thành công! <<<" -ForegroundColor Green
    Write-Host "GitHub Actions đang tự động khởi chạy máy ảo macOS để build file .dmg..." -ForegroundColor Green
    
    $cleanUrl = $RepoUrl -replace '\.git$', ''
    $actionsUrl = "$cleanUrl/actions"
    
    Write-Host "`nĐang mở trang theo dõi tiến trình build tại: $actionsUrl" -ForegroundColor Cyan
    Start-Process $actionsUrl
} else {
    Write-Host "`n[!] Có lỗi khi đẩy code lên GitHub. Vui lòng kiểm tra quyền truy cập repository của bạn." -ForegroundColor Red
}
