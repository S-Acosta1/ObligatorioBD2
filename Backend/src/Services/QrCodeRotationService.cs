namespace ObligatorioAPI.Services;

internal sealed class QrCodeRotationService : BackgroundService
{
    private readonly QrCodeService _qr;
    private readonly ILogger<QrCodeRotationService> _logger;

    public QrCodeRotationService(QrCodeService qr, ILogger<QrCodeRotationService> logger)
    {
        _qr = qr;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("QR code rotation service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            _qr.RotateCodes();
            _logger.LogDebug("QR codes rotated");
        }
    }
}
