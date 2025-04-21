import ProfileMenu from "@/components/ProfileMenu";

export default function Projects() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
        <ProfileMenu />
      </div>
      {/* Conteúdo dos projetos aqui */}
      <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
        Lista de projetos em breve...
      </div>
    </div>
  );
}
