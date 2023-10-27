if (
    localStorage.getItem('color-theme') === 'dark' ||
    (!('color-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
// place files you want to import through the `$lib` alias in this folder.
