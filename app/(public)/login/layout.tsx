export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-200">
            {children}
        </div>
    );
}