# DZ Prime Academy Hub

I want you to rebuild the project from scratch as a REAL production-ready MVP.

The project is called:

DZ PRIME ACADEMY

I have uploaded the official logo image for the project.

USE THE UPLOADED LOGO as the actual application logo.

Do not create a different logo.

Do not replace it with a generated icon.

IMPORTANT:

This is NOT a mockup.

This is NOT a demo.

Do NOT use fake users.

Do NOT use fake student data.

Do NOT use hardcoded sample data.

Do NOT simulate database responses.

Everything that belongs to users, student profiles, news, content, settings, etc. must come from the real Supabase database.

==================================================

1. FIRST SCREEN — SPLASH / LOADING SCREEN

==================================================

When the application opens, the very first screen must be a premium splash screen.

Display:

- The uploaded DZ PRIME ACADEMY logo in the center.

- The text:

  "DZ PRIME ACADEMY"

- Elegant loading animation.

- Dark premium educational visual style.

- Smooth fade/scale animation.

The logo should appear large and centered.

After a short loading period, check whether the user already has a completed student profile.

IMPORTANT:

Do not create fake profile information.

If the user already has a profile:

→ go directly to the main application.

If the user does not have a profile:

→ open the onboarding screen.

==================================================

2. STUDENT ONBOARDING

==================================================

For a new student, show a clean Arabic RTL onboarding form.

Title:

"أهلاً بك في DZ PRIME ACADEMY"

Subtitle:

"أكمل معلوماتك لنجهز لك تجربتك الدراسية"

Ask for:

1. الاسم

2. السنة الدراسية

3. الشعبة

4. الولاية

Name:

- Text input

- Required

School year:

Show exactly these options:

- السنة الأولى ثانوي

- السنة الثانية ثانوي

- السنة الثالثة ثانوي

Branch / Stream:

The available branches must depend on the selected school year.

Do NOT hardcode a fake list of branches if the data can be stored in Supabase.

The branch structure should be designed so it can be managed from the database later.

Wilaya:

Provide the 58 Algerian wilayas.

The student must complete all required fields before continuing.

Button:

"متابعة"

When the student submits:

- Create/update the REAL student profile in Supabase.

- Associate the profile with the authenticated Telegram user if the application is running as a Telegram Mini App.

- Never create a fake Telegram user.

- Never use a hardcoded Telegram ID.

==================================================

3. TELEGRAM MINI APP AUTHENTICATION

==================================================

The application will eventually run inside Telegram.

Use Telegram WebApp authentication.

When available:

- Read Telegram WebApp initData.

- Validate initData server-side.

- Identify the real Telegram user.

- Create the user in Supabase if necessary.

- Link the student profile to that real user.

Never trust a telegram_id sent manually from the frontend.

Never hardcode:

telegram_id

username

first_name

or user identity.

For local development, provide a safe development mode that does NOT create fake database users.

If Telegram authentication is unavailable locally, clearly show that Telegram authentication is required instead of inventing a user.

==================================================

4. MAIN APPLICATION STRUCTURE

==================================================

After onboarding, the student enters the main application.

The application must have these main sections:

1. الرئيسية

2. الأخبار

3. المحتوى

4. الحساب

5. الإعدادات

Use a modern mobile-first bottom navigation.

Arabic RTL.

Premium educational design.

==================================================

5. MAIN HOME PAGE

==================================================

The home page must adapt to the student's selected school year.

For example:

If the student selected:

السنة الأولى ثانوي

show content relevant to first year.

If:

السنة الثانية ثانوي

show second-year content.

If:

السنة الثالثة ثانوي

show third-year content.

The layout and navigation remain the SAME for all students.

Only the educational content changes according to:

- school year

- branch

Do NOT create three completely separate applications.

Use one shared application with dynamic database-driven content.

==================================================

6. HOME PAGE CONTENT

==================================================

Create a premium home page containing:

- Welcome message using the student's REAL first name.

- Student's school year.

- Student's branch.

- Quick access to content.

- Latest news.

