export const getInitials = (name: string): string => {
    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length === 0) return 'U';
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};