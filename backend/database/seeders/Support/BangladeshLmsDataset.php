<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Str;

class BangladeshLmsDataset
{
    public static function tenantBlueprints(): array
    {
        return [
            [
                'name' => 'Dhaka Digital Skills Institute',
                'city' => 'Dhaka',
                'area' => 'Dhanmondi',
                'subdomain' => 'dhaka-dsi',
                'logo_text' => 'DDSI',
                'plan_type' => 'Professional',
                'status' => 'active',
            ],
            [
                'name' => 'Chattogram Tech Academy',
                'city' => 'Chattogram',
                'area' => 'Agrabad',
                'subdomain' => 'ctg-tech',
                'logo_text' => 'CTA',
                'plan_type' => 'Growth',
                'status' => 'active',
            ],
            [
                'name' => 'Sylhet Language and IT Center',
                'city' => 'Sylhet',
                'area' => 'Zindabazar',
                'subdomain' => 'sylhet-lit',
                'logo_text' => 'SLC',
                'plan_type' => 'Growth',
                'status' => 'active',
            ],
            [
                'name' => 'Rajshahi Smart Training Institute',
                'city' => 'Rajshahi',
                'area' => 'Shaheb Bazar',
                'subdomain' => 'raj-smart',
                'logo_text' => 'RSTI',
                'plan_type' => 'Starter',
                'status' => 'trial',
            ],
            [
                'name' => 'Khulna Business Learning Hub',
                'city' => 'Khulna',
                'area' => 'Sonadanga',
                'subdomain' => 'khulna-blh',
                'logo_text' => 'KBLH',
                'plan_type' => 'Growth',
                'status' => 'active',
            ],
            [
                'name' => 'Barishal Skills Development Center',
                'city' => 'Barishal',
                'area' => 'Band Road',
                'subdomain' => 'barishal-sdc',
                'logo_text' => 'BSDC',
                'plan_type' => 'Starter',
                'status' => 'active',
            ],
            [
                'name' => 'Rangpur ICT Academy',
                'city' => 'Rangpur',
                'area' => 'Jahaj Company Mor',
                'subdomain' => 'rangpur-ict',
                'logo_text' => 'RIA',
                'plan_type' => 'Growth',
                'status' => 'active',
            ],
            [
                'name' => 'Cumilla Professional Training Center',
                'city' => 'Cumilla',
                'area' => 'Kandirpar',
                'subdomain' => 'cumilla-ptc',
                'logo_text' => 'CPTC',
                'plan_type' => 'Starter',
                'status' => 'active',
            ],
            [
                'name' => 'Gazipur Industrial Skills Institute',
                'city' => 'Gazipur',
                'area' => 'Board Bazar',
                'subdomain' => 'gazipur-isi',
                'logo_text' => 'GISI',
                'plan_type' => 'Professional',
                'status' => 'active',
            ],
            [
                'name' => 'Narayanganj Corporate Learning Academy',
                'city' => 'Narayanganj',
                'area' => 'Chashara',
                'subdomain' => 'narayanganj-cla',
                'logo_text' => 'NCLA',
                'plan_type' => 'Growth',
                'status' => 'past_due',
            ],
        ];
    }

