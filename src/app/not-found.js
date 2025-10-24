import './globals.css'
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
            <h1 className="text-6xl font-bold text-sky-700">404</h1>
            <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2">
                Sorry, the page you’re looking for doesn’t exist or has been moved.
            </p>
            <Link
                href="/"
                className="mt-6 px-6 py-3 bg-sky-700 text-white rounded-lg shadow-md hover:bg-sky-800 transition"
            >
                Back to Home
            </Link>
        </div>
    );
}
