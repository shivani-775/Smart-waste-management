-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'operator');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table for tracking all actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign operator role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  
  -- Log the signup
  INSERT INTO public.audit_logs (user_id, user_email, action, table_name)
  VALUES (NEW.id, NEW.email, 'USER_SIGNUP', 'auth.users');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Update existing bins table policies for role-based access
DROP POLICY IF EXISTS "Anyone can view bins" ON public.bins;
DROP POLICY IF EXISTS "Anyone can update bins" ON public.bins;
DROP POLICY IF EXISTS "Anyone can insert bins" ON public.bins;

CREATE POLICY "Authenticated users can view bins"
  ON public.bins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operators can update bins"
  ON public.bins FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'operator') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can insert bins"
  ON public.bins FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete bins"
  ON public.bins FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update collection_routes policies
DROP POLICY IF EXISTS "Anyone can view routes" ON public.collection_routes;
DROP POLICY IF EXISTS "Anyone can update routes" ON public.collection_routes;
DROP POLICY IF EXISTS "Anyone can insert routes" ON public.collection_routes;

CREATE POLICY "Authenticated users can view routes"
  ON public.collection_routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can create routes"
  ON public.collection_routes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Managers can update routes"
  ON public.collection_routes FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete routes"
  ON public.collection_routes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create audit trigger function for bins
CREATE OR REPLACE FUNCTION public.audit_bins_changes()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, old_data, new_data
    )
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'BIN_UPDATED',
      'bins',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, new_data
    )
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'BIN_CREATED',
      'bins',
      NEW.id,
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach audit trigger to bins
CREATE TRIGGER audit_bins_trigger
  AFTER INSERT OR UPDATE ON public.bins
  FOR EACH ROW EXECUTE FUNCTION public.audit_bins_changes();

-- Create audit trigger for routes
CREATE OR REPLACE FUNCTION public.audit_routes_changes()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, old_data, new_data
    )
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'ROUTE_UPDATED',
      'collection_routes',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (
      user_id, user_email, action, table_name, record_id, new_data
    )
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'ROUTE_CREATED',
      'collection_routes',
      NEW.id,
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach audit trigger to collection_routes
CREATE TRIGGER audit_routes_trigger
  AFTER INSERT OR UPDATE ON public.collection_routes
  FOR EACH ROW EXECUTE FUNCTION public.audit_routes_changes();