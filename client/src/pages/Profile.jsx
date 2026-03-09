import { useUser } from '@clerk/react';

const Profile = () => {
  const { user } = useUser();

  const primaryEmail = user?.primaryEmailAddress?.emailAddress
    || user?.emailAddresses?.[0]?.emailAddress
    || 'No email found';

  return (
    <div className="space-y-6">
      <section className="surface-card p-5 sm:p-6">
        <h2 className="page-title">Profile</h2>
        <p className="page-subtitle">
          Manage your GoalOS identity details. Account deletion is disabled in this app
          to prevent orphaned planner data linked to your <code>clerkId</code>.
        </p>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {user?.fullName || user?.username || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{primaryEmail}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clerk ID</p>
            <p className="mt-1 break-all text-xs text-slate-700">{user?.id || 'Unavailable'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Actions</p>
            <p className="mt-1 text-sm text-slate-700">Sign out is available from the user menu.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
