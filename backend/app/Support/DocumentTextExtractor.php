<?php

namespace App\Support;

use Smalot\PdfParser\Parser;
use Throwable;
use ZipArchive;

class DocumentTextExtractor
{
    public static function extract(string $absolutePath, string $mimeType, string $originalName = ''): array
    {
        $extension = strtolower(pathinfo($originalName !== '' ? $originalName : $absolutePath, PATHINFO_EXTENSION));

        $rawText = match (true) {
            str_starts_with($mimeType, 'text/') || in_array($extension, ['txt', 'md', 'csv', 'json'], true) => self::extractPlainText($absolutePath),
            $mimeType === 'application/pdf' || $extension === 'pdf' => self::extractPdf($absolutePath),
            in_array($mimeType, [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
            ], true) || in_array($extension, ['docx', 'doc'], true) => self::extractWordDocument($absolutePath, $extension),
            default => '',
        };

        $method = self::detectMethod($mimeType, $extension);
        $text = self::normalizeText($rawText);

        if (($mimeType === 'application/pdf' || $extension === 'pdf') && self::shouldTryAiExtraction($text)) {
            $aiText = self::normalizeText((string) DocumentAiExtractor::extractPdf($absolutePath, $originalName));

            if (self::preferAiText($text, $aiText)) {
                $text = $aiText;
                $method = 'openai-pdf';
            }
        }

        $preview = mb_substr($text, 0, 1200);

        if ($text === '') {
            return [
                'text' => '',
                'preview' => '',
                'status' => DocumentAiExtractor::canExtractPdf() && ($mimeType === 'application/pdf' || $extension === 'pdf')
                    ? 'File stored successfully, but readable text could not be extracted yet. Check whether the PDF is image-only or adjust the AI extraction setup.'
                    : 'File stored successfully, but readable text could not be extracted from this document yet.',
                'extractionMethod' => 'unavailable',
            ];
        }

        return [
            'text' => $text,
            'preview' => $preview,
            'status' => $method === 'openai-pdf'
                ? 'Document text was extracted with AI assistance and is ready for question generation.'
                : 'Document text extracted successfully and is ready for AI question generation.',
            'extractionMethod' => $method,
        ];
    }

    private static function extractPlainText(string $absolutePath): string
    {
        return (string) @file_get_contents($absolutePath);
    }

    private static function extractPdf(string $absolutePath): string
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($absolutePath);

            return $pdf->getText();
        } catch (Throwable) {
            return '';
        }
    }

    private static function extractWordDocument(string $absolutePath, string $extension): string
    {
        if ($extension === 'doc') {
            return '';
        }

        if (! class_exists(ZipArchive::class)) {
            return '';
        }

        $archive = new ZipArchive();

        if ($archive->open($absolutePath) !== true) {
            return '';
        }

        $xmlParts = [];

        foreach (['word/document.xml', 'word/header1.xml', 'word/footer1.xml'] as $entry) {
            $contents = $archive->getFromName($entry);

            if ($contents !== false) {
                $xmlParts[] = $contents;
            }
        }

        $archive->close();

        if ($xmlParts === []) {
            return '';
        }

        $text = implode(' ', array_map(static function (string $xml): string {
            $xml = str_replace(['</w:p>', '</w:tr>', '</w:tbl>'], ["\n", "\n", "\n"], $xml);
            $plain = strip_tags($xml);

            return html_entity_decode($plain, ENT_QUOTES | ENT_XML1, 'UTF-8');
        }, $xmlParts));

        return $text;
    }

    private static function normalizeText(string $text): string
    {
        $text = preg_replace('/[^\P{C}\n\t]+/u', ' ', $text) ?? '';
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = str_replace(["\u{00A0}", "\u{200B}", "\u{200C}", "\u{200D}"], ' ', $text);
        $text = str_replace(['ﬁ', 'ﬂ', '’', '“', '”'], ['fi', 'fl', "'", '"', '"'], $text);
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? '';
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? '';

        return trim($text);
    }

    private static function detectMethod(string $mimeType, string $extension): string
    {
        return match (true) {
            $mimeType === 'application/pdf' || $extension === 'pdf' => 'pdf-parser',
            in_array($extension, ['docx', 'doc'], true) => 'word-extractor',
            str_starts_with($mimeType, 'text/') || in_array($extension, ['txt', 'md', 'csv', 'json'], true) => 'plain-text',
            default => 'generic',
        };
    }

    private static function shouldTryAiExtraction(string $text): bool
    {
        if (! DocumentAiExtractor::canExtractPdf()) {
            return false;
        }

        if ($text === '') {
            return true;
        }

        if (mb_strlen($text) < 900) {
            return true;
        }

        $wordCount = preg_match_all('/\b[\p{L}\p{N}]+\b/u', $text, $matches);
        $longTokenCount = preg_match_all('/\b[\p{L}]{16,}\b/u', $text);
        $newlineCount = substr_count($text, "\n");

        return ($wordCount !== false && $wordCount < 180)
            || ($longTokenCount !== false && $longTokenCount >= 8)
            || $newlineCount < 3;
    }

    private static function preferAiText(string $localText, string $aiText): bool
    {
        if ($aiText === '') {
            return false;
        }

        if ($localText === '') {
            return true;
        }

        if (mb_strlen($aiText) > mb_strlen($localText) * 1.2) {
            return true;
        }

        $localParagraphs = substr_count($localText, "\n");
        $aiParagraphs = substr_count($aiText, "\n");

        if ($aiParagraphs > $localParagraphs + 2) {
            return true;
        }

        $localLongTokens = preg_match_all('/\b[\p{L}]{16,}\b/u', $localText);
        $aiLongTokens = preg_match_all('/\b[\p{L}]{16,}\b/u', $aiText);

        return $aiLongTokens !== false
            && $localLongTokens !== false
            && $aiLongTokens < $localLongTokens;
    }
}
