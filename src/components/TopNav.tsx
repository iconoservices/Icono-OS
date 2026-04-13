import Link from "next/link";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/10 shadow-sm dark:shadow-none shrink-0 w-full h-16 flex justify-between items-center px-8">
      <div className="flex items-center gap-8">
        <span className="text-lg font-black tracking-tighter text-slate-950 dark:text-white font-headline">El Curador Digital</span>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 font-body text-sm transition-all focus:outline-none">Portafolio</Link>
          <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 font-body text-sm transition-all focus:outline-none">Estrategia</Link>
          <Link href="#" className="text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-1 font-body text-sm transition-all">Analíticas</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input className="bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-fixed w-64 transition-all" placeholder="Buscar ideas..." type="text" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-900 transition-all focus:ring-2 focus:ring-slate-200 outline-none rounded-lg"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 text-slate-500 hover:text-slate-900 transition-all focus:ring-2 focus:ring-slate-200 outline-none rounded-lg"><span className="material-symbols-outlined">help_outline</span></button>
          <div className="ml-2 h-8 w-8 rounded-full bg-surface-container-highest border border-outline-variant/15 overflow-hidden ring-2 ring-transparent transition-all cursor-pointer hover:ring-primary-fixed/50">
            <img alt="Perfil de Usuario" src="https://ui-avatars.com/api/?name=Curador&background=random" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
