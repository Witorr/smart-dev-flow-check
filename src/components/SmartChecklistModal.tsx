import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CHECKLIST_TEMPLATES, BASE_CHECKLIST } from "@/checklistTemplates";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import Player from "lottie-react";

const TECHNOLOGIES = ["React", "Node.js", "TypeScript", "Python", "Django", "Laravel", "Vue.js", "Flutter", "Java", "C#", "Go"];

interface SmartChecklistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SmartChecklistModal({ open, onClose, onSubmit }: SmartChecklistModalProps) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [teamType, setTeamType] = useState<string>("individual");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!teamType || selectedTechs.length === 0 || !startDate || !endDate) return;
    setIsSubmitting(true);
    let checklist: string[] = [...BASE_CHECKLIST];
    selectedTechs.forEach(tech => {
      if (CHECKLIST_TEMPLATES[tech]) {
        checklist = checklist.concat(CHECKLIST_TEMPLATES[tech]);
      }
    });
    checklist = [...new Set(checklist)];

    // Upload de anexos (se houver)
    let attachmentUrls: string[] = [];
    for (const file of attachments) {
      try {
        const filePath = `items/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('lovabledev').upload(filePath, file, { upsert: true });
        if (uploadError) {
          alert(`Erro ao fazer upload: ${uploadError.message}`);
          continue;
        }
        const { data: publicData, error: publicError } = await supabase.storage.from('lovabledev').getPublicUrl(filePath);
        if (publicError) {
          alert(`Erro ao obter URL pública: ${publicError.message}`);
          continue;
        }
        if (publicData?.publicUrl) {
          attachmentUrls.push(publicData.publicUrl);
        }
      } catch (err) {
        alert(`Falha inesperada ao anexar arquivo: ${err instanceof Error ? err.message : err}`);
      }
    }

    const result = await onSubmit({
      teamType,
      is_team: teamType === 'time',
      technologies: selectedTechs,
      checklist,
      attachments: attachmentUrls,
      start_date: startDate,
      end_date: endDate
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Checklist Inteligente</DialogTitle>
        </DialogHeader>
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Player
              autoplay
              loop
              animationData={require("../../public/robot-loader.json")}
              style={{ height: 180, width: 180 }}
            />
            <span className="mt-4 text-brand-500 font-semibold text-lg animate-pulse">Seu checklist inteligente está sendo criado...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-medium">Tecnologias do projeto:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {TECHNOLOGIES.map(tech => (
                  <Badge
                    key={tech}
                    className={`cursor-pointer px-3 py-1 ${selectedTechs.includes(tech) ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground'}`}
                    onClick={() => handleTechToggle(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Tipo de equipe:</span>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={teamType === "individual" ? "default" : "outline"}
                  className="text-xs px-3 py-1"
                  onClick={() => setTeamType("individual")}
                >
                  Individual
                </Button>
                <Button
                  variant={teamType === "time" ? "default" : "outline"}
                  className="text-xs px-3 py-1"
                  onClick={() => setTeamType("time")}
                >
                  Time
                </Button>
              </div>
            </div>
            <div>
              <span className="font-medium">Data de início do projeto:</span>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <span className="font-medium">Data de término do projeto:</span>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div>
              <span className="font-medium">Anexos do projeto:</span>
              <Input type="file" multiple onChange={handleAttachmentChange} />
              {attachments.length > 0 && (
                <span className="text-xs text-muted-foreground mt-1 block">
                  {attachments.map(file => file.name).join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || !teamType || selectedTechs.length === 0 || !startDate || !endDate}>
            {isSubmitting ? "Enviando..." : "Criar Checklist"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
