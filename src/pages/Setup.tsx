import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGitHubApp } from '@/hooks/useGitHubAuth';

export default function Setup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectOrg } = useGitHubApp();

  useEffect(() => {
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');

    if (installationId && setupAction === 'install') {
      // Save installation info in context/storage
      selectOrg('default-org', Number(installationId));

      // Redirect to home/dashboard
      navigate('/');
    } else {
      // If missing parameters, fallback to connect page
      navigate('/connect');
    }
  }, [searchParams, selectOrg, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Setting up your GitHub App… Redirecting home…</p>
    </div>
  );
}