    public static function courseCatalog(): array
    {
        return [
            [
                'title' => 'Full Stack Web Development',
                'category' => 'Development',
                'level' => 'Intermediate',
                'price_bdt' => 18500,
                'description' => 'Hands-on full stack web development for Bangladeshi job market projects using HTML, JavaScript, Laravel, Next.js, and PostgreSQL.',
                'modules' => ['Web Foundations', 'Frontend Interaction', 'Backend and Deployment'],
                'lessons' => [
                    ['title' => 'HTML structure and semantic layout', 'type' => 'video'],
                    ['title' => 'Responsive CSS with utility classes', 'type' => 'pdf'],
                    ['title' => 'JavaScript DOM and event handling', 'type' => 'video'],
                    ['title' => 'Working with REST APIs', 'type' => 'quiz'],
                    ['title' => 'Laravel authentication and CRUD', 'type' => 'assignment'],
                    ['title' => 'Deploying on cloud hosting', 'type' => 'live_class'],
                ],
                'keywords' => ['HTML', 'JavaScript', 'Laravel', 'Next.js', 'PostgreSQL'],
            ],
            [
                'title' => 'Flutter App Development',
                'category' => 'Development',
                'level' => 'Beginner',
                'price_bdt' => 16500,
                'description' => 'Build Android-ready cross platform apps with Flutter and Firebase for local startup and freelance work.',
                'modules' => ['Flutter Setup', 'Widgets and Navigation', 'API and Project Build'],
                'lessons' => [
                    ['title' => 'Installing Flutter and Android Studio', 'type' => 'video'],
                    ['title' => 'Dart basics for mobile apps', 'type' => 'pdf'],
                    ['title' => 'Layouts, widgets, and reusable components', 'type' => 'video'],
                    ['title' => 'Navigation and state handling', 'type' => 'quiz'],
                    ['title' => 'API integration for app screens', 'type' => 'assignment'],
                    ['title' => 'Publishing APK and project review', 'type' => 'live_class'],
                ],
                'keywords' => ['Flutter', 'Dart', 'Widgets', 'Navigation', 'Firebase'],
            ],
            [
                'title' => 'Laravel Backend Development',
                'category' => 'Development',
                'level' => 'Intermediate',
                'price_bdt' => 17500,
                'description' => 'Learn Laravel backend architecture, authentication, queues, testing, and PostgreSQL for production-ready API projects.',
                'modules' => ['Laravel Core', 'Database and API', 'Testing and Production'],
                'lessons' => [
                    ['title' => 'Laravel routing and controller flow', 'type' => 'video'],
                    ['title' => 'Eloquent relationships and migrations', 'type' => 'pdf'],
                    ['title' => 'Building JSON APIs with resources', 'type' => 'video'],
                    ['title' => 'Queue jobs and notifications', 'type' => 'quiz'],
                    ['title' => 'Authentication with Sanctum', 'type' => 'assignment'],
                    ['title' => 'Testing and deployment checklist', 'type' => 'live_class'],
                ],
                'keywords' => ['Laravel', 'Eloquent', 'Sanctum', 'Queues', 'Testing'],
            ],
            [
                'title' => 'Next.js Frontend Development',
                'category' => 'Development',
                'level' => 'Intermediate',
                'price_bdt' => 16800,
                'description' => 'Create modern frontend products with Next.js, React, route handling, dashboard UI, and API integration.',
                'modules' => ['Next.js Basics', 'UI Systems', 'Data and Deployment'],
                'lessons' => [
                    ['title' => 'App Router and page structure', 'type' => 'video'],
                    ['title' => 'Client components and state handling', 'type' => 'pdf'],
                    ['title' => 'Reusable dashboard design patterns', 'type' => 'video'],
                    ['title' => 'Fetching API data effectively', 'type' => 'quiz'],
                    ['title' => 'Deployment and SEO basics', 'type' => 'assignment'],
                    ['title' => 'Portfolio review session', 'type' => 'live_class'],
                ],
                'keywords' => ['Next.js', 'React', 'Routing', 'UI', 'API'],
            ],
            [
                'title' => 'Digital Marketing',
                'category' => 'Marketing',
                'level' => 'Beginner',
                'price_bdt' => 9800,
                'description' => 'Practical digital marketing for Bangladeshi SMEs with Facebook ads, SEO, content planning, and lead generation.',
                'modules' => ['Marketing Basics', 'Paid Campaigns', 'Analytics and Reporting'],
                'lessons' => [
                    ['title' => 'Digital funnel and customer journey', 'type' => 'video'],
                    ['title' => 'Facebook and Instagram ad setup', 'type' => 'pdf'],
                    ['title' => 'Keyword research for local SEO', 'type' => 'video'],
                    ['title' => 'Ad copywriting and creatives', 'type' => 'quiz'],
                    ['title' => 'Campaign optimization exercise', 'type' => 'assignment'],
                    ['title' => 'Reporting to business owners', 'type' => 'live_class'],
                ],
                'keywords' => ['SEO', 'Facebook Ads', 'Content', 'Leads', 'Analytics'],
            ],
            [
                'title' => 'Graphic Design',
                'category' => 'Design',
                'level' => 'Beginner',
                'price_bdt' => 9200,
                'description' => 'Develop practical graphic design skills for social media, branding, and freelance delivery using Photoshop and Illustrator.',
                'modules' => ['Design Foundations', 'Brand and Social Creatives', 'Freelance Delivery'],
                'lessons' => [
                    ['title' => 'Color, layout, and typography basics', 'type' => 'video'],
                    ['title' => 'Photoshop tools for beginners', 'type' => 'pdf'],
                    ['title' => 'Illustrator logo and icon workflow', 'type' => 'video'],
                    ['title' => 'Social media post composition', 'type' => 'quiz'],
                    ['title' => 'Client brief to final design', 'type' => 'assignment'],
                    ['title' => 'Portfolio critique session', 'type' => 'live_class'],
                ],
                'keywords' => ['Photoshop', 'Illustrator', 'Typography', 'Branding', 'Portfolio'],
            ],
            [
                'title' => 'Spoken English',
                'category' => 'Language',
                'level' => 'Beginner',
                'price_bdt' => 7500,
                'description' => 'Improve speaking confidence for interviews, customer communication, and classroom presentations.',
                'modules' => ['Speaking Foundations', 'Workplace Communication', 'Confidence Building'],
                'lessons' => [
                    ['title' => 'Pronunciation and basic fluency', 'type' => 'video'],
                    ['title' => 'Daily conversation patterns', 'type' => 'pdf'],
                    ['title' => 'Telephone and meeting communication', 'type' => 'video'],
                    ['title' => 'Presentation vocabulary practice', 'type' => 'quiz'],
                    ['title' => 'Role play assignment', 'type' => 'assignment'],
                    ['title' => 'Live speaking practice', 'type' => 'live_class'],
                ],
                'keywords' => ['Pronunciation', 'Fluency', 'Conversation', 'Presentation', 'Confidence'],
            ],
            [
                'title' => 'IELTS Preparation',
                'category' => 'Language',
                'level' => 'Advanced',
                'price_bdt' => 12500,
                'description' => 'Target higher IELTS bands with structured reading, writing, speaking, and listening practice.',
                'modules' => ['Reading and Listening', 'Writing Tasks', 'Speaking Strategy'],
                'lessons' => [
                    ['title' => 'Reading skimming and scanning', 'type' => 'video'],
                    ['title' => 'Listening section techniques', 'type' => 'pdf'],
                    ['title' => 'Writing Task 1 band strategy', 'type' => 'video'],
                    ['title' => 'Writing Task 2 structure', 'type' => 'quiz'],
                    ['title' => 'Speaking mock assignment', 'type' => 'assignment'],
                    ['title' => 'Live mock test review', 'type' => 'live_class'],
                ],
                'keywords' => ['IELTS', 'Band Score', 'Writing', 'Listening', 'Speaking'],
            ],
            [
                'title' => 'Data Science with Python',
                'category' => 'Data',
                'level' => 'Intermediate',
                'price_bdt' => 19800,
                'description' => 'Analyze data with Python, pandas, visualization, and machine learning basics using local business and education datasets.',
                'modules' => ['Python for Data', 'Analysis Workflow', 'ML Fundamentals'],
                'lessons' => [
                    ['title' => 'Python syntax for analysis', 'type' => 'video'],
                    ['title' => 'Pandas data cleaning workflow', 'type' => 'pdf'],
                    ['title' => 'Charts with matplotlib and seaborn', 'type' => 'video'],
                    ['title' => 'Feature and target understanding', 'type' => 'quiz'],
                    ['title' => 'Regression mini project', 'type' => 'assignment'],
                    ['title' => 'Model review and interpretation', 'type' => 'live_class'],
                ],
                'keywords' => ['Python', 'Pandas', 'Visualization', 'Regression', 'Data Cleaning'],
            ],
            [
                'title' => 'Office Management',
                'category' => 'Business',
                'level' => 'Beginner',
                'price_bdt' => 6900,
                'description' => 'Essential office operations, professional communication, documentation, and administrative workflow for Bangladeshi offices.',
                'modules' => ['Office Basics', 'Documentation', 'Admin Coordination'],
                'lessons' => [
                    ['title' => 'Office etiquette and communication', 'type' => 'video'],
                    ['title' => 'Official letter and memo drafting', 'type' => 'pdf'],
                    ['title' => 'Meeting schedule and follow-up', 'type' => 'video'],
                    ['title' => 'Records and file handling', 'type' => 'quiz'],
                    ['title' => 'Admin workflow simulation', 'type' => 'assignment'],
                    ['title' => 'Supervisor feedback session', 'type' => 'live_class'],
                ],
                'keywords' => ['Communication', 'Documentation', 'Administration', 'Records', 'Office'],
            ],
            [
                'title' => 'Corporate Compliance Training',
                'category' => 'Compliance',
                'level' => 'Intermediate',
                'price_bdt' => 8400,
                'description' => 'Corporate compliance essentials covering workplace policy, reporting, audit readiness, and employee responsibility.',
                'modules' => ['Policy Awareness', 'Risk and Reporting', 'Audit Readiness'],
                'lessons' => [
                    ['title' => 'Code of conduct orientation', 'type' => 'video'],
                    ['title' => 'Whistleblower and reporting policy', 'type' => 'pdf'],
                    ['title' => 'Conflict of interest scenarios', 'type' => 'video'],
                    ['title' => 'Compliance checkpoint quiz', 'type' => 'quiz'],
                    ['title' => 'Incident response assignment', 'type' => 'assignment'],
                    ['title' => 'Audit walkthrough class', 'type' => 'live_class'],
                ],
                'keywords' => ['Compliance', 'Audit', 'Policy', 'Reporting', 'Risk'],
            ],
            [
                'title' => 'Cyber Security Basics',
                'category' => 'Security',
                'level' => 'Intermediate',
                'price_bdt' => 11200,
                'description' => 'Understand practical cyber security basics, phishing risks, password hygiene, and workplace data safety.',
                'modules' => ['Security Awareness', 'Threats and Response', 'Safe Practice'],
                'lessons' => [
                    ['title' => 'Understanding common cyber threats', 'type' => 'video'],
                    ['title' => 'Password and MFA best practice', 'type' => 'pdf'],
                    ['title' => 'Email phishing detection', 'type' => 'video'],
                    ['title' => 'Secure browsing quiz', 'type' => 'quiz'],
                    ['title' => 'Incident reporting assignment', 'type' => 'assignment'],
                    ['title' => 'Security Q&A live session', 'type' => 'live_class'],
                ],
                'keywords' => ['Phishing', 'Password', 'MFA', 'Threats', 'Security'],
            ],
            [
                'title' => 'AI Tools for Business',
                'category' => 'Business',
                'level' => 'Intermediate',
                'price_bdt' => 11900,
                'description' => 'Use AI tools responsibly for research, presentations, workflow automation, and communication in business teams.',
                'modules' => ['AI Fundamentals', 'Business Use Cases', 'Governance and Ethics'],
                'lessons' => [
                    ['title' => 'Prompt writing for office tasks', 'type' => 'video'],
                    ['title' => 'Summarization and research support', 'type' => 'pdf'],
                    ['title' => 'AI for reports and slides', 'type' => 'video'],
                    ['title' => 'Quality review and fact checking', 'type' => 'quiz'],
                    ['title' => 'AI workflow design assignment', 'type' => 'assignment'],
                    ['title' => 'Leadership live workshop', 'type' => 'live_class'],
                ],
                'keywords' => ['AI', 'Prompting', 'Automation', 'Research', 'Governance'],
            ],
            [
                'title' => 'Accounting with Excel',
                'category' => 'Business',
                'level' => 'Beginner',
                'price_bdt' => 8800,
                'description' => 'Apply Excel formulas, ledger setup, reporting, and reconciliation for SME accounting teams in Bangladesh.',
                'modules' => ['Excel Basics', 'Accounting Workflow', 'Reporting and Analysis'],
                'lessons' => [
                    ['title' => 'Worksheet setup and formulas', 'type' => 'video'],
                    ['title' => 'Voucher and ledger entry', 'type' => 'pdf'],
                    ['title' => 'Pivot table for monthly report', 'type' => 'video'],
                    ['title' => 'Reconciliation and checks', 'type' => 'quiz'],
                    ['title' => 'Financial report assignment', 'type' => 'assignment'],
                    ['title' => 'Excel troubleshooting class', 'type' => 'live_class'],
                ],
                'keywords' => ['Excel', 'Ledger', 'Voucher', 'Pivot Table', 'Reconciliation'],
            ],
            [
                'title' => 'Time Management for Professionals',
                'category' => 'Personal Development',
                'level' => 'Beginner',
                'price_bdt' => 4500,
                'description' => 'Master productivity tools, prioritization techniques, and work-life balance for busy Bangladeshi professionals.',
                'modules' => ['Productivity Tools', 'Prioritization Techniques', 'Sustaining Balance'],
                'lessons' => [
                    ['title' => 'Calendar and task management', 'type' => 'video'],
                    ['title' => 'The Eisenhower Matrix explained', 'type' => 'pdf'],
                    ['title' => 'Handling interruptions effectively', 'type' => 'video'],
                    ['title' => 'Focus and deep work sessions', 'type' => 'quiz'],
                    ['title' => 'Weekly review assignment', 'type' => 'assignment'],
                    ['title' => 'Productivity Q&A session', 'type' => 'live_class'],
                ],
                'keywords' => ['Productivity', 'Focus', 'Prioritization', 'Work-life balance'],
            ],
            [
                'title' => 'Photography Foundations',
                'category' => 'Arts',
                'level' => 'Beginner',
                'price_bdt' => 12000,
                'description' => 'Learn manual camera settings, composition, lighting, and basic editing for professional-looking photos.',
                'modules' => ['Camera Basics', 'Composition and Light', 'Editing Workflow'],
                'lessons' => [
                    ['title' => 'Aperture, Shutter, and ISO', 'type' => 'video'],
                    ['title' => 'Rule of Thirds and Framing', 'type' => 'pdf'],
                    ['title' => 'Natural vs Artificial Lighting', 'type' => 'video'],
                    ['title' => 'Composition quiz', 'type' => 'quiz'],
                    ['title' => 'Outdoor shoot assignment', 'type' => 'assignment'],
                    ['title' => 'Lightroom basics workshop', 'type' => 'live_class'],
                ],
                'keywords' => ['Photography', 'Lighting', 'Composition', 'Editing', 'Lightroom'],
            ],
            [
                'title' => 'Public Speaking Masterclass',
                'category' => 'Personal Development',
                'level' => 'Intermediate',
                'price_bdt' => 9500,
                'description' => 'Overcome stage fright and deliver impactful presentations with structured storytelling and vocal training.',
                'modules' => ['Overcoming Anxiety', 'Storytelling Techniques', 'Delivery Mastery'],
                'lessons' => [
                    ['title' => 'Breathing and posture basics', 'type' => 'video'],
                    ['title' => 'Structuring your speech', 'type' => 'pdf'],
                    ['title' => 'Engaging the audience', 'type' => 'video'],
                    ['title' => 'Vocal variety exercise', 'type' => 'quiz'],
                    ['title' => 'Presentation assignment', 'type' => 'assignment'],
                    ['title' => 'Live speech feedback', 'type' => 'live_class'],
                ],
                'keywords' => ['Public Speaking', 'Confidence', 'Storytelling', 'Vocal Training'],
            ],
            [
                'title' => 'Basics of Stock Market',
                'category' => 'Finance',
                'level' => 'Beginner',
                'price_bdt' => 8500,
                'description' => 'Understand the Bangladesh stock market, fundamental analysis, and long-term investment strategies.',
                'modules' => ['Market Structure', 'Analysis Basics', 'Investment Strategy'],
                'lessons' => [
                    ['title' => 'How DSE and CSE work', 'type' => 'video'],
                    ['title' => 'Reading financial statements', 'type' => 'pdf'],
                    ['title' => 'Diversification and risk', 'type' => 'video'],
                    ['title' => 'IPO and primary market', 'type' => 'quiz'],
                    ['title' => 'Portfolio design assignment', 'type' => 'assignment'],
                    ['title' => 'Market review class', 'type' => 'live_class'],
                ],
                'keywords' => ['Stock Market', 'Finance', 'Investment', 'DSE', 'Analysis'],
            ],
            [
                'title' => 'First Aid and Safety',
                'category' => 'Health',
                'level' => 'Beginner',
                'price_bdt' => 3500,
                'description' => 'Basic life-saving skills, wound care, and emergency response for workplace and home safety.',
                'modules' => ['Emergency Response', 'Injury Management', 'Safety Protocols'],
                'lessons' => [
                    ['title' => 'CPR and Choking basics', 'type' => 'video'],
                    ['title' => 'Wound cleaning and dressing', 'type' => 'pdf'],
                    ['title' => 'Burns and fracture response', 'type' => 'video'],
                    ['title' => 'Emergency kits checklist', 'type' => 'quiz'],
                    ['title' => 'First aid simulation', 'type' => 'assignment'],
                    ['title' => 'Q&A with a paramedic', 'type' => 'live_class'],
                ],
                'keywords' => ['First Aid', 'Safety', 'Health', 'Emergency', 'CPR'],
            ],
            [
                'title' => 'Culinary Arts: Bengali Cuisine',
                'category' => 'Arts',
                'level' => 'Intermediate',
                'price_bdt' => 11000,
                'description' => 'Master authentic Bengali recipes, spice blending, and professional plating for traditional favorites.',
                'modules' => ['Spice Foundations', 'Main Course Mastery', 'Desserts and Plating'],
                'lessons' => [
                    ['title' => 'The art of Bengali spices', 'type' => 'video'],
                    ['title' => 'Traditional Fish Curry', 'type' => 'pdf'],
                    ['title' => 'Biryani and Pulao secrets', 'type' => 'video'],
                    ['title' => 'Recipe modification quiz', 'type' => 'quiz'],
                    ['title' => 'Dish creation assignment', 'type' => 'assignment'],
                    ['title' => 'Plating live demo', 'type' => 'live_class'],
                ],
                'keywords' => ['Cooking', 'Cuisine', 'Bengali', 'Recipes', 'Plating'],
            ],
        ];
    }

