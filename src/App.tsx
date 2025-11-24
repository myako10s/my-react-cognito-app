import { useCallback, useEffect, useState } from "react";
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from "aws-amplify/auth";
import { ensureAmplifyConfigured, missingAwsEnv } from "./lib/awsConfig";

type AuthState = "loading" | "signedIn" | "signedOut";

type UserProfile = {
  username: string;
  email?: string;
};

const App = () => {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [status, setStatus] = useState("サインイン状態を確認しています...");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const notices = [
    {
      title: "マネージドログイン",
      body: "サインインボタンで AWS マネージドログインに移動し、戻るとセッションが更新されます。"
    },
    {
      title: "環境変数",
      body: "`.env` を変更したら `pnpm dev` を再起動してください。未設定のキーは上部のアラートに表示されます。"
    },
    {
      title: "ホスティング",
      body: "`pnpm build` の成果物を S3 + CloudFront などの静的ホスティングに配置することを想定しています。"
    }
  ];

  const signedIn = authState === "signedIn";

  const hydrateUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      const session = await fetchAuthSession();
      const email =
        "tokens" in session ? (session.tokens?.idToken?.payload?.email as string | undefined) : undefined;
      setCurrentUser({
        username: current.username,
        email
      });
      setAuthState("signedIn");
      setStatus(`ログイン中: ${email ?? current.username}`);
    } catch {
      setCurrentUser(null);
      setAuthState("signedOut");
      setStatus("");
    }
  }, []);

  useEffect(() => {
    const keys = missingAwsEnv();
    setMissingKeys(keys);
    try {
      ensureAmplifyConfigured();
      if (!keys.length) {
        void hydrateUser();
      } else {
        setAuthState("signedOut");
        setStatus("");
      }
    } catch (error) {
      setStatus(String(error));
    }
  }, [hydrateUser]);

  const handleHostedSignIn = () => {
    setStatus("Cognito にリダイレクトしています...");
    void signInWithRedirect({
      options: {
        lang: "ja"
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setAuthState("signedOut");
      setStatus("サインアウトしました。");
    } catch (error) {
      setStatus(`サインアウトエラー: ${String(error)}`);
    }
  };

  return (
    <div className="app-shell">
      <header className="global-header">
        <div className="logo-area">
          <h1>my-react-cognito-app</h1>
          <p>マネージドログインを使った Cognito 認証サンプル</p>
        </div>
        <nav aria-label="グローバルメニュー">
          <ul>
            <li>
              <a href="#home">ホーム</a>
            </li>
            <li>
              <a href="#notice">お知らせ</a>
            </li>
            <li>
              <a href="https://www.digital.go.jp/en/policies/servicedesign/designsystem" target="_blank" rel="noreferrer">
                デザインシステム
              </a>
            </li>
          </ul>
        </nav>
        <div className="user-info">
          {signedIn && (
            <div className="user-meta">
              <p className="user-name">{currentUser?.email ?? currentUser?.username}</p>
              {status && (
                <p className="status-text" aria-live="polite">
                  {status}
                </p>
              )}
            </div>
          )}
          {signedIn ? (
            <button className="btn btn-secondary" onClick={handleSignOut}>
              サインアウト
            </button>
          ) : (
            <div className="user-cta">
              {status && (
                <p className="status-text" aria-live="polite">
                  {status}
                </p>
              )}
              <button className="btn btn-primary" type="button" onClick={handleHostedSignIn} disabled={authState === "loading"}>
                サインイン
              </button>
            </div>
          )}
        </div>
      </header>

      {missingKeys.length > 0 && (
        <section className="panel">
          <h2>環境変数が未設定です</h2>
          <p className="support-text">
            以下のキーを <code>.env</code> に設定して再起動してください。
          </p>
          <ul className="storage-list">
            {missingKeys.map((key) => (
              <li key={key} className="storage-item">
                <span>{key}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <main className="main-layout">
        {signedIn && (
          <section className="panel main-content">
            <h2 id="home">メインコンテンツ</h2>
            <div className="placeholder-box">
              <p>ここに各種コンテンツを配置してください。</p>
            </div>
          </section>
        )}

        <section className="panel" id="notice">
          <h2>お知らせ</h2>
          <ul className="notice-compact">
            {notices.map((notice) => (
              <li key={notice.title}>
                <p className="notice-title">{notice.title}</p>
                <p className="notice-detail">{notice.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default App;
