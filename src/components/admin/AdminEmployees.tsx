import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit3, Trash2, Save, X, Loader2, Users, Clock, Calendar,
  Phone, MapPin, IndianRupee, CheckCircle2, XCircle, AlertCircle, User,
  ClipboardList, ChevronRight, Star, Timer, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────
interface Employee {
  id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  role: string;
  department: string;
  daily_wage: number;
  status: string;
  joined_at: string;
  left_at: string | null;
  emergency_contact: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  hours_worked: number;
  status: string;
  overtime_hours: number;
  notes: string | null;
}

interface Task {
  id: string;
  employee_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

type SubView = 'list' | 'profile' | 'attendance' | 'tasks';

const ROLES = ['cutter', 'polisher', 'delivery', 'supervisor', 'helper', 'driver', 'admin', 'other'];
const DEPARTMENTS = ['cutting', 'polishing', 'delivery', 'warehouse', 'showroom', 'office', 'general'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const inputCls = "w-full px-3 py-2.5 bg-muted/60 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";
const selectCls = inputCls;

const ROLE_COLORS: Record<string, string> = {
  cutter: 'bg-orange-100 text-orange-700',
  polisher: 'bg-purple-100 text-purple-700',
  delivery: 'bg-blue-100 text-blue-700',
  supervisor: 'bg-emerald-100 text-emerald-700',
  helper: 'bg-slate-100 text-slate-700',
  driver: 'bg-cyan-100 text-cyan-700',
  admin: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
};

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subView, setSubView] = useState<SubView>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Partial<Employee> | null>(null);
  const [saving, setSaving] = useState(false);

