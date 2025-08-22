import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="brand">
          GoBasera, Announcements
        </Link>
      </header>
      <main className="app__main">
        <Outlet />
      </main>
      <footer className="app__footer">Built for the Final Round</footer>
    </div>
  );
}