    public static function permissions(): array
    {
        return [
            'manage_tenants' => 'Manage tenants and institute settings',
            'manage_users' => 'Manage tenant users',
            'manage_roles' => 'Manage roles and permissions',
            'manage_courses' => 'Create and update courses',
            'publish_courses' => 'Publish course content',
            'manage_assessments' => 'Create and review assessments',
            'submit_assessments' => 'Submit course assessments',
            'manage_live_classes' => 'Schedule and control live classes',
            'track_attendance' => 'Track class attendance',
            'manage_certificates' => 'Issue and revoke certificates',
            'manage_billing' => 'Handle subscription and invoices',
            'view_reports' => 'Access reports and analytics',
            'receive_notifications' => 'Receive LMS notifications',
        ];
    }

    public static function rolePermissions(): array
    {
        return [
            'admin' => [
                'manage_users',
                'manage_courses',
                'publish_courses',
                'manage_assessments',
                'manage_live_classes',
                'manage_certificates',
                'manage_billing',
                'view_reports',
                'receive_notifications',
            ],
            'teacher' => [
                'manage_courses',
                'publish_courses',
                'manage_assessments',
                'manage_live_classes',
                'receive_notifications',
            ],
            'student' => [
                'submit_assessments',
                'receive_notifications',
            ],
        ];
    }

