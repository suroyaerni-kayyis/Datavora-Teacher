-- 1. HAPUS TABEL LAMA
DROP TABLE IF EXISTS public.student_notes CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.cash_transactions CASCADE;
DROP TABLE IF EXISTS public.duty_schedules CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.class_info CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. BUAT TABEL PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUAT FUNGSI TRIGGER UNTUK USER BARU
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$;

-- 4. PASANG TRIGGER KE AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. BUAT TABEL LAINNYA
CREATE TABLE public.class_info (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  homeroom_teacher TEXT NOT NULL,
  homeroom_teacher_nip TEXT,
  school_name TEXT NOT NULL,
  school_logo TEXT,
  headmaster_name TEXT,
  headmaster_nip TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.students (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nis TEXT NOT NULL,
  nisn TEXT NOT NULL,
  gender TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif',
  avatar_url TEXT,
  birth_place TEXT,
  birth_date TEXT,
  address TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_mother_name TEXT,
  parent_phone TEXT,
  parent_job TEXT,
  blood_type TEXT,
  health_notes TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.attendance (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.grades (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.schedules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL
);

CREATE TABLE public.duty_schedules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  day TEXT NOT NULL,
  member_student_ids TEXT NOT NULL,
  tasks TEXT NOT NULL
);

CREATE TABLE public.cash_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  fee_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  date TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.student_notes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  follow_up_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AKTIFKAN RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- 7. BUAT POLICIES
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own class_info" ON public.class_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own students" ON public.students FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attendance" ON public.attendance FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own grades" ON public.grades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own schedules" ON public.schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own duty_schedules" ON public.duty_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cash_transactions" ON public.cash_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payments" ON public.payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own student_notes" ON public.student_notes FOR ALL USING (auth.uid() = user_id);
