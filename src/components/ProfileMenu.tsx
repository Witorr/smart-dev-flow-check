import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string | null;
  email: string;
}

export default function ProfileMenu() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', avatar_url: '' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Se for Google/Github, priorize dados do SSO
      let ssoName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      let ssoAvatar = user.user_metadata?.avatar_url || '';
      let ssoEmail = user.email || '';
      // Busca do supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        toast({ title: 'Erro ao carregar perfil', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      setProfile({
        ...data,
        first_name: ssoName ? ssoName.split(' ')[0] : data?.first_name || '',
        last_name: ssoName ? ssoName.split(' ').slice(1).join(' ') : data?.last_name || '',
        avatar_url: ssoAvatar || data?.avatar_url || '',
        email: ssoEmail,
      });
      setForm({
        first_name: ssoName ? ssoName.split(' ')[0] : data?.first_name || '',
        last_name: ssoName ? ssoName.split(' ').slice(1).join(' ') : data?.last_name || '',
        phone: data?.phone || '',
        avatar_url: ssoAvatar || data?.avatar_url || ''
      });
      setLoading(false);
    };
    fetchProfile();
  }, [toast]);

  // Detecta se é SSO e pega foto do Google/Github
  useEffect(() => {
    const fetchSSOPhoto = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.app_metadata && (user.app_metadata.provider === 'google' || user.app_metadata.provider === 'github')) {
        const avatar = user.user_metadata?.avatar_url || '';
        if (avatar) setForm((f) => ({ ...f, avatar_url: avatar }));
      }
    };
    fetchSSOPhoto();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        avatar_url: form.avatar_url
      })
      .eq('id', user.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setProfile((p) => p ? { ...p, ...form } : null);
    setEditing(false);
    toast({ title: 'Perfil atualizado!' });
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="max-w-sm mx-auto p-6 bg-card rounded-lg shadow flex flex-col items-center gap-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={form.avatar_url || undefined} alt="Foto do usuário" />
        <AvatarFallback>
          {form.first_name?.[0]?.toUpperCase()}{form.last_name?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {editing ? (
        <>
          <Input name="first_name" placeholder="Nome" value={form.first_name} onChange={handleChange} className="mt-2" />
          <Input name="last_name" placeholder="Sobrenome" value={form.last_name} onChange={handleChange} className="mt-2" />
          <Input name="avatar_url" placeholder="URL da foto (opcional)" value={form.avatar_url} onChange={handleChange} className="mt-2" />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={loading}>Salvar</Button>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>Cancelar</Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-lg font-semibold">{profile?.first_name || 'Sem nome'} {profile?.last_name}</div>
          <div className="text-sm text-muted-foreground">{profile?.email}</div>
          <Button className="mt-4" onClick={() => setEditing(true)}>Editar perfil</Button>
        </>
      )}
    </div>
  );
}
