using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace ObligatorioAPI.Services;

internal sealed class QrCodeEntry
{
    public int TicketId { get; init; }
    public required string Codigo { get; set; }
}

internal sealed class QrCodeService
{
    private readonly ConcurrentDictionary<int, QrCodeEntry> _codes = new();
    private readonly string _secret;

    public QrCodeService(IConfiguration configuration)
    {
        _secret = configuration["Qr:Secret"] ?? throw new InvalidOperationException("Qr:Secret is required");
    }

    private static long GetTimeSlot()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 30;
    }

    private string ComputeSignature(int ticketId, long slot)
    {
        var data = $"{ticketId}:{slot}";
        var hmac = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(_secret),
            Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hmac)[..16];
    }

    private string BuildCode(int ticketId)
    {
        var slot = GetTimeSlot();
        var sig = ComputeSignature(ticketId, slot);
        return $"TICKET:{ticketId}:{slot}:{sig}";
    }

    public string GetCurrentCode(int ticketId)
    {
        var entry = _codes.GetOrAdd(ticketId, id => new QrCodeEntry
        {
            TicketId = id,
            Codigo = BuildCode(id)
        });

        entry.Codigo = BuildCode(ticketId);
        return entry.Codigo;
    }

    public void RotateCodes()
    {
        foreach (var kv in _codes)
        {
            var fresh = BuildCode(kv.Key);
            kv.Value.Codigo = fresh;
        }
    }
}
