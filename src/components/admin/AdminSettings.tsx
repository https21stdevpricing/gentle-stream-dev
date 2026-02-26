import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Setting {
  id: string;
  key: string;
  value: string;
}

const SETTING_GROUPS = [
  {
    label: 'Company Info',
    fields: [
      { key: 'company_name', label: 'Company Name' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'company_gstin', label: 'GSTIN' },
      { key: 'founded_year', label: 'Founded Year' },
    ],
  },
  {
    label: 'Contact Details',
    fields: [
      { key: 'phone1', label: 'Phone 1' },
      { key: 'phone2', label: 'Phone 2' },
      { key: 'email', label: 'Email' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'address', label: 'Address' },
    ],
  },
  {
    label: 'Statistics (Displayed on Homepage)',
    fields: [
      { key: 'stat_years', label: 'Years of Trust' },
      { key: 'stat_inventory', label: 'Inventory Value' },
      { key: 'stat_warehouse', label: 'Warehouse Sqft' },
      { key: 'stat_team', label: 'Team Members' },
    ],
  },
  {
    label: 'About Content',
    fields: [
      { key: 'about_short', label: 'Short About', multiline: true },
      { key: 'about_full', label: 'Full About', multiline: true },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) { toast.error('Failed to load settings'); console.error(error); }
    else {
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
    setDirty(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const updateField = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
      }
      toast.success('Settings saved');
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-xl p-5">
            <div className="h-4 bg-muted rounded w-1/4 mb-3" />
            <div className="space-y-2">
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg">Site Settings</h2>
        <div className="flex gap-2">
          <button onClick={loadSettings} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-[12px] font-medium hover:bg-accent transition-colors">
            <RefreshCw size={12} /> Reload
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-[12px] font-medium hover:opacity-90 disabled:opacity-40 transition-all">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {SETTING_GROUPS.map(group => (
          <div key={group.label} className="bg-card rounded-2xl p-5 border border-border/20">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{group.label}</h3>
            <div className="space-y-3">
              {group.fields.map(field => (
                <div key={field.key}>
                  <label className="text-[11px] text-muted-foreground mb-1 block">{field.label}</label>
                  {(field as any).multiline ? (
                    <textarea value={settings[field.key] || ''} onChange={e => updateField(field.key, e.target.value)}
                      rows={3} className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                  ) : (
                    <input value={settings[field.key] || ''} onChange={e => updateField(field.key, e.target.value)}
                      className="w-full px-3 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dirty && (
        <div className="sticky bottom-4 mt-6">
          <div className="bg-foreground text-background rounded-xl p-3 flex items-center justify-between shadow-lg">
            <p className="text-sm">You have unsaved changes</p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-background text-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