    public static function fullName(int $index): string
    {
        $firstNames = [
            'Abdur', 'Abida', 'Afsana', 'Ahmed', 'Akhi', 'Akram', 'Amena', 'Anika', 'Arif', 'Asif',
            'Farhana', 'Farid', 'Habiba', 'Hasan', 'Iffat', 'Imran', 'Jannat', 'Jubayer', 'Kawsar', 'Mahin',
            'Mahmud', 'Maliha', 'Maruf', 'Mehedi', 'Mim', 'Mithila', 'Monira', 'Nafisa', 'Nayeem', 'Nishat',
            'Nusrat', 'Oishee', 'Rafi', 'Rakib', 'Rashida', 'Rifat', 'Rizwan', 'Sabbir', 'Sadia', 'Saiful',
            'Salma', 'Sanjida', 'Shadman', 'Sharmin', 'Siam', 'Shuvo', 'Tahmid', 'Tahsin', 'Tanjim', 'Tasnia',
            'Tanvir', 'Taslima', 'Towhid', 'Yasin', 'Zarin', 'Zubair',
        ];

        $middleNames = [
            'Ahsan', 'Akter', 'Alam', 'Ara', 'Chowdhury', 'Ferdous', 'Haque', 'Hossain', 'Islam', 'Jahan',
            'Kabir', 'Khatun', 'Mahmud', 'Morshed', 'Nahar', 'Parveen', 'Rashid', 'Sultana', 'Uddin',
        ];

        $lastNames = [
            'Ahmed', 'Akter', 'Ali', 'Anam', 'Apu', 'Bari', 'Bhuiyan', 'Das', 'Fahim', 'Hasan', 'Hossain',
            'Hridoy', 'Islam', 'Khan', 'Mahmud', 'Miah', 'Molla', 'Nahar', 'Rahman', 'Rana', 'Sarker',
            'Shikder', 'Sultana', 'Talukder', 'Uddin',
        ];

        $first = $firstNames[$index % count($firstNames)];
        $middle = $middleNames[intdiv($index, count($firstNames)) % count($middleNames)];
        $last = $lastNames[intdiv($index, count($firstNames) * count($middleNames)) % count($lastNames)];

        return "{$first} {$middle} {$last}";
    }

