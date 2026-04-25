<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Throwable;

class DocumentAiExtractor
{
    public static function canExtractPdf(): bool
    {
        return config('services.openai.api_key') !== null
            && config('services.openai.api_key') !== ''
            && config('services.openai.pdf_extraction_enabled', false);
    }

    public static function extractPdf(string $absolutePath, string $originalName = 'document.pdf'): ?string
    {
        if (! self::canExtractPdf() || ! is_file($absolutePath)) {
            return null;
        }

        $binary = @file_get_contents($absolutePath);

        if ($binary === false || $binary === '') {
            return null;
        }

        $base64 = base64_encode($binary);

        try {
            $response = Http::withToken((string) config('services.openai.api_key'))
                ->acceptJson()
                ->timeout((int) config('services.openai.timeout', 60))
                ->post('https://api.openai.com/v1/responses', [
                    'model' => config('services.openai.pdf_extraction_model', 'gpt-4.1-mini'),
                    'input' => [[
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'input_text',
                                'text' => 'Extract clean learning notes from this PDF. Return plain text only. Keep useful headings and bullets, remove repeated headers, footers, and page numbers, and repair obvious OCR/layout issues when possible.',
                            ],
                            [
                                'type' => 'input_file',
                                'filename' => $originalName !== '' ? $originalName : 'document.pdf',
                                'file_data' => 'data:application/pdf;base64,' . $base64,
                            ],
                        ],
                    ]],
                ]);

            if (! $response->successful()) {
                return null;
            }

            $payload = $response->json();
            $text = $payload['output_text'] ?? null;

            if (is_string($text) && trim($text) !== '') {
                return trim($text);
            }

            return self::flattenResponseText($payload);
        } catch (Throwable) {
            return null;
        }
    }

    private static function flattenResponseText(array $payload): ?string
    {
        $chunks = [];

        foreach (($payload['output'] ?? []) as $outputItem) {
            foreach (($outputItem['content'] ?? []) as $contentItem) {
                $text = $contentItem['text'] ?? null;

                if (is_string($text) && trim($text) !== '') {
                    $chunks[] = trim($text);
                }
            }
        }

        if ($chunks === []) {
            return null;
        }

        return trim(implode("\n\n", $chunks));
    }
}