- Important announcements.

- Recommended educational content.

Everything must come from Supabase.

If there is no content yet in the database:

show a beautiful empty state such as:

"لا يوجد محتوى متاح حالياً"

Do NOT display fake cards.

==================================================

7. NEWS PAGE — COMMON FOR ALL YEARS

==================================================

This is very important.

The NEWS page must be COMMON to ALL students.

For example:

A student in:

السنة الأولى ثانوي

and another student in:

السنة الثالثة ثانوي

must see the same general news if the news is marked as global.

Any news/announcement published by the administrator should appear for everyone when it is a global announcement.

However, the database should support optional targeting in the future.

For example:

- global

- specific school year

- specific branch

The default news feed should show:

Global news

+

news targeted to the student's year/branch.

News must be real Supabase records.

Do NOT create fake news.

==================================================

8. CONTENT PAGE

==================================================

Create a dedicated:

"المحتوى"

page.

Content is filtered dynamically based on:

- student's school year

- student's branch

- selected subject

Example:

First year student:

→ first-year content.

Second year student:

→ second-year content.

Third year student:

→ third-year content.

Branch-specific content should only appear for the correct branch.

Create categories such as:

- الدروس

- الملخصات

- التمارين

- الاختبارات

- الملفات

But do not create fake records.

If there are no records in Supabase:

show:

"لا يوجد محتوى متاح حالياً"

==================================================

9. STUDENT ACCOUNT PAGE

==================================================

Create:

"الحساب"

Display the REAL student information:

- الاسم

- اسم المستخدم Telegram if available

- السنة الدراسية

- الشعبة

- الولاية

Allow the student to edit their profile.

Changes must be saved to Supabase.

Do not store the main profile only in localStorage.

==================================================

10. SETTINGS PAGE

==================================================

Create:

"الإعدادات"

Include:

- تعديل المعلومات الشخصية

- اللغة

- الإشعارات

- حول التطبيق

- الدعم

Use real settings where necessary.

Do not create fake functionality.

If a setting requires backend support, create the required database structure.

==================================================

11. DATABASE — SUPABASE

==================================================

Use Supabase as the real backend/database.

Create a clean scalable schema.

At minimum create:

users

student_profiles

school_years

branches

wilayas

subjects

content

news

user_settings

Suggested structure:

users:

- id uuid primary key

- telegram_id bigint unique

- username text

- first_name text

- last_name text

- created_at timestamptz

- updated_at timestamptz

student_profiles:

- id uuid primary key

- user_id uuid references users(id)

- name text

- school_year_id uuid

- branch_id uuid

- wilaya_id uuid

- created_at timestamptz

- updated_at timestamptz

school_years:

- id uuid primary key

- name text

- slug text unique

branches:

- id uuid primary key

- name text

- school_year_id uuid references school_years(id)

wilayas:

- id uuid primary key

- name text

- code text

subjects:

- id uuid primary key

- name text

- school_year_id uuid

- branch_id uuid nullable

content:

- id uuid primary key

- title text

- description text

- content_type text

- file_url text nullable

- subject_id uuid

- school_year_id uuid

- branch_id uuid nullable

- created_at timestamptz

- updated_at timestamptz

news:

- id uuid primary key

- title text

- content text

- image_url text nullable

- visibility text

- school_year_id uuid nullable

- branch_id uuid nullable

- published_at timestamptz

- created_at timestamptz

user_settings:

- id uuid primary key

- user_id uuid references users(id)

- notifications_enabled boolean default true

- language text default 'ar'

- created_at timestamptz

- updated_at timestamptz

Create proper indexes and foreign keys.

==================================================

12. SECURITY

==================================================

Use Supabase Row Level Security.

Students must only be able to:

- read their own profile

- update their own profile

- read public/global news

- read news targeted to their school year/branch

- read content available to their school year/branch

- manage their own settings

Students must NOT be able to:

- modify other students

- create admin accounts

- modify news

- modify educational content

- modify database configuration

Never disable security just to make something work.

