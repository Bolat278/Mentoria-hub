-- Supabase Schema and Seed Script for Mentoria Hub
-- Run this in your Supabase SQL Editor

-- ==========================================
-- 1. SCHEMA DEFINITION
-- ==========================================

-- User profiles with roles
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  grade int check (grade between 8 and 11),
  interests text[],
  goals text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp default now()
);

-- Opportunities catalog
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('olympiad', 'internship', 'hackathon', 'scholarship')),
  description text,
  tags text[],
  deadline date,
  link text,
  image_url text,
  created_at timestamp default now()
);

-- Saved/liked opportunities per user
create table if not exists saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  saved_at timestamp default now(),
  unique(user_id, opportunity_id)
);

-- Courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[],
  thumbnail_url text,
  video_url text,
  quiz_question text,
  quiz_options text[],
  quiz_correct_index int,
  quiz_pause_at_seconds int default 10,
  created_at timestamp default now()
);

-- User progress
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed boolean default false,
  quiz_passed boolean default false,
  roadmap_stage text,
  completed_at timestamp,
  unique(user_id, course_id)
);

-- ==========================================
-- 2. SEED DATA
-- ==========================================

-- Seed Opportunities (15 Examples)
insert into opportunities (title, type, description, tags, deadline, image_url, link) values
('National Mathematics Olympiad', 'olympiad', 'Prestigious national math competition for grades 8-11. Win scholarships to top universities.', ARRAY['STEM', 'Mathematics'], '2027-01-15', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', '#'),
('Yandex Junior Internship', 'internship', 'Summer coding internship for high school students. Learn Python, Data Science, and build real products.', ARRAY['Programming', 'STEM'], '2027-03-01', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', '#'),
('Global Tech Hackathon', 'hackathon', '48-hour online hackathon to solve global sustainability issues using technology.', ARRAY['Programming', 'Business'], '2026-11-20', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', '#'),
('Future Leaders Scholarship', 'scholarship', 'Full-ride scholarship for students demonstrating exceptional leadership in their communities.', ARRAY['Business', 'Social Sciences'], '2027-02-28', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', '#'),
('All-Russian Physics Olympiad', 'olympiad', 'Test your physics knowledge against the brightest minds in the country.', ARRAY['STEM', 'Physics'], '2026-12-10', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80', '#'),
('Google Code-in', 'internship', 'Global, online contest introducing teenagers to the world of open source development.', ARRAY['Programming'], '2026-10-30', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', '#'),
('Eco-Business Hackathon', 'hackathon', 'Create a business model for a sustainable startup and pitch to investors.', ARRAY['Business', 'Social Sciences'], '2027-04-15', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', '#'),
('Medical Sciences Olympiad', 'olympiad', 'Biology and chemistry competition for aspiring medical students.', ARRAY['STEM', 'Medicine'], '2027-03-20', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', '#'),
('Art & Design Scholarship', 'scholarship', 'Financial support for talented students pursuing a degree in visual arts or design.', ARRAY['Arts'], '2027-05-01', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', '#'),
('Cybersecurity Bootcamp & Hackathon', 'hackathon', 'Learn to hack ethically and defend networks in this intensive weekend event.', ARRAY['Programming', 'STEM'], '2026-12-05', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', '#'),
('Law & Debate Tournament', 'olympiad', 'Regional debate tournament focusing on constitutional law and civil rights.', ARRAY['Law', 'Social Sciences'], '2027-01-20', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80', '#'),
('Language Ambassador Internship', 'internship', 'Practice translation and cultural exchange with an international NGO.', ARRAY['Languages', 'Social Sciences'], '2027-04-10', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', '#'),
('Space Exploration Hackathon', 'hackathon', 'Design concepts for Mars colonization using real NASA data.', ARRAY['STEM', 'Physics'], '2027-02-15', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80', '#'),
('Creative Writing Scholarship', 'scholarship', 'Submit your original short story or poetry collection for a chance to win funding.', ARRAY['Arts', 'Languages'], '2027-06-01', 'https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&w=800&q=80', '#'),
('Finance & Trading Olympiad', 'olympiad', 'Virtual stock market trading competition to test your economic intuition.', ARRAY['Business', 'Mathematics'], '2026-11-30', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', '#');

-- Seed Courses (5 Sample Courses)
insert into courses (title, description, tags, thumbnail_url, video_url, quiz_question, quiz_options, quiz_correct_index, quiz_pause_at_seconds) values
('Introduction to Python', 'Learn the basics of Python programming, variables, and loops.', ARRAY['Programming', 'Beginner'], 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&w=800&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'What is the correct syntax to output "Hello World" in Python?', ARRAY['echo "Hello World"', 'print("Hello World")', 'console.log("Hello World")', 'System.out.println("Hello World")'], 1, 15),
('Business Strategy 101', 'Understand how companies create value and build competitive advantage.', ARRAY['Business', 'Strategy'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'What is a SWOT analysis primarily used for?', ARRAY['Financial accounting', 'Strategic planning', 'Human resources', 'Software development'], 1, 10),
('Mastering Data Science', 'Dive deep into data manipulation with Pandas and NumPy.', ARRAY['Programming', 'STEM'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'Which library is best suited for numerical computing in Python?', ARRAY['Requests', 'BeautifulSoup', 'NumPy', 'Django'], 2, 20),
('Public Speaking Mastery', 'Techniques to overcome stage fright and deliver compelling presentations.', ARRAY['Arts', 'Soft Skills'], 'https://images.unsplash.com/photo-1475721025505-11110de81ff6?auto=format&fit=crop&w=800&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'What is the most effective way to start a speech?', ARRAY['Reading from a script', 'A compelling hook or story', 'Apologizing for nervousness', 'A long self-introduction'], 1, 12),
('Advanced Algorithms', 'Prepare for olympiads by mastering graph theory and dynamic programming.', ARRAY['Programming', 'Advanced'], 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 'What is the time complexity of binary search?', ARRAY['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], 3, 8);
