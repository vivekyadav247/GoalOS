const TAGLINE = 'Small steps and consistency lead to big goals';

const sizeMap = {
  sm: {
    image: 'h-9 w-9',
    text: 'text-lg'
  },
  md: {
    image: 'h-11 w-11',
    text: 'text-xl'
  },
  lg: {
    image: 'h-14 w-14',
    text: 'text-3xl'
  }
};

export const BrandName = ({ className = '', accentClassName = 'text-blue-600' }) => (
  <span className={className}>
    Goal<span className={accentClassName}>OS</span>
  </span>
);

const Logo = ({
  showTagline = false,
  align = 'left',
  size = 'md',
  className = '',
  tagline = TAGLINE
}) => {
  const sizes = sizeMap[size] || sizeMap.md;
  const isCentered = align === 'center';

  return (
    <div
      className={[
        'logo-hover inline-flex',
        isCentered ? 'flex-col items-center text-center' : 'items-center',
        className
      ].join(' ')}
    >
      <div className={['flex items-center gap-2', isCentered ? 'justify-center' : ''].join(' ')}>
        <img
          src="/logo.png"
          alt="GoalOS logo"
          className={['logo-mark shrink-0', sizes.image].join(' ')}
        />
        <BrandName className={[sizes.text, 'font-semibold tracking-tight text-slate-900'].join(' ')} />
      </div>
      {showTagline ? (
        <span className="mt-2 max-w-md text-sm text-slate-500 sm:text-base">{tagline}</span>
      ) : null}
    </div>
  );
};

export default Logo;
