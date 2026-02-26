
-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'worker',
  department TEXT NOT NULL DEFAULT 'general',
  daily_wage NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at DATE,
  emergency_contact TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

-- Attendance table
CREATE TABLE public.employee_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIME,
  check_out TIME,
  hours_worked NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'present',
  overtime_hours NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage attendance" ON public.employee_attendance FOR ALL USING (true) WITH CHECK (true);

-- Employee tasks
CREATE TABLE public.employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage tasks" ON public.employee_tasks FOR ALL USING (true) WITH CHECK (true);

-- Warehouse zones
CREATE TABLE public.warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity_sqft NUMERIC DEFAULT 0,
  used_sqft NUMERIC DEFAULT 0,
  zone_type TEXT DEFAULT 'storage',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouse_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage zones" ON public.warehouse_zones FOR ALL USING (true) WITH CHECK (true);

-- Inventory stock tracking
CREATE TABLE public.inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES public.warehouse_zones(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'sqft',
  min_stock_level NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage inventory" ON public.inventory_stock FOR ALL USING (true) WITH CHECK (true);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gstin TEXT,
  category TEXT DEFAULT 'General',
  rating INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
