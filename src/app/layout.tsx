import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
// import './globals.css'; // グローバルスタイルのインポート

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* AuthProvider はクライアントコンポーネントとして動作させる必要がある */}
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}

// App RouterではContext ProviderはClient Componentにする必要がある
const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
};
