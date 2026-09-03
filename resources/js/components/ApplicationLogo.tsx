import logoUrl from '../../images/logo.png';

export default function ApplicationLogo({
    className = 'w-10 h-10',
    alt = 'Application Logo',
}) {
    return (
        <img
            src={logoUrl}
            alt={alt}
            className={`object-contain select-none ${className}`.trim()}
        />
    );
}