    public static function email(string $name, string $subdomain, int $index): string
    {
        $parts = collect(explode(' ', Str::lower($name)))
            ->map(fn (string $part): string => preg_replace('/[^a-z]/', '', $part) ?: '')
            ->filter()
            ->values();

        $base = $parts->slice(0, 2)->implode('.');

        return sprintf('%s%d@%s.example.com', $base, $index + 1, $subdomain);
    }

    public static function phone(int $index): string
    {
        $prefixes = ['017', '018', '019', '016', '015'];
        $prefix = $prefixes[$index % count($prefixes)];

        return $prefix . str_pad((string) (10000000 + ($index % 89999999)), 8, '0', STR_PAD_LEFT);
    }

    public static function address(string $city, string $area, int $index): string
    {
        $roads = ['Road', 'Lane', 'Link Road', 'Avenue', 'Main Road'];
        $buildingTitles = ['Tower', 'Center', 'Bhaban', 'Plaza', 'Complex'];

        return sprintf(
            '%d/%d, %s %s, %s %s, %s, Bangladesh',
            ($index % 25) + 1,
            ($index % 9) + 1,
            ucfirst($area),
            $roads[$index % count($roads)],
            ucfirst($area),
            $buildingTitles[$index % count($buildingTitles)],
            $city
        );
    }

