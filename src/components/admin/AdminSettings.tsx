import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, RefreshCw, Upload, Image as ImageIcon, Palette, Globe, Building2, Phone, BarChart3, FileText, Trash2 } from 'lucide-react';
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
    icon: Building2,
    fields: [
      { key: 'company_name', label: 'Company Name', hint: 'e.g. AB Stone World Pvt Ltd' },
      { key: 'tagline', label: 'Tagline', hint: 'e.g. Quality Matters the MOST!' },
      { key: 'company_gstin', label: 'GSTIN', hint: 'e.g. 24AAKCA1234F1Z5' },
      { key: 'founded_year', label: 'Founded Year', hint: 'e.g. 2003' },
    ],
  },
  {
    label: 'Contact Details',
    icon: Phone,
    fields: [
      { key: 'phone1', label: 'Phone 1', hint: '+91 9377521509' },
      { key: 'phone2', label: 'Phone 2', hint: '+91 9427459805' },
      { key: 'email', label: 'Email', hint: 'Stoneworld1947@gmail.com' },
      { key: 'whatsapp', label: 'WhatsApp', hint: '+91 9377521509' },
      { key: 'address', label: 'Address', hint: 'Full business address', multiline: true },
    ],
  },
  {
    label: 'Homepage Statistics',
    icon: BarChart3,
    fields: [
      { key: 'stat_years', label: 'Years of Trust', hint: 'e.g. 20+' },
      { key: 'stat_inventory', label: 'Inventory Value', hint: 'e.g. 5Cr+' },
      { key: 'stat_warehouse', label: 'Warehouse (Sqft)', hint: 'e.g. 30,000' },
      { key: 'stat_team', label: 'Team Members', hint: 'e.g. 25+' },
    ],
  },
  {
    label: 'About Content',
    icon: FileText,
    fields: [
      { key: 'about_short', label: 'Short About (Homepage)', hint: 'Brief 1-2 sentence company description', multiline: true },
      { key: 'about_full', label: 'Full About (About Page)', hint: 'Detailed company story and mission', multiline: true },
    ],
  },
  {
    label: 'Branding & Appearance',
    icon: Palette,
    fields: [
      { key: 'logo_url', label: 'Logo URL', hint: 'Upload below or paste a URL' },
      { key: 'logo_size', label: 'Logo Size (px height)', hint: 'e.g. 24 for navbar, default is 24' },
      { key: 'primary_color', label: 'Brand Color (hex)', hint: 'e.g. #1d1d1f' },
      { key: 'accent_color', label: 'Accent Color (hex)', hint: 'e.g. #bf9b5e (gold)' },
    ],
  },
  {
    label: 'SEO & Social',
    icon: Globe,
    fields: [
      { key: 'meta_title', label: 'Homepage Title', hint: 'Stone World — Premium Surface Solutions' },
      { key: 'meta_description', label: 'Meta Description', hint: 'SEO description for search engines', multiline: true },
      { key: 'google_maps_url', label: 'Google Maps Embed URL', hint: 'Paste your Google Maps embed link' },
      { key: 'instagram_url', label: 'Instagram URL', hint: 'https://instagram.com/...' },
      { key: 'facebook_url', label: 'Facebook URL', hint: 'https://facebook.com/...' },
    ],
  },
];

const inputCls = "w-full px-3.5 py-2.5 bg-muted/60 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

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
      toast.success('Settings saved successfully!');
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `branding/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      updateField('logo_url', data.publicUrl);
      toast.success('Logo uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (logoRef.current) logoRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-2xl p-5 border border-border/20">
            <div className="h-4 bg-muted rounded-lg w-1/4 mb-3" />
            <div className="space-y-2"><div className="h-10 bg-muted rounded-xl" /><div className="h-10 bg-muted rounded-xl" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-semibold text-lg">Site Settings</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">Manage your website content, branding & SEO</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSettings} className="flex items-center gap-1.5 px-3.5 py-2 bg-muted rounded-xl text-[12px] font-medium hover:bg-accent transition-colors">
            <RefreshCw size={12} /> Reload
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-5 py-2 bg-stone-900 text-white rounded-xl text-[12px] font-medium hover:bg-stone-800 disabled:opacity-40 transition-all">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {SETTING_GROUPS.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.label} className="bg-card rounded-2xl p-5 border border-border/20">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icon size={13} /> {group.label}
              </h3>
              <div className="space-y-3">
                {group.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">{field.label}</label>
                    {(field as any).multiline ? (
                      <textarea value={settings[field.key] || ''} onChange={e => updateField(field.key, e.target.value)}
                        rows={3} placeholder={field.hint} className={inputCls + ' resize-none'} />
                    ) : (
                      <input value={settings[field.key] || ''} onChange={e => updateField(field.key, e.target.value)}
                        placeholder={field.hint} className={inputCls} />
                    )}
                  </div>
                ))}
                
                {/* Logo upload for branding group */}
                {group.label === 'Branding & Appearance' && (
                  <div className="pt-2">
                    <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">Upload Logo</label>
                    <div className="flex items-center gap-3">
                      {settings.logo_url && (
                        <div className="relative">
                          <img src={settings.logo_url} alt="Logo" className="h-12 rounded-lg border border-border/30 bg-white p-1" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border border-dashed border-border/40 rounded-xl text-sm cursor-pointer hover:bg-accent transition-colors">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploading ? 'Uploading...' : 'Choose file'}
                        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                      </label>
                    </div>
                    
                    {/* Color preview */}
                    <div className="flex gap-3 mt-4">
                      {settings.primary_color && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg border border-border/30 shadow-inner" style={{ backgroundColor: settings.primary_color }} />
                          <span className="text-[11px] text-muted-foreground">Primary</span>
                        </div>
                      )}
                      {settings.accent_color && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg border border-border/30 shadow-inner" style={{ backgroundColor: settings.accent_color }} />
                          <span className="text-[11px] text-muted-foreground">Accent</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dirty && (
        <div className="sticky bottom-4 mt-6">
          <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl">
            <p className="text-sm font-medium">Unsaved changes</p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-white text-stone-900 rounded-xl text-sm font-semibold hover:bg-stone-100 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