==================================================

13. ADMIN SYSTEM

==================================================

Prepare the database architecture for an Admin Dashboard.

Admins will eventually be able to:

- Add news

- Edit news

- Delete news

- Add educational content

- Edit content

- Delete content

- Manage school years

- Manage branches

- Manage subjects

- Manage users

For now, implement the database structure and secure authorization architecture.

Do not create fake admin data.

==================================================

14. ENVIRONMENT VARIABLES

==================================================

IMPORTANT:

Do NOT put secret keys directly inside source code.

Create the required environment variable setup.

FRONTEND:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SERVER ONLY:

SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=

TELEGRAM_BOT_TOKEN=

IMPORTANT:

SUPABASE_SERVICE_ROLE_KEY must NEVER be exposed to the browser.

TELEGRAM_BOT_TOKEN must NEVER be exposed to the browser.

Do not use NEXT_PUBLIC_ for secret keys.

==================================================

15. KEY SETUP INSTRUCTIONS

==================================================

After building the project, clearly tell me:

WHERE I ENTER THE KEYS.

I want a clear section named:

"Environment Variables Setup"

Tell me exactly:

1. Where to put the Supabase URL.

2. Where to put the Supabase Publishable Key.

3. Where to put the Supabase Service Role Key.

4. Where to put the Telegram Bot Token.

5. Which ones are public.

6. Which ones are secret.

7. Where to obtain each one.

8. How to restart the application after adding them.

Do NOT ask me to put secret keys into page.tsx.

Do NOT hardcode any credentials.

==================================================

16. NO FAKE DATA

==================================================

This rule is extremely important.

DO NOT create:

- fake students

- fake usernames

- fake news

- fake subjects

- fake content

- fake subscriptions

- fake Telegram users

- fake statistics

If the database is empty, the UI must show a proper empty state.

For example:

"لا توجد أخبار حالياً"

instead of inventing an article.

==================================================

17. DESIGN

==================================================

Use the uploaded DZ PRIME ACADEMY logo.

Design style:

- Premium

- Modern

- Educational

- Mobile-first

- Arabic RTL

- Smooth animations

- Elegant cards

- Dark blue / navy visual identity matching the uploaded logo

- White/silver accents

- Excellent typography

- Clean spacing

The app should feel like a real Algerian educational platform.

Do NOT make it look like a generic dashboard template.

==================================================

18. RESPONSIVE DESIGN

==================================================

The primary target is:

Telegram Mobile Mini App.

Optimize for:

- Android

- iPhone

- Telegram WebApp

Also make it work correctly on desktop browsers.

==================================================

19. FINAL USER FLOW

==================================================

The complete flow must be:

OPEN APP

↓

DZ PRIME ACADEMY SPLASH SCREEN

↓

CHECK REAL TELEGRAM USER / REAL PROFILE

↓

If profile doesn't exist:

ONBOARDING

↓

Name

↓

School Year

↓

Branch

↓

Wilaya

↓

SAVE TO SUPABASE

↓

MAIN APP

MAIN APP:

الرئيسية

الأخبار

المحتوى

الحساب

الإعدادات

The main interface is shared between all school years.

The content dynamically changes based on:

school year + branch.

NEWS remains globally shared when marked as global.

==================================================

20. FINAL REQUIREMENT

==================================================

Build the application as a REAL MVP.

Do not stop at the visual interface.

Implement:

- real Supabase connection

- real database schema

- real CRUD where needed

- real student profiles

- real Telegram authentication architecture

- real news database

- real educational content database

- real filtering by school year and branch

- real user settings

- real security policies

If something is not yet configured, do NOT fake it.

Instead show me exactly what I need to configure.

At the end, provide:

1. Project structure

2. Supabase tables created

3. Environment variables required

4. Where to enter each key

5. Telegram setup steps

6. Local testing steps

7. Deployment steps

8. A checklist to verify the complete MVP

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dzprime-learn-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dfd5a490-b7aa-4717-8859-d6c9a4fd2af4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
