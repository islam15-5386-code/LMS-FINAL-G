<?php

return [
    'plans' => [
        'Starter' => [
            'price' => 49,
            'seat_limit' => 100,
            'overage_per_seat' => 5,
            'live_limit' => 0,
            'white_label' => false,
        ],
        'Growth' => [
            'price' => 149,
            'seat_limit' => 500,
            'overage_per_seat' => 3,
            'live_limit' => 100,
            'white_label' => false,
        ],
        'Professional' => [
            'price' => 349,
            'seat_limit' => 2000,
            'overage_per_seat' => 2,
            'live_limit' => 500,
            'white_label' => true,
        ],
    ],
    'fallback_question_banks' => [
        [
            'id' => 'fallback-compliance',
            'title' => 'Compliance Foundations Bank',
            'category' => 'Compliance',
            'source_text' => 'Compliance audit evidence policy remediation reporting controls certificate verification employee completion matrix department filters export csv pdf reminder workflow.',
            'recommended_types' => ['MCQ', 'True/False', 'Short Answer'],
        ],
        [
            'id' => 'fallback-ai',
            'title' => 'AI Assessment Bank',
            'category' => 'Teaching',
            'source_text' => 'AI rubric evaluation teacher review question generation uploaded notes fallback bank essay feedback learning objectives answer quality publishing workflow.',
            'recommended_types' => ['MCQ', 'Essay', 'Short Answer'],
        ],
        [
            'id' => 'fallback-live',
            'title' => 'Live Classroom Bank',
            'category' => 'Live Learning',
            'source_text' => 'Live classroom Jitsi reminders scheduled session recording attendance participant limit host workflow student notification one hour twenty four hours.',
            'recommended_types' => ['MCQ', 'True/False'],
        ],
    ],
    'endpoints' => [
        'note_upload' => '/api/teacher/notes/upload',
        'ai_assessment_generate' => '/api/teacher/assessments/generate',
        'fallback_question_bank' => '/api/teacher/question-bank/fallback',
    ],
];