  // Attendance & Tasks
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'normal', due_date: '' });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkAttendance, setBulkAttendance] = useState<Record<string, { status: string; check_in: string; check_out: string }>>({});

  const loadEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').order('name');
    if (error) toast.error('Failed to load employees');
    setEmployees((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadEmployees(); }, []);

  const loadAttendance = async (empId: string) => {
    const { data } = await supabase.from('employee_attendance').select('*')
      .eq('employee_id', empId).order('date', { ascending: false }).limit(60);
    setAttendance((data as any) || []);
  };

  const loadTasks = async (empId: string) => {
    const { data } = await supabase.from('employee_tasks').select('*')
      .eq('employee_id', empId).order('created_at', { ascending: false });
    setTasks((data as any) || []);
  };

  const openProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSubView('profile');
    loadAttendance(emp.id);
    loadTasks(emp.id);
  };

  // ─── Save Employee ─────────────────────────────────
  const handleSave = async () => {
    if (!editing?.name?.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        phone: editing.phone || null,
        role: editing.role || 'worker',
        department: editing.department || 'general',
        daily_wage: editing.daily_wage || 0,
        status: editing.status || 'active',
        joined_at: editing.joined_at || new Date().toISOString().split('T')[0],
        left_at: editing.left_at || null,
        emergency_contact: editing.emergency_contact || null,
        address: editing.address || null,
        notes: editing.notes || null,
      };
      if (editing.id) {
        const { error } = await supabase.from('employees').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employees').insert(payload);
        if (error) throw error;
      }
      toast.success(editing.id ? 'Updated!' : 'Employee added!');
      setEditing(null);
      loadEmployees();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this employee?')) return;
    await supabase.from('employees').delete().eq('id', id);
    toast.success('Removed');
    loadEmployees();
    if (selectedEmployee?.id === id) { setSubView('list'); setSelectedEmployee(null); }
  };

  // ─── Attendance ────────────────────────────────────
  const markAttendance = async (empId: string, status: string, checkIn: string, checkOut: string) => {
    const hours = checkIn && checkOut
      ? (new Date(`2000-01-01T${checkOut}`).getTime() - new Date(`2000-01-01T${checkIn}`).getTime()) / 3600000
      : 0;
    const overtime = Math.max(0, hours - 8);

    const { error } = await supabase.from('employee_attendance').upsert({
      employee_id: empId,
      date: attendanceDate,
      status,
      check_in: checkIn || null,
      check_out: checkOut || null,
      hours_worked: Math.round(hours * 100) / 100,
      overtime_hours: Math.round(overtime * 100) / 100,
    }, { onConflict: 'employee_id,date' });
    if (error) toast.error('Failed: ' + error.message);
    else toast.success('Attendance marked');
  };

  const saveBulkAttendance = async () => {
    const entries = Object.entries(bulkAttendance);
    if (entries.length === 0) { toast.error('Mark attendance first'); return; }

    for (const [empId, data] of entries) {
      await markAttendance(empId, data.status, data.check_in, data.check_out);
    }
    toast.success(`Attendance saved for ${entries.length} workers`);
    setBulkAttendance({});
  };

  // ─── Tasks ─────────────────────────────────────────
  const addTask = async () => {
    if (!selectedEmployee || !newTask.title.trim()) { toast.error('Task title required'); return; }
    const { error } = await supabase.from('employee_tasks').insert({
      employee_id: selectedEmployee.id,
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
    });
    if (error) toast.error(error.message);
    else { toast.success('Task added'); setNewTask({ title: '', description: '', priority: 'normal', due_date: '' }); loadTasks(selectedEmployee.id); }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await supabase.from('employee_tasks').update({
      status, completed_at: status === 'completed' ? new Date().toISOString() : null,
    }).eq('id', taskId);
    if (selectedEmployee) loadTasks(selectedEmployee.id);
  };

  // ─── Wage Calculator ──────────────────────────────
  const calcMonthlyWage = (emp: Employee) => {
    const present = attendance.filter(a => a.status === 'present' || a.status === 'half_day');
    const totalDays = present.reduce((s, a) => s + (a.status === 'half_day' ? 0.5 : 1), 0);
    const totalOT = present.reduce((s, a) => s + (a.overtime_hours || 0), 0);
    const base = totalDays * emp.daily_wage;
    const otPay = totalOT * (emp.daily_wage / 8) * 1.5;
    return { totalDays, totalOT: Math.round(totalOT * 10) / 10, base: Math.round(base), otPay: Math.round(otPay), total: Math.round(base + otPay) };
  };

  // ═══════════════════════════════════════════════════
  // EMPLOYEE FORM
  // ═══════════════════════════════════════════════════
  if (editing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base">{editing.id ? 'Edit' : 'Add'} Employee</h2>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setEditing(null)} className="p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
        </div>

        <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Name *</label>
              <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Ramesh Kumar" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
              <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="+91 98765 43210" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</label>
              <select value={editing.role || 'worker'} onChange={e => setEditing({ ...editing, role: e.target.value })} className={selectCls}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</label>
              <select value={editing.department || 'general'} onChange={e => setEditing({ ...editing, department: e.target.value })} className={selectCls}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Daily Wage (₹)</label>
              <input type="number" value={editing.daily_wage || ''} onChange={e => setEditing({ ...editing, daily_wage: +e.target.value })} placeholder="e.g. 600" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Joined Date</label>
              <input type="date" value={editing.joined_at || ''} onChange={e => setEditing({ ...editing, joined_at: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <select value={editing.status || 'active'} onChange={e => setEditing({ ...editing, status: e.target.value })} className={selectCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Address</label>
            <textarea value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} rows={2} className={inputCls + ' resize-none'} placeholder="Home address" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Emergency Contact</label>
              <input value={editing.emergency_contact || ''} onChange={e => setEditing({ ...editing, emergency_contact: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
              <input value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} className={inputCls} placeholder="Any special notes" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // PROFILE VIEW
  // ═══════════════════════════════════════════════════
  if (subView === 'profile' && selectedEmployee) {
    const emp = selectedEmployee;
    const wage = calcMonthlyWage(emp);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => { setSubView('list'); setSelectedEmployee(null); }}
          className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground mb-4 transition-colors">
          ← Back to team
        </button>

        {/* Profile Header */}
        <div className="p-5 bg-card rounded-2xl border border-border/30 mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {emp.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-lg">{emp.name}</h2>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[emp.role] || ROLE_COLORS.other}`}>
                  {emp.role}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {emp.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{emp.department} • Joined {new Date(emp.joined_at).toLocaleDateString('en-IN')}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                {emp.phone && <span className="flex items-center gap-1"><Phone size={11} /> {emp.phone}</span>}
                {emp.address && <span className="flex items-center gap-1"><MapPin size={11} /> {emp.address}</span>}
                <span className="flex items-center gap-1"><IndianRupee size={11} /> ₹{emp.daily_wage}/day</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(emp)} className="px-4 py-2 bg-muted rounded-xl text-[12px] font-medium hover:bg-accent transition-colors">
                <Edit3 size={13} className="inline mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-4 bg-card rounded-2xl border border-border/20 text-center">
            <p className="text-2xl font-bold text-foreground">{wage.totalDays}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Days Present</p>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border/20 text-center">
            <p className="text-2xl font-bold text-foreground">{wage.totalOT}h</p>
            <p className="text-[10px] text-muted-foreground mt-1">Overtime</p>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border/20 text-center">
            <p className="text-2xl font-bold text-emerald-600">₹{wage.total.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Est. Monthly Pay</p>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border/20 text-center">
            <p className="text-2xl font-bold text-foreground">{completedTasks}/{completedTasks + pendingTasks}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tasks Done</p>
          </div>
        </div>

        {/* Attendance History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 bg-card rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><Clock size={12} /> Recent Attendance</h3>
            {attendance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No attendance records yet</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {attendance.slice(0, 20).map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/10 last:border-0">
                    {a.status === 'present' ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> :
                     a.status === 'absent' ? <XCircle size={14} className="text-red-400 shrink-0" /> :
                     <AlertCircle size={14} className="text-amber-400 shrink-0" />}
                    <span className="text-muted-foreground text-xs">{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    <span className="text-xs text-muted-foreground">{a.check_in || '--'} → {a.check_out || '--'}</span>
                    <span className="ml-auto text-xs font-medium">{a.hours_worked}h</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="p-5 bg-card rounded-2xl border border-border/30">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><ClipboardList size={12} /> Tasks</h3>
            
            {/* Add Task */}
            <div className="flex gap-2 mb-3">
              <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Add a task..." className={inputCls + ' flex-1'} onKeyDown={e => e.key === 'Enter' && addTask()} />
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="px-2 py-2 bg-muted/60 border border-border/30 rounded-xl text-xs">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={addTask} className="p-2.5 bg-foreground text-background rounded-xl hover:opacity-90"><Plus size={14} /></button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks assigned</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-border/10 last:border-0">
                    <button onClick={() => updateTaskStatus(t.id, t.status === 'completed' ? 'pending' : 'completed')}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        t.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border hover:border-primary'}`}>
                      {t.status === 'completed' && <CheckCircle2 size={11} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${t.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                      {t.due_date && <p className="text-[10px] text-muted-foreground">{new Date(t.due_date).toLocaleDateString('en-IN')}</p>}
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      t.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ATTENDANCE VIEW (Bulk)
  // ═══════════════════════════════════════════════════
  if (subView === 'attendance') {
    const activeEmps = employees.filter(e => e.status === 'active');
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-base">Daily Attendance</h2>
            <p className="text-muted-foreground text-[12px]">Mark attendance for all active workers</p>
          </div>
          <div className="flex gap-2">
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
              className="px-3 py-2 bg-muted/60 border border-border/30 rounded-xl text-sm" />
            <button onClick={saveBulkAttendance}
              className="px-5 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90">
              <Save size={13} className="inline mr-1" /> Save All
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {activeEmps.map(emp => {
            const data = bulkAttendance[emp.id] || { status: 'present', check_in: '09:00', check_out: '18:00' };
            return (
              <div key={emp.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card rounded-2xl border border-border/20">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{emp.name}</p>
                    <p className="text-[11px] text-muted-foreground">{emp.role} • ₹{emp.daily_wage}/day</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select value={data.status} onChange={e => setBulkAttendance({ ...bulkAttendance, [emp.id]: { ...data, status: e.target.value } })}
                    className="px-3 py-2 bg-muted/60 border border-border/30 rounded-xl text-xs font-medium">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                  <input type="time" value={data.check_in} onChange={e => setBulkAttendance({ ...bulkAttendance, [emp.id]: { ...data, check_in: e.target.value } })}
                    className="px-2 py-2 bg-muted/60 border border-border/30 rounded-xl text-xs w-28" />
                  <span className="text-muted-foreground text-xs">→</span>
                  <input type="time" value={data.check_out} onChange={e => setBulkAttendance({ ...bulkAttendance, [emp.id]: { ...data, check_out: e.target.value } })}
                    className="px-2 py-2 bg-muted/60 border border-border/30 rounded-xl text-xs w-28" />
                </div>
              </div>
            );
          })}
          {activeEmps.length === 0 && (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border/30">
              <Users size={28} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No active employees. Add employees first.</p>
            </div>
          )}
        </div>

        <button onClick={() => setSubView('list')} className="mt-4 text-[12px] text-muted-foreground hover:text-foreground">← Back to team</button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // EMPLOYEE LIST (Default)
  // ═══════════════════════════════════════════════════
  const filtered = employees.filter(e => {
    const s = search.toLowerCase();
    return !s || e.name.toLowerCase().includes(s) || e.role.toLowerCase().includes(s) || e.department.toLowerCase().includes(s);
  });

  const activeCount = employees.filter(e => e.status === 'active').length;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Team <span className="text-muted-foreground font-normal text-sm">({activeCount} active)</span></h2>
          <div className="flex gap-2">
            <button onClick={() => setSubView('attendance')} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-xl text-[12px] font-medium hover:bg-accent transition-colors">
              <Calendar size={13} /> Attendance
            </button>
            <button onClick={() => setEditing({ role: 'worker', department: 'general', status: 'active', daily_wage: 0 })}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-xl text-[12px] font-medium hover:opacity-90 transition-all">
              <Plus size={13} /> Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, department..." className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-card rounded-2xl p-4 border border-border/20"><div className="h-4 bg-muted rounded w-1/3 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/30">
          <Users size={36} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm mb-1">No team members yet</p>
          <button onClick={() => setEditing({ role: 'worker', department: 'general', status: 'active', daily_wage: 0 })}
            className="mt-2 px-5 py-2 bg-foreground text-background rounded-xl text-sm font-medium hover:opacity-90">
            <Plus size={14} className="inline mr-1.5" /> Add First Employee
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(emp => (
            <div key={emp.id} onClick={() => openProfile(emp)}
              className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/20 hover:border-border/40 hover:shadow-sm transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{emp.name}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[emp.role] || ROLE_COLORS.other}`}>{emp.role}</span>
                </div>
                <p className="text-muted-foreground text-[11px]">{emp.department} • ₹{emp.daily_wage}/day</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {emp.status}
              </span>
              <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
