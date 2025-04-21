import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function UserAvatarButton() {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let avatar = user.user_metadata?.avatar_url || "";
        let displayName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        // Busca na tabela profiles se não for SSO
        if (!avatar) {
          const { data } = await supabase.from('profiles').select('avatar_url, first_name, last_name').eq('id', user.id).single();
          avatar = data?.avatar_url || "";
          displayName = (data?.first_name || "") + " " + (data?.last_name || "");
        }
        setAvatarUrl(avatar);
        setName(displayName.trim());
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <button
      className="rounded-full border-2 border-transparent hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition flex items-center gap-2 px-1.5 py-1"
      onClick={() => navigate('/profile')}
      title="Configurações do perfil"
      aria-label="Abrir perfil"
      style={{ minWidth: 40 }}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={avatarUrl || undefined} alt={name || 'Usuário'} />
        <AvatarFallback>{name ? name.split(" ").map(n => n[0]).join("") : "U"}</AvatarFallback>
      </Avatar>
    </button>
  );
}
