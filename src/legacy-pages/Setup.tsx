import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGitHubApp } from '@/hooks/useGitHubAuth';

export default function Setup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectOrg } = useGitHubApp();

  useEffect(() => {
    if (!searchParams) return;
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');

    if (installationId && setupAction === 'install') {
      // Save installation info in context/storage
      selectOrg('default-org', Number(installationId));

      // Redirect to home/dashboard
      router.push('/');
    } else {
      // If missing parameters, fallback to connect page
      router.push('/connect');
    }
  }, [searchParams, selectOrg, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Setting up your GitHub App… Redirecting home…</p>
    </div>
  );
}
