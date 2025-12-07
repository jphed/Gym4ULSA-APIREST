export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-950/60 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-black dark:bg-white" aria-hidden />
              <span className="text-lg font-semibold tracking-tight">Gym4ULSA</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
      <footer className="border-t border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500 text-center">© {new Date().getFullYear()} Gym4ULSA</div>
      </footer>
    </div>
  );
}
