function TeamList() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const hostname = window.location.hostname.replace(/^www\./, '');
  const mainDomain = "sportinghip.com";
  const isCustomDomain = hostname !== mainDomain;
  const slug = !isCustomDomain ? window.location.pathname.split("/")[1] : null;
  const domain = isCustomDomain ? hostname : null;

  useEffect(() => {
    if (loading) return;

    // ❌ Don't redirect anymore unless both are null
    if (!slug && !domain && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [slug, domain, isAuthenticated, loading, navigate]);

  return loading ? <p>Loading...</p> : isAuthenticated ? <TeamListAuth /> : <TeamListPublic slug={slug} domain={domain} />;
}