    /**
     * A curated pool of real educational YouTube video IDs grouped by topic.
     * These are popular, freely available tutorial videos.
     */
    public static function youtubeVideoPool(): array
    {
        return [
            'html' => ['qz0aGYrrlhU', 'UB1O30fR-EE', 'HcOc7P5BMi4'],
            'css' => ['1Rs2ND1ryYc', 'OXGznpKZ_sA', 'G3e-cpL7ofc'],
            'javascript' => ['W6NZfCO5SIk', 'PkZNo7MFNFg', 'jS4aFq5-91M'],
            'react' => ['SqcY0GlETPk', 'w7ejDZ8SWv8', 'bMknfKXIFA8'],
            'nextjs' => ['ZVnjOPwW4ZA', 'mTz0GXj8NN0', 'wm5gMKuwSYk'],
            'laravel' => ['MFh0Fd7BsjQ', 'MYyJ4PuL4pY', 'ImtZ5yENzgE'],
            'flutter' => ['VPvVD8t02U8', '1ukSR1GRtMU', 'x0uinJvhNxI'],
            'dart' => ['Ej_Pcr4uC2Q', 'F3JuuYuOUK4'],
            'python' => ['_uQrJ0TkZlc', 'rfscVS0vtbw', 'kqtD5dpn9C8'],
            'pandas' => ['vmEHCJofslg', 'PcvsOaixUh8'],
            'data' => ['r-uOLxNrNk8', 'ua-CiDNNj30'],
            'api' => ['GZvSYJDk-us', 'WXsD0ZgxjRw'],
            'database' => ['HXV3zeQKqGY', 'ztHopE5Wnpc'],
            'git' => ['RGOj5yH7evk', 'SWYqp7iY_Tc'],
            'marketing' => ['bixR-KIJKYM', 'i_gNOt0CjdI'],
            'seo' => ['DvwS7cV9GmQ', 'SnxRyUe8KFI'],
            'facebook' => ['bixR-KIJKYM', 'I-FoJGUPOjg'],
            'photoshop' => ['IyR_uYsRdPs', 'W-hWm6ZdEKQ'],
            'illustrator' => ['Ib8UBwu3yGA', '3aYECRqh9YM'],
            'design' => ['YqQx75OPRa0', 'HZuk6ICGrGE'],
            'typography' => ['sByzHoiYFX0', 'agbh1wbfJt8'],
            'english' => ['TETSs8Y6XjE', 'OnprREgvUiI'],
            'ielts' => ['PSSBRNyw00k', 'TETSs8Y6XjE'],
            'speaking' => ['HAnw168huqA', 'eIho2S0ZahI'],
            'presentation' => ['Iwpi1Lm6dFo', 'yoD8RMq2OkU'],
            'excel' => ['Vl0H-eTkFBs', '0nbkaYsR94c'],
            'accounting' => ['yYX4bvQSqbo', 'AcfKhZXF9y4'],
            'compliance' => ['aTL6P6YgSrA', 'sKbj5L4NXnY'],
            'security' => ['inWWhr5tnEA', 'sdpxddDzXfE'],
            'phishing' => ['XBkzBrXlle0', 'Y7zNlEMDmAI'],
            'ai' => ['JMUxmLyrhSk', '2ePf9rue1Ao', 'aircAruvnKk'],
            'prompt' => ['jC4v5AS4RIM', '_ZvnD96BXqo'],
            'photography' => ['V7z7BAZdt2M', 'LxO-6rlihSg'],
            'lighting' => ['V7z7BAZdt2M', 'GximhhWeKK4'],
            'stock' => ['A7fZp9dwELo', 'Xn7KWR9EOGQ'],
            'finance' => ['WEDIj9JBTC8', 'HQnNQ1FBiME'],
            'first_aid' => ['ea1RJUOiNfQ', 'AEP3ppbQnFI'],
            'cooking' => ['bJUiWdM__Qw', 'Cit2jWRRaUw'],
            'time_management' => ['iONDebHX9qk', 'iDbdXTMnOXM'],
            'productivity' => ['k6Uxc5n7pHo', 'LAj2fFYQPHE'],
            'general' => ['dQw4w9WgXcQ', 'rfscVS0vtbw', 'W6NZfCO5SIk'],
        ];
    }

