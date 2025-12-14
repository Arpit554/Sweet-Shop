import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user, isAdmin } = useContext(AuthContext);

  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="bg-gradient-to-r from-amber-500 to-pink-500 text-white py-24 rounded-3xl text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          🍬 Welcome to Sweet Shop
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-8">
          Fresh, delicious sweets made with love. Order your favorite treats
          anytime, anywhere.
        </p>

        <div className="flex justify-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}

          {user && (
            <Link to="/dashboard" className="btn-primary">
              {isAdmin() ? "Admin Dashboard" : "Start Shopping"}
            </Link>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-2">🍫 Premium Quality</h3>
          <p className="text-gray-500">
            Made from the finest ingredients for best taste.
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold mb-2">🧼 Hygienic</h3>
          <p className="text-gray-500">
            Prepared with strict hygiene standards.
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-bold mb-2">🚀 Fast Service</h3>
          <p className="text-gray-500">
            Quick order processing and instant confirmation.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to taste happiness? 😋
        </h2>
        <Link to="/dashboard" className="btn-primary px-10 py-4">
          Explore Sweets
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 pt-10 border-t">
        © {new Date().getFullYear()} Sweet Shop. All rights reserved.
      </footer>
    </div>
  );
}
