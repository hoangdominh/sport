export default function PageWrapper({ children }) {
  return (
    <main className="mx-auto min-h-[calc(100svh-64px)] max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      {children}
    </main>
  );
}
