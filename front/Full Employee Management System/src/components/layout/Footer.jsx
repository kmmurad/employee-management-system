export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 h-12 flex items-center justify-center px-6">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} Employee Management System. All rights reserved.
      </p>
    </footer>
  );
}