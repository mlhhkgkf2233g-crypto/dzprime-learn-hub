
-- shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- ============ reference tables ============
CREATE TABLE public.wilayas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_fr text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wilayas TO anon, authenticated;
GRANT ALL ON public.wilayas TO service_role;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wilayas_public_read" ON public.wilayas FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.school_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.school_years TO anon, authenticated;
GRANT ALL ON public.school_years TO service_role;
ALTER TABLE public.school_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_years_public_read" ON public.school_years FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year_id uuid NOT NULL REFERENCES public.school_years(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_year_id, slug)
);
CREATE INDEX idx_branches_year ON public.branches(school_year_id);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches_public_read" ON public.branches FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  icon text,
  school_year_id uuid REFERENCES public.school_years(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subjects_year ON public.subjects(school_year_id);
CREATE INDEX idx_subjects_branch ON public.subjects(branch_id);
GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects_public_read" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ users & profiles (server-only access) ============
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE,
  username text,
  first_name text,
  last_name text,
  photo_url text,
  language_code text,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  school_year_id uuid NOT NULL REFERENCES public.school_years(id),
  branch_id uuid REFERENCES public.branches(id),
  wilaya_id uuid REFERENCES public.wilayas(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_year ON public.student_profiles(school_year_id);
CREATE INDEX idx_profiles_branch ON public.student_profiles(branch_id);
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  notifications_enabled boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ============ content & news (server-served) ============
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type text NOT NULL DEFAULT 'lesson',
  file_url text,
  external_url text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  school_year_id uuid REFERENCES public.school_years(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_year ON public.content(school_year_id);
CREATE INDEX idx_content_branch ON public.content(branch_id);
CREATE INDEX idx_content_subject ON public.content(subject_id);
CREATE INDEX idx_content_type ON public.content(content_type);
GRANT ALL ON public.content TO service_role;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_content_updated BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  visibility text NOT NULL DEFAULT 'global',
  school_year_id uuid REFERENCES public.school_years(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  is_important boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_published ON public.news(published_at DESC);
CREATE INDEX idx_news_visibility ON public.news(visibility);
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ official reference data ============
INSERT INTO public.school_years (slug, name, position) VALUES
  ('1as', 'السنة الأولى ثانوي', 1),
  ('2as', 'السنة الثانية ثانوي', 2),
  ('3as', 'السنة الثالثة ثانوي', 3);

INSERT INTO public.branches (school_year_id, slug, name, position)
SELECT y.id, b.slug, b.name, b.position FROM public.school_years y
JOIN (VALUES
  ('1as','tc-st','جذع مشترك علوم وتكنولوجيا',1),
  ('1as','tc-lettres','جذع مشترك آداب',2)
) AS b(year_slug, slug, name, position) ON b.year_slug = y.slug;

INSERT INTO public.branches (school_year_id, slug, name, position)
SELECT y.id, b.slug, b.name, b.position FROM public.school_years y
JOIN (VALUES
  ('sciences','علوم تجريبية',1),
  ('maths','رياضيات',2),
  ('tech-maths','تقني رياضي',3),
  ('gestion','تسيير واقتصاد',4),
  ('lettres-philo','آداب وفلسفة',5),
  ('langues','لغات أجنبية',6)
) AS b(slug, name, position) ON true
WHERE y.slug IN ('2as','3as');

INSERT INTO public.wilayas (code, name, name_fr) VALUES
('01','أدرار','Adrar'),('02','الشلف','Chlef'),('03','الأغواط','Laghouat'),
('04','أم البواقي','Oum El Bouaghi'),('05','باتنة','Batna'),('06','بجاية','Béjaïa'),
('07','بسكرة','Biskra'),('08','بشار','Béchar'),('09','البليدة','Blida'),
('10','البويرة','Bouira'),('11','تمنراست','Tamanrasset'),('12','تبسة','Tébessa'),
('13','تلمسان','Tlemcen'),('14','تيارت','Tiaret'),('15','تيزي وزو','Tizi Ouzou'),
('16','الجزائر','Alger'),('17','الجلفة','Djelfa'),('18','جيجل','Jijel'),
('19','سطيف','Sétif'),('20','سعيدة','Saïda'),('21','سكيكدة','Skikda'),
('22','سيدي بلعباس','Sidi Bel Abbès'),('23','عنابة','Annaba'),('24','قالمة','Guelma'),
('25','قسنطينة','Constantine'),('26','المدية','Médéa'),('27','مستغانم','Mostaganem'),
('28','المسيلة','MSila'),('29','معسكر','Mascara'),('30','ورقلة','Ouargla'),
('31','وهران','Oran'),('32','البيض','El Bayadh'),('33','إليزي','Illizi'),
('34','برج بوعريريج','Bordj Bou Arréridj'),('35','بومرداس','Boumerdès'),('36','الطارف','El Tarf'),
('37','تندوف','Tindouf'),('38','تيسمسيلت','Tissemsilt'),('39','الوادي','El Oued'),
('40','خنشلة','Khenchela'),('41','سوق أهراس','Souk Ahras'),('42','تيبازة','Tipaza'),
('43','ميلة','Mila'),('44','عين الدفلى','Aïn Defla'),('45','النعامة','Naâma'),
('46','عين تموشنت','Aïn Témouchent'),('47','غرداية','Ghardaïa'),('48','غليزان','Relizane'),
('49','تيميمون','Timimoun'),('50','برج باجي مختار','Bordj Badji Mokhtar'),('51','أولاد جلال','Ouled Djellal'),
('52','بني عباس','Béni Abbès'),('53','عين صالح','In Salah'),('54','عين قزام','In Guezzam'),
('55','تقرت','Touggourt'),('56','جانت','Djanet'),('57','المغير','El MGhair'),
('58','المنيعة','El Meniaa');
