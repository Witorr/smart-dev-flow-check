import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function CalendlyConnect({ onConnect }: { onConnect?: () => void }) {
  const [accessToken, setAccessToken] = useState("");
  const [userUri, setUserUri] = useState("");
  const [loadingUserUri, setLoadingUserUri] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGetUserUri = async () => {
    if (!accessToken) {
      toast({ title: "Erro", description: "Informe o Access Token primeiro", variant: "destructive" });
      return;
    }
    setLoadingUserUri(true);
    try {
      const res = await fetch("https://api.calendly.com/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Token inválido ou erro na API do Calendly");
      const data = await res.json();
      if (data.resource && data.resource.uri) {
        setUserUri(data.resource.uri);
        toast({ title: "User URI obtido com sucesso!" });
      } else {
        throw new Error("User URI não encontrado na resposta");
      }
    } catch (err: any) {
      toast({ title: "Erro ao buscar User URI", description: err.message, variant: "destructive" });
    } finally {
      setLoadingUserUri(false);
    }
  };

  const handleSave = () => {
    if (!accessToken || !userUri) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    localStorage.setItem("calendly_access_token", accessToken);
    localStorage.setItem("calendly_user_uri", userUri);
    toast({ title: "Conectado ao Calendly!" });
    if (onConnect) onConnect();
    // Redireciona para a página de tasks após conectar
    setTimeout(() => {
      navigate(-1); // Volta para a página anterior (Checklist)
    }, 800);
  };

  return (
    <div className="border p-4 rounded bg-muted flex flex-col gap-2 max-w-md mx-auto mt-8">
      <h2 className="font-bold text-lg mb-2">Conectar ao Calendly</h2>
      <label className="text-sm font-medium">Access Token do Calendly</label>
      <Input
        type="text"
        placeholder="Personal Access Token"
        value={accessToken}
        onChange={e => setAccessToken(e.target.value)}
        autoComplete="off"
      />
      <Button className="mt-1 mb-2 w-fit" onClick={handleGetUserUri} disabled={!accessToken || loadingUserUri}>
        {loadingUserUri ? "Buscando User URI..." : "Buscar User URI automaticamente"}
      </Button>
      <label className="text-sm font-medium">User URI do Calendly</label>
      <Input
        type="text"
        placeholder="https://api.calendly.com/users/SEU_USER_ID"
        value={userUri}
        onChange={e => setUserUri(e.target.value)}
        autoComplete="off"
      />
      <Button className="mt-2" onClick={handleSave}>Salvar e Conectar</Button>
    </div>
  );
}