    /**
     * Get a YouTube embed URL for a lesson based on its title and category.
     */
    public static function videoUrlForLesson(string $lessonTitle, string $category, int $index): string
    {
        $pool = self::youtubeVideoPool();
        $lower = strtolower($lessonTitle . ' ' . $category);

        // Try to match a keyword from the pool
        $matched = null;
        foreach ($pool as $keyword => $videos) {
            if (str_contains($lower, $keyword)) {
                $matched = $videos;
                break;
            }
        }

        // Fallback to category-based or general
        if ($matched === null) {
            $catKey = strtolower($category);
            $matched = $pool[$catKey] ?? $pool['general'];
        }

        $videoId = $matched[$index % count($matched)];

        return 'https://www.youtube.com/watch?v=' . $videoId;
    }

    public static function thumbnailUrl(string $subdomain, string $slug): string
    {
        return sprintf('https://cdn.%s.example.com/thumbnails/%s.jpg', $subdomain, $slug);
    }

    public static function meetingUrl(string $subdomain, string $slug, int $index): string
    {
        return sprintf('https://meet.%s.example.com/%s-session-%d', $subdomain, $slug, $index + 1);
    }

    public static function recordingUrl(string $subdomain, string $slug, int $index): string
    {
        return sprintf('https://video.%s.example.com/%s-recording-%d.mp4', $subdomain, $slug, $index + 1);
    }

    public static function invoiceNumber(string $subdomain, int $index): string
    {
        return strtoupper(sprintf('%s-INV-%04d', Str::slug($subdomain, ''), $index + 1));
    }

    public static function certificateNumber(string $subdomain, int $index): string
    {
        return strtoupper(sprintf('%s-CERT-%05d', Str::slug($subdomain, ''), $index + 1));
    }

    public static function verificationCode(string $subdomain, int $index): string
    {
        return strtoupper(sprintf('%s-%s', substr(Str::slug($subdomain, ''), 0, 4), str_pad((string) ($index + 1), 6, '0', STR_PAD_LEFT)));
    }
}
