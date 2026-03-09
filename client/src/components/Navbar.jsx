import { useLocation } from 'react-router-dom';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react';
import { PAGE_TITLES } from './navigation';

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/goals/')) {
    return 'Goal Detail';
  }

  return PAGE_TITLES[pathname] || 'GoalOS';
};

const Navbar = () => {
  const location = useLocation();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{resolveTitle(location.pathname)}</h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:block">
            Search
          </div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn-secondary px-3 py-2 text-xs sm:text-sm">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="hidden rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
              >
                Get started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              afterSignOutUrl="/"
              userProfileMode="navigation"
              userProfileUrl="/profile"
            >
              <UserButton.MenuItems>
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
          {!user && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white">
              G
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
