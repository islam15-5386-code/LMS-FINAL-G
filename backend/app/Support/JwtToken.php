<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class JwtToken
{
    public const TTL_MINUTES = 120;

    public static function issue(User $user): string
    {
        $now = time();
        $exp = $now + (self::TTL_MINUTES * 60);
        $jti = (string) Str::uuid();

        $payload = [
            'iss' => config('app.url'),
            'sub' => (string) $user->id,
            'iat' => $now,
            'nbf' => $now,
            'exp' => $exp,
            'jti' => $jti,
            'tenant_id' => $user->tenant_id,
            'role' => $user->role,
        ];

        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $encodedHeader = self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $encodedPayload = self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", self::secret(), true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    /**
     * @return array<string, mixed>
     */
    public static function decode(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new \RuntimeException('Invalid token format.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $signingInput = "{$encodedHeader}.{$encodedPayload}";
        $expectedSignature = self::base64UrlEncode(hash_hmac('sha256', $signingInput, self::secret(), true));

        if (! hash_equals($expectedSignature, $encodedSignature)) {
            throw new \RuntimeException('Invalid token signature.');
        }

        $header = json_decode(self::base64UrlDecode($encodedHeader), true);
        if (! is_array($header) || ($header['alg'] ?? null) !== 'HS256') {
            throw new \RuntimeException('Invalid token header.');
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (! is_array($payload)) {
            throw new \RuntimeException('Invalid token payload.');
        }

        $now = time();
        if (isset($payload['nbf']) && $now < (int) $payload['nbf']) {
            throw new \RuntimeException('Token not yet valid.');
        }

        if (isset($payload['exp']) && $now >= (int) $payload['exp']) {
            throw new \RuntimeException('Token expired.');
        }

        return $payload;
    }

    public static function revoke(string $jti, int $exp): void
    {
        $ttlSeconds = max(60, $exp - time());
        Cache::put(self::blacklistKey($jti), true, now()->addSeconds($ttlSeconds));
    }

    public static function isRevoked(string $jti): bool
    {
        return Cache::has(self::blacklistKey($jti));
    }

    private static function blacklistKey(string $jti): string
    {
        return "jwt:blacklist:{$jti}";
    }

    private static function secret(): string
    {
        return (string) config('app.key');
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
